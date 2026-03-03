import { useFirebaseAuth as useAuth } from "@/contexts/firebase-auth-context";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, Building2, BarChart3, School, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
    school_code?: string;
}

export default function SchoolAdminDashboard() {
    const { currentUser: { profile } } = useAuth();
    const { toast } = useToast();

    const { data: teachers, isLoading } = useQuery<User[]>({
        queryKey: ["/api/school/teachers"],
    });

    const approveMutation = useMutation({
        mutationFn: async (teacherId: number) => {
            await apiRequest("POST", `/api/school/teachers/${teacherId}/approve`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/school/teachers"] });
            toast({
                title: "Teacher Approved",
                description: "The teacher account is now active.",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Action Failed",
                description: error.message,
                variant: "destructive",
            });
        }
    });

    const activeTeachers = teachers?.filter(t => t.status === "active")?.length || 0;
    const pendingTeachers = teachers?.filter(t => t.status === "pending")?.length || 0;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">School Admin Dashboard</h1>
                <p className="text-muted-foreground mt-2">
                    Welcome back, {profile?.displayName || "Administrator"}. Your school code is <span className="font-mono font-bold text-primary">{profile?.school_code || "N/A"}</span>.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{teachers?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            {activeTeachers} Active | {pendingTeachers} Pending
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,845</div>
                        <p className="text-xs text-muted-foreground">+12 from last month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Classes</CardTitle>
                        <School className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">86</div>
                        <p className="text-xs text-muted-foreground">Across all grades</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">76%</div>
                        <p className="text-xs text-muted-foreground">+2.4% from last term</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Teacher Management</CardTitle>
                    <CardDescription>Manage teacher accounts and approvals for your school.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <span className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                        </div>
                    ) : teachers && teachers.length > 0 ? (
                        <div className="border rounded-md overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 border-b">
                                    <tr>
                                        <th className="text-left p-3 font-medium">Name</th>
                                        <th className="text-left p-3 font-medium">Email</th>
                                        <th className="text-left p-3 font-medium">Status</th>
                                        <th className="text-right p-3 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {teachers.map((teacher) => (
                                        <tr key={teacher.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="p-3 font-medium">{teacher.name}</td>
                                            <td className="p-3 text-muted-foreground">{teacher.email}</td>
                                            <td className="p-3">
                                                {teacher.status === "active" ? (
                                                    <span className="flex items-center text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full text-xs w-fit">
                                                        <CheckCircle2 className="h-3 w-3 mr-1" /> Active
                                                    </span>
                                                ) : teacher.status === "pending" ? (
                                                    <span className="flex items-center text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full text-xs w-fit">
                                                        <Clock className="h-3 w-3 mr-1" /> Pending
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full text-xs w-fit">
                                                        <XCircle className="h-3 w-3 mr-1" /> {teacher.status}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-3 text-right">
                                                {teacher.status === "pending" && (
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline" 
                                                        className="h-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                        onClick={() => approveMutation.mutate(teacher.id)}
                                                        disabled={approveMutation.isPending}
                                                    >
                                                        Approve
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center p-8 bg-muted/20 rounded-lg border border-dashed">
                            <p className="text-muted-foreground text-sm italic">No teachers found for your school code.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>School Performance Overview</CardTitle>
                        <CardDescription>Academic trends for the current academic year.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center border-t">
                        <p className="text-muted-foreground">Performance charts will appear here</p>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Latest administrative actions and alerts.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center border-t">
                        <p className="text-muted-foreground">Activity feed will appear here</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
