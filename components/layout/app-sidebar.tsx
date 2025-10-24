// components/layout/app-sidebar.tsx
"use client";

import React from "react";
import { NavMain } from "@/components/nav-main";
import {
    BookOpen,
    GraduationCap,
    Home,
    LibraryBig,
    Users,
    UserCheck,
    FileText,
    ClipboardList,
    Settings,
    Webhook,
    Building2,
    CalendarCheck,
    BarChart3,
    Calendar,
} from "lucide-react";
import {
    Sidebar,
    SidebarHeader,
    SidebarMenu,
    SidebarContent,
    SidebarFooter,
    SidebarMenuButton,
    SidebarMenuItem,
} from "../ui/sidebar";
import {NavFooter} from "@/components/nav-footer";
import {NavUser} from "@/components/layout/nav-user";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    userRole?: "ADMIN" | "TEACHER";
}

const AppSidebar = ({ userRole = "ADMIN", ...props }: AppSidebarProps) => {

    const adminNavGroups = [
        {
            label: "Overview",
            items: [
                {
                    title: "Dashboard",
                    url: "/admin",
                    icon: Home,
                },
            ],
        },
        {
            label: "People Management",
            items: [
                {
                    title: "Students",
                    url: "/admin/students",
                    icon: Users,
                },
                {
                    title: "Parents",
                    url: "/admin/parents",
                    icon: UserCheck,
                },
                {
                    title: "Teachers",
                    url: "/admin/teachers",
                    icon: GraduationCap,
                },
            ],
        },
        {
            label: "Academic Management",
            items: [
                {
                    title: "Classes",
                    url: "/admin/classes",
                    icon: BookOpen,
                },
                {
                    title: "Subjects",
                    url: "/admin/subjects",
                    icon: LibraryBig,
                },
                {
                    title: "Departments",
                    url: "/admin/departments",
                    icon: Building2,
                },
                {
                    title: "Timetable",
                    url: "/admin/timetable",
                    icon: Calendar,
                },
            ],
        },
        {
            label: "Performance & Tracking",
            items: [
                {
                    title: "Attendance",
                    url: "/admin/attendance",
                    icon: CalendarCheck,
                },
                {
                    title: "Assessments",
                    url: "/admin/assessments",
                    icon: ClipboardList,
                },
                {
                    title: "Reports",
                    url: "/admin/reports",
                    icon: FileText,
                },
            ],
        },
        {
            label: "System",
            items: [
                {
                    title: "Settings",
                    url: "/admin/settings",
                    icon: Settings,
                },
            ],
        },
    ];

    const teacherNavGroups = [
        {
            label: "Overview",
            items: [
                {
                    title: "Dashboard",
                    url: "/teacher",
                    icon: Home,
                },
                {
                    title: "Performance",
                    url: "/teacher/performance",
                    icon: BarChart3,
                },
            ],
        },
        {
            label: "My Teaching",
            items: [
                {
                    title: "My Classes",
                    url: "/teacher/my-classes",
                    icon: BookOpen,
                },
                {
                    title: "My Students",
                    url: "/teacher/my-students",
                    icon: Users,
                },
                {
                    title: "Schedule",
                    url: "/teacher/schedule",
                    icon: Calendar,
                },
            ],
        },
        {
            label: "Academic Work",
            items: [
                {
                    title: "Grades",
                    url: "/teacher/grades",
                    icon: ClipboardList,
                },
                {
                    title: "Assessments",
                    url: "/teacher/assessments",
                    icon: FileText,
                },
                {
                    title: "Attendance",
                    url: "/teacher/attendance",
                    icon: CalendarCheck,
                },
            ],
        },
        {
            label: "System",
            items: [
                {
                    title: "Settings",
                    url: "/teacher/settings",
                    icon: Settings,
                },
            ],
        },
    ];

    const navGroups = userRole === "TEACHER" ? teacherNavGroups : adminNavGroups;
    const homeUrl = userRole === "TEACHER" ? "/teacher" : "/admin";



    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <a href={homeUrl}>
                                <Webhook />
                                <span className="font-bold text-xl">ultimate</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain groups={navGroups} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={{
                    name: userRole === "ADMIN" ? "Diết Lam" : "John Mwangi",
                    email: userRole === "ADMIN" ? "admin@school.com" : "teacher@school.com",
                    avatar: "/avatars/user.jpg",
                    role: userRole === "ADMIN" ? "Admin" : "Teacher"
                }} />
            </SidebarFooter>
        </Sidebar>
    );
};

export default AppSidebar;