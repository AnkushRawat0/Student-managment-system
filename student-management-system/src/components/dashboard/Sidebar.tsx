"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  UserCheck, 
  Settings,
  GraduationCap 
} from "lucide-react";

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  adminOnly?: boolean;
}

const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Students',
    href: '/dashboard/students',
    icon: GraduationCap,
    adminOnly: true,
  },
  {
    name: 'Courses',
    href: '/dashboard/courses',
    icon: BookOpen,
    adminOnly: true,
  },
  {
    name: 'Coaches',
    href: '/dashboard/coaches',
    icon: UserCheck,
    adminOnly: true,
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const filteredNavigation = navigation.filter(item => 
    !item.adminOnly || user?.role === 'ADMIN'
  );

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <div className="space-y-2">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}