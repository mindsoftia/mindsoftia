import React from 'react';

function Footer() {
  return (
    <footer className="footer mt-auto py-3">
      <div className="row g-0 justify-content-between fs--1 mt-4 mb-3">
        <div className="col-12 col-sm-auto text-center">
          <p className="mb-0 text-600">
            Gracias por construir con <span className="font-sans-serif fw-bold text-primary">Mindsoftia</span>
            <span className="d-none d-sm-inline-block"> | </span>
            <br className="d-sm-none" /> {new Date().getFullYear()} &copy;
          </p>
        </div>
        <div className="col-12 col-sm-auto text-center">
          <p className="mb-0 text-600">v1.0.0</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
