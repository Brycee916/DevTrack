import './ProjectList.css'

import { useState } from 'react'

export default function ProjectList({
  editingProjectId,
  onEdit,
  onMoveProject,
  onSearchChange,
  onStatusFilterChange,
  projects,
  projectCount,
  searchTerm,
  statusFilter,
  loading,
  deletingProjectId,
  movingProjectId,
  onDelete,
}) {
  const [draggedProjectId, setDraggedProjectId] = useState(null)
  const [activeDropColumn, setActiveDropColumn] = useState('')

  const columns = [
    {
      key: 'active',
      title: 'In Progress',
      description: 'Projects currently moving through delivery.',
    },
    {
      key: 'complete',
      title: 'Completed',
      description: 'Finished work ready for reporting or handoff.',
    },
  ]

  if (loading) {
    return (
      <section className="board-panel panel">
        <div className="board-header">
          <div>
            <p className="eyebrow">Board View</p>
            <h2>Loading projects...</h2>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="board-panel panel">
      <div className="board-header">
        <div>
          <p className="eyebrow">Board View</p>
          <h2>Team delivery board</h2>
          <p className="board-copy">
            A kanban-style view of the current portfolio, grouped by delivery state.
          </p>
        </div>
      </div>

      <div className="project-toolbar">
        <label className="toolbar-search">
          <span>Search</span>
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search title or description"
          />
        </label>

        <label className="toolbar-filter">
          <span>Status</span>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="complete">Complete</option>
          </select>
        </label>
      </div>

      <div className="board-columns">
        {columns.map((column) => {
          const columnProjects = projects.filter((project) => project.status === column.key)

          return (
            <section
              key={column.key}
              className={`board-column ${
                activeDropColumn === column.key ? 'board-column-drop-active' : ''
              }`}
              onDragOver={(e) => {
                e.preventDefault()
                if (draggedProjectId) {
                  setActiveDropColumn(column.key)
                }
              }}
              onDragLeave={() => {
                if (activeDropColumn === column.key) {
                  setActiveDropColumn('')
                }
              }}
              onDrop={async (e) => {
                e.preventDefault()
                const projectId = Number(e.dataTransfer.getData('text/plain'))

                setActiveDropColumn('')
                if (!projectId) {
                  setDraggedProjectId(null)
                  return
                }

                await onMoveProject(projectId, column.key)
                setDraggedProjectId(null)
              }}
            >
              <header className="board-column-header">
                <div>
                  <h3>{column.title}</h3>
                  <p>{column.description}</p>
                </div>
                <span className="column-count">{columnProjects.length}</span>
              </header>

              <div className="project-list">
                {columnProjects.length === 0 ? (
                  <div className="column-empty">
                    {projectCount === 0
                      ? 'Create a project to populate the board.'
                      : 'No projects match this column right now.'}
                  </div>
                ) : (
                  columnProjects.map((project) => (
                    <article
                      key={project.id}
                      className={`project-card ${
                        draggedProjectId === project.id ? 'project-card-dragging' : ''
                      }`}
                      draggable={movingProjectId !== project.id}
                      onDragStart={(e) => {
                        setDraggedProjectId(project.id)
                        e.dataTransfer.setData('text/plain', String(project.id))
                        e.dataTransfer.effectAllowed = 'move'
                      }}
                      onDragEnd={() => {
                        setDraggedProjectId(null)
                        setActiveDropColumn('')
                      }}
                    >
                      <div className="project-card-top">
                        <div>
                          <h4>{project.title}</h4>
                          <p>{project.description}</p>
                        </div>
                      </div>

                      <div className="project-meta">
                        <span className={`badge status-${project.status}`}>
                          {project.status}
                        </span>
                        <span className={`badge priority-${project.priority}`}>
                          {project.priority} priority
                        </span>
                      </div>

                      <div className="project-card-footer">
                        <span className="created-at">
                          {movingProjectId === project.id
                            ? 'Moving card...'
                            : `Updated view ${new Date(project.created_at).toLocaleDateString()}`}
                        </span>
                        <div className="project-actions">
                          <button
                            className="ghost-button"
                            type="button"
                            disabled={
                              deletingProjectId === project.id ||
                              movingProjectId === project.id
                            }
                            onClick={() => onEdit(project)}
                          >
                            {editingProjectId === project.id ? 'Editing' : 'Edit'}
                          </button>
                          <button
                            className="ghost-button ghost-danger"
                            type="button"
                            disabled={
                              deletingProjectId === project.id ||
                              movingProjectId === project.id
                            }
                            onClick={() => onDelete(project.id)}
                          >
                            {deletingProjectId === project.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>
          )
        })}
      </div>
    </section>
  )
}
