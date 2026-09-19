import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('AeroNova render error:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ error: null });
    window.location.href = '/';
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 text-center">
        <p className="eyebrow text-red-600">Something broke on this page</p>
        <h1 className="text-h2 max-w-lg">This route hit an error instead of loading.</h1>
        <pre className="max-w-xl overflow-auto rounded-lg bg-mist-100 p-4 text-left text-[0.8125rem] text-ink-700">
          {error.message}
        </pre>
        <button
          type="button"
          onClick={this.handleReset}
          className="mt-2 rounded-full bg-navy-900 px-5 py-2.5 text-[0.9375rem] font-medium text-white"
        >
          Back to home
        </button>
      </div>
    );
  }
}
