import React, { Component } from 'react';
import AppErrorState from '../ui/AppErrorState.jsx';
import { buildDiagnostic } from '../errors/appErrors.js';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError:false, error:null, componentStack:'' };
  }

  static getDerivedStateFromError(error) {
    return { hasError:true, error };
  }

  componentDidCatch(error, info) {
    console.error('[GD-UI-001]', error, info);
    this.setState({ componentStack:info?.componentStack || '' });
  }

  reset = () => this.setState({ hasError:false, error:null, componentStack:'' });

  render() {
    if (this.state.hasError) {
      const diagnostic = buildDiagnostic({
        code:'GD-UI-001',
        error:this.state.error,
        componentStack:this.state.componentStack,
        context:typeof window !== 'undefined' ? window.location.hash || 'interface' : 'interface',
      });
      return (
        <div style={{ padding:'24px 10px' }}>
          <AppErrorState
            code="GD-UI-001"
            diagnostic={diagnostic}
            onRetry={this.reset}
            onHome={() => {
              this.reset();
              this.props.onReset?.();
            }}
          />
        </div>
      );
    }
    return this.props.children;
  }
}
