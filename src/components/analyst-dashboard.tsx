
import React from 'react';
import BoletosTable from './shared/boletos-table';

const AnalystDashboard = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard do Analista</h1>
      <div className="grid gap-6">
        <BoletosTable />
      </div>
    </div>
  );
};

export default AnalystDashboard;
