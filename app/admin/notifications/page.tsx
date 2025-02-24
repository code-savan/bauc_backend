'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface Notification {
  id: string;
  title: string;
  message: string;
  description: string;
  table_name: string;
  record_id: string;
  event_type: string;
  created_at: string;
  read: boolean;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) setNotifications(data);
    };

    fetchNotifications();
  }, []);

  const getEventColor = (event: string) => {
    switch (event) {
      case 'INSERT': return 'bg-green-100 text-green-800';
      case 'UPDATE': return 'bg-blue-100 text-blue-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Notifications</h1>
      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`bg-white rounded-lg shadow p-6 ${
              !notification.read ? 'border-l-4 border-blue-500' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  {notification.title}
                </h2>
                <Badge variant="outline" className={getEventColor(notification.event_type)}>
                  {notification.event_type}
                </Badge>
              </div>
              <span className="text-sm text-gray-500">
                {formatDate(notification.created_at)}
              </span>
            </div>
            <p className="text-gray-600 mb-2">{notification.message}</p>
            <pre className="bg-gray-50 rounded p-3 text-sm font-mono whitespace-pre-wrap">
              {notification.description}
            </pre>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <span className="font-medium mr-2">Table:</span>
              {notification.table_name}
              <span className="mx-2">•</span>
              <span className="font-medium mr-2">Record ID:</span>
              {notification.record_id}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
