"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Calendar as CalendarIcon, Clock, ThumbsUp, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  acknowledgedBy?: string[]; // Array of teacher IDs who acknowledged
}

interface EventsProps {
  embedded?: boolean;
  userRole?: "admin" | "teacher"; // Determines if user can create or just acknowledge
  currentUserId?: string; // Current logged-in user ID
  currentUserName?: string; // Current logged-in user name
}

// Mock teacher data - would come from API
const mockTeachers = [
  { id: "t1", name: "John Mwangi", initials: "JM" },
  { id: "t2", name: "Mary Njeri", initials: "MN" },
  { id: "t3", name: "Peter Kamau", initials: "PK" },
  { id: "t4", name: "Sarah Wanjiru", initials: "SW" },
  { id: "t5", name: "David Ochieng", initials: "DO" },
];

export default function Events({
  embedded = false,
  userRole = "admin",
  currentUserId = "t1",
  currentUserName = "John Mwangi"
}: EventsProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<Event[]>([
    {
      id: "1",
      title: "Parent-Teacher Meeting",
      description: "Quarterly progress discussion",
      date: new Date(2025, 9, 15),
      time: "10:00 AM",
      acknowledgedBy: ["t2", "t3"], // Mock acknowledgments
    },
    {
      id: "2",
      title: "Sports Day",
      description: "Annual sports competition",
      date: new Date(2025, 9, 20),
      time: "8:00 AM",
      acknowledgedBy: ["t1", "t2", "t4", "t5"], // Mock acknowledgments
    },
  ]);
  const [isOpen, setIsOpen] = useState(false);
  const [viewAcknowledgmentsDialog, setViewAcknowledgmentsDialog] = useState(false);
  const [selectedEventForAcknowledgments, setSelectedEventForAcknowledgments] = useState<Event | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    time: "",
  });

  const handleCreateEvent = () => {
    if (newEvent.title && date) {
      const event: Event = {
        id: Date.now().toString(),
        title: newEvent.title,
        description: newEvent.description,
        date: date,
        time: newEvent.time,
        acknowledgedBy: [],
      };
      setEvents([...events, event]);
      setNewEvent({ title: "", description: "", time: "" });
      setIsOpen(false);
    }
  };

  const handleAcknowledge = (eventId: string) => {
    setEvents(events.map(event => {
      if (event.id === eventId) {
        const acknowledgedBy = event.acknowledgedBy || [];
        // Toggle acknowledgment
        if (acknowledgedBy.includes(currentUserId)) {
          return {
            ...event,
            acknowledgedBy: acknowledgedBy.filter(id => id !== currentUserId)
          };
        } else {
          return {
            ...event,
            acknowledgedBy: [...acknowledgedBy, currentUserId]
          };
        }
      }
      return event;
    }));
  };

  const handleViewAcknowledgments = (event: Event) => {
    setSelectedEventForAcknowledgments(event);
    setViewAcknowledgmentsDialog(true);
  };

  const getTeacherName = (teacherId: string) => {
    const teacher = mockTeachers.find(t => t.id === teacherId);
    return teacher ? teacher.name : "Unknown Teacher";
  };

  const getTeacherInitials = (teacherId: string) => {
    const teacher = mockTeachers.find(t => t.id === teacherId);
    return teacher ? teacher.initials : "??";
  };

  const hasAcknowledged = (event: Event) => {
    return event.acknowledgedBy?.includes(currentUserId) || false;
  };

  const upcomingEvents = events
    .filter((event) => event.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 2);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Embedded mode (for side panel)
  if (embedded) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-end">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
                <DialogDescription>
                  Add a new event to your calendar. Select a date first.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Event Title</Label>
                  <Input
                    id="title"
                    value={newEvent.title}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, title: e.target.value })
                    }
                    placeholder="Enter event title"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newEvent.description}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, description: e.target.value })
                    }
                    placeholder="Enter event description"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newEvent.time}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, time: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Selected Date</Label>
                  <p className="text-sm text-muted-foreground">
                    {date ? formatDate(date) : "No date selected"}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateEvent}>Create Event</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
        />

        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Events List</h3>
          {upcomingEvents.length > 0 ? (
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <Card
                  key={event.id}
                  className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-1">
                          <h4 className="text-sm font-semibold leading-none">
                            {event.title}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {event.description}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1.5 text-xs text-muted-foreground text-right shrink-0">
                          <div className="flex items-center gap-1 justify-end">
                            <CalendarIcon className="h-3 w-3" />
                            <span>{formatDate(event.date)}</span>
                          </div>
                          {event.time && (
                            <div className="flex items-center gap-1 justify-end">
                              <Clock className="h-3 w-3" />
                              <span>{event.time}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Acknowledgment section */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        {userRole === "teacher" ? (
                          <Button
                            size="sm"
                            variant={hasAcknowledged(event) ? "default" : "outline"}
                            onClick={() => handleAcknowledge(event.id)}
                            className="gap-2">
                            <ThumbsUp className={`h-3 w-3 ${hasAcknowledged(event) ? "fill-current" : ""}`} />
                            {hasAcknowledged(event) ? "Acknowledged" : "Acknowledge"}
                          </Button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Acknowledgments:</span>
                            <Badge
                              variant="secondary"
                              className="cursor-pointer hover:bg-secondary/80"
                              onClick={() => handleViewAcknowledgments(event)}>
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              {event.acknowledgedBy?.length || 0}
                            </Badge>
                          </div>
                        )}
                        {event.acknowledgedBy && event.acknowledgedBy.length > 0 && (
                          <div className="flex items-center gap-1">
                            <div className="flex -space-x-2">
                              {event.acknowledgedBy.slice(0, 3).map((teacherId) => (
                                <Avatar key={teacherId} className="h-6 w-6 border-2 border-background">
                                  <AvatarFallback className="text-xs">
                                    {getTeacherInitials(teacherId)}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                            </div>
                            {event.acknowledgedBy.length > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{event.acknowledgedBy.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No upcoming events
            </p>
          )}
        </div>

        {/* Acknowledgments Dialog */}
        <Dialog open={viewAcknowledgmentsDialog} onOpenChange={setViewAcknowledgmentsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Event Acknowledgments</DialogTitle>
              <DialogDescription>
                Teachers who acknowledged "{selectedEventForAcknowledgments?.title}"
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[400px] pr-4">
              {selectedEventForAcknowledgments?.acknowledgedBy &&
              selectedEventForAcknowledgments.acknowledgedBy.length > 0 ? (
                <div className="space-y-3">
                  {selectedEventForAcknowledgments.acknowledgedBy.map((teacherId, index) => (
                    <div
                      key={teacherId}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {getTeacherInitials(teacherId)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {getTeacherName(teacherId)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Teacher ID: {teacherId}
                        </p>
                      </div>
                      <ThumbsUp className="h-4 w-4 text-primary fill-current" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <ThumbsUp className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No acknowledgments yet</p>
                </div>
              )}
            </ScrollArea>
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewAcknowledgmentsDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Dashboard mode (standalone card)
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Upcoming Events</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
              <DialogDescription>
                Add a new event to your calendar. Select a date first.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title-dash">Event Title</Label>
                <Input
                  id="title-dash"
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                  placeholder="Enter event title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description-dash">Description</Label>
                <Textarea
                  id="description-dash"
                  value={newEvent.description}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, description: e.target.value })
                  }
                  placeholder="Enter event description"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="time-dash">Time</Label>
                <Input
                  id="time-dash"
                  type="time"
                  value={newEvent.time}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, time: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Selected Date</Label>
                <p className="text-sm text-muted-foreground">
                  {date ? formatDate(date) : "No date selected"}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateEvent}>Create Event</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-4">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
        />

        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Upcoming Events</h3>
          {upcomingEvents.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto">
              {upcomingEvents.map((event) => (
                <Card
                  key={event.id}
                  className="border-l-4 border-l-primary min-w-[250px] flex-1">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-1">
                          <h4 className="text-sm font-semibold leading-none">
                            {event.title}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {event.description}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1.5 text-xs text-muted-foreground text-right shrink-0">
                          <div className="flex items-center gap-1 justify-end">
                            <CalendarIcon className="h-3 w-3" />
                            <span>{formatDate(event.date)}</span>
                          </div>
                          {event.time && (
                            <div className="flex items-center gap-1 justify-end">
                              <Clock className="h-3 w-3" />
                              <span>{event.time}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Acknowledgment section */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        {userRole === "teacher" ? (
                          <Button
                            size="sm"
                            variant={hasAcknowledged(event) ? "default" : "outline"}
                            onClick={() => handleAcknowledge(event.id)}
                            className="gap-2 text-xs">
                            <ThumbsUp className={`h-3 w-3 ${hasAcknowledged(event) ? "fill-current" : ""}`} />
                            {hasAcknowledged(event) ? "Acknowledged" : "Acknowledge"}
                          </Button>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="cursor-pointer hover:bg-secondary/80"
                            onClick={() => handleViewAcknowledgments(event)}>
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            {event.acknowledgedBy?.length || 0} teachers
                          </Badge>
                        )}
                        {event.acknowledgedBy && event.acknowledgedBy.length > 0 && (
                          <div className="flex items-center gap-1">
                            <div className="flex -space-x-2">
                              {event.acknowledgedBy.slice(0, 2).map((teacherId) => (
                                <Avatar key={teacherId} className="h-6 w-6 border-2 border-background">
                                  <AvatarFallback className="text-xs">
                                    {getTeacherInitials(teacherId)}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                            </div>
                            {event.acknowledgedBy.length > 2 && (
                              <span className="text-xs text-muted-foreground">
                                +{event.acknowledgedBy.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No upcoming events
            </p>
          )}
        </div>
      </CardContent>

      {/* Acknowledgments Dialog */}
      <Dialog open={viewAcknowledgmentsDialog} onOpenChange={setViewAcknowledgmentsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Event Acknowledgments</DialogTitle>
            <DialogDescription>
              Teachers who acknowledged "{selectedEventForAcknowledgments?.title}"
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[400px] pr-4">
            {selectedEventForAcknowledgments?.acknowledgedBy &&
            selectedEventForAcknowledgments.acknowledgedBy.length > 0 ? (
              <div className="space-y-3">
                {selectedEventForAcknowledgments.acknowledgedBy.map((teacherId, index) => (
                  <div
                    key={teacherId}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {getTeacherInitials(teacherId)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {getTeacherName(teacherId)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Teacher ID: {teacherId}
                      </p>
                    </div>
                    <ThumbsUp className="h-4 w-4 text-primary fill-current" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ThumbsUp className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No acknowledgments yet</p>
              </div>
            )}
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewAcknowledgmentsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
