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
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Project Intake</p>
          <h2>
            {editingProject
              ? 'Update the details and keep it moving'
              : 'Start something worth shipping'}
          </h2>
        </div>
      </div>

      <form className="project-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Title</span>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Launch landing page redesign"
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
            placeholder="Capture the goal, scope, and next milestone."
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
