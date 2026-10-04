import { Component, type ErrorInfo, type ReactNode } from 'react'

interface State {
  failed: boolean
}

/** Last line of defence: a render crash shows a calm page with a way back instead of a blank screen. */
export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Hook point for an error-reporting service (Sentry, LogRocket...).
    console.error('Unhandled render error', error, info.componentStack)
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div role="alert" className="mx-auto grid min-h-svh max-w-lg content-center gap-4 px-6 text-center">
        <p className="font-script-title text-4xl text-burgundy-soft">Oh no</p>
        <h1 className="text-5xl">Something went wrong</h1>
        <p className="text-muted">We hit an unexpected problem. Your cart is safe. Please reload the page, or go back to the home page.</p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => window.location.reload()} className="min-h-12 rounded-full bg-burgundy px-7 font-medium text-ivory">
            Reload
          </button>
          <a href="/" className="inline-flex min-h-12 items-center rounded-full border border-burgundy/40 px-7 font-medium text-burgundy">
            Home
          </a>
        </div>
      </div>
    )
  }
}
