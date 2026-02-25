const BASE_URL = "https://api.cal.com/v2";

function getApiKey(): string | undefined {
  return process.env.CALCOM_API_KEY;
}

function headers(apiVersion?: string): Record<string, string> {
  const h: Record<string, string> = {
    Authorization: `Bearer ${getApiKey()}`,
    "Content-Type": "application/json",
  };
  if (apiVersion) {
    h["cal-api-version"] = apiVersion;
  }
  return h;
}

export function isConfigured(): boolean {
  return !!getApiKey();
}

export async function calGet(
  path: string,
  params?: Record<string, string>,
  apiVersion?: string
): Promise<unknown> {
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }
  }
  const res = await fetch(url.toString(), { headers: headers(apiVersion) });
  if (!res.ok) {
    const text = await res.text();
    return { error: `HTTP ${res.status}: ${res.statusText}`, status_code: res.status, response_text: text };
  }
  return res.json();
}

export async function calPost(
  path: string,
  body: unknown,
  apiVersion?: string
): Promise<unknown> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: headers(apiVersion),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let responseText: unknown;
    try {
      responseText = await res.json();
    } catch {
      responseText = await res.text();
    }
    return { error: `HTTP ${res.status}: ${res.statusText}`, status_code: res.status, response_text: responseText };
  }
  return res.json();
}

export async function calPatch(
  path: string,
  body: unknown,
  apiVersion?: string
): Promise<unknown> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "PATCH",
    headers: headers(apiVersion),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let responseText: unknown;
    try {
      responseText = await res.json();
    } catch {
      responseText = await res.text();
    }
    return { error: `HTTP ${res.status}: ${res.statusText}`, status_code: res.status, response_text: responseText };
  }
  return res.json();
}
