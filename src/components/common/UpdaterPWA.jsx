import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

function UpdaterPWA() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW registrado: ', r);
    },
    onRegisterError(error) {
      console.log('Error en SW: ', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!offlineReady && !needRefresh) return null;

  return (
    <div
      className="position-fixed bottom-0 end-0 p-3"
      style={{ zIndex: 9999 }}
    >
      <div className="toast show align-items-center text-white bg-primary border-0 shadow" role="alert" aria-live="assertive" aria-atomic="true">
        <div className="d-flex">
          <div className="toast-body">
            {offlineReady
              ? 'Mindsoftia está listo para usarse sin conexión.'
              : 'Hay una nueva versión disponible de Mindsoftia. Haz clic en el botón para actualizar.'}
          </div>
          <button
            type="button"
            className="btn-close btn-close-white me-2 m-auto"
            aria-label="Close"
            onClick={close}
          ></button>
        </div>
        {needRefresh && (
          <div className="toast-body pt-0">
            <button
              className="btn btn-light btn-sm w-100"
              onClick={() => updateServiceWorker(true)}
            >
              Recargar para Actualizar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default UpdaterPWA;
