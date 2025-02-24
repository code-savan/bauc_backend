import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotificationBell() {
  // Keep the unread count at zero since we're not tracking notifications
  const unreadCount = 0;

  const markAllAsRead = () => {
    // This function can remain empty for now
  };

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" onClick={markAllAsRead}>
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center h-4 w-4 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </Button>
    </div>
  );
}
