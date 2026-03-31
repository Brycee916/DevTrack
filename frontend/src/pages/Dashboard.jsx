import { useEffect, useEffectEvent, useState } from 'react'
import ProjectForm from '../components/ProjectForm'
import ProjectList from '../components/ProjectList'
import { createProject, deleteProject, getProjects } from '../services/api'

export default function Dashboard({ token, onLogout }) {
  const [projects, setProjects] = useState([])
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [savingProject, setSavingProject] = useState(false)
  const [error, setError] = useState('')

  const loadProjects = useEffectEvent(async () => {
    setLoadingProjects(true)
    setError('')

    try {
      const data = await getProjects(token)
      setProjects(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingProjects(false)
    }
  })

  useEffect(() => {
    loadProjects()
  }, [token])

  const handleCreateProject = async (project) => {
    setSavingProject(true)
    setError('')

    try {
      const newProject = await createProject(token, project)
      setProjects((current) => [newProject, ...current])
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingProject(false)
    }
  }

  const handleDeleteProject = async (projectId) => {
    setError('')

    try {
      await deleteProject(token, projectId)
      setProjects((current) => current.filter((project) => project.id !== projectId))
    } catch (err) {
      setError(err.message)
    }
  }

  const completedCount = projects.filter((project) => project.status === 'complete').length
  const activeCount = projects.length - completedCount

  return (
    <div className="dashboard-shell">
      <header className="dashboard-hero">
        <div>
          <p className="eyebrow">DevTrack Workspace</p>
          <h1>Keep the work visible and the momentum real.</h1>
          <p className="hero-copy">
            Track active projects, record priorities, and give yourself a clean
            place to push work forward.
          </p>
        </div>

        <div className="hero-actions">
          <button className="ghost-button" type="button" onClick={loadProjects}>
            Refresh
          </button>
          <button className="primary-button" type="button" onClick={onLogout}>
            Log out
          </button>
        </div>
      </header>

      <section className="stats-grid">
        <article className="stat-card">
          <span>Total projects</span>
          <strong>{projects.length}</strong>
        </article>
        <article className="stat-card">
          <span>Active</span>
          <strong>{activeCount}</strong>
        </article>
        <article className="stat-card">
          <span>Completed</span>
          <strong>{completedCount}</strong>
        </article>
      </section>

      {error && <div className="app-message error-message">{error}</div>}

      <div className="dashboard-grid">
        <ProjectForm onCreate={handleCreateProject} loading={savingProject} />
        <ProjectList
          projects={projects}
          loading={loadingProjects}
          onDelete={handleDeleteProject}
        />
      </div>
    </div>
  )
}
