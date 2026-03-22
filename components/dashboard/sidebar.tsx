"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  School,
  Calendar,
  ClipboardList,
  BarChart3,
  FileText,
  ChevronLeft,
  ChevronRight,
  UserCircle,
  UsersRound,
} from "lucide-react";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const navigationSections = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "People Management",
    items: [
      {
        title: "Students",
        href: "/dashboard/students",
        icon: GraduationCap,
      },
      {
        title: "Parents",
        href: "/dashboard/parents",
        icon: UsersRound,
      },
      {
        title: "Teachers",
        href: "/dashboard/teachers",
        icon: UserCircle,
      },
    ],
  },
  {
    title: "Academic Management",
    items: [
      {
        title: "Classes",
        href: "/dashboard/classes",
        icon: School,
      },
      {
        title: "Subjects",
        href: "/dashboard/subjects",
        icon: BookOpen,
      },
      {
        title: "Departments",
        href: "/dashboard/departments",
        icon: Users,
      },
      {
        title: "Timetable",
        href: "/dashboard/timetable",
        icon: Calendar,
      },
      {
        title: "Schedule",
        href: "/dashboard/schedule",
        icon: ClipboardList,
      },
    ],
  },
  {
    title: "Performance & Tracking",
    items: [
      {
        title: "Attendance",
        href: "/dashboard/attendance",
        icon: ClipboardList,
      },
      {
        title: "Assessments",
        href: "/dashboard/assessments",
        icon: FileText,
      },
      {
        title: "Assessment Calendar",
        href: "/dashboard/assessments/calendar",
        icon: Calendar,
      },
      {
        title: "Reports",
        href: "/dashboard/reports",
        icon: BarChart3,
      },
    ],
  },
];

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "sticky top-0 h-screen bg-background border-r border-border transition-all duration-300 ease-in-out flex flex-col",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="h-16 border-b border-border flex items-center justify-between px-4">
        {!isCollapsed && (
          <h1 className="font-semibold text-sm text-foreground">School MS</h1>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 hover:bg-muted/50 rounded-md transition-colors ml-auto"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-5">
          {navigationSections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {!isCollapsed && (
                <h2 className="mb-1.5 px-2.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                  {section.title}
                </h2>
              )}
              <div className="space-y-0.5">
                {section.items.map((item, itemIndex) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={itemIndex}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] font-medium transition-all duration-200",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                        isCollapsed && "justify-center px-2"
                      )}
                      title={isCollapsed ? item.title : undefined}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
}
