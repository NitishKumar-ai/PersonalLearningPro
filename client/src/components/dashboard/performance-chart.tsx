import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

interface PerformanceData {
  subject: string;
  averageScore: number;
  classAverage: number;
}

export function PerformanceChart() {
  const [period, setPeriod] = useState("monthly");
  
  const { data, isLoading } = useQuery<PerformanceData[]>({
    queryKey: ["/api/analytics/performance", { period }],
  });

  if (isLoading) {
    return <PerformanceChartSkeleton />;
  }

  // Default data if none available
  const chartData = data || [
    { subject: "Physics", averageScore: 78, classAverage: 72 },
    { subject: "Chemistry", averageScore: 82, classAverage: 68 },
    { subject: "Mathematics", averageScore: 74, classAverage: 70 },
    { subject: "Biology", averageScore: 85, classAverage: 75 },
    { subject: "English", averageScore: 80, classAverage: 78 },
  ];

  return (
    <div className="h-full">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="font-medium">Class Performance by Subject</h3>
        <Tabs defaultValue="monthly" onValueChange={setPeriod}>
          <TabsList>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="subject" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
            <Tooltip
              formatter={(value) => [`${value}%`]}
              contentStyle={{
                backgroundColor: "var(--background)",
                borderColor: "var(--border)",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Bar
              name="Average Score"
              dataKey="averageScore"
              fill="hsl(var(--chart-1))"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              name="Class Average"
              dataKey="classAverage"
              fill="hsl(var(--chart-2))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function PerformanceChartSkeleton() {
  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-8 w-64" />
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
