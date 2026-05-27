import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
import { nanoid } from "nanoid";
import { getEmbeddings } from "./embeddings";
import { getPineconeIndex } from "./pinecone";
import type { ChunkMetadata } from "./types";

const KNOWLEDGE_DIR = path.join(process.cwd(), "data", "knowledge");
const CALENDAR_SOURCE = "academic-calendar-2026-2027.md";

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 800,
  chunkOverlap: 200,
});

/** Fix broken line breaks and spacing from pasted calendar PDFs. */
export function normalizeCalendarText(raw: string): string {
  let text = raw.replace(/\r\n/g, "\n");
  // Join ordinals split across lines: "2\nnd" -> "2nd" (must run before other rules)
  text = text.replace(/(\d)\s*\n\s*(st|nd|rd|th)\b/gi, "$1$2");
  // "24thJanuary" or "1stJune" -> add space before month name
  text = text.replace(
    /(\d{1,2}(?:st|nd|rd|th))([A-Za-z])/gi,
    "$1 $2"
  );
  text = text.replace(/[ \t]+\n/g, "\n");
  text = text.replace(/\n{3,}/g, "\n\n");
  return text.trim();
}

export function splitCalendarSections(raw: string): { title: string; body: string }[] {
  const normalized = normalizeCalendarText(raw);
  const sem2Match = normalized.match(/^SEMESTER II\s*$/m);
  const provMatch = normalized.match(/^PROVISIONAL DATES/m);
  const sem2Idx = sem2Match?.index ?? -1;
  const provIdx = provMatch?.index ?? -1;

  if (sem2Idx === -1 || provIdx === -1 || provIdx <= sem2Idx) {
    return [{ title: "Academic Calendar", body: normalized }];
  }

  return [
    {
      title: "Semester I 2026",
      body: normalized.slice(0, sem2Idx).trim(),
    },
    {
      title: "Semester II 2026",
      body: normalized.slice(sem2Idx, provIdx).trim(),
    },
    {
      title: "Provisional 2027 Semester I",
      body: normalized.slice(provIdx).trim(),
    },
  ];
}

const FAQ_HEADING_CATEGORY: Record<string, string> = {
  fees: "fees",
  "student id": "id",
  admissions: "admissions",
};

export async function ingestText(
  content: string,
  meta: { source: string; category: string; page?: number }
): Promise<number> {
  const docs = await splitter.createDocuments(
    [content],
    [
      {
        source: meta.source,
        category: meta.category,
        page: meta.page ?? 1,
      },
    ]
  );
  return ingestDocuments(docs);
}

export async function ingestDocuments(
  docs: Document[],
  options?: { label?: string }
): Promise<number> {
  const embeddings = getEmbeddings();
  const index = getPineconeIndex();
  const timestamp = new Date().toISOString();
  const label = options?.label ?? "document";

  const vectors = [];
  for (let i = 0; i < docs.length; i++) {
    const doc = docs[i];
    const text = doc.pageContent;
    if (docs.length > 1) {
      console.log(`[seed]   embedding ${label} chunk ${i + 1}/${docs.length}...`);
    }
    const vector = await embeddings.embedQuery(text);
    vectors.push({
      id: nanoid(),
      values: vector,
      metadata: {
        text,
        source: String(doc.metadata.source ?? "unknown"),
        page: Number(doc.metadata.page ?? 1),
        category: String(doc.metadata.category ?? "general"),
        timestamp,
      } satisfies ChunkMetadata,
    });
  }

  console.log(`[seed]   upserting ${vectors.length} vector(s) to Pinecone...`);
  await index.upsert({ records: vectors });
  return vectors.length;
}

export async function ingestPdfBuffer(
  buffer: Buffer,
  filename: string,
  category: string
): Promise<number> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  await parser.destroy();
  const text = result.text?.trim();
  if (!text) {
    throw new Error("No text extracted from PDF");
  }
  return ingestText(text, { source: filename, category });
}

export async function ingestMarkdownFile(
  filename: string,
  category: string,
  options?: { normalize?: (text: string) => string }
): Promise<number> {
  const filePath = path.join(KNOWLEDGE_DIR, filename);
  const raw = await readFile(filePath, "utf-8");
  const content = options?.normalize ? options.normalize(raw) : raw;
  return ingestText(content, { source: filename, category });
}

