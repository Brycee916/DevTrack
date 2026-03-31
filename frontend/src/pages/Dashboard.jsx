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
  const [movingProjectId, setMovingProjectId] = useState(null)
  const [editingProject, setEditingProject] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
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

  const handleMoveProject = async (projectId, nextStatus) => {
    const projectToMove = projects.find((project) => project.id === projectId)

    if (!projectToMove || projectToMove.status === nextStatus) {
      return false
    }

    setError('')
    setSuccess('')
    setMovingProjectId(projectId)

    try {
      const updatedProject = await updateProject(token, projectId, {
        title: projectToMove.title,
        description: projectToMove.description,
        status: nextStatus,
        priority: projectToMove.priority,
      })

      setProjects((current) =>
        current.map((project) =>
          project.id === updatedProject.id ? updatedProject : project
        )
      )

      if (editingProject?.id === projectId) {
        setEditingProject(updatedProject)
      }

      setSuccess(
        nextStatus === 'complete'
          ? 'Project moved to Completed.'
          : 'Project moved to In Progress.'
      )
      return true
    } catch (err) {
      if (err.status === 401) {
        onLogout()
        return false
      }
      setError(err.message)
      return false
    } finally {
      setMovingProjectId(null)
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
  const highPriorityCount = projects.filter((project) => project.priority === 'high').length
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="dashboard-shell">
      <header className="workspace-topbar panel">
        <div className="workspace-branding">
          <div className="workspace-logo">DT</div>
          <div>
            <p className="eyebrow">Portfolio Workspace</p>
            <h1>DevTrack</h1>
          </div>
        </div>

        <div className="workspace-topbar-copy">
          <strong>Delivery board</strong>
          <span>Project visibility for product, operations, and client work.</span>
        </div>

        <div className="workspace-actions">
          <button className="ghost-button" type="button" onClick={loadProjects}>
            Refresh board
          </button>
          <button className="primary-button" type="button" onClick={onLogout}>
            Log out
          </button>
        </div>
      </header>

      <section className="workspace-header panel">
        <div className="workspace-header-main">
          <div className="workspace-breadcrumbs" aria-label="Breadcrumb">
            <span>Workspaces</span>
            <span className="breadcrumb-separator">/</span>
            <span>Portfolio</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">DevTrack</span>
          </div>

          <div className="workspace-title-row">
            <div>
              <p className="eyebrow">Operations Board</p>
              <h2>Delivery management</h2>
            </div>
            <div className="workspace-title-meta">
              <span className="workspace-chip">Q2 Active Planning</span>
              <span className="workspace-chip workspace-chip-muted">Investor Demo Ready</span>
            </div>
          </div>

          <p className="workspace-summary">
            Centralize active delivery work, surface high-priority projects, and
            keep execution status ready for leadership reviews.
          </p>
        </div>

        <div className="workspace-tabs" role="tablist" aria-label="Workspace views">
          <button className="workspace-tab workspace-tab-active" type="button" role="tab" aria-selected="true">
            Board
          </button>
          <button className="workspace-tab" type="button" role="tab" aria-selected="false">
            Timeline
          </button>
          <button className="workspace-tab" type="button" role="tab" aria-selected="false">
            Reports
          </button>
          <button className="workspace-tab" type="button" role="tab" aria-selected="false">
            Settings
          </button>
        </div>
      </section>

      <div className="workspace-layout">
        <aside className="workspace-sidebar panel">
          <div className="sidebar-section">
            <p className="eyebrow">Workspace</p>
            <h2>Board overview</h2>
            <p className="sidebar-copy">
              Track execution, see what needs attention, and update project
              details from one shared operational board.
            </p>
          </div>

          <nav className="sidebar-nav">
            <button className="sidebar-nav-item sidebar-nav-item-active" type="button">
              Board
            </button>
            <button className="sidebar-nav-item" type="button">
              Roadmap
            </button>
            <button className="sidebar-nav-item" type="button">
              Reporting
            </button>
          </nav>

          <div className="sidebar-section">
            <p className="eyebrow">Metrics</p>
            <div className="stats-grid">
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
              <article className="stat-card">
                <span>High priority</span>
                <strong>{highPriorityCount}</strong>
              </article>
            </div>
          </div>

          <div className="sidebar-section sidebar-callout">
            <p className="eyebrow">Operations</p>
            <h3>Investor-ready workflow</h3>
            <p>
              Structured tracking, visible priorities, and a board layout that
              makes project progress easy to demo.
            </p>
          </div>
        </aside>

        <section className="workspace-main">
          {error && <div className="app-message error-message">{error}</div>}
          {success && <div className="app-message success-message">{success}</div>}

          <div className="dashboard-grid">
            <ProjectList
              onEdit={handleEditProject}
              onMoveProject={handleMoveProject}
              projects={filteredProjects}
              projectCount={projects.length}
              searchTerm={searchTerm}
              statusFilter={statusFilter}
              onSearchChange={setSearchTerm}
              onStatusFilterChange={setStatusFilter}
              loading={loadingProjects}
              deletingProjectId={deletingProjectId}
              movingProjectId={movingProjectId}
              onDelete={handleDeleteProject}
            />
            <ProjectForm
              editingProject={null}
              loading={savingProject}
              onCancelEdit={handleCancelEdit}
              onSubmitProject={handleSubmitProject}
            />
          </div>
        </section>
      </div>

      {editingProject && (
        <div className="project-modal-backdrop" onClick={handleCancelEdit}>
          <div
            className="project-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-project-title"
          >
            <ProjectForm
              editingProject={editingProject}
              isModal
              loading={savingProject}
              onCancelEdit={handleCancelEdit}
              onSubmitProject={handleSubmitProject}
            />
          </div>
        </div>
      )}
    </div>
  )
}
