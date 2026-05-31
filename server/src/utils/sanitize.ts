import { JSDOM } from "jsdom";
import DOMPurify from "dompurify";

const window = new JSDOM("").window as unknown as Window & typeof globalThis;
const purify = DOMPurify(window);

export function sanitizeHtml(input: string): string {
  return purify.sanitize(input, { ALLOWED_TAGS: [] });
}
