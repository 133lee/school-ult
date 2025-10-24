"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { MoreVertical } from "lucide-react";

interface Performer {
  id: string;
  name: string;
  studentId: string;
  className: string;
  percentage: number;
  rank: string;
  photoUrl: string;
}

const weekPerformers: Performer[] = [
  {
    id: "1",
    name: "Enos Schimel",
    studentId: "ID: 4278",
    className: "6th Class",
    percentage: 98.44,
    rank: "1st",
    photoUrl: "https://i.pravatar.cc/150?img=12",
  },
  {
    id: "2",
    name: "Cayla Bergnaum",
    studentId: "ID: 2347",
    className: "8th Class",
    percentage: 98.22,
    rank: "2nd",
    photoUrl: "https://i.pravatar.cc/150?img=5",
  },
  {
    id: "3",
    name: "Kathryn Hahn",
    studentId: "ID: 5940",
    className: "5th Class",
    percentage: 97.0,
    rank: "3rd",
    photoUrl: "https://i.pravatar.cc/150?img=9",
  },
];

const monthPerformers: Performer[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    studentId: "ID: 3421",
    className: "7th Class",
    percentage: 96.8,
    rank: "1st",
    photoUrl: "https://i.pravatar.cc/150?img=20",
  },
  {
    id: "2",
    name: "Mike Torres",
    studentId: "ID: 5678",
    className: "6th Class",
    percentage: 95.5,
    rank: "2nd",
    photoUrl: "https://i.pravatar.cc/150?img=15",
  },
  {
    id: "3",
    name: "Emma Davis",
    studentId: "ID: 8912",
    className: "8th Class",
    percentage: 94.2,
    rank: "3rd",
    photoUrl: "https://i.pravatar.cc/150?img=25",
  },
];

const yearPerformers: Performer[] = [
  {
    id: "1",
    name: "Alex Martinez",
    studentId: "ID: 1234",
    className: "9th Class",
    percentage: 97.9,
    rank: "1st",
    photoUrl: "https://i.pravatar.cc/150?img=33",
  },
  {
    id: "2",
    name: "Jessica Brown",
    studentId: "ID: 4567",
    className: "7th Class",
    percentage: 96.4,
    rank: "2nd",
    photoUrl: "https://i.pravatar.cc/150?img=45",
  },
  {
    id: "3",
    name: "David Wilson",
    studentId: "ID: 7890",
    className: "8th Class",
    percentage: 95.8,
    rank: "3rd",
    photoUrl: "https://i.pravatar.cc/150?img=52",
  },
];

export default function TopPerformerCard() {
  const [activeTab, setActiveTab] = useState("week");

  const getCurrentPerformers = () => {
    switch (activeTab) {
      case "week":
        return weekPerformers;
      case "month":
        return monthPerformers;
      case "year":
        return yearPerformers;
      default:
        return weekPerformers;
    }
  };

  const performers = getCurrentPerformers();

  const getProgressColor = (percentage: number) => {
    if (percentage >= 98) return "bg-red-500";
    if (percentage >= 95) return "bg-orange-500";
    return "bg-yellow-500";
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">Top Performer</CardTitle>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreVertical className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100">
            <TabsTrigger value="week" className="text-sm">
              Week
            </TabsTrigger>
            <TabsTrigger value="month" className="text-sm">
              Month
            </TabsTrigger>
            <TabsTrigger value="year" className="text-sm">
              Year
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 text-xs text-gray-500 font-medium pb-2 border-b">
            <div className="col-span-3">Name</div>
            <div className="col-span-3 text-center">ID Number</div>
            <div className="col-span-2 text-center">Standard</div>
            <div className="col-span-2 text-center">Rank</div>
          </div>

          {/* Performers List */}
          <div className="space-y-4">
            {performers.map((performer, index) => (
              <div key={performer.id} className="space-y-2">
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Name with Avatar */}
                  <div className="col-span-3 flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={performer.photoUrl}
                        alt={performer.name}
                      />
                      <AvatarFallback>
                        {performer.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm text-gray-800">
                      {performer.name}
                    </span>
                  </div>

                  {/* ID Number */}
                  <div className="col-span-3 text-center">
                    <span className="text-sm text-gray-600">
                      {performer.studentId}
                    </span>
                  </div>

                  {/* Standard/Class */}
                  <div className="col-span-2 text-center">
                    <span className="text-sm text-gray-800">
                      {performer.className}
                    </span>
                  </div>

                  {/* Rank */}
                  <div className="col-span-3 text-center">
                    {/* Progress Bar */}
                    <div className="pl-0">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 relative">
                          <Progress
                            value={performer.percentage}
                            className="h-2"
                          />
                          <div
                            className={`absolute top-0 left-0 h-2 rounded-full transition-all ${getProgressColor(
                              performer.percentage
                            )}`}
                            style={{ width: `${performer.percentage}%` }}
                          />
                        </div>
                        <span
                          className={`text-sm font-semibold min-w-[50px] text-right ${
                            performer.percentage >= 98
                              ? "text-red-600"
                              : performer.percentage >= 95
                              ? "text-orange-600"
                              : "text-yellow-600"
                          }`}>
                          {performer.percentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
