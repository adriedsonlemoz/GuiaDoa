import React, { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Falha no módulo:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center mt-12 px-4 max-w-xs mx-auto">
          <div
            className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center text-4xl bg-aoe-card border-2 border-aoe-gold2"
            style={{ boxShadow: '0 4px 16px rgba(62,47,28,0.15)' }}
          >
            ⚠️
          </div>
          <p className="font-cinzel font-bold text-base tracking-wide text-aoe-red mb-1 m-0">
            Módulo Inacessível
          </p>
          <p className="font-nunito text-sm text-aoe-mid leading-relaxed mb-4 m-0">
            Ocorreu uma falha ao carregar esta secção.
          </p>
          <button
            className="btn-navy btn-lg"
            onClick={() => {
              this.setState({ hasError: false });
              this.props.onReset();
            }}
          >
            ← Voltar ao Quartel
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
