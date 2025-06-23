// ActionButton.jsx
import React from 'react'

export default function ActionButton({ 
  onClick, 
  children, 
  className = '', 
  disabled = false, 
  color, 
  icon: Icon, 
  title,
  size = 'md',
  variant = 'default',
  ...props 
}) {
  // Size variants
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  }

  // Base classes
  const baseClasses = `
    inline-flex items-center justify-center
    font-medium rounded-lg
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    hover:shadow-md active:scale-95
  `.replace(/\s+/g, ' ').trim()

  // If color is provided, use it for background
  const colorStyle = color ? {
    backgroundColor: color,
    color: 'white'
  } : {}

  // If it's an icon-only button (no children, only icon)
  const isIconOnly = Icon && !children

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${isIconOnly ? 'aspect-square' : ''}
        ${className}
      `.replace(/\s+/g, ' ').trim()}
      style={colorStyle}
      title={title}
      {...props}
    >
      {Icon && <Icon className={`w-4 h-4 ${children ? 'mr-2' : ''}`} />}
      {children}
    </button>
  )
}