export const api = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('delicas_token');
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!options.body || typeof options.body === 'string') {
     headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error ${response.status}`);
  }

  return response.json();
};
