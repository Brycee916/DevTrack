import { useEffect, useEffectEvent, useState } from 'react'
import ProjectForm from '../components/ProjectForm'
import ProjectList from '../components/ProjectList'
import { getProjectStatusLabel } from '../constants/projectStatus'
import {
  createProject,
  deleteProject,
  getProjects,
  updateProject,
} from '../services/api'

export default function Dashboard({ token, onLogout }) {
  const [activeView, setActiveView] = useState('board')
  const [projects, setProjects] = useState([])
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [savingProject, setSavingProject] = useState(false)
  const [deletingProjectId, setDeletingProjectId] = useState(null)
  const [movingProjectId, setMovingProjectId] = useState(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
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

  useEffect(() => {
    if (!editingProject && !isCreateModalOpen) {
      return
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (editingProject) {
          setEditingProject(null)
        } else if (isCreateModalOpen) {
          setIsCreateModalOpen(false)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [editingProject, isCreateModalOpen])

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
      setIsCreateModalOpen(false)
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

      setSuccess(`Project moved to ${getProjectStatusLabel(nextStatus)}.`)
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

  const handleOpenCreate = () => {
    setError('')
    setSuccess('')
    setEditingProject(null)
    setIsCreateModalOpen(true)
  }

  const handleCancelCreate = () => {
    setIsCreateModalOpen(false)
  }

  const completedCount = projects.filter((project) => project.status === 'complete').length
  const openCount = projects.length - completedCount
  const highPriorityCount = projects.filter((project) => project.priority === 'high').length
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const viewTabs = [
    { id: 'board', label: 'Board', iconClass: 'tab-icon-board' },
    { id: 'timeline', label: 'Timeline', iconClass: 'tab-icon-timeline' },
    { id: 'reports', label: 'Reports', iconClass: 'tab-icon-reports' },
    { id: 'settings', label: 'Settings', iconClass: 'tab-icon-settings' },
  ]

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
          <button className="primary-button" type="button" onClick={handleOpenCreate}>
            Create project
          </button>
          <button className="ghost-button" type="button" onClick={loadProjects}>
            Refresh board
          </button>
          <button className="ghost-button" type="button" onClick={onLogout}>
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
          {viewTabs.map((tab) => (
            <button
              key={tab.id}
              className={`workspace-tab ${
                activeView === tab.id ? 'workspace-tab-active' : ''
              }`}
              type="button"
              role="tab"
              aria-selected={activeView === tab.id}
              onClick={() => setActiveView(tab.id)}
            >
              <span className={`workspace-tab-icon ${tab.iconClass}`} />
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      <div className="workspace-layout">
        <aside className="workspace-sidebar panel">
          <div className="sidebar-section">
            <p className="eyebrow">Workspace</p>
            <h2>Portfolio operations</h2>
            <p className="sidebar-copy">
              Manage delivery status, review priorities, and keep project
              execution visible across teams.
            </p>
          </div>

          <nav className="sidebar-nav">
            <button
              className={`sidebar-nav-item ${
                activeView === 'board' ? 'sidebar-nav-item-active' : ''
              }`}
              type="button"
              onClick={() => setActiveView('board')}
            >
              <span className="sidebar-nav-icon" />
              Board
            </button>
            <button
              className={`sidebar-nav-item ${
                activeView === 'timeline' ? 'sidebar-nav-item-active' : ''
              }`}
              type="button"
              onClick={() => setActiveView('timeline')}
            >
              <span className="sidebar-nav-icon" />
              Timeline
            </button>
            <button
              className={`sidebar-nav-item ${
                activeView === 'reports' ? 'sidebar-nav-item-active' : ''
              }`}
              type="button"
              onClick={() => setActiveView('reports')}
            >
              <span className="sidebar-nav-icon" />
              Reporting
            </button>
            <button className="sidebar-nav-item" type="button">
              <span className="sidebar-nav-icon" />
              Team
            </button>
            <button
              className={`sidebar-nav-item ${
                activeView === 'settings' ? 'sidebar-nav-item-active' : ''
              }`}
              type="button"
              onClick={() => setActiveView('settings')}
            >
              <span className="sidebar-nav-icon" />
              Settings
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
                <span>Open</span>
                <strong>{openCount}</strong>
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

          <div className="sidebar-section">
            <p className="eyebrow">Quick actions</p>
            <div className="sidebar-action-list">
              <button className="sidebar-action-button" type="button" onClick={handleOpenCreate}>
                <span className="sidebar-action-icon" />
                New project
              </button>
              <button className="sidebar-action-button" type="button" onClick={loadProjects}>
                <span className="sidebar-action-icon" />
                Refresh data
              </button>
            </div>
          </div>
        </aside>

        <section className="workspace-main">
          {error && <div className="app-message error-message">{error}</div>}
          {success && <div className="app-message success-message">{success}</div>}

          {activeView === 'board' ? (
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
            </div>
          ) : activeView === 'timeline' ? (
            <section className="view-panel panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Timeline</p>
                  <h2>Delivery sequencing</h2>
                  <p className="panel-copy">
                    Review which priorities are active now and which completed items
                    are ready for retrospective reporting.
                  </p>
                </div>
              </div>
              <div className="timeline-list">
                {projects.length === 0 ? (
                  <div className="view-empty-state">No projects available for timeline view.</div>
                ) : (
                  projects.map((project) => (
                    <article key={project.id} className="timeline-item">
                      <div className="timeline-marker" />
                      <div className="timeline-content">
                        <h3>{project.title}</h3>
                        <p>{project.description}</p>
                        <div className="timeline-meta">
                          <span className={`badge status-${project.status}`}>
                            {getProjectStatusLabel(project.status)}
                          </span>
                          <span className={`badge priority-${project.priority}`}>
                            {project.priority} priority
                          </span>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>
          ) : activeView === 'reports' ? (
            <section className="view-panel panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Reports</p>
                  <h2>Portfolio reporting</h2>
                  <p className="panel-copy">
                    High-level operational metrics for leadership review and investor updates.
                  </p>
                </div>
              </div>
              <div className="report-grid">
                <article className="report-card">
                  <div className="report-card-icon report-icon-completion" />
                  <span>Delivery completion rate</span>
                  <strong>
                    {projects.length === 0
                      ? '0%'
                      : `${Math.round((completedCount / projects.length) * 100)}%`}
                  </strong>
                </article>
                <article className="report-card">
                  <div className="report-card-icon report-icon-alert" />
                  <span>Projects needing attention</span>
                  <strong>{highPriorityCount}</strong>
                </article>
                <article className="report-card">
                  <div className="report-card-icon report-icon-load" />
                  <span>Open execution load</span>
                  <strong>{openCount}</strong>
                </article>
              </div>
            </section>
          ) : (
            <section className="view-panel panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Settings</p>
                  <h2>Workspace preferences</h2>
                  <p className="panel-copy">
                    Configure how the portfolio board is presented to operators and stakeholders.
                  </p>
                </div>
              </div>
              <div className="settings-list">
                <div className="settings-row">
                  <span>Board mode</span>
                  <strong>Kanban</strong>
                </div>
                <div className="settings-row">
                  <span>Reporting cadence</span>
                  <strong>Weekly</strong>
                </div>
                <div className="settings-row">
                  <span>Priority scale</span>
                  <strong>Low / Medium / High</strong>
                </div>
              </div>
            </section>
          )}
        </section>
      </div>

      {isCreateModalOpen && (
        <div className="project-modal-backdrop" onClick={handleCancelCreate}>
          <div
            className="project-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-project-title"
          >
            <ProjectForm
              editingProject={null}
              isModal
              loading={savingProject}
              onCancelEdit={handleCancelCreate}
              onSubmitProject={handleSubmitProject}
            />
          </div>
        </div>
      )}

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
