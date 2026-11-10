/**
 * CSVSANITIZER.TS - Sanitasi Sel CSV Anti-Formula Injection (CWE-1236)
 *
 * Mencegah eksekusi rumus berbahaya seperti:
 * =cmd|' /C calc'!A0
 * +SUM(...)
 * -2+5+cmd|...
 * @malicious.com
 * \t atau \r
 */
export function escapeCsvCell(val: unknown): string {
  if (val === null || val === undefined) return '""';
  let str = String(val);
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  return `"${str.replace(/"/g, '""')}"`;
}

