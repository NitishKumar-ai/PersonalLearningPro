import { useState } from "react";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { TopStudents } from "@/components/dashboard/top-students";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

/**
 * Render the Performance Analytics dashboard for classroom and student insights.
 *
 * Renders a dashboard composed of subject performance and completion charts, a top-students panel, and an AI-generated learning insights card with tabs for class and individual views.
 *
 * @returns The Analytics React element containing the dashboard layout and visualizations.
 */
export default function Analytics() {
  const [periodTab, setPeriodTab] = useState("monthly");

  // Sample data for visualizations
  const testCompletionData = [
    { name: "Completed", value: 85, color: "hsl(var(--chart-1))" },
    { name: "In Progress", value: 10, color: "hsl(var(--chart-2))" },
    { name: "Not Started", value: 5, color: "hsl(var(--chart-3))" },
  ];

  const subjectData = [
    { name: "Physics", value: 30, color: "hsl(var(--chart-1))" },
    { name: "Chemistry", value: 25, color: "hsl(var(--chart-2))" },
    { name: "Mathematics", value: 20, color: "hsl(var(--chart-3))" },
    { name: "Biology", value: 15, color: "hsl(var(--chart-4))" },
    { name: "Computer Science", value: 10, color: "hsl(var(--chart-5))" },
  ];

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Performance Analytics</h1>
        <p className="text-muted-foreground">
          Detailed insights into student performance and learning patterns
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Student Performance Overview */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Class Performance by Subject</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <PerformanceChart />
          </CardContent>
        </Card>

        {/* Top Performing Students */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Students</CardTitle>
          </CardHeader>
          <CardContent>
            <TopStudents />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Test Completion Rate */}
        <Card>
          <CardHeader>
            <CardTitle>Test Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={testCompletionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {testCompletionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Subject Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Subject Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subjectData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {subjectData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Learning Insights */}
      <Card>
        <CardHeader>
          <CardTitle>AI-Generated Learning Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="class" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="class">Class Insights</TabsTrigger>
              <TabsTrigger value="individuals">Individual Students</TabsTrigger>
            </TabsList>
            <TabsContent value="class" className="mt-4 space-y-4">
              <div className="bg-muted rounded-md p-4">
                <h3 className="font-medium mb-2">Improvement Areas</h3>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>Physics: Newton's Laws of Motion understanding needs reinforcement</li>
                  <li>Mathematics: Calculus application in real-world problems</li>
                  <li>Chemistry: Chemical bonding concepts need more practice</li>
                </ul>
              </div>

              <div className="bg-muted rounded-md p-4">
                <h3 className="font-medium mb-2">Teaching Recommendations</h3>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>Increase practical demonstrations for Physics concepts</li>
                  <li>Provide more visual learning materials for Chemistry</li>
                  <li>Create specialized practice sessions for weak topics</li>
                </ul>
              </div>
            </TabsContent>
            <TabsContent value="individuals" className="mt-4">
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Individual student analytics will be available in future updates
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
}