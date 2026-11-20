import 'server-only';

type ApiHealthResponse = {
  status?: unknown;
};

export async function getApiHealthStatus(): Promise<'ok' | 'unavailable'> {
  const serviceUrl = process.env.API_SERVICE_URL;
  if (!serviceUrl) {
    console.error('API_SERVICE_URL service binding is not configured.');
    return 'unavailable';
  }

  let healthUrl: URL;
  try {
    healthUrl = new URL('/api/v1/health', serviceUrl);
  } catch (error) {
    console.error('API_SERVICE_URL is not a valid URL:', error);
    return 'unavailable';
  }

  try {
    const response = await fetch(healthUrl, {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      console.error(`5S API health check returned ${response.status}.`);
      return 'unavailable';
    }

    const health = (await response.json()) as ApiHealthResponse;
    if (health.status !== 'ok') {
      console.error('5S API health check returned an unexpected response.');
      return 'unavailable';
    }
    return 'ok';
  } catch (error) {
    console.error('5S API health check failed:', error);
    return 'unavailable';
  }
}
