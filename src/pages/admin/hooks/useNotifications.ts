import { useCallback, useMemo } from 'react';
import { useApp } from '../../../store/AppContext';

export function useNotifications() {
  const { notifications, addNotification, deleteNotification, clearAllNotifications, toggleNotificationReadStatus } = useApp();

  const unreadCount = useMemo(() => notifications.filter(n => !n.leida).length, [notifications]);
  const adminNotifications = useMemo(() => notifications.filter(n => n.tipo === 'admin'), [notifications]);
  const userNotifications = useMemo(() => notifications.filter(n => n.tipo !== 'admin'), [notifications]);

  const sendToAll = useCallback(async (title: string, message: string, imageUrl?: string, linkUrl?: string) => {
    return addNotification(title, message, 'todos', undefined, imageUrl, linkUrl);
  }, [addNotification]);

  const sendToUser = useCallback(async (title: string, message: string, phone: string, imageUrl?: string, linkUrl?: string) => {
    return addNotification(title, message, 'personal', phone, imageUrl, linkUrl);
  }, [addNotification]);

  const markAsRead = useCallback((id: string) => {
    toggleNotificationReadStatus(id);
  }, [toggleNotificationReadStatus]);

  const markAllAsRead = useCallback(() => {
    notifications.forEach(n => {
      if (!n.leida) toggleNotificationReadStatus(n.id);
    });
  }, [notifications, toggleNotificationReadStatus]);

  return {
    notifications,
    unreadCount,
    adminNotifications,
    userNotifications,
    sendToAll,
    sendToUser,
    deleteNotification,
    clearAllNotifications,
    markAsRead,
    markAllAsRead,
  };
}
