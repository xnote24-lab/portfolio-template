export async function fetchJson(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeout ?? 15000);

  try {
    const response = await fetch(url, {...options, signal: controller.signal});

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`HTTP ${response.status} for ${url}: ${body.slice(0, 240)}`);
    }

    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}
