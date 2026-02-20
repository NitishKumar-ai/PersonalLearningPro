import { useQuery } from "@tanstack/react-query";
import { 
  Calendar, 
  ClipboardList, 
  Clock, 
  Users,
  Laptop
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

interface ClassSession {
  id: number;
  title: string;
  class: string;
  time: string;
  duration: string;
  students: number;
  isLiveClass: boolean;
}

interface ScheduleDay {
  day: string;
  date: string;
  sessions: ClassSession[];
}

export function ClassSchedule() {
  const { data: scheduleData, isLoading } = useQuery<ScheduleDay[]>({
    queryKey: ["/api/class-schedule"],
    enabled: false, // Disabled for now until API endpoint is implemented
  });

  // Mock data for UI demonstration
  const mockSchedule: ScheduleDay[] = [
    {
      day: "Today",
      date: new Date().toISOString().split("T")[0],
      sessions: [
        {
          id: 1,
          title: "Physics - Forces & Motion",
          class: "10-A",
          time: "09:00 AM",
          duration: "45m",
          students: 32,
          isLiveClass: false,
        },
        {
          id: 2,
          title: "Chemistry Lab Session",
          class: "11-B",
          time: "11:30 AM",
          duration: "60m",
          students: 28,
          isLiveClass: true,
        },
      ],
    },
    {
      day: "Tomorrow",
      date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
      sessions: [
        {
          id: 3,
          title: "Mathematics - Algebra",
          class: "9-B",
          time: "10:15 AM",
          duration: "45m",
          students: 26,
          isLiveClass: false,
        },
        {
          id: 4,
          title: "Biology - Cellular Structure",
          class: "10-A",
          time: "02:00 PM",
          duration: "45m",
          students: 32,
          isLiveClass: false,
        },
      ],
    },
    {
      day: "Wednesday",
      date: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
      sessions: [
        {
          id: 5,
          title: "Computer Science - Algorithms",
          class: "11-A",
          time: "09:30 AM",
          duration: "60m",
          students: 24,
          isLiveClass: true,
        },
      ],
    },
  ];

  if (isLoading) {
    return <ScheduleSkeleton />;
  }

  const schedule = scheduleData || mockSchedule;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-primary mr-2" />
            <CardTitle>Class Schedule</CardTitle>
          </div>
          <CardDescription className="mt-0">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="Today">
          <TabsList className="mb-4 grid grid-cols-3">
            {schedule.map((day) => (
              <TabsTrigger key={day.day} value={day.day}>
                {day.day}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {schedule.map((day) => (
            <TabsContent key={day.day} value={day.day} className="space-y-4">
              {day.sessions.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No classes scheduled for this day
                </div>
              ) : (
                day.sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-start gap-4 p-3 rounded-lg border bg-card"
                  >
                    <div className={`rounded-full p-2 ${session.isLiveClass ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'}`}>
                      {session.isLiveClass ? <Laptop className="h-5 w-5" /> : <ClipboardList className="h-5 w-5" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{session.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">Class {session.class}</div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <div className="flex items-center justify-end mb-1">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{session.time}</span>
                        <span className="ml-1">({session.duration})</span>
                      </div>
                      <div className="flex items-center justify-end">
                        <Users className="h-3 w-3 mr-1" />
                        <span>{session.students} students</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}

function ScheduleSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-10 w-full mb-6" />
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}