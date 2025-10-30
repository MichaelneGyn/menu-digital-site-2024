'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  userName?: string;
  userEmail?: string;
  amount?: number;
  isRead: boolean;
  createdAt: string;
}

const ADMIN_EMAIL = 'michaeldouglasqueiroz@gmail.com';

export default function AdminNotifications() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Verificar se é o admin
  const isAdmin = session?.user?.email === ADMIN_EMAIL;

  // Buscar notificações
  const fetchNotifications = async () => {
    if (!isAdmin) return;

    try {
      setLoading(true);
      const res = await fetch('/api/admin/notifications?limit=20');
      const data = await res.json();

      if (res.ok) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  // Marcar como lida
  const markAsRead = async (notificationId: string) => {
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: [notificationId] }),
      });

      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  // Marcar todas como lidas
  const markAllAsRead = async () => {
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true }),
      });

      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  // Buscar notificações ao montar e a cada 30 segundos
  useEffect(() => {
    if (isAdmin) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // 30 segundos
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  // Não renderizar se não for admin
  if (!isAdmin) {
    return null;
  }

  // Ícone baseado no tipo
  const getIcon = (type: string) => {
    switch (type) {
      case 'NEW_SIGNUP':
        return '👤';
      case 'PAYMENT_RECEIVED':
        return '💰';
      case 'TRIAL_ENDING':
        return '⏰';
      case 'SUBSCRIPTION_CANCELED':
        return '❌';
      default:
        return '🔔';
    }
  };

  // Cor baseada no tipo
  const getColor = (type: string) => {
    switch (type) {
      case 'NEW_SIGNUP':
        return 'bg-blue-100 text-blue-600';
      case 'PAYMENT_RECEIVED':
        return 'bg-green-100 text-green-600';
      case 'TRIAL_ENDING':
        return 'bg-yellow-100 text-yellow-600';
      case 'SUBSCRIPTION_CANCELED':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="relative">
      {/* Botão de Notificações */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        title="Notificações"
      >
        <span className="text-2xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown de Notificações */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[600px] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50">
              <div>
                <h3 className="font-bold text-lg text-gray-900">🔔 Notificações</h3>
                <p className="text-xs text-gray-600">
                  {unreadCount > 0 ? `${unreadCount} não lida${unreadCount > 1 ? 's' : ''}` : 'Tudo lido'}
                </p>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>

            {/* Lista de Notificações */}
            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="animate-spin text-3xl mb-2">⏳</div>
                  <p className="text-sm">Carregando...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="text-5xl mb-3">📭</div>
                  <p className="text-sm font-medium">Nenhuma notificação</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Você será notificado sobre novos cadastros e pagamentos
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => !notification.isRead && markAsRead(notification.id)}
                      className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                        !notification.isRead ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Ícone */}
                        <div
                          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg ${getColor(
                            notification.type
                          )}`}
                        >
                          {getIcon(notification.type)}
                        </div>

                        {/* Conteúdo */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-sm text-gray-900">
                              {notification.title}
                            </h4>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          {notification.userName && (
                            <p className="text-xs text-gray-500 mt-1">
                              👤 {notification.userName}
                            </p>
                          )}
                          {notification.userEmail && (
                            <p className="text-xs text-gray-500">
                              📧 {notification.userEmail}
                            </p>
                          )}
                          {notification.amount && (
                            <p className="text-xs font-semibold text-green-600 mt-1">
                              💰 R$ {notification.amount.toFixed(2)}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-2">
                            {formatDate(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={fetchNotifications}
                  className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  🔄 Atualizar
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
