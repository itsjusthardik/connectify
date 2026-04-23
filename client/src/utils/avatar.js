export const getInitials = (name) =>
  name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'

export const getAvatarColor = (name) => {
  const colors = ['#6366F1', '#22D3EE', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
  return colors[(name?.charCodeAt(0) || 0) % colors.length]
}
