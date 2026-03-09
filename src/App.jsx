import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import NewProject from './pages/NewProject'
import ProjectLayout from './components/layout/ProjectLayout'
import ProjectOverview from './pages/ProjectOverview'
import Questions from './pages/Questions'
import Transcripts from './pages/Transcripts'
import Insights from './pages/Insights'
import Ask from './pages/Ask'
import Personas from './pages/Personas'
import Report from './pages/Report'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/projects/new" element={<NewProject />} />
      <Route path="/projects/:id" element={<ProjectLayout />}>
        <Route index element={<ProjectOverview />} />
        <Route path="questions" element={<Questions />} />
        <Route path="transcripts" element={<Transcripts />} />
        <Route path="insights" element={<Insights />} />
        <Route path="personas" element={<Personas />} />
        <Route path="ask" element={<Ask />} />
        <Route path="report" element={<Report />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
