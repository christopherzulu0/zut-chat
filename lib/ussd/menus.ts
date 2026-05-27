export const MAIN_MENU = `CON ZUT Student Support
1. Admissions
2. Fees
3. Lost ID card
4. Registration
5. Deadlines
6. Ask a question
0. Contact staff`;

export const ASK_PROMPT = `CON Type your question (max 120 chars):`;

export function endMessage(text: string): string {
  return `END ${text}`;
}

export function continueMessage(text: string): string {
  return `CON ${text}`;
}
