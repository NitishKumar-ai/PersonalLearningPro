import { useState } from "react";
import { Link } from "wouter";
import { Search, Filter, ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { getInitials } from "@/lib/utils";

interface Student {
  id: number;
  name: string;
  profileUrl?: string;
  avatar?: string;
  city: string;
  state: string;
  standard: string;
  section?: string;
}

const standards = [
  "Nursery",
  "LKG",
  "UKG",
  "1st",
  "2nd",
  "3rd",
  "4th",
  "5th",
  "6th",
  "7th",
  "8th",
  "9th",
  "10th",
  "11th",
  "12th"
];

const standardGroups = [
  { id: "pre-primary", name: "Pre-Primary", standards: ["Nursery", "LKG", "UKG"] },
  { id: "primary", name: "Primary", standards: ["1st", "2nd", "3rd", "4th", "5th"] },
  { id: "middle", name: "Middle", standards: ["6th", "7th", "8th"] },
  { id: "secondary", name: "Secondary", standards: ["9th", "10th"] },
  { id: "senior-secondary", name: "Senior Secondary", standards: ["11th", "12th"] }
];

export default function StudentDirectory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStandard, setSelectedStandard] = useState<string>("all");
  const [selectedState, setSelectedState] = useState<string>("all");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");

  // Fetch student data
  const { data: students, isLoading } = useQuery<Student[]>({
    queryKey: ["/api/students"],
    enabled: false, // Disabled until API endpoint is implemented
  });

  // Mock student data for UI demonstration
  const mockStudents: Student[] = [
    {
      id: 1,
      name: "Ishita Khot",
      profileUrl: "linkedin.com/in/...b721a/",
      avatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=1",
      city: "Buldana",
      state: "Maharashtra",
      standard: "9th",
      section: "A"
    },
    {
      id: 2,
      name: "Riya Bhurse",
      profileUrl: "linkedin.com/in/...78fb7/",
      avatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=2",
      city: "Belagavi",
      state: "Karnataka",
      standard: "10th",
      section: "B"
    },
    {
      id: 3,
      name: "Pawanjot Kaur",
      profileUrl: "linkedin.com/in/...84259/",
      avatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=3",
      city: "Jaipur",
      state: "Rajasthan",
      standard: "11th",
      section: "C"
    },
    {
      id: 4,
      name: "Rushil Choudhary",
      profileUrl: "linkedin.com/in/...93f72/",
      avatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=4",
      city: "Mumbai",
      state: "Maharashtra",
      standard: "12th",
      section: "A"
    },
    {
      id: 5,
      name: "Ayush Saxena",
      profileUrl: "linkedin.com/in/...a7e51/",
      avatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=5&hair=short",
      city: "Delhi",
      state: "Delhi",
      standard: "8th",
      section: "B"
    },
    {
      id: 6,
      name: "Yash Athwani",
      profileUrl: "linkedin.com/in/...42c6b/",
      avatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=6&hair=short",
      city: "Pune",
      state: "Maharashtra",
      standard: "7th",
      section: "A"
    },
    {
      id: 7,
      name: "Ananya Patel",
      profileUrl: "linkedin.com/in/...b23d4/",
      avatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=7",
      city: "Ahmedabad",
      state: "Gujarat",
      standard: "6th",
      section: "B"
    },
    {
      id: 8,
      name: "Rohan Singh",
      profileUrl: "linkedin.com/in/...c41e5/",
      avatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=8&hair=short",
      city: "Lucknow",
      state: "Uttar Pradesh",
      standard: "5th",
      section: "A"
    },
    {
      id: 9,
      name: "Neha Sharma",
      profileUrl: "linkedin.com/in/...d56f1/",
      avatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=9",
      city: "Jaipur",
      state: "Rajasthan",
      standard: "4th",
      section: "C"
    },
    {
      id: 10,
      name: "Arjun Kumar",
      profileUrl: "linkedin.com/in/...e67g2/",
      avatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=10&hair=short",
      city: "Chennai",
      state: "Tamil Nadu",
      standard: "3rd",
      section: "B"
    },
    {
      id: 11,
      name: "Shreya Desai",
      profileUrl: "linkedin.com/in/...f78h3/",
      avatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=11",
      city: "Surat",
      state: "Gujarat",
      standard: "2nd",
      section: "A"
    },
    {
      id: 12,
      name: "Vikas Reddy",
      profileUrl: "linkedin.com/in/...g89i4/",
      avatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=12&hair=short",
      city: "Hyderabad",
      state: "Telangana",
      standard: "1st",
      section: "D"
    },
    {
      id: 13,
      name: "Meera Nair",
      profileUrl: "linkedin.com/in/...h90j5/",
      avatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=13",
      city: "Kochi",
      state: "Kerala",
      standard: "UKG",
      section: "A"
    },
    {
      id: 14,
      name: "Aman Gupta",
      profileUrl: "linkedin.com/in/...i01k6/",
      avatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=14&hair=short",
      city: "Indore",
      state: "Madhya Pradesh",
      standard: "LKG",
      section: "B"
    },
    {
      id: 15,
      name: "Ria Malhotra",
      profileUrl: "linkedin.com/in/...j12l7/",
      avatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=15",
      city: "Chandigarh",
      state: "Punjab",
      standard: "Nursery",
      section: "A"
    }
  ];

  const displayStudents = students || mockStudents;

  // Extract unique states for the filter
  const states = Array.from(new Set(displayStudents.map(student => student.state))).sort();

  // Filter students based on search term and filters
  const filteredStudents = displayStudents.filter(student => {
    const matchesSearch = searchTerm === "" || 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.state.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStandard = selectedStandard === "all" || student.standard === selectedStandard;
    const matchesState = selectedState === "all" || student.state === selectedState;
    
    let matchesGroup = true;
    if (selectedGroup !== "all") {
      const group = standardGroups.find(g => g.id === selectedGroup);
      matchesGroup = group ? group.standards.includes(student.standard) : true;
    }
    
    return matchesSearch && matchesStandard && matchesState && matchesGroup;
  });

  return (
    <>
      <Header title="Student Directory" />
      <div className="px-4 py-6 md:px-6 lg:px-8 pb-20 md:pb-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Student Directory</h1>
          <p className="text-muted-foreground">Browse and search for students across all standards</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative md:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name, city or state..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Select value={selectedStandard} onValueChange={setSelectedStandard}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Select Standard" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Standards</SelectItem>
                {standards.map((standard) => (
                  <SelectItem key={standard} value={standard}>
                    {standard}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-1">
                  <Filter className="h-4 w-4" />
                  <span>Filter</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter by Standard Group</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem 
                  checked={selectedGroup === "all"}
                  onCheckedChange={() => setSelectedGroup("all")}
                >
                  All Groups
                </DropdownMenuCheckboxItem>
                {standardGroups.map((group) => (
                  <DropdownMenuCheckboxItem 
                    key={group.id}
                    checked={selectedGroup === group.id}
                    onCheckedChange={() => setSelectedGroup(group.id)}
                  >
                    {group.name}
                  </DropdownMenuCheckboxItem>
                ))}
                
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Filter by State</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem 
                  checked={selectedState === "all"}
                  onCheckedChange={() => setSelectedState("all")}
                >
                  All States
                </DropdownMenuCheckboxItem>
                {states.map((state) => (
                  <DropdownMenuCheckboxItem 
                    key={state}
                    checked={selectedState === state}
                    onCheckedChange={() => setSelectedState(state)}
                  >
                    {state}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {(selectedStandard !== "all" || selectedState !== "all" || selectedGroup !== "all") && (
              <Button 
                variant="ghost" 
                onClick={() => {
                  setSelectedStandard("all");
                  setSelectedState("all");
                  setSelectedGroup("all");
                }}
                className="text-sm"
              >
                Reset Filters
              </Button>
            )}
          </div>
        </div>

        {/* Display by tabs for different grade groups */}
        <Tabs defaultValue="all" className="mb-4">
          <TabsList className="mb-6 flex flex-wrap">
            <TabsTrigger value="all">All Students</TabsTrigger>
            {standardGroups.map((group) => (
              <TabsTrigger key={group.id} value={group.id}>{group.name}</TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value="all">
            <StudentGrid students={filteredStudents} />
          </TabsContent>
          
          {standardGroups.map((group) => (
            <TabsContent key={group.id} value={group.id}>
              <StudentGrid 
                students={filteredStudents.filter(
                  student => group.standards.includes(student.standard)
                )} 
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
      <MobileNav />
    </>
  );
}

function StudentGrid({ students }: { students: Student[] }) {
  if (students.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No students found matching your criteria</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {students.map((student) => (
        <StudentCard key={student.id} student={student} />
      ))}
    </div>
  );
}

function StudentCard({ student }: { student: Student }) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="h-48 bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
        <Avatar className="h-32 w-32">
          {student.avatar ? (
            <AvatarImage src={student.avatar} alt={student.name} />
          ) : (
            <AvatarFallback className="text-2xl">
              {getInitials(student.name)}
            </AvatarFallback>
          )}
        </Avatar>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-1">{student.name}</h3>
        
        {student.profileUrl && (
          <a 
            href={`https://${student.profileUrl}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground block mb-2 hover:underline truncate"
          >
            {student.profileUrl}
          </a>
        )}
        
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="secondary" className="mr-1">{student.city}</Badge>
          <Badge variant="outline" className="bg-primary/10">{student.state}</Badge>
        </div>
        
        <div className="mt-3 pt-3 border-t flex items-center justify-between">
          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 dark:bg-blue-500/20 dark:text-blue-400">
            Class {student.standard}
          </Badge>
          {student.section && (
            <Badge variant="outline" className="bg-purple-500/10 text-purple-500 dark:bg-purple-500/20 dark:text-purple-400">
              Section {student.section}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}