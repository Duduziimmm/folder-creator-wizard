
import React from 'react';

const BoletosTable = () => {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[640px] table-auto">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Número</th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Valor</th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Vencimento</th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Status</th>
          </tr>
        </thead>
        <tbody>
          {/* Aqui será inserido o conteúdo dinâmico dos boletos */}
        </tbody>
      </table>
    </div>
  );
};

export default BoletosTable;
