import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught React Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container py-5 text-center">
          <div className="card shadow-sm mx-auto border-0" style={{ maxWidth: '500px' }}>
            <div className="card-body p-4">
              <div className="mb-3 text-warning">
                <i className="fas fa-exclamation-triangle fa-3x"></i>
              </div>
              <h5 className="fw-bold mb-2">Ocurrió un error visual temporal</h5>
              <p className="text-600 fs--1 mb-4">
                La interfaz se desincronizó momentáneamente con el navegador. Tus datos guardados están seguros.
              </p>
              <button
                className="btn btn-primary btn-sm px-4"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
              >
                <i className="fas fa-sync-alt me-2"></i>Recargar Vista
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
