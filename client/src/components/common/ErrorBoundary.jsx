import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return <div className="p-6 text-gray-700">Something went wrong. Please refresh the page.</div>;
    }
    return this.props.children;
  }
}
