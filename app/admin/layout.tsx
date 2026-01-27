import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { MobileSidebar } from '@/components/admin/MobileSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
