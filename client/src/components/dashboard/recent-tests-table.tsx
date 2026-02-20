import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Check, 
  Clock, 
  FileText, 
  X 
} from "lucide-react";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

interface Test {
  id: number;
  title: string;
  subject: string;
  class: string;
  testDate: string;
  status: string;
  completionRate?: number;
  averageScore?: number;
}

export function RecentTestsTable() {
  const { data: tests, isLoading } = useQuery<Test[]>({
    queryKey: ["/api/tests"],
  });

  if (isLoading) {
    return <TestsTableSkeleton />;
  }

  // Mock data for UI demonstration
  const mockTests: Test[] = [
    {
      id: 1,
      title: "Periodic Table Quiz",
      subject: "Chemistry",
      class: "10-A",
      testDate: "2023-04-02",
      status: "completed",
      completionRate: 100,
      averageScore: 82,
    },
    {
      id: 2,
      title: "Equations & Inequalities",
      subject: "Mathematics",
      class: "9-B",
      testDate: "2023-04-03",
      status: "in-progress",
      completionRate: 65,
    },
    {
      id: 3,
      title: "Photosynthesis",
      subject: "Biology",
      class: "10-A",
      testDate: "2023-04-05",
      status: "scheduled",
    },
  ];

  const displayTests = tests || mockTests;

  if (!displayTests || displayTests.length === 0) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6 text-center">
        <p className="text-muted-foreground">No tests available</p>
        <Link href="/create-test">
          <Button className="mt-4">Create your first test</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Test</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Completion</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayTests.map((test) => (
            <TableRow key={test.id}>
              <TableCell>
                <div className="font-medium">{test.title}</div>
                <div className="text-xs text-muted-foreground">{test.subject}</div>
              </TableCell>
              <TableCell>{test.class}</TableCell>
              <TableCell>
                {new Date(test.testDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </TableCell>
              <TableCell>
                <TestStatusBadge status={test.status} />
              </TableCell>
              <TableCell>
                {test.status !== "scheduled" ? (
                  <div className="w-full max-w-[100px]">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs">
                        {test.completionRate}%
                      </span>
                      {test.status === "completed" && (
                        <span className="text-xs">
                          Avg: {test.averageScore}%
                        </span>
                      )}
                    </div>
                    <Progress value={test.completionRate} className="h-2" />
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">Not started</span>
                )}
              </TableCell>
              <TableCell>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/tests/${test.id}`} className="flex items-center">
                    <FileText className="h-4 w-4 mr-1" />
                    View
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function TestStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "completed":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
          <Check className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      );
    case "in-progress":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
          <Clock className="h-3 w-3 mr-1" />
          In Progress
        </Badge>
      );
    case "scheduled":
      return (
        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800">
          <Clock className="h-3 w-3 mr-1" />
          Scheduled
        </Badge>
      );
    case "canceled":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
          <X className="h-3 w-3 mr-1" />
          Canceled
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function TestsTableSkeleton() {
  return (
    <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Test</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Completion</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[1, 2, 3].map((i) => (
            <TableRow key={i}>
              <TableCell>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-24 rounded-full" />
              </TableCell>
              <TableCell>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-2 w-full" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-9 w-20 rounded" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}