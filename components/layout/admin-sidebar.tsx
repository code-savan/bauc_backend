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
  Calendar,
  MessageSquare,
  Mail,
  Mails,
  FileText,
  Users,
  Megaphone,
  BarChart,
  PlusCircle,
  Target,
  LineChart,
  Bell,
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
import Image from 'next/image';

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

  const mainNavItems: NavItem[] = [
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
    {
      title: 'Events',
      href: '/admin/events',
      icon: <Calendar className="h-5 w-5" />,
      children: [
        { title: 'All Events', href: '/admin/events' },
        { title: 'Add New', href: '/admin/events/new' },
      ],
    },
    // {
    //   title: 'Notifications',
    //   href: '/admin/notifications',
    //   icon: <Bell className="h-5 w-5" />,
    // },
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

  const formNavItems: NavItem[] = [
    {
      title: 'Forms Overview',
      href: '/admin/forms',
      icon: <BarChart className="h-5 w-5" />,
    },
    {
      title: 'Contact Messages',
      href: '/admin/forms/contacts',
      icon: <Mails className="h-5 w-5" />,
    },
    {
      title: 'Newsletter Subscribers',
      href: '/admin/forms/newsletter',
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: 'Expression of Interest',
      href: '/admin/forms/interests',
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: 'Popup Submissions',
      href: '/admin/forms/popups',
      icon: <MessageSquare className="h-5 w-5" />,
    },
  ];

  const campaignNavItems: NavItem[] = [
    {
      title: 'Campaign Overview',
      href: '/admin/campaigns',
      icon: <BarChart className="h-5 w-5" />,
    },
    {
      title: 'All Campaigns',
      href: '/admin/campaigns/all',
      icon: <Megaphone className="h-5 w-5" />,
    },
    {
      title: 'Create Campaign',
      href: '/admin/campaigns/new',
      icon: <PlusCircle className="h-5 w-5" />,
    },
    {
      title: 'Track Campaigns',
      href: '/admin/campaigns/track',
      icon: <Target className="h-5 w-5" />,
    },
    {
      title: 'Campaign Analytics',
      href: '/admin/campaigns/analytics',
      icon: <LineChart className="h-5 w-5" />,
    },
  ];

  const NavContent = () => (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header/Logo Section */}
      <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-800">
        <Image
          src="/logo-white.png" // Make sure to add your logo
          alt="Company Logo"
          width={80}
          height={80}
          className=""
        />
        {/* <div>
          <h1 className="text-sm font-semibold text-white">BAUC International</h1>
          <p className="text-sm text-gray-400">Admin Dashboard</p>
        </div> */}
      </div>

      {/* Navigation Section */}
      <div className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
        {/* Main Navigation */}
        <div>
          <h2 className="px-4 text-xs font-semibold text-gray-50 uppercase tracking-wider">
            Main
          </h2>
          <div className="mt-2 space-y-1">
            {mainNavItems.map((item) => (
              item.children ? (
                <Collapsible
                  key={item.title}
                  open={openCollapsible === item.title}
                  onOpenChange={() => setOpenCollapsible(
                    openCollapsible === item.title ? null : item.title
                  )}
                >
                  <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 rounded-lg">
                    <div className="flex items-center">
                      {item.icon}
                      <span className="ml-3">{item.title}</span>
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-8 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "flex items-center py-2 px-4 text-sm font-medium rounded-lg",
                          pathname === child.href
                            ? "bg-gray-800 text-white"
                            : "text-gray-400 hover:bg-gray-800 hover:text-white"
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
                      ? "bg-gray-800 text-white"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  )}
                >
                  {item.icon}
                  <span className="ml-3">{item.title}</span>
                </Link>
              )
            ))}
          </div>
        </div>

        {/* Forms Section */}
        <div>
          <h2 className="px-4 text-xs font-semibold text-gray-50 uppercase tracking-wider">
            Forms
          </h2>
          <div className="mt-2 space-y-1">
            {formNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-4 py-2 text-sm font-medium rounded-lg",
                  pathname === item.href
                    ? "bg-gray-800 text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                )}
              >
                {item.icon}
                <span className="ml-3">{item.title}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Campaigns Section */}
        <div>
          <h2 className="px-4 text-xs font-semibold text-gray-50 uppercase tracking-wider">
            Campaigns
          </h2>
          <div className="mt-2 space-y-1">
            {campaignNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-4 py-2 text-sm font-medium rounded-lg",
                  pathname === item.href
                    ? "bg-gray-800 text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                )}
              >
                {item.icon}
                <span className="ml-3">{item.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Footer/Logout Section */}
      <div className="border-t border-gray-800 p-4">
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
        <NavContent />
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
