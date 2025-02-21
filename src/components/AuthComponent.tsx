
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";

interface Props {
  children: React.ReactNode;
  requiredRole?: "admin" | "coordinator" | "analyst";
}

const AuthComponent = ({ children, requiredRole }: Props) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/login', { replace: true });
          return;
        }

        // Verifica se o usuário é admin
        const { data: isAdmin } = await supabase.rpc('has_role', {
          role_to_check: 'admin'
        });

        // Se o usuário é admin, permite acesso a qualquer página
        if (isAdmin) {
          setIsLoading(false);
          return;
        }

        // Se não é admin e a página requer uma role específica
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
            navigate('/login', { replace: true });
            return;
          }

          if (!hasRole) {
            const { data: userRole } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', session.user.id)
              .single();

            const redirectPath = userRole?.role === 'coordinator' 
              ? '/coordinator' 
              : '/analyst';

            toast({
              variant: "destructive",
              title: "Acesso negado",
              description: "Você não tem permissão para acessar esta página."
            });
            
            navigate(redirectPath, { replace: true });
            return;
          }
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Auth check error:', error);
        navigate('/login', { replace: true });
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/login', { replace: true });
      } else if (event === 'SIGNED_IN' && session) {
        checkAuth();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, requiredRole, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthComponent;
