import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface Student {
  id: number;
  name: string;
  avatar?: string;
  averageScore: number;
  color?: string;
}

export function TopStudents() {
  const { data: students, isLoading } = useQuery<Student[]>({
    queryKey: ["/api/users", { role: "student", sortBy: "score", limit: 3 }],
  });

  if (isLoading) {
    return <TopStudentsSkeleton />;
  }

  // Add default colors if not provided
  const defaultColors = ["bg-primary", "bg-accent", "bg-neutral-400"];
  const studentsWithColor = students?.map((student, index) => ({
    ...student,
    color: student.color || defaultColors[index % defaultColors.length],
  }));

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  if (!studentsWithColor || studentsWithColor.length === 0) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-muted-foreground">No student data available yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {studentsWithColor.map((student) => (
        <div key={student.id} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full ${student.color} text-white flex items-center justify-center font-medium text-sm mr-3`}
          >
            {getInitials(student.name)}
          </div>
          <div className="flex-1">
            <p className="font-medium">{student.name}</p>
            <div className="flex items-center">
              <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full w-full mt-1 overflow-hidden">
                <div
                  className="h-full bg-secondary rounded-full"
                  style={{ width: `${student.averageScore}%` }}
                ></div>
              </div>
              <span className="ml-2 text-sm font-medium text-secondary">
                {student.averageScore}%
              </span>
            </div>
          </div>
        </div>
      ))}

      <Button
        variant="ghost"
        className="w-full mt-2 py-2 text-sm font-medium text-primary hover:underline"
      >
        View All Students
      </Button>
    </div>
  );
}

function TopStudentsSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="ml-3 space-y-2 flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-2 w-full" />
          </div>
          <Skeleton className="h-4 w-8 ml-2" />
        </div>
      ))}
      <Skeleton className="h-8 w-full" />
    </div>
  );
}
