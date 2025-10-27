"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Calendar,
  Megaphone,
  Plus,
  Search,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

export default function AdminCommunications() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isNoticeDialogOpen, setIsNoticeDialogOpen] = useState(false);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [noticeType, setNoticeType] = useState<"school-wide" | "department">("school-wide");
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);

  const departments = ["Sciences", "Humanities", "Languages", "Arts"];

  const toggleDepartment = (dept: string) => {
    if (selectedDepartments.includes(dept)) {
      setSelectedDepartments(selectedDepartments.filter(d => d !== dept));
    } else {
      setSelectedDepartments([...selectedDepartments, dept]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">School Communications</h1>
          <p className="text-muted-foreground text-sm">
            Create and manage school-wide notices and events
          </p>
        </div>
      </div>

      {/* Search and Actions Bar */}
      <div className="flex items-center gap-3">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search communications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>

        <div className="ml-auto flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-2"
            onClick={() => setIsNoticeDialogOpen(true)}
          >
            <Bell className="h-4 w-4" />
            Send Notice
          </Button>
          <Button
            size="sm"
            className="gap-2"
            onClick={() => setIsEventDialogOpen(true)}
          >
            <Calendar className="h-4 w-4" />
            Schedule Event
          </Button>
        </div>
      </div>

      {/* Communications Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Notices Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recent Notices
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Card className="p-3 bg-muted/30">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-sm">School Assembly Tomorrow</h4>
                  <p className="text-xs text-muted-foreground">School-wide</p>
                </div>
                <Badge variant="default">Active</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                All students and staff are required to attend the school assembly tomorrow at 10:00 AM in the main hall.
              </p>
              <p className="text-xs text-muted-foreground">2 hours ago</p>
            </Card>

            <Card className="p-3 bg-muted/30">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-sm">Sciences Department Meeting</h4>
                  <p className="text-xs text-muted-foreground">Sciences Department</p>
                </div>
                <Badge variant="secondary">Departmental</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                All Science department members are requested to attend the quarterly meeting on Friday at 3:00 PM.
              </p>
              <p className="text-xs text-muted-foreground">1 day ago</p>
            </Card>

            <Card className="p-3 bg-muted/30">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-sm">Updated Exam Schedule</h4>
                  <p className="text-xs text-muted-foreground">School-wide</p>
                </div>
                <Badge variant="default">Active</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                Please find the updated examination schedule attached. All changes have been finalized.
              </p>
              <p className="text-xs text-muted-foreground">3 days ago</p>
            </Card>
          </CardContent>
        </Card>

        {/* Upcoming Events Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Card className="p-3 bg-green-50 border-green-200">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">Sports Day</h4>
                  <p className="text-xs text-muted-foreground">Nov 30, 2024</p>
                  <Badge className="text-[10px] mt-1" variant="outline">School-wide</Badge>
                </div>
              </div>
            </Card>

            <Card className="p-3 bg-blue-50 border-blue-200">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">Science Fair</h4>
                  <p className="text-xs text-muted-foreground">Dec 5, 2024</p>
                  <Badge className="text-[10px] mt-1" variant="outline">Sciences Dept</Badge>
                </div>
              </div>
            </Card>

            <Card className="p-3 bg-purple-50 border-purple-200">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">Staff Training</h4>
                  <p className="text-xs text-muted-foreground">Dec 8, 2024</p>
                  <Badge className="text-[10px] mt-1" variant="outline">School-wide</Badge>
                </div>
              </div>
            </Card>
          </CardContent>
        </Card>
      </div>

      {/* Send Notice Dialog */}
      <Dialog open={isNoticeDialogOpen} onOpenChange={setIsNoticeDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
              Send Notice
            </DialogTitle>
            <DialogDescription>
              Distribute an important notice to the school
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {/* Notice Type Selection */}
            <div>
              <label className="text-sm font-medium mb-3 block">Send To</label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-muted cursor-pointer"
                  onClick={() => {
                    setNoticeType("school-wide");
                    setSelectedDepartments([]);
                  }}>
                  <Checkbox
                    checked={noticeType === "school-wide"}
                    onCheckedChange={() => {
                      setNoticeType("school-wide");
                      setSelectedDepartments([]);
                    }}
                  />
                  <label className="text-sm flex-1 cursor-pointer">
                    Entire School
                  </label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-muted cursor-pointer"
                  onClick={() => setNoticeType("department")}>
                  <Checkbox
                    checked={noticeType === "department"}
                    onCheckedChange={() => setNoticeType("department")}
                  />
                  <label className="text-sm flex-1 cursor-pointer">
                    Specific Departments
                  </label>
                </div>
              </div>
            </div>

            {/* Department Selection */}
            {noticeType === "department" && (
              <div>
                <label className="text-sm font-medium mb-2 block">Select Departments</label>
                <div className="space-y-2">
                  {departments.map((dept) => (
                    <div key={dept} className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md cursor-pointer"
                      onClick={() => toggleDepartment(dept)}>
                      <Checkbox
                        checked={selectedDepartments.includes(dept)}
                        onCheckedChange={() => toggleDepartment(dept)}
                      />
                      <label className="text-sm flex-1 cursor-pointer">{dept}</label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">Notice Title</label>
              <Input placeholder="Enter notice title..." className="w-full" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Notice Message</label>
              <Textarea
                placeholder="Enter your notice message..."
                className="w-full min-h-32"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Priority</label>
              <select className="w-full p-2 border rounded-md text-sm">
                <option value="normal">Normal</option>
                <option value="important">Important</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="send-email-admin" />
              <label htmlFor="send-email-admin" className="text-sm cursor-pointer">
                Also send via email
              </label>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsNoticeDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button className="flex-1 gap-2">
                <Megaphone className="h-4 w-4" />
                Send Notice
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Event Dialog */}
      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              Schedule Event
            </DialogTitle>
            <DialogDescription>
              Create a new event for the school
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {/* Event Type Selection */}
            <div>
              <label className="text-sm font-medium mb-3 block">Event Scope</label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-muted cursor-pointer"
                  onClick={() => {
                    setNoticeType("school-wide");
                    setSelectedDepartments([]);
                  }}>
                  <Checkbox
                    checked={noticeType === "school-wide"}
                    onCheckedChange={() => {
                      setNoticeType("school-wide");
                      setSelectedDepartments([]);
                    }}
                  />
                  <label className="text-sm flex-1 cursor-pointer">
                    Entire School
                  </label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-muted cursor-pointer"
                  onClick={() => setNoticeType("department")}>
                  <Checkbox
                    checked={noticeType === "department"}
                    onCheckedChange={() => setNoticeType("department")}
                  />
                  <label className="text-sm flex-1 cursor-pointer">
                    Specific Departments
                  </label>
                </div>
              </div>
            </div>

            {/* Department Selection */}
            {noticeType === "department" && (
              <div>
                <label className="text-sm font-medium mb-2 block">Select Departments</label>
                <div className="space-y-2">
                  {departments.map((dept) => (
                    <div key={dept} className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md cursor-pointer"
                      onClick={() => toggleDepartment(dept)}>
                      <Checkbox
                        checked={selectedDepartments.includes(dept)}
                        onCheckedChange={() => toggleDepartment(dept)}
                      />
                      <label className="text-sm flex-1 cursor-pointer">{dept}</label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">Event Title</label>
              <Input placeholder="Enter event title..." className="w-full" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Event Description</label>
              <Textarea
                placeholder="Enter event description..."
                className="w-full min-h-24"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Event Date</label>
                <Input type="date" className="w-full" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Event Time</label>
                <Input type="time" className="w-full" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Location</label>
              <Input placeholder="Enter event location..." className="w-full" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Event Type</label>
              <select className="w-full p-2 border rounded-md text-sm">
                <option value="announcement">Announcement</option>
                <option value="meeting">Meeting</option>
                <option value="training">Training</option>
                <option value="workshop">Workshop</option>
                <option value="seminar">Seminar</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="send-reminder-admin" />
              <label htmlFor="send-reminder-admin" className="text-sm cursor-pointer">
                Send reminder 24 hours before event
              </label>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsEventDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button className="flex-1 gap-2">
                <Calendar className="h-4 w-4" />
                Create Event
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
