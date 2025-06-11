export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount)
}

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export const generateId = () => {
  return Math.random().toString(36).substr(2, 9)
}

export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text
  return text.substr(0, maxLength) + '...'
}