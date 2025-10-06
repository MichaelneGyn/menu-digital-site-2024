'use client';

import { useRouter } from 'next/navigation';

const ADMIN_EMAIL = 'michaeldouglasqueiroz@gmail.com';
const isAdminEmail = (email?: string) => email === ADMIN_EMAIL;

interface CardProps {
  icon: string;
  title: string;
  onClick: () => void;
}

function Card({ icon, title, onClick }: CardProps) {
  return (
    <button
      onClick={onClick}
      className="h-20 flex flex-col items-center justify-center space-y-2 border rounded-lg p-4 hover-scale animated-button hover-float bg-white"
    >
      <span className="text-2xl">{icon}</span>
      <span className="font-medium">{title}</span>
    </button>
  );
}

export function QuickActions({ userEmail }: { userEmail?: string }) {
  const router = useRouter();
  const isAdmin = isAdminEmail(userEmail);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card icon="🧾" title="Comandas" onClick={() => router.push('/admin/orders')} />
      {isAdmin && (
        <Card
          icon="👥💳"
          title="Usuários & Assinaturas"
          onClick={() => router.push('/admin/customers')}
        />
      )}
    </div>
  );
}