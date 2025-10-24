"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "../ui/sidebar";
import { Bell, ChevronRight, Calendar as CalendarIcon, Search, Sun, Moon } from "lucide-react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";
import { useTheme } from "@/components/theme-provider";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "../ui/breadcrumb";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "../ui/sheet";
import Events from "../events";
import Notifications from "../notifications";

const AppNavbar = () => {
    const pathname = usePathname();
    const [notificationsSheetOpen, setNotificationsSheetOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const unreadCount = 2; // This would come from a real notification state/API
    const { theme, toggleTheme } = useTheme();

    // Generate breadcrumb items based on current-path
    const generateBreadcrumbs = () => {
        const pathSegments = pathname.split("/").filter(Boolean);

        // Map of paths to display names
        const pathNames: { [key: string]: string } = {
            admin: "Dashboard",
            teacher: "Dashboard",
            students: "Students",
            teachers: "Teachers",
            classes: "Classes",
            subjects: "Subjects",
            departments: "Departments",
            timetable: "Timetable",
            attendance: "Attendance",
            assessments: "Assessments",
            reports: "Reports",
            settings: "Settings",
            "my-classes": "My Classes",
            "my-students": "My Students",
            schedule: "Schedule",
            grades: "Grades",
            performance: "Performance",
            login: "Login",
        };

        // Determine if teacher or admin role based on first segment
        const isTeacher = pathSegments[0] === "teacher";
        const dashboardPath = isTeacher ? "/teacher" : "/admin";
        const dashboardName = "Dashboard";

        const breadcrumbs = [
            { name: dashboardName, href: dashboardPath, isLast: false },
        ];

        if (pathSegments.length > 0 && pathSegments[0] !== "admin" && pathSegments[0] !== "teacher") {
            const currentPath = pathSegments[0];
            breadcrumbs.push({
                name: pathNames[currentPath] || currentPath,
                href: `/${currentPath}`,
                isLast: true,
            });
        } else if (pathSegments.length > 1) {
            // Handle nested routes like /admin/students or /teacher/schedule
            const currentPath = pathSegments[1];
            breadcrumbs.push({
                name: pathNames[currentPath] || currentPath.charAt(0).toUpperCase() + currentPath.slice(1),
                href: `/${pathSegments[0]}/${currentPath}`,
                isLast: true,
            });
        } else if (pathSegments[0] === "admin" || pathSegments[0] === "teacher") {
            breadcrumbs[0].isLast = true;
        }

        return breadcrumbs;
    };

    const breadcrumbs = generateBreadcrumbs();

    return (
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator
                    orientation="vertical"
                    className="mx-2 h-4"
                />
                <Breadcrumb>
                    <BreadcrumbList>
                        {breadcrumbs.map((breadcrumb, index) => (
                            <React.Fragment key={breadcrumb.href}>
                                <BreadcrumbItem>
                                    {breadcrumb.isLast ? (
                                        <BreadcrumbPage className="font-medium">
                                            {breadcrumb.name}
                                        </BreadcrumbPage>
                                    ) : (
                                        <BreadcrumbLink
                                            href={breadcrumb.href}
                                            className="text-muted-foreground hover:text-foreground">
                                            {breadcrumb.name}
                                        </BreadcrumbLink>
                                    )}
                                </BreadcrumbItem>
                                {!breadcrumb.isLast && (
                                    <BreadcrumbSeparator>
                                        <ChevronRight className="h-4 w-4" />
                                    </BreadcrumbSeparator>
                                )}
                            </React.Fragment>
                        ))}
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <div className="ml-auto flex items-center gap-3">
                {/* Search Bar */}
                <div className="relative w-64 hidden md:block">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        type="search"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-9 bg-muted/50 border-border/50 focus-visible:ring-primary"
                    />
                </div>

                {/* Theme Toggle - Badge style with label */}
                <Button
                    variant="ghost"
                    onClick={toggleTheme}
                    className="h-9 px-3 gap-2 rounded-full bg-muted/50 hover:bg-muted border border-border/50">
                    {theme === "light" ? (
                        <Moon className="h-4 w-4 text-foreground" />
                    ) : (
                        <Sun className="h-4 w-4 text-foreground" />
                    )}
                    <span className="text-sm font-medium">
                        {theme === "light" ? "Light" : "Dark"}
                    </span>
                </Button>

                {/* Notifications - Soft badge rounded */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full bg-muted/50 hover:bg-muted border border-border/50 relative"
                    onClick={() => setNotificationsSheetOpen(true)}>
                    <Bell className="h-4 w-4 text-foreground" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive animate-pulse" />
                    )}
                </Button>
            </div>

            {/* Notifications & Events Side Panel - iOS Style */}
            <Sheet open={notificationsSheetOpen} onOpenChange={setNotificationsSheetOpen}>
                <SheetContent
                    side="right"
                    className="w-full sm:max-w-lg p-0 overflow-hidden flex flex-col bg-gradient-to-b from-background/95 via-background/90 to-muted/20 backdrop-blur-2xl border-l border-white/10 dark:border-gray-700/30">
                    <SheetHeader className="px-6 pb-0 pt-16 shrink-0">
                        <SheetTitle className="text-2xl font-bold">Activity</SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 overflow-hidden">
                        <Tabs defaultValue="notifications" className="h-full flex flex-col">
                            <TabsList className="mx-6 mt-6 bg-white/40 dark:bg-gray-900/40 p-1 rounded-2xl backdrop-blur-xl border border-white/20 dark:border-gray-700/30 shadow-sm">
                                <TabsTrigger
                                    value="notifications"
                                    className="flex-1 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
                                >
                                    <Bell className="h-4 w-4 mr-2" />
                                    Notifications
                                    {unreadCount > 0 && (
                                        <Badge
                                            variant="destructive"
                                            className="ml-2 h-5 w-5 flex items-center justify-center p-0 text-[10px] rounded-full animate-pulse"
                                        >
                                            {unreadCount}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger
                                    value="events"
                                    className="flex-1 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
                                >
                                    <CalendarIcon className="h-4 w-4 mr-2" />
                                    Events
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="notifications" className="flex-1 overflow-hidden mt-4 data-[state=active]:animate-in data-[state=active]:fade-in-50 data-[state=active]:slide-in-from-bottom-2">
                                <Notifications embedded={true} />
                            </TabsContent>
                            <TabsContent value="events" className="flex-1 overflow-hidden mt-4 data-[state=active]:animate-in data-[state=active]:fade-in-50 data-[state=active]:slide-in-from-bottom-2">
                                <div className="h-full px-6 pb-6">
                                    <Events embedded={true} />
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </SheetContent>
            </Sheet>
        </header>
    );
};

export default AppNavbar;