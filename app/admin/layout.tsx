import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { MobileSidebar } from '@/components/admin/MobileSidebar';
import { authOptions } from '@/lib/auth';
import { checkUserSubscriptionByEmail } from '@/lib/subscription';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect('/auth/login');
  }

  const access = await checkUserSubscriptionByEmail(session.user.email);
  if (!access.isActive && !access.isAdmin) {
    redirect('/subscription-expired');
  }

  return (
    <div className="h-full relative bg-gray-50">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-50 bg-gray-900">
        <AdminSidebar />
      </div>
      <div className="md:pl-72">
        <div className="md:hidden flex items-center p-4 bg-white border-b">
          <MobileSidebar />
          <span className="font-bold ml-2">Menu Digital</span>
        </div>
        {children}
      </div>
    </div>
  );
}