import { useState } from "react";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ChevronLeft,
    ChevronRight,
    CalendarDays,
    BookOpen,
    FileQuestion,
    Trophy,
    Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

type EventType = "exam" | "assignment" | "holiday" | "event" | "test";

interface CalEvent {
    id: string;
    date: number; // day of month
    month: number; // 0-indexed
    year: number;
    title: string;
    type: EventType;
    subject?: string;
    time?: string;
}

const EVENT_COLORS: Record<EventType, { bg: string; text: string; border: string; dot: string; label: string; icon: ReactNode }> = {
    exam: { bg: "bg-red-500/10", text: "text-red-600 dark:text-red-400", border: "border-red-500/30", dot: "bg-red-500", label: "Exam", icon: <FileQuestion className="h-3 w-3" /> },
    test: { bg: "bg-orange-500/10", text: "text-orange-600 dark:text-orange-400", border: "border-orange-500/30", dot: "bg-orange-500", label: "Quiz", icon: <BookOpen className="h-3 w-3" /> },
    assignment: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", border: "border-blue-500/30", dot: "bg-blue-500", label: "Assignment", icon: <BookOpen className="h-3 w-3" /> },
    holiday: { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/30", dot: "bg-emerald-500", label: "Holiday", icon: <Star className="h-3 w-3" /> },
    event: { bg: "bg-violet-500/10", text: "text-violet-600 dark:text-violet-400", border: "border-violet-500/30", dot: "bg-violet-500", label: "Event", icon: <Trophy className="h-3 w-3" /> },
};

const EVENTS: CalEvent[] = [
    { id: "1", date: 8, month: 2, year: 2026, title: "Physics Quiz — EM Waves", type: "test", subject: "Physics", time: "10:00 AM" },
    { id: "2", date: 11, month: 2, year: 2026, title: "Math Integration Unit Test", type: "test", subject: "Mathematics", time: "9:00 AM" },
    { id: "3", date: 13, month: 2, year: 2026, title: "Chemistry Assignment Due", type: "assignment", subject: "Chemistry" },
    { id: "4", date: 15, month: 2, year: 2026, title: "Annual Sports Day", type: "event", time: "All Day" },
    { id: "5", date: 18, month: 2, year: 2026, title: "Biology Mid-term Exam", type: "exam", subject: "Biology", time: "11:00 AM" },
    { id: "6", date: 22, month: 2, year: 2026, title: "Holi (School Holiday)", type: "holiday" },
    { id: "7", date: 25, month: 2, year: 2026, title: "Computer Science Project Demo", type: "assignment", subject: "Computer Science", time: "2:00 PM" },
    { id: "8", date: 28, month: 2, year: 2026, title: "Chapter Test — English", type: "test", subject: "English", time: "8:00 AM" },
    { id: "9", date: 30, month: 2, year: 2026, title: "Chemistry Final Exam", type: "exam", subject: "Chemistry", time: "9:00 AM" },
    { id: "10", date: 1, month: 3, year: 2026, title: "Summer Break Begins", type: "holiday" },
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
    return new Date(year, month, 1).getDay();
}

export default function AcademicCalendarPage() {
    const today = new Date();
    const [currentYear, setCurrentYear] = useState(2026);
    const [currentMonth, setCurrentMonth] = useState(2); // March (0-indexed)
    const [selectedDate, setSelectedDate] = useState<number | null>(today.getDate());

    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

    const prevMonth = () => {
        if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1); }
        else setCurrentMonth((m) => m - 1);
        setSelectedDate(null);
    };

    const nextMonth = () => {
        if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1); }
        else setCurrentMonth((m) => m + 1);
        setSelectedDate(null);
    };

    const eventsForMonth = EVENTS.filter((e) => e.month === currentMonth && e.year === currentYear);
    const eventsForDay = selectedDate
        ? eventsForMonth.filter((e) => e.date === selectedDate)
        : [];
    const isToday = (day: number) =>
        day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

    const getEventsForDay = (day: number) => eventsForMonth.filter((e) => e.date === day);

    return (
        <>
            <PageHeader
                title="Academic Calendar"
                subtitle="Plan, track, and manage your academic schedule with ease."
                className="animate-fade-in-up"
                breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Calendar" }]}
            />

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 mb-6 animate-fade-in-up" style={{ animationDelay: "50ms" }}>
                {Object.entries(EVENT_COLORS).map(([type, cfg]) => (
                    <div key={type} className="flex items-center gap-1.5">
                        <span className={cn("w-2.5 h-2.5 rounded-full", cfg.dot)} />
                        <span className="text-xs text-muted-foreground font-medium">{cfg.label}</span>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Calendar */}
                <div className="lg:col-span-2">
                    <Card className="animate-fade-in-up overflow-hidden shadow-soft border-border" style={{ animationDelay: "100ms" }}>
                        {/* Month nav */}
                        <div className="flex items-center justify-between p-6 pb-5 border-b border-border bg-muted/50">
                            <div className="flex items-center gap-3">
                                <CalendarDays className="h-5 w-5 text-accent" />
                                <h2 className="text-xl font-display text-foreground">
                                    {MONTHS[currentMonth]} {currentYear}
                                </h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-border hover:bg-muted/50" onClick={prevMonth}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" className="h-9 px-4 text-xs font-bold uppercase tracking-widest border-border hover:bg-muted/50" onClick={() => { setCurrentMonth(today.getMonth()); setCurrentYear(today.getFullYear()); setSelectedDate(today.getDate()); }}>
                                    Today
                                </Button>
                                <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-border hover:bg-muted/50" onClick={nextMonth}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <CardContent className="p-6 pt-5">
                            {/* Day headers */}
                            <div className="grid grid-cols-7 gap-2 mb-4">
                                {DAYS.map((d) => (
                                    <div key={d} className={cn("text-[10px] font-bold text-center py-2 uppercase tracking-widest", d === "Sun" || d === "Sat" ? "text-energy" : "text-muted-foreground")}>
                                        {d}
                                    </div>
                                ))}
                            </div>

                            {/* Day cells */}
                            <div className="grid grid-cols-7 gap-2">
                                {/* Empty cells before first day */}
                                {Array.from({ length: firstDay }).map((_, i) => (
                                    <div key={`empty-${i}`} className="min-h-[70px]" />
                                ))}

                                {Array.from({ length: daysInMonth }).map((_, i) => {
                                    const day = i + 1;
                                    const dayEvents = getEventsForDay(day);
                                    const isSelected = selectedDate === day;
                                    const todayDay = isToday(day);

                                    return (
                                        <button
                                            key={day}
                                            onClick={() => setSelectedDate(day === selectedDate ? null : day)}
                                            className={cn(
                                                "relative flex flex-col items-center p-2 rounded-2xl transition-all text-sm font-medium min-h-[70px] border group",
                                                isSelected 
                                                    ? "border-accent/40 bg-accent-soft/30 shadow-inner" 
                                                    : "border-cream-100 hover:border-border hover:bg-muted",
                                                todayDay && !isSelected ? "border-accent/20 bg-muted/50" : ""
                                            )}
                                        >
                                            <span className={cn(
                                                "w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold transition-all mb-1",
                                                todayDay ? "bg-accent text-white shadow-soft" : isSelected ? "text-accent" : "text-foreground"
                                            )}>
                                                {day}
                                            </span>
                                            {/* Event dots */}
                                            {dayEvents.length > 0 && (
                                                <div className="flex gap-1 flex-wrap justify-center">
                                                    {dayEvents.slice(0, 3).map((ev) => (
                                                        <span
                                                            key={ev.id}
                                                            className={cn("w-1.5 h-1.5 rounded-full ring-1 ring-white", EVENT_COLORS[ev.type].dot)}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Month summary strip */}
                    <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
                        {Object.entries(EVENT_COLORS).slice(0, 4).map(([type, cfg]) => {
                            const count = eventsForMonth.filter((e) => e.type === type).length;
                            return (
                                <Card key={type} className="hover:shadow-card transition-all border-border group">
                                    <CardContent className="p-4 flex items-center gap-3">
                                        <div className={cn("p-2 rounded-xl transition-transform group-hover:scale-110", cfg.bg)}>
                                            <span className={cfg.text}>{cfg.icon}</span>
                                        </div>
                                        <div>
                                            <div className="text-xl font-display text-foreground leading-none mb-1">{count}</div>
                                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{cfg.label}s</div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {/* Right: Day Detail + Upcoming */}
                <div className="space-y-4">
                    {/* Selected Day Events */}
                    <Card className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
                        <CardContent className="p-4">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                                <CalendarDays className="h-4 w-4" />
                                {selectedDate ? `${MONTHS[currentMonth]} ${selectedDate}` : "Select a day"}
                            </h3>
                            {selectedDate ? (
                                eventsForDay.length === 0 ? (
                                    <div className="flex flex-col items-center gap-2 py-6 text-center">
                                        <p className="text-sm text-muted-foreground">No events on this day</p>
                                        <p className="text-xs text-muted-foreground/60">Free day! 🎉</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {eventsForDay.map((ev) => {
                                            const cfg = EVENT_COLORS[ev.type];
                                            return (
                                                <div key={ev.id} className={cn("p-3 rounded-xl border", cfg.bg, cfg.border)}>
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                        <span className={cfg.text}>{cfg.icon}</span>
                                                        <Badge className={cn("text-[9px] font-bold border-0", cfg.bg, cfg.text)}>
                                                            {cfg.label}
                                                        </Badge>
                                                    </div>
                                                    <p className={cn("text-sm font-semibold", cfg.text)}>{ev.title}</p>
                                                    {ev.subject && <p className="text-xs text-muted-foreground mt-0.5">{ev.subject}</p>}
                                                    {ev.time && <p className="text-xs text-muted-foreground mt-0.5">⏰ {ev.time}</p>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">Click a date to see events</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Upcoming Events */}
                    <Card className="animate-fade-in-up" style={{ animationDelay: "250ms" }}>
                        <CardContent className="p-4">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                                Upcoming Events
                            </h3>
                            <div className="space-y-2">
                                {eventsForMonth
                                    .filter((e) => e.date >= (selectedDate || today.getDate()))
                                    .sort((a, b) => a.date - b.date)
                                    .slice(0, 6)
                                    .map((ev) => {
                                        const cfg = EVENT_COLORS[ev.type];
                                        return (
                                            <div
                                                key={ev.id}
                                                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/40 transition-colors cursor-pointer"
                                                onClick={() => setSelectedDate(ev.date)}
                                            >
                                                <div className="flex-shrink-0 w-8 h-8 flex flex-col items-center justify-center rounded-lg bg-muted text-center">
                                                    <span className="text-[10px] font-bold text-muted-foreground">{MONTHS[ev.month].slice(0, 3).toUpperCase()}</span>
                                                    <span className="text-sm font-bold leading-none">{ev.date}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-semibold truncate">{ev.title}</p>
                                                    {ev.subject && <p className="text-[10px] text-muted-foreground">{ev.subject}</p>}
                                                </div>
                                                <span className={cn("w-2 h-2 rounded-full flex-shrink-0", cfg.dot)} />
                                            </div>
                                        );
                                    })}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
