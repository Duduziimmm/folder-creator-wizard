
import React from 'react';

interface Boleto {
  id: string;
  value: number;
  dueDate: string;
  status: string;
  customer: string;
}

interface BoletosTableProps {
  boletos: Boleto[];
}

const BoletosTable = ({ boletos }: BoletosTableProps) => {
  if (!boletos?.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhum boleto encontrado para a data selecionada.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[640px] table-auto">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Número</th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Cliente</th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Valor</th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Vencimento</th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Status</th>
          </tr>
        </thead>
        <tbody>
          {boletos.map((boleto) => (
            <tr key={boleto.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4 text-sm text-gray-600">{boleto.id}</td>
              <td className="py-3 px-4 text-sm text-gray-600">{boleto.customer}</td>
              <td className="py-3 px-4 text-sm text-gray-600">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(boleto.value)}
              </td>
              <td className="py-3 px-4 text-sm text-gray-600">
                {new Date(boleto.dueDate).toLocaleDateString('pt-BR')}
              </td>
              <td className="py-3 px-4">
                <span 
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${boleto.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                    boleto.status === 'RECEIVED' ? 'bg-green-100 text-green-800' : 
                    'bg-gray-100 text-gray-800'}`}
                >
                  {boleto.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BoletosTable;
