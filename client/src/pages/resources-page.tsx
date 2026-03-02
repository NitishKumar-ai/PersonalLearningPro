import { useState } from "react";
import { useLocation } from "wouter";
import { AchieversBookPanel } from "@/components/test/achievers-book-panel";
import { ArrowLeft, BookOpen, Brain, Download, Search, PlayCircle, FlaskConical, Bookmark, Clock, Star, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const mockAchieversData = {
    summary: `
# Chapter 5: Electromagnetism

### Key Concepts
- **Magnetic Flux ($\\Phi_B$)**: $\\Phi_B = B \\cdot A \\cdot \\cos(\\theta)$
- **Faraday's Law of Induction**: $\\mathcal{E} = -N \\frac{d\\Phi_B}{dt}$
- **Lenz's Law**: The direction of the induced current opposes the change in magnetic flux that produced it.

### Important Real-World Examples
1. **Generators**: Convert mechanical energy into electrical energy using electromagnetic induction.
2. **Transformers**: Step up or step down AC voltage by mutual induction.
  `,
    pyqs: [
        {
            year: 2023,
            board: "CBSE Set A",
            question: "Why can't a transformer be used with a DC source?",
            answer: "A transformer works on the principle of mutual induction which requires a changing magnetic flux. A DC source produces a constant magnetic field, so there is no changing flux, and thus no induced EMF."
        },
        {
            year: 2022,
            board: "ICSE",
            question: "State Lenz's Law.",
            answer: "Lenz's Law states that the current induced in a circuit due to a change in a magnetic field is directed to oppose the change in flux and to exert a mechanical force which opposes the motion."
        }
    ]
};

const CATEGORIES = ["All", "AI & ML", "Physics", "Mathematics", "Chemistry", "Biology", "Digital Art"];
const TYPES = ["All", "Textbooks", "Videos", "Labs"];

const resources = [
    {
        title: "Chapter 5: Electromagnetism - Quick Revision",
        subject: "Physics",
        type: "Textbooks",
        difficulty: "Intermediate",
        description: "Read the full Achievers Book summary and practice Previous Year Questions for your upcoming board exams.",
        icon: <BookOpen className="h-6 w-6 text-blue-400" />,
        gradient: "from-blue-500/20 to-indigo-600/20",
        border: "hover:border-blue-500/50",
        action: "Read",
        progress: null,
        duration: "45 mins read",
        thumbnail: "https://images.unsplash.com/photo-1636466497217-26c8c25ea4b3?q=80&w=600&auto=format&fit=crop"
    },
    {
        title: "Calculus Fundamentals",
        subject: "Mathematics",
        type: "Textbooks",
        difficulty: "Beginner",
        description: "Master integration and differentiation basics with step-by-step interactive PDF guides.",
        icon: <Download className="h-6 w-6 text-amber-400" />,
        gradient: "from-amber-500/20 to-orange-600/20",
        border: "hover:border-amber-500/50",
        action: "Download",
        progress: 35,
        duration: "2 hours",
        thumbnail: "https://images.unsplash.com/photo-1635372722656-389f87a941b7?q=80&w=600&auto=format&fit=crop"
    },
    {
        title: "Organic Chemistry Reactions Map",
        subject: "Chemistry",
        type: "Labs",
        difficulty: "Advanced",
        description: "A complete visual guide and interactive virtual lab for discovering all named reactions.",
        icon: <FlaskConical className="h-6 w-6 text-emerald-400" />,
        gradient: "from-emerald-500/20 to-teal-600/20",
        border: "hover:border-emerald-500/50",
        action: "Start Lab",
        progress: null,
        duration: "1.5 hours",
        thumbnail: "https://images.unsplash.com/photo-1603126857599-f6e15782fd5d?q=80&w=600&auto=format&fit=crop"
    },
    {
        title: "Introduction to Neural Networks",
        subject: "AI & ML",
        type: "Videos",
        difficulty: "Advanced",
        description: "Deep dive into perceptrons, backpropagation, and activation functions in this fully animated lecture.",
        icon: <PlayCircle className="h-6 w-6 text-purple-400" />,
        gradient: "from-purple-500/20 to-fuchsia-600/20",
        border: "hover:border-purple-500/50",
        action: "Watch",
        progress: 78,
        duration: "56 mins",
        thumbnail: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=600&auto=format&fit=crop"
    },
    {
        title: "Quantum Mechanics Basics",
        subject: "Physics",
        type: "Videos",
        difficulty: "Advanced",
        description: "Understanding wave-particle duality and Schrödinger's equation through interactive visual proofs.",
        icon: <PlayCircle className="h-6 w-6 text-cyan-400" />,
        gradient: "from-cyan-500/20 to-blue-600/20",
        border: "hover:border-cyan-500/50",
        action: "Watch",
        progress: null,
        duration: "1h 20m",
        thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=600&auto=format&fit=crop"
    },
    {
        title: "Cell Division & Genetics",
        subject: "Biology",
        type: "Labs",
        difficulty: "Intermediate",
        description: "Interactive simulation of mitosis and meiosis processes. Manipulate parameters and observe the outcomes.",
        icon: <FlaskConical className="h-6 w-6 text-pink-400" />,
        gradient: "from-pink-500/20 to-rose-600/20",
        border: "hover:border-pink-500/50",
        action: "Start Lab",
        progress: 12,
        duration: "45 mins",
        thumbnail: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?q=80&w=600&auto=format&fit=crop"
    }
];

export default function ResourcesPage() {
    const [, setLocation] = useLocation();
    const [isBookOpen, setIsBookOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState("All");
    const [activeType, setActiveType] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredResources = resources.filter(res => {
        const matchesCategory = activeCategory === "All" || res.subject === activeCategory;
        const matchesType = activeType === "All" || res.type === activeType;
        const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            res.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesType && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-background pb-12">
            <PageHeader
                title="Resource Library"
                subtitle="Discover premium study materials, interactive labs, and curated lectures."
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Resources" },
                ]}
            >
                <Button variant="outline" onClick={() => setLocation("/")} className="bg-background/50 backdrop-blur-sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
            </PageHeader>

            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">

                {/* Search & Filter Section */}
                <div className="flex flex-col gap-6 mb-10">
                    <div className="relative group max-w-2xl mx-auto w-full">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-50"></div>
                        <div className="relative flex items-center bg-card/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                            <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
                            <Input
                                placeholder="Search 'Quantum Physics' or 'Calculus'..."
                                className="pl-12 py-6 border-0 bg-transparent text-lg focus-visible:ring-0 placeholder:text-muted-foreground/70"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <ScrollArea className="w-full whitespace-nowrap pb-4 md:pb-0 block">
                            <div className="flex space-x-2">
                                {CATEGORIES.map(category => (
                                    <Button
                                        key={category}
                                        variant={activeCategory === category ? "default" : "secondary"}
                                        className={`rounded-full px-5 transition-all ${activeCategory === category ? 'shadow-lg shadow-primary/25' : 'bg-secondary/50 hover:bg-secondary border border-transparent hover:border-white/10'}`}
                                        onClick={() => setActiveCategory(category)}
                                    >
                                        {category}
                                    </Button>
                                ))}
                            </div>
                            <ScrollBar orientation="horizontal" className="hidden" />
                        </ScrollArea>

                        <div className="flex gap-2 p-1 bg-secondary/30 backdrop-blur-sm rounded-xl border border-white/5 w-full md:w-auto overflow-x-auto shrink-0">
                            {TYPES.map(type => (
                                <button
                                    key={type}
                                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${activeType === type ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                    onClick={() => setActiveType(type)}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Personalized/Featured Section (Optional: just a header) */}
                <div className="mb-6 flex justify-between items-end">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Personalized for You</h2>
                        <p className="text-muted-foreground text-sm mt-1">Based on your recent learning activity</p>
                    </div>
                </div>

                {/* Resource Grid */}
                {filteredResources.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-card/30 rounded-3xl border border-white/5 backdrop-blur-sm">
                        <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <h3 className="text-xl font-semibold">No resources found</h3>
                        <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
                        <Button variant="outline" className="mt-4" onClick={() => { setSearchQuery(""); setActiveCategory("All"); setActiveType("All"); }}>
                            Clear Filters
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredResources.map((res, i) => (
                            <Card key={i} className={`group relative overflow-hidden bg-card/40 backdrop-blur-sm border-white/5 hover:bg-card/60 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl ${res.border} flex flex-col h-full rounded-2xl`}>
                                {/* Thumbnail Section */}
                                <div className="h-48 relative overflow-hidden bg-muted/20">
                                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 flex items-end to-transparent z-10" />
                                    {res.thumbnail && (
                                        <img
                                            src={res.thumbnail}
                                            alt={res.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out opacity-80 group-hover:opacity-100"
                                        />
                                    )}
                                    <div className="absolute top-4 right-4 z-20 flex gap-2">
                                        <Badge variant="secondary" className="bg-background/80 backdrop-blur-md border border-white/10">{res.difficulty}</Badge>
                                        <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-background/50 backdrop-blur-md opacity-0 group-hover:opacity-100 translate-y-[-10px] group-hover:translate-y-0 transition-all duration-300">
                                            <Bookmark className="h-4 w-4 text-foreground" />
                                        </Button>
                                    </div>
                                    <div className="absolute bottom-4 left-4 z-20 flex gap-2">
                                        <Badge variant="secondary" className="bg-background/60 backdrop-blur-md border border-white/10">{res.type}</Badge>
                                        <Badge variant="outline" className="bg-background/60 backdrop-blur-md border border-white/10 flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {res.duration}
                                        </Badge>
                                    </div>
                                </div>

                                <CardContent className="p-6 flex flex-col h-full flex-grow relative z-20">
                                    <div className="flex items-start justify-between mb-3 gap-4">
                                        <h3 className="font-bold text-xl leading-tight line-clamp-2">{res.title}</h3>
                                        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${res.gradient} shadow-sm shrink-0 border border-white/5 group-hover:scale-110 transition-transform duration-300`}>
                                            {res.icon}
                                        </div>
                                    </div>

                                    <p className="text-sm text-muted-foreground mb-6 flex-grow line-clamp-3">{res.description}</p>

                                    {res.progress !== null && (
                                        <div className="mb-5">
                                            <div className="flex justify-between text-xs mb-1.5 font-medium">
                                                <span className="text-muted-foreground">Progress</span>
                                                <span className="text-primary">{res.progress}%</span>
                                            </div>
                                            <Progress value={res.progress} className="h-1.5" />
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{res.subject}</span>
                                        <Button
                                            className="group/btn relative overflow-hidden rounded-full px-6"
                                            variant={res.action === "Read" || res.action === "Start Lab" ? "default" : "secondary"}
                                            onClick={() => res.action === "Read" ? setIsBookOpen(true) : undefined}
                                        >
                                            <span className="relative z-10 font-semibold">{res.progress !== null ? "Continue" : res.action}</span>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <AchieversBookPanel
                summary={mockAchieversData.summary}
                pyqs={mockAchieversData.pyqs}
                isOpen={isBookOpen}
                onChange={setIsBookOpen}
            />

            {/* Overlay for mobile when book is open */}
            {isBookOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-[50]"
                    onClick={() => setIsBookOpen(false)}
                />
            )}
        </div>
    );
}
