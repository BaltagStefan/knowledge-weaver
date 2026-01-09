const MAX_SCAN_BYTES = 256 * 1024;
const TAIL_SCAN_BYTES = 64 * 1024;

const SUSPICIOUS_PATTERNS: RegExp[] = [
  /<script\b/i,
  /javascript:/i,
  /\/JS\b/i,
  /\/JavaScript\b/i,
  /\/AA\b/i,
  /\/OpenAction\b/i,
  /\/Launch\b/i,
  /\/XFA\b/i,
  /\/RichMedia\b/i,
  /\/EmbeddedFile\b/i,
  /\/SubmitForm\b/i,
  /\/GoToR\b/i,
];

function decodeBuffer(buffer: ArrayBuffer): string {
  if (typeof TextDecoder !== 'undefined') {
    try {
      return new TextDecoder('latin1').decode(buffer);
    } catch {
      return new TextDecoder().decode(buffer);
    }
  }

  const bytes = new Uint8Array(buffer);
  let result = '';
  for (let i = 0; i < bytes.length; i += 1) {
    result += String.fromCharCode(bytes[i]);
  }
  return result;
}

async function readSlice(file: File, start: number, length: number): Promise<string> {
  const slice = file.slice(start, start + length);
  const buffer = await slice.arrayBuffer();
  return decodeBuffer(buffer);
}

export async function isPdfLikelyMalicious(file: File): Promise<boolean> {
  const headLength = Math.min(file.size, MAX_SCAN_BYTES);
  const head = await readSlice(file, 0, headLength);
  const tail = file.size > TAIL_SCAN_BYTES
    ? await readSlice(file, Math.max(file.size - TAIL_SCAN_BYTES, 0), TAIL_SCAN_BYTES)
    : '';
  const content = `${head}\n${tail}`;
  return SUSPICIOUS_PATTERNS.some((pattern) => pattern.test(content));
}
