"use client";

import { useState } from "react";
import { Bell, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TeacherAssessmentEntry } from "@/types/hod-assessment";
import { useToast } from "@/hooks/use-toast";

interface ReminderModalProps {
  assessment: TeacherAssessmentEntry | null;
  isOpen: boolean;
  onClose: () => void;
  isBulk?: boolean;
  selectedCount?: number;
}

export function ReminderModal({
  assessment,
  isOpen,
  onClose,
  isBulk = false,
  selectedCount = 0,
}: ReminderModalProps) {
  const [message, setMessage] = useState(
    `Dear ${isBulk ? "Teachers" : assessment?.teacherName || "Teacher"},\n\nThis is a friendly reminder to complete the score entry for the assessment. The deadline is approaching and some entries are still pending.\n\nPlease complete the entries at your earliest convenience.\n\nBest regards,\nHOD`
  );
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSend = async () => {
    try {
      setIsSending(true);
      const token = localStorage.getItem("auth_token");

      if (!token) {
        toast({
          title: "Error",
          description: "Authentication required",
          variant: "destructive",
        });
        return;
      }

      // TODO: For bulk sending, we need to get recipient IDs from the HOD assessment page
      // For now, we'll handle single recipient only
      if (isBulk) {
        toast({
          title: "Info",
          description: "Bulk sending is not yet implemented. Please send reminders individually.",
          variant: "destructive",
        });
        setIsSending(false);
        return;
      }

      if (!assessment?.teacherId) {
        toast({
          title: "Error",
          description: "Teacher information not found",
          variant: "destructive",
        });
        setIsSending(false);
        return;
      }

      // Send notification via API
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientId: assessment.teacherId,
          subject: `Assessment Reminder: ${assessment.subject} - ${assessment.className}`,
          message,
          type: "ASSESSMENT_REMINDER",
          priority: "NORMAL",
          relatedEntityType: "assessment",
          relatedEntityId: assessment.assessmentId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send notification");
      }

      toast({
        title: "Reminder Sent",
        description: `Reminder sent to ${assessment?.teacherName} successfully.`,
      });
      onClose();
    } catch (error) {
      console.error("Error sending reminder:", error);
      toast({
        title: "Error",
        description: "Failed to send reminder. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-yellow-500" />
            {isBulk ? "Send Bulk Reminder" : "Send Reminder"}
          </DialogTitle>
          <DialogDescription>
            {isBulk
              ? `Send a reminder to ${selectedCount} teachers with pending assessments.`
              : `Send a reminder to ${assessment?.teacherName} about pending score entries.`}
          </DialogDescription>
        </DialogHeader>

        {!isBulk && assessment && (
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(assessment.teacherName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{assessment.teacherName}</p>
              <p className="text-sm text-muted-foreground">
                {assessment.subject} - {assessment.className}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            className="resize-none"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={isSending} className="gap-2">
            {isSending ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Reminder
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
