import { useEffect, useState } from 'react'
import './ProjectForm.css'

const initialForm = {
  title: '',
  description: '',
  status: 'active',
  priority: 'medium',
}

export default function ProjectForm({
  editingProject,
  isModal = false,
  loading,
  onCancelEdit,
  onSubmitProject,
}) {
  const [form, setForm] = useState(initialForm)

  useEffect(() => {
    if (editingProject) {
      setForm({
        title: editingProject.title || '',
        description: editingProject.description || '',
        status: editingProject.status || 'active',
        priority: editingProject.priority || 'medium',
      })
      return
    }

    setForm(initialForm)
  }, [editingProject])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const wasSaved = await onSubmitProject(form)

    if (wasSaved && !editingProject) {
      setForm(initialForm)
    }
  }

  return (
    <section className={`panel ${isModal ? 'editor-modal-panel' : 'editor-panel'}`}>
      <div className="panel-header">
        <div>
          <p className="eyebrow">{editingProject ? 'Editor' : 'Add Project'}</p>
          <h2>
            {editingProject ? 'Update project details' : 'Create a new project card'}
          </h2>
          <p className="panel-copy">
            Drag cards between board columns to update status. Use this panel to
            create new cards or edit project details when needed.
          </p>
        </div>

        {isModal && (
          <button
            className="modal-close-button"
            type="button"
            onClick={onCancelEdit}
            aria-label="Close edit dialog"
          >
            Close
          </button>
        )}
      </div>

      <form className="project-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Title</span>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Enterprise onboarding launch"
            required
          />
        </label>

        <label className="field">
          <span>Description</span>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="4"
            placeholder="Add context, deliverables, stakeholders, and the next milestone."
            required
          />
        </label>

        <div className="form-grid">
          <label className="field">
            <span>Status</span>
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="active">Active</option>
              <option value="complete">Complete</option>
            </select>
          </label>

          <label className="field">
            <span>Priority</span>
            <select name="priority" value={form.priority} onChange={handleChange}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
        </div>

        <div className="form-actions">
          <button className="primary-button" type="submit" disabled={loading}>
            {loading
              ? editingProject
                ? 'Updating project...'
                : 'Saving project...'
              : editingProject
                ? 'Update project'
                : 'Create project'}
          </button>

          {editingProject && (
            <button
              className="ghost-button"
              type="button"
              disabled={loading}
              onClick={onCancelEdit}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  )
}
