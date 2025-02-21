
import React from 'react';

interface Boleto {
  id: string;
  value: number;
  dueDate: string;
  status: string;
}

interface BoletosTableProps {
  boletos: Boleto[];
}

const BoletosTable = ({ boletos }: BoletosTableProps) => {
  if (!boletos?.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhum boleto encontrado.
      </div>
    );
  }

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
          {boletos.map((boleto) => (
            <tr key={boleto.id} className="border-b border-gray-100">
              <td className="py-3 px-4 text-sm">{boleto.id}</td>
              <td className="py-3 px-4 text-sm">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(boleto.value)}
              </td>
              <td className="py-3 px-4 text-sm">
                {new Date(boleto.dueDate).toLocaleDateString('pt-BR')}
              </td>
              <td className="py-3 px-4 text-sm">{boleto.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BoletosTable;
