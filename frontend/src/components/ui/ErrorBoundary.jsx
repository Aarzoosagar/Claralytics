import React from 'react'
import { AlertTriangle } from 'lucide-react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="card p-6 flex items-start gap-3">
          <AlertTriangle size={16} className="text-yellow-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-white">
              {this.props.fallbackTitle || 'Something went wrong'}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="btn-ghost mt-3 text-xs"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
