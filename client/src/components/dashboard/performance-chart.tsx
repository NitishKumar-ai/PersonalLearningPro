import { useQuery } from "@tanstack/react-query";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "@/contexts/theme-context";

interface PerformanceData {
  subject: string;
  classAverage: number;
  schoolAverage: number;
}

export function PerformanceChart() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  const { data, isLoading } = useQuery<PerformanceData[]>({
    queryKey: ["/api/class-performance"],
    enabled: false, // Disabled for now until API endpoint is implemented
  });

  // Mock data for UI demonstration
  const mockData: PerformanceData[] = [
    { subject: "Physics", classAverage: 78, schoolAverage: 72 },
    { subject: "Chemistry", classAverage: 82, schoolAverage: 76 },
    { subject: "Biology", classAverage: 85, schoolAverage: 79 },
    { subject: "Math", classAverage: 74, schoolAverage: 71 },
    { subject: "English", classAverage: 88, schoolAverage: 82 },
  ];

  if (isLoading) {
    return <PerformanceChartSkeleton />;
  }

  const chartData = data || mockData;

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#333" : "#eee"} />
          <XAxis 
            dataKey="subject" 
            tick={{ fontSize: 12 }} 
            tickLine={false}
            axisLine={{ stroke: isDark ? "#444" : "#ddd" }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickLine={false} 
            axisLine={{ stroke: isDark ? "#444" : "#ddd" }}
            domain={[0, 100]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? "#333" : "#fff",
              border: `1px solid ${isDark ? "#444" : "#ddd"}`,
              borderRadius: "4px",
              color: isDark ? "#fff" : "#333",
            }}
          />
          <Legend wrapperStyle={{ paddingTop: 10 }} />
          <Bar 
            dataKey="classAverage" 
            name="Your Class" 
            fill="hsl(var(--primary))" 
            radius={[4, 4, 0, 0]} 
          />
          <Bar 
            dataKey="schoolAverage" 
            name="School Average" 
            fill="hsl(var(--muted-foreground))" 
            radius={[4, 4, 0, 0]} 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function PerformanceChartSkeleton() {
  return (
    <div className="h-[300px] w-full">
      <Skeleton className="h-full w-full" />
    </div>
  );
}