const ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};

export const escapeXml = (text: string) =>
  text.replace(/[&<>"']/g, (ch) => ENTITIES[ch] ?? ch);
