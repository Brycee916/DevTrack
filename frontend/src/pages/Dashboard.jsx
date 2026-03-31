import { useEffect, useEffectEvent, useState } from 'react'
import ProjectForm from '../components/ProjectForm'
import ProjectList from '../components/ProjectList'
import {
  createProject,
  deleteProject,
  getProjects,
  updateProject,
} from '../services/api'

export default function Dashboard({ token, onLogout }) {
  const [projects, setProjects] = useState([])
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [savingProject, setSavingProject] = useState(false)
  const [deletingProjectId, setDeletingProjectId] = useState(null)
  const [editingProject, setEditingProject] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadProjects = useEffectEvent(async () => {
    setLoadingProjects(true)
    setError('')

    try {
      const data = await getProjects(token)
      setProjects(data)
    } catch (err) {
      if (err.status === 401) {
        onLogout()
        return
      }
      setError(err.message)
    } finally {
      setLoadingProjects(false)
    }
  })

  useEffect(() => {
    loadProjects()
  }, [token])

  const handleSubmitProject = async (project) => {
    setSavingProject(true)
    setError('')
    setSuccess('')

    try {
      if (editingProject) {
        const updatedProject = await updateProject(token, editingProject.id, project)
        setProjects((current) =>
          current.map((currentProject) =>
            currentProject.id === updatedProject.id ? updatedProject : currentProject
          )
        )
        setEditingProject(null)
        setSuccess('Project updated successfully.')
        return true
      }

      const newProject = await createProject(token, project)
      setProjects((current) => [newProject, ...current])
      setSuccess('Project created successfully.')
      return true
    } catch (err) {
      if (err.status === 401) {
        onLogout()
        return false
      }
      setError(err.message)
      return false
    } finally {
      setSavingProject(false)
    }
  }

  const handleDeleteProject = async (projectId) => {
    setError('')
    setSuccess('')
    setDeletingProjectId(projectId)

    try {
      await deleteProject(token, projectId)
      setProjects((current) => current.filter((project) => project.id !== projectId))
      if (editingProject?.id === projectId) {
        setEditingProject(null)
      }
      setSuccess('Project deleted successfully.')
    } catch (err) {
      if (err.status === 401) {
        onLogout()
        return
      }
      setError(err.message)
    } finally {
      setDeletingProjectId(null)
    }
  }

  const handleEditProject = (project) => {
    setError('')
    setSuccess('')
    setEditingProject(project)
  }

  const handleCancelEdit = () => {
    setEditingProject(null)
  }

  const completedCount = projects.filter((project) => project.status === 'complete').length
  const activeCount = projects.length - completedCount

  return (
    <div className="dashboard-shell">
      <header className="dashboard-hero">
        <div>
          <p className="eyebrow">Workspace Overview</p>
          <h1>Project operations, in one place.</h1>
          <p className="hero-copy">
            Monitor active work, update priorities, and maintain a clear view
            of delivery across your portfolio.
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
      {success && <div className="app-message success-message">{success}</div>}

      <div className="dashboard-grid">
        <ProjectForm
          editingProject={editingProject}
          loading={savingProject}
          onCancelEdit={handleCancelEdit}
          onSubmitProject={handleSubmitProject}
        />
        <ProjectList
          editingProjectId={editingProject?.id}
          onEdit={handleEditProject}
          projects={projects}
          loading={loadingProjects}
          deletingProjectId={deletingProjectId}
          onDelete={handleDeleteProject}
        />
      </div>
    </div>
  )
}
