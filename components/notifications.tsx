"use client";

import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  CheckCircle,
  Info,
  TrendingDown,
  UserCheck,
  FileText,
  Calendar,
  Clock,
  X,
} from "lucide-react";

interface Notification {
  id: string;
  type: "success" | "warning" | "info" | "alert";
  title: string;
  message: string;
  time: string;
  timestamp: Date; // For date grouping
  read: boolean;
  icon?: React.ReactNode;
}

interface NotificationsProps {
  embedded?: boolean;
}

const Notifications = ({ embedded = false }: NotificationsProps) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "alert",
      title: "Low Attendance Alert",
      message: "Student John Doe has attendance below 75% this week",
      time: "5 minutes ago",
      timestamp: new Date(now.getTime() - 5 * 60 * 1000), // 5 minutes ago
      read: false,
      icon: <TrendingDown className="h-4 w-4" />,
    },
    {
      id: "2",
      type: "success",
      title: "Grades Submitted",
      message: "Your grades for Class 9A Mid-Term exam have been successfully submitted",
      time: "1 hour ago",
      timestamp: new Date(now.getTime() - 60 * 60 * 1000), // 1 hour ago
      read: false,
      icon: <CheckCircle className="h-4 w-4" />,
    },
    {
      id: "3",
      type: "info",
      title: "New Assignment Created",
      message: "Assignment 'Chapter 5 Review' has been created for Class 10A",
      time: "2 hours ago",
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: true,
      icon: <FileText className="h-4 w-4" />,
    },
    {
      id: "4",
      type: "warning",
      title: "Upcoming Deadline",
      message: "Grade submission deadline for CAT 1 is tomorrow at 5:00 PM",
      time: "3 hours ago",
      timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000), // 3 hours ago
      read: true,
      icon: <Clock className="h-4 w-4" />,
    },
    {
      id: "5",
      type: "info",
      title: "Attendance Marked",
      message: "You marked attendance for Class 11A successfully",
      time: "Yesterday",
      timestamp: new Date(yesterday.getTime() + 10 * 60 * 60 * 1000), // Yesterday 10 AM
      read: true,
      icon: <UserCheck className="h-4 w-4" />,
    },
    {
      id: "6",
      type: "alert",
      title: "Student Performance Alert",
      message: "3 students in Class 9A are failing Mathematics",
      time: "2 days ago",
      timestamp: new Date(yesterday.getTime() - 24 * 60 * 60 * 1000), // 2 days ago
      read: true,
      icon: <AlertCircle className="h-4 w-4" />,
    },
  ]);

  const handleDismiss = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const handleMarkAllRead = () => {
    setNotifications(
      notifications.map((n) => ({
        ...n,
        read: true,
      }))
    );
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "success":
        return "text-green-600 bg-green-100";
      case "warning":
        return "text-yellow-600 bg-yellow-100";
      case "alert":
        return "text-red-600 bg-red-100";
      case "info":
      default:
        return "text-blue-600 bg-blue-100";
    }
  };

  const getNotificationBadge = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-600";
      case "warning":
        return "bg-yellow-600";
      case "alert":
        return "bg-red-600";
      case "info":
      default:
        return "bg-blue-600";
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Group notifications by date (Today, Yesterday, Older)
  const getDateLabel = (timestamp: Date) => {
    const notifDate = new Date(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate());

    if (notifDate.getTime() === today.getTime()) {
      return "Today";
    } else if (notifDate.getTime() === yesterday.getTime()) {
      return "Yesterday";
    } else {
      return "Older";
    }
  };

  const groupedNotifications = notifications.reduce((groups, notification) => {
    const label = getDateLabel(notification.timestamp);
    if (!groups[label]) {
      groups[label] = [];
    }
    groups[label].push(notification);
    return groups;
  }, {} as Record<string, Notification[]>);

  // Maintain order: Today, Yesterday, Older
  const orderedGroups = ["Today", "Yesterday", "Older"].filter(
    (label) => groupedNotifications[label]?.length > 0
  );

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-muted/10 via-muted/5 to-background/50 backdrop-blur-xl">
      {/* Header with unread count - iOS style */}
      {unreadCount > 0 && (
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">
              {unreadCount} New Notification{unreadCount > 1 ? "s" : ""}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="h-8 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              Mark all read
            </Button>
          </div>
        </div>
      )}

      {/* Notifications List - iOS Cards with Date Groups */}
      <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
        <div className="space-y-4 pb-4 pr-2">
          {orderedGroups.map((dateLabel) => (
            <div key={dateLabel} className="space-y-3">
              {/* Date Badge - WhatsApp Style */}
              <div className="flex items-center justify-center sticky top-0 z-10 py-2">
                <Badge
                  variant="secondary"
                  className="bg-muted/90 backdrop-blur-sm text-muted-foreground text-xs px-3 py-1 shadow-sm"
                >
                  {dateLabel}
                </Badge>
              </div>

              {/* Notifications for this date */}
              {groupedNotifications[dateLabel].map((notification, index) => (
                <div
                  key={notification.id}
                  className={`group relative rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] backdrop-blur-lg border ${
                    !notification.read
                      ? "bg-white/80 dark:bg-gray-900/80 shadow-lg border-white/20 dark:border-gray-700/50"
                      : "bg-white/40 dark:bg-gray-900/40 shadow-md border-white/10 dark:border-gray-700/30"
                  }`}
                  style={{
                    animation: `slideIn 0.3s ease-out ${index * 0.05}s both`,
                  }}
                >
                  <div className="p-4">
                    <div className="flex gap-3">
                      {/* Icon - iOS style with gradient and glass */}
                      <div
                        className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${getNotificationColor(
                          notification.type
                        )} shadow-sm backdrop-blur-sm`}
                      >
                        {notification.icon || <Info className="h-5 w-5" />}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-semibold text-foreground">
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground/70" />
                              <p className="text-xs text-muted-foreground/70 font-medium whitespace-nowrap">
                                {notification.time}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDismiss(notification.id)}
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        {/* Message - Single line with ellipsis */}
                        <p className="text-sm text-muted-foreground truncate">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* iOS-style bottom shine effect */}
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Footer - iOS style */}
      <div className="p-4 border-t border-white/10 dark:border-gray-700/30 backdrop-blur-xl bg-background/60">
        <Button
          variant="ghost"
          className="w-full h-11 rounded-xl font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
        >
          View All Notifications
        </Button>
      </div>

      <style jsx global>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* iOS-style scrollbar */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.4);
          border-radius: 10px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.6);
          background-clip: padding-box;
        }

        /* Dark mode scrollbar */
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(107, 114, 128, 0.5);
          background-clip: padding-box;
        }

        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 0.7);
          background-clip: padding-box;
        }
      `}</style>
    </div>
  );
};

export default Notifications;
