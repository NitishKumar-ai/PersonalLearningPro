import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

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

  if (!tests || tests.length === 0) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6 text-center">
        <p className="text-muted-foreground">No tests available</p>
        <Link href="/create-test">
          <a>
            <Button className="mt-4">Create your first test</Button>
          </a>
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table className="min-w-full bg-white dark:bg-neutral-800 rounded-lg shadow">
        <TableHeader>
          <TableRow>
            <TableHead className="font-medium text-sm">Test Name</TableHead>
            <TableHead className="font-medium text-sm">Class</TableHead>
            <TableHead className="font-medium text-sm">Date</TableHead>
            <TableHead className="font-medium text-sm">Completion</TableHead>
            <TableHead className="font-medium text-sm">Avg. Score</TableHead>
            <TableHead className="font-medium text-sm">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tests.map((test) => (
            <TableRow
              key={test.id}
              className="hover:bg-neutral-50 dark:hover:bg-neutral-700/30"
            >
              <TableCell className="font-medium">{test.title}</TableCell>
              <TableCell>{test.class}</TableCell>
              <TableCell>
                {new Date(test.testDate).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <div className="h-2 w-24 bg-neutral-200 dark:bg-neutral-700 rounded-full mr-2 overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{
                        width: `${test.completionRate || 0}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm">
                    {test.completionRate || 0}%
                  </span>
                </div>
              </TableCell>
              <TableCell className="font-medium text-secondary">
                {test.averageScore || 0}%
              </TableCell>
              <TableCell>
                <Link href={`/tests/${test.id}`}>
                  <a>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-primary hover:text-primary-dark"
                    >
                      <Eye className="h-5 w-5" />
                    </Button>
                  </a>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function TestsTableSkeleton() {
  return (
    <div className="rounded-lg shadow overflow-hidden bg-white dark:bg-neutral-800">
      <div className="p-4 border-b">
        <Skeleton className="h-6 w-32" />
      </div>
      <div className="space-y-4 p-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex justify-between items-center">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
