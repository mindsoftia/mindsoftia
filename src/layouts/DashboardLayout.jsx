import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import TopNav  from '../components/common/TopNav';
import Footer  from '../components/common/Footer';
import SettingsPanel from '../components/common/SettingsPanel';

/**
 * DashboardLayout — Layout principal del panel administrativo.
 * Estructura: Sidebar izquierdo + contenido derecho (TopNav + vista + Footer)
 * Usado como contenedor de todas las rutas privadas en App.jsx.
 */
function DashboardLayout() {
  const [isFluid, setIsFluid] = React.useState(JSON.parse(localStorage.getItem('isFluid')) || false);

  React.useEffect(() => {
    const handleStorageChange = () => {
      setIsFluid(JSON.parse(localStorage.getItem('isFluid')) || false);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <main className="main" id="top">
      <div className={isFluid ? "container-fluid" : "container"} data-layout="container">
        <Sidebar />
        <div className="content">
          <TopNav />
          <div className="pt-4 pb-4">
            <Outlet />
          </div>
          <Footer />
        </div>
      </div>
      <SettingsPanel />
    </main>
  );
}

export default DashboardLayout;
