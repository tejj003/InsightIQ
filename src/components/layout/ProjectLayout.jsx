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
    <div className="min-h-screen bg-bg flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>
        <Sidebar project={project} onDelete={handleDelete} onRename={handleRename} />
        <main className="flex-1 overflow-y-auto">
          <Outlet context={{ project, update }} />
        </main>
      </div>
    </div>
  )
}
