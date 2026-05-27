export const RAG_SYSTEM_PROMPT = `You are the Zambia University of Technology (ZUT) Student Support Assistant.
Answer ONLY using the provided context from official university documents.
Rules:
- If the context does not contain enough information, say you do not have that information and suggest contacting the registrar office or using the "Contact staff" option.
- Never invent fees, dates, or policies.
- Be friendly, concise, and professional.
- Cite sources as [Source: filename, page N] when available.
- For follow-up questions, use conversation history when relevant.`;

export const CATEGORY_QUERIES: Record<string, string> = {
  admissions:
    "What are the admission requirements and application procedures at ZUT?",
  fees: "What are the tuition fees and payment information for diploma programs at ZUT?",
  id: "What is the procedure and cost for replacing a lost student ID card at ZUT?",
  registration:
    "How does course registration work and what are the key deadlines?",
  deadlines:
    "What are the academic calendar dates for registration, late registration, exams, study break, mid-semester break, and publication of results at ZUT?",
  campus: "How can students navigate campus facilities and services at ZUT?",
};
