"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  MessageSquare,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertCircle,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/**
 * Notifications Settings Page
 * Configure SMS, Email, and Push notification settings
 *
 * Current Implementation: SMS via Africa's Talking
 */

interface SMSBalance {
  balance: string;
  currency: string;
}

interface SMSLog {
  id: string;
  phoneNumber: string;
  message: string;
  status: "PENDING" | "SENT" | "DELIVERED" | "FAILED";
  sentAt: string | null;
  createdAt: string;
  error: string | null;
  guardian: {
    firstName: string;
    lastName: string;
  };
}

export default function NotificationsSettingsPage() {
  const [testing, setTesting] = useState(false);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [balance, setBalance] = useState<SMSBalance | null>(null);
  const [logs, setLogs] = useState<SMSLog[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    loadBalance();
    loadRecentLogs();
  }, []);

  const testConnection = async () => {
    setTesting(true);
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/sms/test", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setConnectionStatus(data.data);

        if (data.data.success) {
          toast.success("Connection successful!");
          loadBalance(); // Refresh balance after successful test
        } else {
          toast.error(data.data.message);
        }
      } else {
        toast.error("Failed to test connection");
      }
    } catch (error) {
      console.error("Error testing connection:", error);
      toast.error("Error testing connection");
    } finally {
      setTesting(false);
    }
  };

  const loadBalance = async () => {
    setLoadingBalance(true);
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/sms/balance", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setBalance(data.data);
        }
      }
    } catch (error) {
      console.error("Error loading balance:", error);
    } finally {
      setLoadingBalance(false);
    }
  };

  const loadRecentLogs = async () => {
    setLoadingLogs(true);
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/sms/logs?pageSize=10", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data?.logs) {
          setLogs(data.data.logs);
        }
      }
    } catch (error) {
      console.error("Error loading logs:", error);
    } finally {
      setLoadingLogs(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SENT":
      case "DELIVERED":
        return <Badge className="bg-green-100 text-green-700">Sent</Badge>;
      case "FAILED":
        return <Badge className="bg-red-100 text-red-700">Failed</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/settings">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Notification Settings</h1>
            <p className="text-sm text-muted-foreground">
              Configure SMS, email, and push notifications
            </p>
          </div>
        </div>
        <Button onClick={loadRecentLogs} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* SMS Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">SMS Configuration</CardTitle>
                <CardDescription>
                  Africa's Talking SMS integration for Zambia
                </CardDescription>
              </div>
            </div>
            {connectionStatus && (
              <div className="flex items-center gap-2">
                {connectionStatus.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Configuration Status */}
          <Alert>
            <Settings className="h-4 w-4" />
            <AlertDescription>
              SMS credentials are configured in environment variables (.env file).
              <br />
              <span className="text-xs text-muted-foreground">
                Variables: AFRICAS_TALKING_USERNAME, AFRICAS_TALKING_API_KEY,
                AFRICAS_TALKING_SENDER_ID
              </span>
            </AlertDescription>
          </Alert>

          {/* Balance Display */}
          {balance && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">SMS Credits Balance</p>
                  <p className="text-2xl font-bold mt-1">
                    {balance.currency} {balance.balance}
                  </p>
                </div>
                <Button onClick={loadBalance} variant="outline" size="sm" disabled={loadingBalance}>
                  {loadingBalance ? "Loading..." : "Refresh Balance"}
                </Button>
              </div>
            </div>
          )}

          {/* Test Connection */}
          <div className="flex items-center gap-3">
            <Button onClick={testConnection} disabled={testing} variant="outline">
              <CheckCircle className="h-4 w-4 mr-2" />
              {testing ? "Testing..." : "Test Connection"}
            </Button>
            {connectionStatus && (
              <p
                className={`text-sm ${
                  connectionStatus.success ? "text-green-600" : "text-red-600"
                }`}>
                {connectionStatus.message}
              </p>
            )}
          </div>

          {/* Configuration Instructions */}
          <div className="p-4 border rounded-lg space-y-2">
            <h3 className="font-semibold text-sm">Configuration Instructions</h3>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Add your Africa's Talking credentials to the .env file</li>
              <li>Set your SMS sender number in School Settings</li>
              <li>Click "Test Connection" to verify the integration</li>
              <li>You can now send SMS to parents from Report Cards and other features</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Recent SMS Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent SMS Activity</CardTitle>
          <CardDescription>Last 10 SMS messages sent</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingLogs ? (
            <div className="text-center py-8 text-muted-foreground">Loading logs...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No SMS messages sent yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Message Preview</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">
                      {log.guardian.firstName} {log.guardian.lastName}
                    </TableCell>
                    <TableCell>{log.phoneNumber}</TableCell>
                    <TableCell className="max-w-xs truncate">{log.message}</TableCell>
                    <TableCell>{getStatusBadge(log.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {log.sentAt ? formatDate(log.sentAt) : "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Coming Soon Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Coming Soon</CardTitle>
          <CardDescription>Additional notification features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Email notifications integration</p>
          <p>• Push notifications for mobile app</p>
          <p>• SMS templates management</p>
          <p>• Scheduled notifications</p>
          <p>• Notification preferences per user</p>
        </CardContent>
      </Card>
    </div>
  );
}
