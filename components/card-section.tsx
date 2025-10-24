"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, GraduationCap, BookOpen, LibraryBig } from "lucide-react";

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalSubjects: number;
  studentsGrowth: string;
  teachersGrowth: string;
}

// Static mock data for UI display
const mockStats: DashboardStats = {
  totalStudents: 245,
  totalTeachers: 12,
  totalClasses: 18,
  totalSubjects: 15,
  studentsGrowth: "Male's: 128, Female's: 117",
  teachersGrowth: "12 active staff",
};

export function CardSection() {
  const [stats] = useState<DashboardStats>(mockStats);

  const cardData = [
    {
      title: "Total Students",
      description: "Active enrolled students",
      content: stats.totalStudents.toString(),
      footer: stats.studentsGrowth,
      icon: Users,
    },
    {
      title: "Total Teachers",
      description: "Active teaching staff",
      content: stats.totalTeachers.toString(),
      footer: stats.teachersGrowth,
      icon: GraduationCap,
    },
    {
      title: "Active Classes",
      description: "Currently running classes",
      content: stats.totalClasses.toString(),
      footer: "Across all grades",
      icon: BookOpen,
    },
    {
      title: "Subjects Offered",
      description: "Available subjects",
      content: stats.totalSubjects.toString(),
      footer: "Core & elective courses",
      icon: LibraryBig,
    },
  ];

  return (
    <section className="grid grid-cols-2 gap-3">
      {cardData.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card
            key={index}
            className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <Icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.content}</div>
              <CardDescription className="text-xs text-muted-foreground">
                {card.description}
              </CardDescription>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">{card.footer}</p>
            </CardFooter>
          </Card>
        );
      })}
    </section>
  );
}
