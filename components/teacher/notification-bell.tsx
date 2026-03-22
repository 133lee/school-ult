"use client";

import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface NotificationBellProps {
  onBellClick?: () => void;
}

export interface NotificationBellRef {
  refreshCount: () => void;
}

export const NotificationBell = forwardRef<NotificationBellRef, NotificationBellProps>(
  ({ onBellClick }, ref) => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchUnreadCount = async () => {
      try {
        const token = localStorage.getItem("auth_token");

        if (!token) {
          return;
        }

        const response = await fetch("/api/notifications/unread-count", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch unread count");
        }

        const result = await response.json();
        if (result.success) {
          setUnreadCount(result.data.count);
        }
      } catch (error) {
        console.error("Error fetching unread count:", error);
        // Silent fail - don't show error toast for polling
      } finally {
        setLoading(false);
      }
    };

    useImperativeHandle(ref, () => ({
      refreshCount: fetchUnreadCount,
    }));

    useEffect(() => {
      // Initial fetch
      fetchUnreadCount();

      // Poll every 30 seconds for updates
      const interval = setInterval(fetchUnreadCount, 30000);

      return () => clearInterval(interval);
    }, []);

    const handleClick = () => {
      if (onBellClick) {
        onBellClick();
      }
    };

    return (
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={handleClick}
        disabled={loading}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
        <span className="sr-only">Notifications</span>
      </Button>
    );
  }
);

NotificationBell.displayName = "NotificationBell";
