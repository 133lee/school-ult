import { CardSection } from "@/components/card-section";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import Events from "@/components/events";
import React from "react";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { ScrollBar } from "@/components/ui/scroll-area";
import TopPerformerCard from "@/components/top-performer";

const page = () => {
  return (
    <main className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/*  Right side - Cards in 2x2 grid */}
        <div className="md:col-span-1">
          <CardSection />
        </div>

        {/* Left side - Chart */}
        <div className="md:col-span-2">
          <ChartAreaInteractive />
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3">
          <TopPerformerCard />
        </div>
        <div className="md:col-span-1">
          <Events embedded={true} userRole="admin" />
        </div>
      </div>
    </main>
  );
};

export default page;
