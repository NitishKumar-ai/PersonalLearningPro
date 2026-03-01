import { Link, useLocation } from "wouter";
import {
    ArrowLeft,
    Rocket,
    School,
    Users,
    CalendarDays,
    Building2,
    Video,
    FileQuestion,
    BarChart,
    BookOpen,
    Trophy,
    Settings,
    MessageSquare,
    UserCog,
    Target,
    Headphones,
    UserCheck,
    Baby,
    Clock,
    Bell,
    ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Map of route paths to metadata
const pageMetadata: Record<
    string,
    { title: string; description: string; icon: React.ReactNode; color: string; gradient: string }
> = {
    "/institution": {
        title: "Institution Management",
        description: "Manage your school's departments, buildings, and organizational structure from one central hub.",
        icon: <School className="h-10 w-10" />,
        color: "text-blue-500",
        gradient: "from-blue-500 to-indigo-600",
    },
    "/staff": {
        title: "Staff Management",
        description: "View, onboard, and manage all teaching and non-teaching staff members in your institution.",
        icon: <Users className="h-10 w-10" />,
        color: "text-violet-500",
        gradient: "from-violet-500 to-purple-600",
    },
    "/students": {
        title: "Student Management",
        description: "Enroll students, manage classroom assignments, and track overall student progress.",
        icon: <Users className="h-10 w-10" />,
        color: "text-emerald-500",
        gradient: "from-emerald-500 to-teal-600",
    },
    "/calendar": {
        title: "Academic Calendar",
        description: "Plan and manage academic events, exam schedules, holidays, and important dates.",
        icon: <CalendarDays className="h-10 w-10" />,
        color: "text-amber-500",
        gradient: "from-amber-500 to-orange-600",
    },
    "/infrastructure": {
        title: "Infrastructure",
        description: "Manage classrooms, labs, libraries and other physical resources of your institution.",
        icon: <Building2 className="h-10 w-10" />,
        color: "text-rose-500",
        gradient: "from-rose-500 to-pink-600",
    },
    "/live-classes": {
        title: "Live Classes",
        description: "Host and join live interactive video classes with screen sharing, whiteboards, and polls.",
        icon: <Video className="h-10 w-10" />,
        color: "text-cyan-500",
        gradient: "from-cyan-500 to-blue-600",
    },
    "/tests": {
        title: "Tests & Assessments",
        description: "Browse your assigned tests, attempt quizzes, and review your answers with detailed feedback.",
        icon: <FileQuestion className="h-10 w-10" />,
        color: "text-indigo-500",
        gradient: "from-indigo-500 to-blue-600",
    },
    "/progress": {
        title: "My Progress",
        description: "Track your academic journey with detailed charts, learning milestones, and goal tracking.",
        icon: <BarChart className="h-10 w-10" />,
        color: "text-green-500",
        gradient: "from-green-500 to-emerald-600",
    },
    "/resources": {
        title: "Learning Resources",
        description: "Access study materials, e-books, video lectures, flashcards, and curated learning content.",
        icon: <BookOpen className="h-10 w-10" />,
        color: "text-amber-500",
        gradient: "from-amber-500 to-yellow-500",
    },
    "/study-groups": {
        title: "Study Groups",
        description: "Create or join collaborative study groups with peers and learn together in real-time.",
        icon: <Users className="h-10 w-10" />,
        color: "text-blue-500",
        gradient: "from-blue-500 to-cyan-600",
    },
    "/achievements": {
        title: "Achievements",
        description: "Unlock badges and certificates as you hit learning milestones and top leaderboards.",
        icon: <Trophy className="h-10 w-10" />,
        color: "text-amber-500",
        gradient: "from-amber-400 to-orange-500",
    },
    "/settings": {
        title: "Settings",
        description: "Customize your profile, notifications, appearance, and privacy preferences.",
        icon: <Settings className="h-10 w-10" />,
        color: "text-slate-500",
        gradient: "from-slate-500 to-gray-600",
    },
    "/system-settings": {
        title: "System Settings",
        description: "Configure system-level parameters, integrations, roles, and permissions for your institution.",
        icon: <Settings className="h-10 w-10" />,
        color: "text-slate-500",
        gradient: "from-slate-500 to-gray-600",
    },
    "/users": {
        title: "User Management",
        description: "Create, edit, suspend, and manage user accounts and role assignments across the platform.",
        icon: <UserCog className="h-10 w-10" />,
        color: "text-violet-500",
        gradient: "from-violet-500 to-indigo-600",
    },
    "/classes": {
        title: "Classes",
        description: "Create and manage class sections, assign teachers, and monitor class-level performance.",
        icon: <School className="h-10 w-10" />,
        color: "text-blue-500",
        gradient: "from-blue-500 to-indigo-600",
    },
    "/focus": {
        title: "Focus Sessions",
        description: "Start timed Pomodoro-style deep work sessions with ambient sounds and distraction blockers.",
        icon: <Headphones className="h-10 w-10" />,
        color: "text-teal-500",
        gradient: "from-teal-500 to-emerald-600",
    },
    "/partners": {
        title: "Study Partner Matching",
        description: "Find your ideal study buddy based on subjects, schedule, and learning style.",
        icon: <UserCheck className="h-10 w-10" />,
        color: "text-rose-500",
        gradient: "from-rose-500 to-pink-600",
    },
    "/children": {
        title: "My Children",
        description: "View all your children's profiles, academic progress, attendance, and teacher feedback.",
        icon: <Baby className="h-10 w-10" />,
        color: "text-purple-500",
        gradient: "from-purple-500 to-violet-600",
    },
    "/meetings": {
        title: "Teacher Meetings",
        description: "Schedule, request, and attend virtual parent-teacher meeting sessions.",
        icon: <Clock className="h-10 w-10" />,
        color: "text-cyan-500",
        gradient: "from-cyan-500 to-blue-600",
    },
    "/notifications": {
        title: "Notifications",
        description: "Manage all your alerts, announcements, and platform notifications in one place.",
        icon: <Bell className="h-10 w-10" />,
        color: "text-amber-500",
        gradient: "from-amber-500 to-orange-500",
    },
    "/reports": {
        title: "Reports",
        description: "Generate comprehensive performance, attendance, and financial reports for your institution.",
        icon: <ClipboardList className="h-10 w-10" />,
        color: "text-rose-500",
        gradient: "from-rose-500 to-red-600",
    },
    "/ai-study-plans": {
        title: "AI Study Plans",
        description: "Generate personalized, AI-powered study plans tailored to your curriculum and exam schedule.",
        icon: <Target className="h-10 w-10" />,
        color: "text-purple-500",
        gradient: "from-purple-500 to-violet-600",
    },
    "/test-results": {
        title: "Tests & Results",
        description: "View all test results, score breakdowns, and detailed feedback for each assessment.",
        icon: <FileQuestion className="h-10 w-10" />,
        color: "text-indigo-500",
        gradient: "from-indigo-500 to-blue-600",
    },
};

const defaultMeta = {
    title: "Coming Soon",
    description: "This feature is currently under development. Check back soon for an amazing new experience.",
    icon: <Rocket className="h-10 w-10" />,
    color: "text-primary",
    gradient: "from-primary to-primary/70",
};

// Floating orbs for visual depth
function FloatingOrbs({ gradient }: { gradient: string }) {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            <div className={`absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br ${gradient} opacity-[0.06] blur-3xl`} />
            <div className={`absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-gradient-to-tr ${gradient} opacity-[0.05] blur-3xl`} />
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br ${gradient} opacity-[0.03] blur-3xl`} />
        </div>
    );
}

// Grid dot pattern
function GridPattern() {
    return (
        <div
            className="absolute inset-0 opacity-[0.025] pointer-events-none"
            style={{
                backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
                backgroundSize: "28px 28px",
            }}
            aria-hidden="true"
        />
    );
}

// Feature teaser card
function FeatureCard({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <div className="flex flex-col items-center gap-2 px-4 py-4 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm hover:border-border transition-colors">
            <span className="text-muted-foreground">{icon}</span>
            <span className="text-xs text-muted-foreground font-medium">{label}</span>
        </div>
    );
}

export default function ComingSoon() {
    const [location] = useLocation();
    const meta = pageMetadata[location] ?? defaultMeta;

    // Determine a "go back" destination — guess from the path
    const getBackHref = () => {
        if (location.startsWith("/institution") || location.startsWith("/staff") || location.startsWith("/infrastructure") || location.startsWith("/calendar") || location.startsWith("/system-settings") || location.startsWith("/users") || location.startsWith("/classes") || location.startsWith("/reports")) {
            return "/admin-dashboard";
        }
        if (location.startsWith("/children") || location.startsWith("/meetings") || location.startsWith("/test-results")) {
            return "/parent-dashboard";
        }
        if (location.startsWith("/tests") || location.startsWith("/progress") || location.startsWith("/resources") || location.startsWith("/study-groups") || location.startsWith("/achievements") || location.startsWith("/focus") || location.startsWith("/partners")) {
            return "/student-dashboard";
        }
        return "/";
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-4">
            <FloatingOrbs gradient={meta.gradient} />
            <GridPattern />

            <div className="relative z-10 max-w-lg w-full text-center">
                {/* Icon hero */}
                <div className="flex justify-center mb-8">
                    <div className="relative">
                        {/* Glow ring */}
                        <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${meta.gradient} opacity-20 blur-xl scale-110`} />
                        <div className={`relative p-6 rounded-3xl bg-gradient-to-br ${meta.gradient} text-white shadow-2xl`}>
                            {meta.icon}
                        </div>
                    </div>
                </div>

                {/* Badge */}
                <div className="flex justify-center mb-4">
                    <Badge className="px-3 py-1 text-xs font-bold uppercase tracking-widest bg-primary/10 text-primary border-primary/20 hover:bg-primary/15">
                        🚀 In Development
                    </Badge>
                </div>

                {/* Title */}
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                    {meta.title}
                </h1>

                {/* Description */}
                <p className="text-muted-foreground text-base leading-relaxed mb-8 max-w-md mx-auto">
                    {meta.description}
                </p>

                {/* Divider */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="flex-1 h-px bg-border/60" />
                    <span className="text-xs text-muted-foreground font-medium tracking-wider uppercase">What to expect</span>
                    <div className="flex-1 h-px bg-border/60" />
                </div>

                {/* Feature preview mini-cards */}
                <div className="grid grid-cols-3 gap-3 mb-10">
                    <FeatureCard icon={<Rocket className="h-4 w-4" />} label="Smart Automation" />
                    <FeatureCard icon={<Target className="h-4 w-4" />} label="AI-Powered" />
                    <FeatureCard icon={<Trophy className="h-4 w-4" />} label="Real-time Data" />
                </div>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button asChild size="lg" className="font-semibold shadow-md">
                        <Link href={getBackHref()}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Dashboard
                        </Link>
                    </Button>
                    <Button variant="outline" size="lg" asChild>
                        <Link href="/messages">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Send Feedback
                        </Link>
                    </Button>
                </div>

                {/* Footer note */}
                <p className="mt-8 text-xs text-muted-foreground">
                    We're building this fast. Stay tuned for updates! 🎓
                </p>
            </div>
        </div>
    );
}
