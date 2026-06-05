
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AdminUser } from '@/hooks/useUserRoles';

interface UserStatusModalProps {
  user: AdminUser | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (userId: string, isPremium: boolean, isTrialActive: boolean, extendTrialDays: number) => Promise<void>;
}

export const UserStatusModal: React.FC<UserStatusModalProps> = ({
  user,
  isOpen,
  onClose,
  onSave
}) => {
  const [isPremium, setIsPremium] = useState(false);
  const [isTrialActive, setIsTrialActive] = useState(false);
  const [extendTrialDays, setExtendTrialDays] = useState(0);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (user) {
      setIsPremium(user.is_premium);
      setIsTrialActive(user.is_trial_active);
      setExtendTrialDays(0);
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await onSave(user.user_id, isPremium, isTrialActive, extendTrialDays);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Status do Usuário</DialogTitle>
          <DialogDescription>
            Editando: {user.email}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="premium">Usuário Premium</Label>
            <Switch
              id="premium"
              checked={isPremium}
              onCheckedChange={setIsPremium}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="trial">Trial Ativo</Label>
            <Switch
              id="trial"
              checked={isTrialActive}
              onCheckedChange={setIsTrialActive}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="extend" className="text-right">
              Estender Trial
            </Label>
            <Input
              id="extend"
              type="number"
              value={extendTrialDays}
              onChange={(e) => setExtendTrialDays(parseInt(e.target.value) || 0)}
              className="col-span-3"
              placeholder="Dias adicionais"
            />
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>Status atual:</p>
            <p>• Premium: {user.is_premium ? 'Sim' : 'Não'}</p>
            <p>• Trial: {user.is_trial_active ? 'Ativo' : 'Inativo'}</p>
            <p>• Dias restantes: {user.days_remaining}</p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