export async function ingestAcademicCalendar(filename: string): Promise<number> {
  const filePath = path.join(KNOWLEDGE_DIR, filename);
  const raw = await readFile(filePath, "utf-8");
  const sections = splitCalendarSections(raw);
  let total = 0;

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const content = `${section.title}\n\n${section.body}`;
    total += await ingestText(content, {
      source: CALENDAR_SOURCE,
      category: "deadlines",
      page: i + 1,
    });
  }

  return total;
}

function splitFaqByHeading(content: string): { category: string; content: string }[] {
  const parts = content.split(/^## /m).filter((p) => p.trim());
  const result: { category: string; content: string }[] = [];

  for (const part of parts) {
    const newline = part.indexOf("\n");
    if (newline === -1) continue;
    const heading = part.slice(0, newline).trim().toLowerCase();
    const body = part.slice(newline + 1).trim();
    if (!body) continue;
    const category = FAQ_HEADING_CATEGORY[heading] ?? "general";
    result.push({ category, content: body });
  }

  return result;
}

export async function ingestFaqMarkdown(filename: string): Promise<number> {
  const filePath = path.join(KNOWLEDGE_DIR, filename);
  const raw = await readFile(filePath, "utf-8");
  const sections = splitFaqByHeading(raw);
  let total = 0;

  for (const section of sections) {
    total += await ingestText(section.content, {
      source: filename,
      category: section.category,
    });
  }

  return total;
}

export async function ingestKnowledgeDirectory(): Promise<number> {
  let total = 0;
  let files: string[];

  try {
    files = await readdir(KNOWLEDGE_DIR);
  } catch {
    return 0;
  }

  for (const file of files.filter((f) => f.endsWith(".md"))) {
    if (file.startsWith("academic-calendar")) {
      total += await ingestAcademicCalendar(file);
    } else if (file === "zut-faq.md") {
      total += await ingestFaqMarkdown(file);
    } else {
      total += await ingestMarkdownFile(file, "general");
    }
  }

  return total;
}

export const SEED_KNOWLEDGE: {
  source: string;
  category: string;
  content: string;
}[] = [
  {
    source: "ZUT_Fees_Handbook_2026.pdf",
    category: "fees",
    content: `Tuition fees for the Diploma in Information Technology (DIT) at Zambia University of Technology (ZUT) are K7,445.00 per semester. Payment is due before registration. Contact the finance office for payment plans.`,
  },
  {
    source: "ZUT_ID_Policy_2026.pdf",
    category: "id",
    content: `Lost or damaged student ID cards must be replaced at the Helpdesk. The replacement fee is K350. Bring a valid form of identification and your student number.`,
  },
  {
    source: "ZUT_Admissions_2026.pdf",
    category: "admissions",
    content: `Applications for the 2026 intake close on 30th November 2026. Entry requirements for the Diploma in Information Technology: 5 O-Level credits including English and Mathematics. Apply online or visit the Admissions Office.`,
  },
  {
    source: "ZUT_Admissions_2026.pdf",
    category: "admissions",
    content: `General admission requirements for diploma programs at ZUT include 5 O-Level credits with English and Mathematics. International applicants should contact the Admissions Office for equivalent qualifications.`,
  },
  {
    source: "ZUT_Registration_Guide_2026.pdf",
    category: "registration",
    content: `Course registration opens two weeks before each semester. Students must clear outstanding fees before registering. Late registration incurs a penalty. Use the student portal or visit the registrar.`,
  },
  {
    source: "ZUT_Academic_Calendar_2026.pdf",
    category: "deadlines",
    content: `Full academic calendar dates (registration, exams, breaks, results) are in the official academic calendar document (academic-calendar-2026-2027.md). Use retrieved context for semester-specific dates.`,
  },
  {
    source: "ZUT_Campus_Guide_2026.pdf",
    category: "campus",
    content: `Main campus in Ndola: Administration block near the main gate, library open 08:00–20:00 weekdays, Helpdesk in Block B for ID and student records. ICT lab hours: 08:00–17:00 Monday to Friday.`,
  },
];

export async function seedKnowledgeBase(): Promise<number> {
  let total = 0;

  for (let i = 0; i < SEED_KNOWLEDGE.length; i++) {
    const item = SEED_KNOWLEDGE[i];
    console.log(
      `[seed] (${i + 1}/${SEED_KNOWLEDGE.length}) ${item.category}: ${item.source}`
    );
    total += await ingestText(item.content, {
      source: item.source,
      category: item.category,
    });
  }

  console.log("[seed] Loading markdown from data/knowledge/...");
  total += await ingestKnowledgeDirectory();
  return total;
}
