import { Outlet, useParams, Navigate } from 'react-router-dom'
import { useProject } from '../../hooks/useProjects'
import { deleteProject } from '../../lib/storage'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

export default function ProjectLayout() {
  const { id } = useParams()
  const { project, update } = useProject(id)

  if (!project) return <Navigate to="/" replace />

  function handleDelete() {
    deleteProject(id)
  }

  function handleRename(name) {
    update({ name })
  }

  return (
    <div className="h-screen bg-bg flex flex-col overflow-hidden">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar project={project} onDelete={handleDelete} onRename={handleRename} />
        <main className="flex-1 overflow-hidden">
          <Outlet context={{ project, update }} />
        </main>
      </div>
    </div>
  )
}
