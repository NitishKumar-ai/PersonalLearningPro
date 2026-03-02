import { useFirebaseAuth as useAuth } from "@/contexts/firebase-auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, Building2, BarChart3, School } from "lucide-react";

export default function SchoolAdminDashboard() {
    const { currentUser: { profile } } = useAuth();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">School Admin Dashboard</h1>
                <p className="text-muted-foreground mt-2">
                    Welcome back, {profile?.displayName || "Administrator"}. Here's an overview of your school.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">142</div>
                        <p className="text-xs text-muted-foreground">+4 from last month</p>
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

            {/* Placeholder for future school-admin widgets */}
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
