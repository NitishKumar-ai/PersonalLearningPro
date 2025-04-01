import { useState } from "react";
import { Link } from "wouter";
import { FileQuestion, ScanBarcode, BarChart3, PlusCircle } from "lucide-react";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { QuickActionCard } from "@/components/dashboard/quick-action-card";
import { RecentTestsTable } from "@/components/dashboard/recent-tests-table";
import { TopStudents } from "@/components/dashboard/top-students";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { useAuth } from "@/contexts/auth-context";

export default function Dashboard() {
  const { user } = useAuth();
  const [title] = useState("Teacher Dashboard");

  const quickActions = [
    {
      title: "Create New Test",
      description: "Design customized assessments",
      icon: <PlusCircle className="h-6 w-6" />,
      href: "/create-test",
      bgColor: "bg-primary/10 dark:bg-primary/20",
      iconColor: "text-primary",
    },
    {
      title: "Scan Paper Test",
      description: "Upload handwritten answers",
      icon: <ScanBarcode className="h-6 w-6" />,
      href: "/ocr-scan",
      bgColor: "bg-secondary/10 dark:bg-secondary/20",
      iconColor: "text-secondary",
    },
    {
      title: "View Analytics",
      description: "Class performance insights",
      icon: <BarChart3 className="h-6 w-6" />,
      href: "/analytics",
      bgColor: "bg-accent/10 dark:bg-accent/20",
      iconColor: "text-accent",
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-100 dark:bg-neutral-900">
      <Sidebar />

      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        <Header title={title} />

        <div className="px-4 py-6 md:px-6 lg:px-8 pb-20 md:pb-6">
          {/* Quick Actions Section */}
          <section className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <QuickActionCard
                  key={index}
                  title={action.title}
                  description={action.description}
                  icon={action.icon}
                  href={action.href}
                  bgColor={action.bgColor}
                  iconColor={action.iconColor}
                />
              ))}
            </div>
          </section>

          {/* Recent Tests & Performance Section */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Recent Tests & Performance</h2>
              <Link href="/tests">
                <a className="text-sm text-primary font-medium hover:underline">
                  View All
                </a>
              </Link>
            </div>

            <RecentTestsTable />
          </section>

          {/* Analytics & Student Insights */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Performance Metrics */}
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-4 lg:col-span-2">
              <PerformanceChart />
            </div>

            {/* Top Performing Students */}
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-4">
              <h3 className="font-medium mb-4">Top Performing Students</h3>
              <TopStudents />
            </div>
          </section>
        </div>

        <MobileNav />
      </div>
    </div>
  );
}
