
import React from 'react';

const ConsultaBoletos = () => {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Consulta de Boletos</h2>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Número do boleto"
          className="w-full p-2 border border-gray-300 rounded"
        />
        <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors">
          Consultar
        </button>
      </div>
    </div>
  );
};

export default ConsultaBoletos;
