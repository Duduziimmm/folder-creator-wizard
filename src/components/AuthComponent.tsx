
import React from 'react';

const AuthComponent = ({ children }: { children: React.ReactNode }) => {
  // Aqui você pode implementar a lógica de autenticação
  const isAuthenticated = true; // Exemplo - deve ser implementado com sua lógica real

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-red-600">Acesso Negado</h2>
          <p className="mt-2 text-gray-600">Você precisa estar autenticado para acessar esta página.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthComponent;
