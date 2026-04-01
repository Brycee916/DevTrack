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

  const formattedDate = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="dashboard-shell">
      <header className="workspace-topbar panel">
        <div className="workspace-topbar-left">
          <div className="workspace-branding">
            <div className="workspace-logo">DT</div>
            <div>
              <h1>DevTrack</h1>
            </div>
          </div>

          <nav className="workspace-topnav" aria-label="Primary">
            {viewTabs.map((tab) => (
              <button
                key={tab.id}
                className={`workspace-topnav-link ${
                  activeView === tab.id ? 'workspace-topnav-link-active' : ''
                }`}
                type="button"
                onClick={() => setActiveView(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="workspace-topbar-right">
          <label className="workspace-search" aria-label="Search workspace">
            <span className="workspace-search-icon" />
            <input type="search" placeholder="Search..." />
          </label>

          <div className="workspace-toolbar-icons" aria-label="Workspace tools">
            <button className="workspace-icon-button" type="button" aria-label="Notifications">
              <span className="workspace-icon workspace-icon-bell" />
            </button>
            <button className="workspace-icon-button" type="button" aria-label="Help">
              <span className="workspace-icon workspace-icon-help" />
            </button>
            <button className="workspace-icon-button" type="button" aria-label="Settings">
              <span className="workspace-icon workspace-icon-settings" />
            </button>
          </div>

          <button className="primary-button workspace-create-button" type="button" onClick={handleOpenCreate}>
            Create
          </button>

          <button className="workspace-avatar" type="button" aria-label="Profile">
            DT
          </button>
        </div>
      </header>

      <div
        className={`workspace-layout ${activeView === 'board' ? 'workspace-layout-board' : ''}`}
      >
        <aside className="workspace-sidebar panel">
          <div className="workspace-sidebar-brand">
            <div className="workspace-sidebar-avatar">DT</div>
            <div>
              <h2>Engineering Team</h2>
              <p>Premium Workspace</p>
            </div>
          </div>

          <div className="sidebar-pane-actions">
            <button className="primary-button sidebar-primary-button" type="button" onClick={handleOpenCreate}>
              New Project
            </button>
          </div>

          <nav className="sidebar-nav">
            <button className="sidebar-nav-item sidebar-nav-item-active" type="button">
              Overview
            </button>
            <button
              className={`sidebar-nav-item ${
                activeView === 'board' ? 'sidebar-nav-item-active' : ''
              }`}
              type="button"
              onClick={() => setActiveView('board')}
            >
              Board
            </button>
            <button
              className={`sidebar-nav-item ${
                activeView === 'timeline' ? 'sidebar-nav-item-active' : ''
              }`}
              type="button"
              onClick={() => setActiveView('timeline')}
            >
              Timeline
            </button>
            <button
              className={`sidebar-nav-item ${
                activeView === 'reports' ? 'sidebar-nav-item-active' : ''
              }`}
              type="button"
              onClick={() => setActiveView('reports')}
            >
              Reports
            </button>
            <button className="sidebar-nav-item" type="button">
              Analytics
            </button>
            <button
              className={`sidebar-nav-item ${
                activeView === 'settings' ? 'sidebar-nav-item-active' : ''
              }`}
              type="button"
              onClick={() => setActiveView('settings')}
            >
              Workspace Settings
            </button>
          </nav>

          <div className="sidebar-stats-card">
            <p className="eyebrow">Workspace snapshot</p>
            <div className="sidebar-stats-list">
              <div className="sidebar-stat-row">
                <span>Total projects</span>
                <strong>{projects.length}</strong>
              </div>
              <div className="sidebar-stat-row">
                <span>Open</span>
                <strong>{openCount}</strong>
              </div>
              <div className="sidebar-stat-row">
                <span>Completed</span>
                <strong>{completedCount}</strong>
              </div>
              <div className="sidebar-stat-row">
                <span>High priority</span>
                <strong>{highPriorityCount}</strong>
              </div>
            </div>
          </div>

          <div className="sidebar-upgrade-card">
            <p className="eyebrow">Upgrade Plan</p>
            <p>Get unlimited boards and advanced visibility tools.</p>
            <button className="primary-button sidebar-upgrade-button" type="button">
              Upgrade
            </button>
          </div>

          <div className="sidebar-footer">
            <button className="sidebar-footer-link" type="button">
              Help Center
            </button>
            <button className="sidebar-footer-link" type="button" onClick={onLogout}>
              Log out
            </button>
          </div>
        </aside>

        <section className="workspace-main">
          {error && <div className="app-message error-message">{error}</div>}
          {success && <div className="app-message success-message">{success}</div>}

          {activeView === 'board' ? (
            <div className="dashboard-grid">
              <section className="board-page-header">
                <div>
                  <h2>Development Board</h2>
                  <p>{formattedDate}</p>
                </div>
                <div className="board-page-actions">
                  <button
                    className="ghost-button board-page-filter"
                    type="button"
                    onClick={() => setStatusFilter('all')}
                  >
                    Reset Filters
                  </button>
                  <button className="primary-button" type="button" onClick={handleOpenCreate}>
                    Create Project
                  </button>
                </div>
              </section>
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
