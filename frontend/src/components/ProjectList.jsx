import './ProjectList.css'

export default function ProjectList({ projects, loading, onDelete }) {
  if (loading) {
    return (
      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Project Board</p>
            <h2>Loading your projects...</h2>
          </div>
        </div>
      </section>
    )
  }

  if (projects.length === 0) {
    return (
      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Project Board</p>
            <h2>No projects yet</h2>
          </div>
        </div>
        <p className="empty-state">
          Create your first project to start tracking what matters.
        </p>
      </section>
    )
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Project Board</p>
          <h2>{projects.length} project{projects.length === 1 ? '' : 's'} in motion</h2>
        </div>
      </div>

      <div className="project-list">
        {projects.map((project) => (
          <article key={project.id} className="project-card">
            <div className="project-card-top">
              <div>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
              </div>
              <button
                className="ghost-button"
                type="button"
                onClick={() => onDelete(project.id)}
              >
                Delete
              </button>
            </div>

            <div className="project-meta">
              <span className={`badge status-${project.status}`}>{project.status}</span>
              <span className={`badge priority-${project.priority}`}>
                {project.priority} priority
              </span>
              <span className="created-at">
                {new Date(project.created_at).toLocaleDateString()}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
