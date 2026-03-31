const API_BASE = 'http://localhost:5000/api'

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, options)
  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json')
    ? await response.json()
    : null

  if (!response.ok) {
    throw new Error(data?.error || 'Request failed')
  }

  return data
}

export function loginUser({ email, password }) {
  return apiRequest('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
}

export function registerUser({ email, password }) {
  return apiRequest('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
}

export function getProjects(token) {
  return apiRequest('/project/getAll', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export function createProject(token, project) {
  return apiRequest('/project/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(project),
  })
}

export function deleteProject(token, projectId) {
  return apiRequest(`/project/deleteProjectId=${projectId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export { API_BASE }
