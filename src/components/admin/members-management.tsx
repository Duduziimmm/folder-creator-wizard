
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Member {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

const MembersManagement = () => {
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('analyst');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          id,
          role,
          created_at,
          user_id,
          profiles (
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMembers(data.map(item => ({
        id: item.id,
        email: item.profiles?.email || '',
        role: item.role,
        created_at: item.created_at
      })));
    } catch (error) {
      console.error('Error loading members:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar membros",
        description: "Ocorreu um erro ao carregar a lista de membros."
      });
    }
  };

  const handleAddMember = async () => {
    if (!newMemberEmail || !newMemberRole) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos."
      });
      return;
    }

    setIsLoading(true);
    try {
      // Primeiro, verifica se o usuário já existe
      const { data: existingUser, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', newMemberEmail)
        .single();

      if (userError || !existingUser) {
        toast({
          variant: "destructive",
          title: "Usuário não encontrado",
          description: "Este email não está registrado no sistema."
        });
        return;
      }

      // Adiciona a role ao usuário
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert([{
          user_id: existingUser.id,
          role: newMemberRole as "admin" | "coordinator" | "analyst"
        }]);

      if (roleError) throw roleError;

      toast({
        title: "Membro adicionado",
        description: "O novo membro foi adicionado com sucesso!"
      });

      setNewMemberEmail('');
      setNewMemberRole('analyst');
      loadMembers();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao adicionar membro",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Membro removido",
        description: "O membro foi removido com sucesso!"
      });

      loadMembers();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao remover membro",
        description: "Ocorreu um erro ao tentar remover o membro."
      });
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gerenciamento de Membros</h1>
      
      <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4">Adicionar Novo Membro</h2>
        <div className="flex gap-4 mb-4">
          <Input
            placeholder="Email do novo membro"
            value={newMemberEmail}
            onChange={(e) => setNewMemberEmail(e.target.value)}
            className="flex-1"
          />
          <Select value={newMemberRole} onValueChange={setNewMemberRole}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Selecione a função" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="analyst">Analista</SelectItem>
              <SelectItem value="coordinator">Coordenador</SelectItem>
              <SelectItem value="admin">Administrador</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={handleAddMember}
            disabled={isLoading}
          >
            {isLoading ? "Adicionando..." : "Adicionar Membro"}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Membros Atuais</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">Função</th>
                <th className="text-left py-3 px-4">Data de Adição</th>
                <th className="text-right py-3 px-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="border-b">
                  <td className="py-3 px-4">{member.email}</td>
                  <td className="py-3 px-4 capitalize">{member.role}</td>
                  <td className="py-3 px-4">
                    {new Date(member.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button 
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      Remover
                    </Button>
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">
                    Nenhum membro encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MembersManagement;
