
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });

  useEffect(() => {
    checkProfile();
  }, []);

  const checkProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }

      // Verificar se o perfil já está completo
      const { data: profile } = await supabase
        .from('profiles')
        .select('completed_profile')
        .eq('id', session.user.id)
        .single();

      if (profile?.completed_profile) {
        // Se o perfil já estiver completo, redireciona para a página apropriada
        const { data: userRole } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();

        const redirectPath = userRole?.role === 'coordinator' 
          ? '/coordinator' 
          : '/analyst';

        navigate(redirectPath);
      }
    } catch (error) {
      console.error('Error checking profile:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          phone: formData.phone,
          completed_profile: true,
        })
        .eq('id', session.user.id);

      if (error) throw error;

      toast({
        title: "Perfil atualizado",
        description: "Seu perfil foi atualizado com sucesso!"
      });

      // Buscar a role do usuário para redirecionamento
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      const redirectPath = userRole?.role === 'coordinator' 
        ? '/coordinator' 
        : '/analyst';

      navigate(redirectPath);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar perfil",
        description: error.message || "Ocorreu um erro ao atualizar seu perfil."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Complete seu perfil
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Por favor, complete suas informações para continuar
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nome completo
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1"
                placeholder="Seu nome completo"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Telefone
              </label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                className="mt-1"
                placeholder="Seu telefone"
              />
            </div>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Salvando..." : "Salvar perfil"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
