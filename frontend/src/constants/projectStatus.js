export const PROJECT_STATUSES = [
  {
    key: 'backlog',
    label: 'Backlog',
    boardTitle: 'Backlog',
    description: 'Planned work waiting to be picked up.',
  },
  {
    key: 'active',
    label: 'Active',
    boardTitle: 'In Progress',
    description: 'Projects currently moving through delivery.',
  },
  {
    key: 'inReview',
    label: 'In Review',
    boardTitle: 'In Review',
    description: 'Work awaiting approval, QA, or stakeholder review.',
  },
  {
    key: 'complete',
    label: 'Complete',
    boardTitle: 'Completed',
    description: 'Finished work ready for reporting or handoff.',
  },
]

export function getProjectStatusLabel(status) {
  return PROJECT_STATUSES.find((option) => option.key === status)?.label ?? status
}
