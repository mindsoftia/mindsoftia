import React from 'react';

function StatCard({ title, value, change, isPositive, icon, color = 'primary' }) {
  return (
    <div className="card overflow-hidden" style={{ minWidth: '12rem' }}>
      <div className={`bg-holder bg-card`} style={{ backgroundImage: 'url(/assets/img/icons/spot-illustrations/corner-1.png)' }}></div>
      <div className="card-body position-relative">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <h6 className="text-500 mb-0">{title}</h6>
          {icon && (
            <span className={`badge badge-soft-${color} p-2 rounded-circle fs-6`}>
              <span className={icon}></span>
            </span>
          )}
        </div>
        <div className="d-flex align-items-center align-self-center">
          <h3 className="mb-0 text-700 fw-normal">{value}</h3>
          {change && (
            <span className={`badge rounded-pill ms-3 badge-soft-${isPositive ? 'success' : 'danger'}`}>
              <span className={`fas fa-arrow-${isPositive ? 'up' : 'down'} me-1`}></span>
              {change}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default StatCard;
