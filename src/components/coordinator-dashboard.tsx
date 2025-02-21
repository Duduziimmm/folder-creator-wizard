
import React from 'react';
import BoletosTable from './shared/boletos-table';

const CoordinatorDashboard = () => {
  // Inicializando um array vazio de boletos
  const boletos = [];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard do Coordenador</h1>
      <div className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Total de Boletos</h3>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Boletos Pendentes</h3>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Boletos Pagos</h3>
            <p className="text-2xl font-bold">0</p>
          </div>
        </div>
        <BoletosTable boletos={boletos} />
      </div>
    </div>
  );
};

export default CoordinatorDashboard;
