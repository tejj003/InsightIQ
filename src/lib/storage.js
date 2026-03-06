const STORAGE_KEY = 'insightiq_projects'

export function getProjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveProjects(projects) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
}

export function getProject(id) {
  return getProjects().find((p) => p.id === id) || null
}

export function createProject(data) {
  const projects = getProjects()
  projects.unshift(data)
  saveProjects(projects)
  return data
}

export function updateProject(id, updates) {
  const projects = getProjects().map((p) =>
    p.id === id ? { ...p, ...updates } : p
  )
  saveProjects(projects)
  return projects.find((p) => p.id === id)
}

export function deleteProject(id) {
  saveProjects(getProjects().filter((p) => p.id !== id))
}
