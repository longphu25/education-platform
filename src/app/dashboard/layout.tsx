'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  CreditCard, 
  Trophy, 
  User, 
  GraduationCap 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Courses',
    href: '/dashboard/courses',
    icon: BookOpen,
  },
  {
    title: 'Credits',
    href: '/dashboard/credits/buy',
    icon: CreditCard,
  },
  {
    title: 'Certificates',
    href: '/dashboard/certificates',
    icon: Trophy,
  },
  {
    title: 'Profile',
    href: '/dashboard/profile',
    icon: User,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/40 p-6">
        <div className="mb-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6" />
            <span className="text-xl font-bold">AcademicChain</span>
          </Link>
        </div>
        
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent',
                  isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
