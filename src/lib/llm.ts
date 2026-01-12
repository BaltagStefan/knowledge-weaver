const LLM_ENDPOINT_PATH_REGEX = /\/(chat\/completions|completions|responses)$/i;
const LLM_DEFAULT_PATH = "/chat/completions";

export function normalizeLlmEndpoint(endpoint: string): string {
  const trimmed = endpoint.trim();
  if (!trimmed) return endpoint;

  const hasProtocol = /^https?:\/\//i.test(trimmed);
  const base = hasProtocol
    ? trimmed
    : `http://placeholder${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;

  try {
    const url = new URL(base);
    const pathname = url.pathname.replace(/\/+$/, "");
    if (!LLM_ENDPOINT_PATH_REGEX.test(pathname)) {
      url.pathname = pathname ? `${pathname}${LLM_DEFAULT_PATH}` : LLM_DEFAULT_PATH;
    }
    const normalized = url.toString();
    return hasProtocol ? normalized : normalized.replace(/^http:\/\/placeholder/, "");
  } catch {
    const cleaned = trimmed.replace(/\/+$/, "");
    if (LLM_ENDPOINT_PATH_REGEX.test(cleaned)) return trimmed;
    return `${cleaned}${LLM_DEFAULT_PATH}`;
  }
}

export function getProxyUrl(endpoint: string, proxyBase: string): string {
  if (!import.meta.env.DEV || !endpoint) return endpoint;
  try {
    const url = new URL(endpoint);
    const pathWithQuery = `${url.pathname}${url.search}`;
    return pathWithQuery.startsWith(proxyBase)
      ? pathWithQuery
      : `${proxyBase}${pathWithQuery}`;
  } catch {
    return endpoint;
  }
}
