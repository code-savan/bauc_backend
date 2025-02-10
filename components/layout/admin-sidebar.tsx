'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Building2,
  UserCog,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Cog,
  File,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

type NavItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
  children?: { title: string; href: string }[];
};

interface AdminSidebarProps {
  isSuperAdmin: boolean;
  onSignOut: () => void;
}

export function AdminSidebar({ isSuperAdmin, onSignOut }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [openCollapsible, setOpenCollapsible] = useState<string | null>(null);

  const navItems: NavItem[] = [
    {
      title: 'Overview',
      href: '/admin',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: 'Properties',
      href: '/admin/properties',
      icon: <Building2 className="h-5 w-5" />,
      children: [
        { title: 'All Properties', href: '/admin/properties' },
        { title: 'Add New', href: '/admin/properties/new' },
      ],
    },
    {
      title: 'Developers',
      href: '/admin/developers',
      icon: <Cog className="h-5 w-5" />,
      children: [
        { title: 'All Developers', href: '/admin/developers' },
        { title: 'Add New', href: '/admin/developers/new' },
      ],
    },
    {
      title: 'Blogs',
      href: '/admin/blogs',
      icon: <File className="h-5 w-5" />,
      children: [
        { title: 'All Blogs', href: '/admin/blogs' },
        { title: 'Add New', href: '/admin/blogs/new' },
      ],
    },
    ...(isSuperAdmin
      ? [
          {
            title: 'Admin Approval',
            href: '/admin/approval',
            icon: <UserCog className="h-5 w-5" />,
          },
        ]
      : []),
  ];

  const NavContent = () => (
    <div className="space-y-4 py-4 h-full flex flex-col justify-between">
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold">Admin Dashboard</h2>
        <div className="space-y-1">
          {navItems.map((item) => (
            item.children ? (
              <Collapsible
                key={item.title}
                open={openCollapsible === item.title}
                onOpenChange={() => setOpenCollapsible(
                  openCollapsible === item.title ? null : item.title
                )}
              >
                <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-2 text-sm font-medium hover:bg-gray-100 rounded-lg">
                  <div className="flex items-center">
                    {item.icon}
                    <span className="ml-3 text-gray-900">{item.title}</span>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-8 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={cn(
                        "flex items-center py-2 px-4 text-sm font-medium rounded-lg ",
                        pathname === child.href
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      {child.title}
                    </Link>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-4 py-2 text-sm font-medium rounded-lg",
                  pathname === item.href
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                {item.icon}
                <span className="ml-3 text-gray-900">{item.title}</span>
              </Link>
            )
          ))}
        </div>
      </div>

      {/* sign out  */}
      <div className="px-3 py-2">
        <Button
          variant="destructive"
          className="w-full justify-start"
          onClick={onSignOut}
        >
          <LogOut className="mr-2 h-5 w-5" />
          Sign out
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow border-r bg-white pt-5 overflow-y-auto">
          <NavContent />
        </div>
      </aside>

      <div className="md:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="px-4 py-2"
              size="icon"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
