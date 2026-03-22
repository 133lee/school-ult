"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  CheckCheck,
  Archive,
  Trash2,
  AlertCircle,
  Info,
  Clock,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  subject: string;
  message: string;
  type: string;
  priority: string;
  status: string;
  createdAt: string;
  readAt?: string;
  sender: {
    id: string;
    email: string;
    role: string;
    profile: {
      firstName: string;
      lastName: string;
    } | null;
  };
}

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNotificationUpdate?: () => void;
}

export function NotificationsDrawer({
  isOpen,
  onClose,
  onNotificationUpdate,
}: NotificationsDrawerProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("unread");
  const { toast } = useToast();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");

      if (!token) {
        toast({
          title: "Error",
          description: "Authentication required",
          variant: "destructive",
        });
        return;
      }

      const params = new URLSearchParams();
      if (filter === "unread") {
        params.append("status", "UNREAD");
      }
      params.append("limit", "50");

      const response = await fetch(
        `/api/notifications?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const result = await response.json();
      if (result.success) {
        setNotifications(result.data.notifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, filter]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem("auth_token");

      if (!token) return;

      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "READ" }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark as read");
      }

      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, status: "READ", readAt: new Date().toISOString() }
            : n
        )
      );

      if (onNotificationUpdate) {
        onNotificationUpdate();
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast({
        title: "Error",
        description: "Failed to update notification",
        variant: "destructive",
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const unreadIds = notifications
        .filter((n) => n.status === "UNREAD")
        .map((n) => n.id);

      await Promise.all(
        unreadIds.map((id) =>
          fetch(`/api/notifications/${id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status: "READ" }),
          })
        )
      );

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, status: "READ", readAt: new Date().toISOString() }))
      );

      toast({
        title: "Success",
        description: "All notifications marked as read",
      });

      if (onNotificationUpdate) {
        onNotificationUpdate();
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark all as read",
        variant: "destructive",
      });
    }
  };

  const handleArchive = async (notificationId: string) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "ARCHIVED" }),
      });

      if (!response.ok) {
        throw new Error("Failed to archive");
      }

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

      toast({
        title: "Success",
        description: "Notification archived",
      });

      if (onNotificationUpdate) {
        onNotificationUpdate();
      }
    } catch (error) {
      console.error("Error archiving notification:", error);
      toast({
        title: "Error",
        description: "Failed to archive notification",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete");
      }

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

      toast({
        title: "Success",
        description: "Notification deleted",
      });

      if (onNotificationUpdate) {
        onNotificationUpdate();
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "destructive";
      case "HIGH":
        return "destructive";
      case "NORMAL":
        return "default";
      case "LOW":
        return "secondary";
      default:
        return "default";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "ASSESSMENT_REMINDER":
        return <Clock className="h-4 w-4" />;
      case "APPROVAL_REQUEST":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getSenderName = (sender: Notification["sender"]) => {
    if (sender.profile) {
      return `${sender.profile.firstName} ${sender.profile.lastName}`;
    }
    return sender.email;
  };

  const unreadCount = notifications.filter((n) => n.status === "UNREAD").length;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount}</Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            Stay updated with messages from your HOD and school administration
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          {/* Filter and Actions */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-2">
              <Button
                variant={filter === "unread" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("unread")}
              >
                Unread
              </Button>
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
              >
                All
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={fetchNotifications}
                disabled={loading}
              >
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              </Button>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="gap-2"
                >
                  <CheckCheck className="h-4 w-4" />
                  Mark all read
                </Button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <ScrollArea className="h-[calc(100vh-220px)]">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <Bell className="h-12 w-12 mb-4 opacity-50" />
                <p className="font-medium mb-1">No notifications</p>
                <p className="text-sm">
                  {filter === "unread"
                    ? "You're all caught up!"
                    : "No notifications to display"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-4 rounded-lg border transition-colors",
                      notification.status === "UNREAD"
                        ? "bg-muted/50 border-primary/20"
                        : "bg-background"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">{getTypeIcon(notification.type)}</div>
                      <div className="flex-1 space-y-2">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold">
                              {notification.subject}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              From {getSenderName(notification.sender)} •{" "}
                              {formatDistanceToNow(new Date(notification.createdAt), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                          <Badge variant={getPriorityColor(notification.priority)}>
                            {notification.priority}
                          </Badge>
                        </div>

                        {/* Message */}
                        <p className="text-sm whitespace-pre-wrap">
                          {notification.message}
                        </p>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {notification.status === "UNREAD" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="gap-2 h-8"
                            >
                              <CheckCheck className="h-3 w-3" />
                              Mark as read
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleArchive(notification.id)}
                            className="gap-2 h-8"
                          >
                            <Archive className="h-3 w-3" />
                            Archive
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(notification.id)}
                            className="gap-2 h-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
