'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, X, Download, QrCode, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

type Table = {
  id: string;
  number: string;
  qrCode: string;
  capacity: number;
  isActive: boolean;
  notes?: string;
};

export default function TablesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  
  // Form state
  const [number, setNumber] = useState('');
  const [capacity, setCapacity] = useState('4');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (session) {
      loadTables();
    }
  }, [session]);

  const loadTables = async () => {
    try {
      const res = await fetch('/api/tables');
      if (res.ok) {
        const data = await res.json();
        setTables(data.tables || []);
      }
    } catch (error) {
      console.error('Erro ao carregar mesas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!number.trim()) {
      toast.error('Número da mesa é obrigatório');
      return;
    }

    try {
      const res = await fetch('/api/tables', {
        method: editingTable ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingTable?.id,
          number,
          capacity: parseInt(capacity),
          notes: notes.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao salvar mesa');
      }

      toast.success(editingTable ? 'Mesa atualizada!' : 'Mesa criada!');
      loadTables();
      closeModal();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta mesa?')) return;

    try {
      const res = await fetch(`/api/tables?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Erro ao excluir mesa');

      toast.success('Mesa excluída!');
      loadTables();
    } catch (error) {
      toast.error('Erro ao excluir mesa');
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch('/api/tables', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !isActive }),
      });

      if (!res.ok) throw new Error('Erro ao atualizar mesa');

      toast.success(isActive ? 'Mesa desativada' : 'Mesa ativada');
      loadTables();
    } catch (error) {
      toast.error('Erro ao atualizar mesa');
    }
  };

  const downloadQRCode = (table: Table) => {
    const url = `${window.location.origin}/table/${table.qrCode}`;
    window.open(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`, '_blank');
  };

  const downloadAllQRCodes = () => {
    tables.forEach((table) => {
      setTimeout(() => downloadQRCode(table), 500);
    });
  };

  const openEditModal = (table: Table) => {
    setEditingTable(table);
    setNumber(table.number);
    setCapacity(table.capacity.toString());
    setNotes(table.notes || '');
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingTable(null);
    setNumber('');
    setCapacity('4');
    setNotes('');
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="pizza-loader mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    router.replace('/auth/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Dashboard
        </Button>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl">🍽️ Gestão de Mesas</CardTitle>
              <div className="flex gap-2">
                {tables.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={downloadAllQRCodes}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar Todos QR Codes
                  </Button>
                )}
                <Button onClick={() => setShowAddModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Mesa
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {tables.length === 0 ? (
              <div className="text-center py-12">
                <QrCode className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma mesa cadastrada</h3>
                <p className="text-gray-600 mb-4">Comece criando mesas para gerar QR Codes</p>
                <Button onClick={() => setShowAddModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeira Mesa
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tables.map((table) => (
                  <Card key={table.id} className={!table.isActive ? 'opacity-50' : ''}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-xl font-bold">Mesa {table.number}</h3>
                          <p className="text-sm text-gray-600">
                            👥 {table.capacity} {table.capacity === 1 ? 'pessoa' : 'pessoas'}
                          </p>
                          {table.notes && (
                            <p className="text-xs text-gray-500 mt-1">{table.notes}</p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(table)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(table.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadQRCode(table)}
                          className="flex-1"
                        >
                          <QrCode className="w-4 h-4 mr-1" />
                          QR Code
                        </Button>
                        <Button
                          variant={table.isActive ? 'destructive' : 'default'}
                          size="sm"
                          onClick={() => toggleActive(table.id, table.isActive)}
                        >
                          {table.isActive ? 'Desativar' : 'Ativar'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal Add/Edit */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{editingTable ? 'Editar Mesa' : 'Nova Mesa'}</CardTitle>
                  <Button variant="ghost" size="sm" onClick={closeModal}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Número da Mesa *</Label>
                  <Input
                    placeholder="Ex: 1, A1, VIP 1"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Capacidade (pessoas) *</Label>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Observações (opcional)</Label>
                  <Input
                    placeholder="Ex: Área externa, Próximo à janela"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={closeModal} className="flex-1">
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} className="flex-1">
                    {editingTable ? 'Atualizar' : 'Criar Mesa'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
