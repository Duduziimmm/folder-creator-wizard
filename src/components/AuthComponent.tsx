
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";

interface Props {
  children: React.ReactNode;
  requiredRole?: "admin" | "coordinator" | "analyst";
}

const AuthComponent = ({ children, requiredRole }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasRequiredRole, setHasRequiredRole] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }

      if (requiredRole) {
        const { data: hasRole, error } = await supabase.rpc('has_role', {
          role_to_check: requiredRole
        });

        if (error) {
          console.error('Error checking role:', error);
          toast({
            variant: "destructive",
            title: "Erro",
            description: "Erro ao verificar permissões."
          });
          return;
        }

        if (!hasRole) {
          toast({
            variant: "destructive",
            title: "Acesso negado",
            description: "Você não tem permissão para acessar esta página."
          });
          navigate('/analyst');
          return;
        }

        setHasRequiredRole(true);
      }

      setIsAuthenticated(true);
      setIsLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/login');
      } else if (event === 'SIGNED_IN' && session) {
        checkAuth();
      }
    });

    checkAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, requiredRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || (requiredRole && !hasRequiredRole)) {
    return null;
  }

  return <>{children}</>;
};

export default AuthComponent;
