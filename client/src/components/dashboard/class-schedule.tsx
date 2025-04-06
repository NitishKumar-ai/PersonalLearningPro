import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, GraduationCap, Users, MapPin } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface ClassSession {
  id: string;
  subject: string;
  standard: string;  // Grade/class level
  time: string;
  duration: string;
  room: string;
  students: number;
  status: "upcoming" | "current" | "completed";
}

interface DaySchedule {
  day: string;
  date: string;
  classes: ClassSession[];
}

export function ClassSchedule() {
  // Mock data for the class schedule
  const weekSchedule: DaySchedule[] = [
    {
      day: "Monday",
      date: "April 1, 2025",
      classes: [
        {
          id: "mon-1",
          subject: "Physics",
          standard: "Grade 10",
          time: "08:30 AM",
          duration: "50 min",
          room: "Lab 101",
          students: 28,
          status: "completed"
        },
        {
          id: "mon-2",
          subject: "Chemistry",
          standard: "Grade 11",
          time: "09:30 AM",
          duration: "50 min",
          room: "Lab 203",
          students: 24,
          status: "completed"
        },
        {
          id: "mon-3",
          subject: "Mathematics",
          standard: "Grade 9",
          time: "10:30 AM",
          duration: "50 min",
          room: "Room 105",
          students: 30,
          status: "current"
        },
        {
          id: "mon-4",
          subject: "Physics",
          standard: "Grade 12",
          time: "12:00 PM",
          duration: "50 min",
          room: "Lab 101",
          students: 22,
          status: "upcoming"
        },
        {
          id: "mon-5",
          subject: "Biology",
          standard: "Grade 10",
          time: "01:30 PM",
          duration: "50 min",
          room: "Lab 102",
          students: 26,
          status: "upcoming"
        },
        {
          id: "mon-6",
          subject: "Chemistry",
          standard: "Grade 9",
          time: "02:30 PM",
          duration: "50 min",
          room: "Lab 203",
          students: 30,
          status: "upcoming"
        }
      ]
    },
    {
      day: "Tuesday",
      date: "April 2, 2025",
      classes: [
        {
          id: "tue-1",
          subject: "Mathematics",
          standard: "Grade 12",
          time: "08:30 AM",
          duration: "50 min",
          room: "Room 106",
          students: 22,
          status: "upcoming"
        },
        {
          id: "tue-2",
          subject: "Physics",
          standard: "Grade 11",
          time: "09:30 AM",
          duration: "50 min",
          room: "Lab 101",
          students: 24,
          status: "upcoming"
        },
        {
          id: "tue-3",
          subject: "Chemistry",
          standard: "Grade 10",
          time: "10:30 AM",
          duration: "50 min",
          room: "Lab 203",
          students: 28,
          status: "upcoming"
        },
        {
          id: "tue-4",
          subject: "Biology",
          standard: "Grade 11",
          time: "12:00 PM",
          duration: "50 min",
          room: "Lab 102",
          students: 24,
          status: "upcoming"
        },
        {
          id: "tue-5",
          subject: "Mathematics",
          standard: "Grade 10",
          time: "01:30 PM",
          duration: "50 min",
          room: "Room 105",
          students: 28,
          status: "upcoming"
        },
        {
          id: "tue-6",
          subject: "Physics",
          standard: "Grade 9",
          time: "02:30 PM",
          duration: "50 min",
          room: "Lab 101",
          students: 30,
          status: "upcoming"
        }
      ]
    },
    {
      day: "Wednesday",
      date: "April 3, 2025",
      classes: [
        {
          id: "wed-1",
          subject: "Biology",
          standard: "Grade 12",
          time: "08:30 AM",
          duration: "50 min",
          room: "Lab 102",
          students: 22,
          status: "upcoming"
        },
        {
          id: "wed-2",
          subject: "Mathematics",
          standard: "Grade 11",
          time: "09:30 AM",
          duration: "50 min",
          room: "Room 106",
          students: 24,
          status: "upcoming"
        },
        {
          id: "wed-3",
          subject: "Physics",
          standard: "Grade 10",
          time: "10:30 AM",
          duration: "50 min",
          room: "Lab 101",
          students: 28,
          status: "upcoming"
        },
        {
          id: "wed-4",
          subject: "Chemistry",
          standard: "Grade 9",
          time: "12:00 PM",
          duration: "50 min",
          room: "Lab 203",
          students: 30,
          status: "upcoming"
        },
        {
          id: "wed-5",
          subject: "Biology",
          standard: "Grade 9",
          time: "01:30 PM",
          duration: "50 min",
          room: "Lab 102",
          students: 30,
          status: "upcoming"
        },
        {
          id: "wed-6",
          subject: "Mathematics",
          standard: "Grade 12",
          time: "02:30 PM",
          duration: "50 min",
          room: "Room 106",
          students: 22,
          status: "upcoming"
        }
      ]
    },
    {
      day: "Thursday",
      date: "April 4, 2025",
      classes: [
        {
          id: "thu-1",
          subject: "Chemistry",
          standard: "Grade 12",
          time: "08:30 AM",
          duration: "50 min",
          room: "Lab 203",
          students: 22,
          status: "upcoming"
        },
        {
          id: "thu-2",
          subject: "Biology",
          standard: "Grade 10",
          time: "09:30 AM",
          duration: "50 min",
          room: "Lab 102",
          students: 28,
          status: "upcoming"
        },
        {
          id: "thu-3",
          subject: "Mathematics",
          standard: "Grade 9",
          time: "10:30 AM",
          duration: "50 min",
          room: "Room 105",
          students: 30,
          status: "upcoming"
        },
        {
          id: "thu-4",
          subject: "Physics",
          standard: "Grade 11",
          time: "12:00 PM",
          duration: "50 min",
          room: "Lab 101",
          students: 24,
          status: "upcoming"
        },
        {
          id: "thu-5",
          subject: "Chemistry",
          standard: "Grade 10",
          time: "01:30 PM",
          duration: "50 min",
          room: "Lab 203",
          students: 28,
          status: "upcoming"
        },
        {
          id: "thu-6",
          subject: "Biology",
          standard: "Grade 11",
          time: "02:30 PM",
          duration: "50 min",
          room: "Lab 102",
          students: 24,
          status: "upcoming"
        }
      ]
    },
    {
      day: "Friday",
      date: "April 5, 2025",
      classes: [
        {
          id: "fri-1",
          subject: "Physics",
          standard: "Grade 9",
          time: "08:30 AM",
          duration: "50 min",
          room: "Lab 101",
          students: 30,
          status: "upcoming"
        },
        {
          id: "fri-2",
          subject: "Chemistry",
          standard: "Grade 12",
          time: "09:30 AM",
          duration: "50 min",
          room: "Lab 203",
          students: 22,
          status: "upcoming"
        },
        {
          id: "fri-3",
          subject: "Biology",
          standard: "Grade 11",
          time: "10:30 AM",
          duration: "50 min",
          room: "Lab 102",
          students: 24,
          status: "upcoming"
        },
        {
          id: "fri-4",
          subject: "Mathematics",
          standard: "Grade 10",
          time: "12:00 PM",
          duration: "50 min",
          room: "Room 105",
          students: 28,
          status: "upcoming"
        },
        {
          id: "fri-5",
          subject: "Physics",
          standard: "Grade 12",
          time: "01:30 PM",
          duration: "50 min",
          room: "Lab 101",
          students: 22,
          status: "upcoming"
        },
        {
          id: "fri-6",
          subject: "Chemistry",
          standard: "Grade 11",
          time: "02:30 PM",
          duration: "50 min",
          room: "Lab 203",
          students: 24,
          status: "upcoming"
        }
      ]
    }
  ];

  const [activeDay, setActiveDay] = useState("Monday");

  // Helper function to get the day's schedule
  const getCurrentDaySchedule = () => {
    return weekSchedule.find(day => day.day === activeDay) || weekSchedule[0];
  };

  // Get color based on subject
  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case "Physics":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "Chemistry":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case "Biology":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "Mathematics":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  // Get color based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "current":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 animate-pulse";
      case "completed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400";
      case "upcoming":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400";
    }
  };

  const daySchedule = getCurrentDaySchedule();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-primary mr-2" />
            <CardTitle className="text-lg font-medium">Class Schedule</CardTitle>
          </div>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            View Calendar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="Monday" className="w-full">
          <TabsList className="grid grid-cols-5 mb-4">
            {weekSchedule.map((day) => (
              <TabsTrigger
                key={day.day}
                value={day.day}
                onClick={() => setActiveDay(day.day)}
                className="text-xs md:text-sm"
              >
                {day.day}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <div className="text-sm text-muted-foreground mb-4 flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            {daySchedule.date}
          </div>
          
          <div className="space-y-3">
            {daySchedule.classes.map((classItem) => (
              <div 
                key={classItem.id}
                className="p-3 border rounded-lg transition-colors hover:bg-accent/5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={cn("font-normal", getSubjectColor(classItem.subject))}>
                      {classItem.subject}
                    </Badge>
                    <Badge variant="outline" className="font-normal">
                      {classItem.standard}
                    </Badge>
                    <Badge 
                      variant="secondary" 
                      className={cn("font-normal ml-auto", getStatusColor(classItem.status))}
                    >
                      {classItem.status === "current" ? "In Progress" : 
                       classItem.status === "completed" ? "Completed" : "Upcoming"}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 text-xs sm:text-sm text-muted-foreground mt-2">
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {classItem.time} ({classItem.duration})
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {classItem.room}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {classItem.students} students
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 self-end sm:self-center mt-2 sm:mt-0">
                  <Button size="sm" variant="outline" className="h-8 text-xs">
                    Materials
                  </Button>
                  <Button size="sm" className="h-8 text-xs">
                    <GraduationCap className="h-3 w-3 mr-1" />
                    Start Class
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}