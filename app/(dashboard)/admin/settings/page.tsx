"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  School,
  Settings2,
  Bell,
  Shield,
  ChevronRight,
  BookOpen,
  ShieldCheck
} from "lucide-react";

/**
 * Admin Settings Page
 * Central hub for all system configuration
 */

const settingsSections = [
  {
    title: "Academic Calendar",
    description: "Manage academic years, terms, and school calendar",
    icon: Calendar,
    href: "/admin/settings/academic-calendar",
    badge: "Critical",
  },
  {
    title: "Curriculum Management",
    description: "Define which subjects are taught in each grade level",
    icon: BookOpen,
    href: "/admin/settings/curriculum",
    badge: "New",
  },
  {
    title: "School Information",
    description: "Configure school details, contact information, and branding",
    icon: School,
    href: "/admin/settings/school-info",
    badge: null,
  },
  {
    title: "System Preferences",
    description: "General system settings and preferences",
    icon: Settings2,
    href: "/admin/settings/system",
    badge: null,
  },
  {
    title: "Notifications",
    description: "Configure email, SMS, and push notification settings",
    icon: Bell,
    href: "/admin/settings/notifications",
    badge: null,
  },
  {
    title: "Security",
    description: "Password policies, session management, and security settings",
    icon: Shield,
    href: "/admin/settings/security",
    badge: null,
  },
  {
    title: "Permissions Management",
    description: "Manage user roles, permissions, and access control",
    icon: ShieldCheck,
    href: "/admin/permissions",
    badge: null,
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between mt-2">
        <div className="flex flex-col space-y-2">
          <h1 className="text-xl font-bold">Settings</h1>
          <p className="text-muted-foreground text-sm">
            Configure system settings and preferences
          </p>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {settingsSections.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.href} href={section.href}>
              <Card className="h-full transition-all hover:shadow-md hover:border-primary/50 cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {section.title}
                          {section.badge && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
                              {section.badge}
                            </span>
                          )}
                        </CardTitle>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <CardDescription className="mt-2">
                    {section.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">About Settings</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Important:</strong> Changes made in settings affect the entire school system.
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Always test configuration changes in a controlled environment first</li>
            <li>Academic calendar changes may affect existing assessments and reports</li>
            <li>Security setting changes take effect immediately</li>
            <li>Some changes may require users to log out and log back in</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
