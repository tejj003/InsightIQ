import { useState, useCallback } from 'react'
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from '../lib/storage'
import { generateId } from '../lib/utils'

export function useProjects() {
  const [projects, setProjects] = useState(() => getProjects())

  const refresh = useCallback(() => {
    setProjects(getProjects())
  }, [])

  const addProject = useCallback((data) => {
    const project = {
      id: generateId(),
      name: data.name,
      topic: data.topic,
      description: data.description || '',
      targetAudience: data.targetAudience || '',
      researchGoal: data.researchGoal || '',
      status: 'active',
      createdAt: new Date().toISOString(),
      questions: [],
      transcripts: [],
      insights: null,
      chatHistory: [],
    }
    createProject(project)
    refresh()
    return project
  }, [refresh])

  const editProject = useCallback((id, updates) => {
    const updated = updateProject(id, updates)
    refresh()
    return updated
  }, [refresh])

  const removeProject = useCallback((id) => {
    deleteProject(id)
    refresh()
  }, [refresh])

  return { projects, refresh, addProject, editProject, removeProject }
}

export function useProject(id) {
  const [project, setProject] = useState(() => getProject(id))

  const refresh = useCallback(() => {
    setProject(getProject(id))
  }, [id])

  const update = useCallback((updates) => {
    const updated = updateProject(id, updates)
    setProject(updated)
    return updated
  }, [id])

  return { project, refresh, update }
}
