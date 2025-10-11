'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Coupon {
  id: string;
  code: string;
  type: 'PERCENT' | 'FIXED';
  discount: number;
  description: string | null;
  minValue: number | null;
  maxUses: number | null;
  currentUses: number;
  usesPerUser: number | null;
  validFrom: Date;
  validUntil: Date | null;
  isActive: boolean;
  createdAt: Date;
}

interface CouponsModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: { id: string };
}

export function CouponsModal({ isOpen, onClose, restaurant }: CouponsModalProps) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    type: 'PERCENT' as 'PERCENT' | 'FIXED',
    discount: '',
    description: '',
    minValue: '',
    maxUses: '',
    usesPerUser: '',
    validFrom: new Date().toISOString().split('T')[0],
    validFromTime: '00:00',
    validUntil: '',
    validUntilTime: '23:59',
    isActive: true
  });

  useEffect(() => {
    if (isOpen) {
      fetchCoupons();
    }
  }, [isOpen]);

  const fetchCoupons = async () => {
    try {
      const response = await fetch('/api/coupons');
      if (response.ok) {
        const data = await response.json();
        setCoupons(data);
      }
    } catch (error) {
      console.error('Erro ao buscar cupons:', error);
      toast.error('Erro ao carregar cupons');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = editingCoupon ? `/api/coupons/${editingCoupon.id}` : '/api/coupons';
      const method = editingCoupon ? 'PUT' : 'POST';

      // Combina data + hora para criar DateTime completo
      const validFromDateTime = `${formData.validFrom}T${formData.validFromTime}:00`;
      const validUntilDateTime = formData.validUntil 
        ? `${formData.validUntil}T${formData.validUntilTime}:00` 
        : null;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: formData.code,
          type: formData.type,
          discount: parseFloat(formData.discount),
          description: formData.description,
          minValue: formData.minValue ? parseFloat(formData.minValue) : null,
          maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
          usesPerUser: formData.usesPerUser ? parseInt(formData.usesPerUser) : null,
          validFrom: validFromDateTime,
          validUntil: validUntilDateTime,
          isActive: formData.isActive
        })
      });

      if (response.ok) {
        toast.success(editingCoupon ? '✏️ Cupom atualizado!' : '🎫 Cupom criado!');
        fetchCoupons();
        resetForm();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao salvar cupom');
      }
    } catch (error) {
      console.error('Erro ao salvar cupom:', error);
      toast.error('Erro ao salvar cupom');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente deletar este cupom?')) return;

    try {
      const response = await fetch(`/api/coupons/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('🗑️ Cupom deletado!');
        fetchCoupons();
      } else {
        toast.error('Erro ao deletar cupom');
      }
    } catch (error) {
      console.error('Erro ao deletar cupom:', error);
      toast.error('Erro ao deletar cupom');
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      const response = await fetch(`/api/coupons/${coupon.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isActive: !coupon.isActive
        })
      });

      if (response.ok) {
        toast.success(coupon.isActive ? '🔴 Cupom desativado' : '🟢 Cupom ativado');
        fetchCoupons();
      }
    } catch (error) {
      console.error('Erro ao atualizar cupom:', error);
      toast.error('Erro ao atualizar cupom');
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    const validFromDate = new Date(coupon.validFrom);
    const validUntilDate = coupon.validUntil ? new Date(coupon.validUntil) : null;
    
    setFormData({
      code: coupon.code,
      type: coupon.type,
      discount: coupon.discount.toString(),
      description: coupon.description || '',
      minValue: coupon.minValue?.toString() || '',
      maxUses: coupon.maxUses?.toString() || '',
      usesPerUser: coupon.usesPerUser?.toString() || '',
      validFrom: validFromDate.toISOString().split('T')[0],
      validFromTime: validFromDate.toTimeString().slice(0, 5),
      validUntil: validUntilDate ? validUntilDate.toISOString().split('T')[0] : '',
      validUntilTime: validUntilDate ? validUntilDate.toTimeString().slice(0, 5) : '23:59',
      isActive: coupon.isActive
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      code: '',
      type: 'PERCENT',
      discount: '',
      description: '',
      minValue: '',
      maxUses: '',
      usesPerUser: '',
      validFrom: new Date().toISOString().split('T')[0],
      validFromTime: '00:00',
      validUntil: '',
      validUntilTime: '23:59',
      isActive: true
    });
    setEditingCoupon(null);
    setShowForm(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-4xl my-8 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>🎫 Cupons de Desconto</CardTitle>
            <Button variant="outline" onClick={onClose}>✕</Button>
          </div>
        </CardHeader>
        <CardContent>
          {!showForm ? (
            <div className="space-y-4">
              <Button
                onClick={() => setShowForm(true)}
                className="w-full"
              >
                ➕ Novo Cupom
              </Button>

              {coupons.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-4xl mb-2">🎫</p>
                  <p>Nenhum cupom cadastrado ainda</p>
                  <p className="text-sm mt-2">Crie seu primeiro cupom de desconto!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {coupons.map((coupon) => (
                    <div
                      key={coupon.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg">{coupon.code}</h3>
                            <Badge variant={coupon.isActive ? 'default' : 'secondary'}>
                              {coupon.isActive ? '🟢 Ativo' : '🔴 Inativo'}
                            </Badge>
                            <Badge variant="outline">
                              {coupon.type === 'PERCENT' 
                                ? `${coupon.discount}% OFF` 
                                : `R$ ${coupon.discount.toFixed(2)} OFF`
                              }
                            </Badge>
                          </div>
                          {coupon.description && (
                            <p className="text-sm text-gray-600 mt-1">{coupon.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(coupon)}
                            className="text-blue-600 hover:text-blue-700"
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleToggleActive(coupon)}
                            className="text-yellow-600 hover:text-yellow-700"
                            title={coupon.isActive ? 'Desativar' : 'Ativar'}
                          >
                            {coupon.isActive ? '⏸️' : '▶️'}
                          </button>
                          <button
                            onClick={() => handleDelete(coupon.id)}
                            className="text-red-600 hover:text-red-700"
                            title="Deletar"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        {coupon.minValue && (
                          <div>
                            <span className="text-gray-600">Pedido mínimo:</span>
                            <p className="font-medium">R$ {coupon.minValue.toFixed(2)}</p>
                          </div>
                        )}
                        {coupon.maxUses && (
                          <div>
                            <span className="text-gray-600">Usos:</span>
                            <p className="font-medium">{coupon.currentUses}/{coupon.maxUses}</p>
                          </div>
                        )}
                        {coupon.validUntil && (
                          <div>
                            <span className="text-gray-600">Válido até:</span>
                            <p className="font-medium">
                              {new Date(coupon.validUntil).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-bold text-lg">
                {editingCoupon ? 'Editar Cupom' : 'Novo Cupom'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">Código do Cupom *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    placeholder="Ex: PRIMEIRACOMPRA"
                    required
                    maxLength={20}
                  />
                </div>

                <div>
                  <Label htmlFor="type">Tipo de Desconto *</Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as 'PERCENT' | 'FIXED'})}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="PERCENT">Percentual (%)</option>
                    <option value="FIXED">Valor Fixo (R$)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discount">
                    {formData.type === 'PERCENT' ? 'Percentual de Desconto (%) *' : 'Valor do Desconto (R$) *'}
                  </Label>
                  <Input
                    id="discount"
                    type="number"
                    step="0.01"
                    value={formData.discount}
                    onChange={(e) => setFormData({...formData, discount: e.target.value})}
                    placeholder={formData.type === 'PERCENT' ? '10' : '15.00'}
                    required
                    min="0"
                    max={formData.type === 'PERCENT' ? '100' : undefined}
                  />
                </div>

                <div>
                  <Label htmlFor="minValue">Pedido Mínimo (R$)</Label>
                  <Input
                    id="minValue"
                    type="number"
                    step="0.01"
                    value={formData.minValue}
                    onChange={(e) => setFormData({...formData, minValue: e.target.value})}
                    placeholder="50.00"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Ex: Desconto para primeira compra"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxUses">Máximo de Usos (total)</Label>
                  <Input
                    id="maxUses"
                    type="number"
                    value={formData.maxUses}
                    onChange={(e) => setFormData({...formData, maxUses: e.target.value})}
                    placeholder="100"
                    min="1"
                  />
                </div>

                <div>
                  <Label htmlFor="usesPerUser">Usos por Cliente</Label>
                  <Input
                    id="usesPerUser"
                    type="number"
                    value={formData.usesPerUser}
                    onChange={(e) => setFormData({...formData, usesPerUser: e.target.value})}
                    placeholder="1"
                    min="1"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="validFrom">Válido A Partir De *</Label>
                    <Input
                      id="validFrom"
                      type="date"
                      value={formData.validFrom}
                      onChange={(e) => setFormData({...formData, validFrom: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="validFromTime">Horário Início *</Label>
                    <Input
                      id="validFromTime"
                      type="time"
                      value={formData.validFromTime}
                      onChange={(e) => setFormData({...formData, validFromTime: e.target.value})}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Ex: 00:00 ou 18:00</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="validUntil">Válido Até</Label>
                    <Input
                      id="validUntil"
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="validUntilTime">Horário Fim</Label>
                    <Input
                      id="validUntilTime"
                      type="time"
                      value={formData.validUntilTime}
                      onChange={(e) => setFormData({...formData, validUntilTime: e.target.value})}
                    />
                    <p className="text-xs text-gray-500 mt-1">Ex: 23:59 ou 20:00</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                />
                <Label htmlFor="isActive">Cupom ativo</Label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Salvando...' : editingCoupon ? '✏️ Atualizar' : '🎫 Criar Cupom'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
