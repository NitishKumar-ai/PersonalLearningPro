import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useFirebaseAuth } from "@/contexts/firebase-auth-context";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Brain, 
  BookOpen, 
  Search, 
  MessageSquare, 
  Image, 
  Sparkles, 
  Calculator, 
  Clock, 
  Send,
  Plus,
  ChevronRight,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

// Define the types for the chat
interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  lastActive: Date;
  messages: Message[];
}

const HISTORY_KEY = "ai_tutor_history";
const SYSTEM_PROMPT = "You are an AI tutor for high school students. You're knowledgeable about physics, chemistry, mathematics, biology, and computer science. Provide clear, concise explanations. Include examples when helpful. For math problems, show step-by-step solutions. Keep explanations appropriate for high school level understanding. Be encouraging and supportive.";

export default function AiTutor() {
  const { currentUser } = useFirebaseAuth();
  const [activeTab, setActiveTab] = useState("chat");
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed.map(conv => ({
          ...conv,
          lastActive: new Date(conv.lastActive),
          messages: conv.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        })) : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(() => {
    return conversations.length > 0 ? conversations[0] : null;
  });

  // Save conversations to localStorage whenever they change
  const saveConversations = (convs: Conversation[]) => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(convs));
    setConversations(convs);
  };

  const createNewConversation = () => {
    const newConv: Conversation = {
      id: `conv_${Date.now()}`,
      title: "New Conversation",
      lastActive: new Date(),
      messages: [{
        id: `msg_${Date.now()}`,
        role: "system",
        content: SYSTEM_PROMPT,
        timestamp: new Date()
      }]
    };
    
    const newConvs = [newConv, ...conversations];
    saveConversations(newConvs);
    setActiveConversation(newConv);
  };

  const updateActiveConversation = (updatedConv: Conversation) => {
    const updatedConvs = conversations.map(c => 
      c.id === updatedConv.id ? updatedConv : c
    );
    saveConversations(updatedConvs);
    setActiveConversation(updatedConv);
  };

  const sendMessage = async () => {
    if (!userInput.trim() || isLoading || !activeConversation) return;
    
    setIsLoading(true);
    
    // Create a new user message
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: "user",
      content: userInput,
      timestamp: new Date()
    };
    
    // Update the conversation with the new user message
    const updatedMessages = [...activeConversation.messages, userMessage];
    const updatedConv = {
      ...activeConversation,
      messages: updatedMessages,
      lastActive: new Date()
    };
    
    updateActiveConversation(updatedConv);
    setUserInput("");
    
    try {
      // Prepare the messages for the API request (excluding system prompts from display)
      const apiMessages = updatedMessages.map(m => ({
        role: m.role,
        content: m.content
      }));
      
      // Make the API request to the backend
      const response = await apiRequest("POST", "/api/ai-chat", { 
        messages: apiMessages 
      });
      
      const responseData = await response.json();
      
      // Create the assistant's response message
      const assistantMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        role: "assistant",
        content: responseData?.content || "I'm sorry, I couldn't generate a response.",
        timestamp: new Date()
      };
      
      // Update the conversation with the assistant's response
      const finalMessages = [...updatedMessages, assistantMessage];
      const finalConv = {
        ...updatedConv,
        messages: finalMessages,
        title: updatedConv.title === "New Conversation" && finalMessages.length >= 3 
          ? userMessage.content.slice(0, 30) + (userMessage.content.length > 30 ? "..." : "")
          : updatedConv.title
      };
      
      updateActiveConversation(finalConv);
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Add an error message from the assistant
      const errorMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        role: "assistant",
        content: "I'm sorry, I encountered an error. Please try again later.",
        timestamp: new Date()
      };
      
      const finalMessages = [...updatedMessages, errorMessage];
      const finalConv = { ...updatedConv, messages: finalMessages };
      updateActiveConversation(finalConv);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Filter out system messages for display
  const displayMessages = activeConversation?.messages.filter(m => m.role !== "system") || [];

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-100 dark:bg-neutral-900">
      <Sidebar />

      <div className="flex-1 overflow-hidden">
        <Header title="AI Tutor" />

        <div className="h-[calc(100vh-64px)] flex flex-col md:flex-row">
          {/* Sidebar with conversation history */}
          <div className="w-full md:w-64 lg:w-80 bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
              <Button 
                className="w-full justify-start font-normal gap-2" 
                onClick={createNewConversation}
              >
                <Plus className="h-4 w-4" />
                New Conversation
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2">
              {conversations.length === 0 ? (
                <div className="text-center text-muted-foreground py-6 px-4">
                  <p className="text-sm">No conversations yet</p>
                  <p className="text-xs mt-1">Start a new conversation to get help with your studies</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {conversations.map(conv => (
                    <div 
                      key={conv.id}
                      className={cn(
                        "p-2 rounded-md cursor-pointer flex items-center justify-between",
                        activeConversation?.id === conv.id 
                          ? "bg-primary/10 dark:bg-primary/20" 
                          : "hover:bg-neutral-100 dark:hover:bg-neutral-700/50"
                      )}
                      onClick={() => setActiveConversation(conv)}
                    >
                      <div className="truncate flex-1">
                        <div className="font-medium text-sm truncate">
                          {conv.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(conv.lastActive).toLocaleDateString()}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main chat area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <Tabs defaultValue="chat" className="h-full flex flex-col">
              <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
                <TabsList className="w-full md:w-auto grid grid-cols-4 md:inline-flex">
                  <TabsTrigger value="chat" onClick={() => setActiveTab("chat")}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chat
                  </TabsTrigger>
                  <TabsTrigger value="explain" onClick={() => setActiveTab("explain")}>
                    <BookOpen className="h-4 w-4 mr-2" />
                    Explain
                  </TabsTrigger>
                  <TabsTrigger value="solve" onClick={() => setActiveTab("solve")}>
                    <Calculator className="h-4 w-4 mr-2" />
                    Solve
                  </TabsTrigger>
                  <TabsTrigger value="visualize" onClick={() => setActiveTab("visualize")}>
                    <Image className="h-4 w-4 mr-2" />
                    Visualize
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent 
                value="chat" 
                className="flex-1 flex flex-col overflow-hidden p-4 md:p-6 space-y-4"
              >
                {!activeConversation ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4">
                      <Brain className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">
                      Welcome to your AI Tutor
                    </h3>
                    <p className="text-muted-foreground text-sm max-w-md mb-4">
                      Get help with homework, ask questions about difficult concepts, or prepare for tests with personalized explanations.
                    </p>
                    <Button onClick={createNewConversation}>
                      Start a new conversation
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 overflow-y-auto space-y-4 pb-4">
                      {displayMessages.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">
                            Start chatting with your AI tutor
                          </p>
                        </div>
                      ) : (
                        displayMessages.map(message => (
                          <div 
                            key={message.id}
                            className={cn(
                              "flex items-start gap-3 p-4 rounded-lg max-w-3xl",
                              message.role === "user" 
                                ? "ml-auto bg-primary text-primary-foreground" 
                                : "bg-muted"
                            )}
                          >
                            <div 
                              className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                                message.role === "user" 
                                  ? "bg-primary-foreground/20" 
                                  : "bg-primary/20"
                              )}
                            >
                              {message.role === "user" ? (
                                <div className="text-xs font-medium text-primary-foreground">
                                  {currentUser?.profile?.displayName ? getInitials(currentUser.profile.displayName) : "U"}
                                </div>
                              ) : (
                                <Brain className="h-4 w-4 text-primary" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className={cn(
                                "text-sm whitespace-pre-wrap",
                                message.role === "user" ? "text-primary-foreground" : ""
                              )}>
                                {message.content}
                              </p>
                              <div className={cn(
                                "text-xs mt-1",
                                message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                              )}>
                                {formatTime(message.timestamp)}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                      {isLoading && (
                        <div className="flex items-start gap-3 p-4 rounded-lg bg-muted max-w-3xl">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <Brain className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">Thinking...</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="relative">
                      <Textarea
                        placeholder="Ask your question..."
                        className="min-h-[100px] resize-none pr-12"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                      />
                      <Button
                        size="icon"
                        className="absolute bottom-3 right-3"
                        onClick={sendMessage}
                        disabled={isLoading || !userInput.trim()}
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                        <span className="sr-only">Send</span>
                      </Button>
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent 
                value="explain" 
                className="flex-1 flex flex-col overflow-hidden p-4"
              >
                <Card className="w-full h-full flex flex-col">
                  <CardHeader>
                    <CardTitle>Explain Concepts</CardTitle>
                    <CardDescription>
                      Get clear explanations for difficult academic concepts
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="h-full flex flex-col">
                      <div className="flex gap-2 mb-4">
                        <div className="flex-1">
                          <Input 
                            placeholder="Enter the concept you want explained..." 
                            className="w-full"
                          />
                        </div>
                        <Button>
                          <Search className="h-4 w-4 mr-2" />
                          Explain
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <Card>
                          <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-base">Popular in Physics</CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <ul className="space-y-1">
                              <li className="text-sm hover:text-primary cursor-pointer">Quantum Mechanics</li>
                              <li className="text-sm hover:text-primary cursor-pointer">Special Relativity</li>
                              <li className="text-sm hover:text-primary cursor-pointer">Electromagnetic Induction</li>
                            </ul>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-base">Popular in Chemistry</CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <ul className="space-y-1">
                              <li className="text-sm hover:text-primary cursor-pointer">Chemical Bonding</li>
                              <li className="text-sm hover:text-primary cursor-pointer">Periodic Table Trends</li>
                              <li className="text-sm hover:text-primary cursor-pointer">Acid-Base Reactions</li>
                            </ul>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <div className="bg-muted rounded-md p-4 flex-1">
                        <div className="text-center h-full flex flex-col items-center justify-center">
                          <BookOpen className="h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-muted-foreground">
                            Enter a concept above to get a detailed explanation
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent 
                value="solve" 
                className="flex-1 flex flex-col overflow-hidden p-4"
              >
                <Card className="w-full h-full flex flex-col">
                  <CardHeader>
                    <CardTitle>Solve Problems</CardTitle>
                    <CardDescription>
                      Get step-by-step solutions for math and science problems
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="h-full flex flex-col">
                      <Textarea 
                        placeholder="Enter your math or science problem here..."
                        className="min-h-[120px] mb-4"
                      />
                      
                      <div className="flex gap-2 mb-4">
                        <Button className="flex-1">
                          <Calculator className="h-4 w-4 mr-2" />
                          Solve Step-by-Step
                        </Button>
                        <Button variant="outline">
                          <Image className="h-4 w-4 mr-2" />
                          Upload Image
                        </Button>
                      </div>
                      
                      <div className="bg-muted rounded-md p-4 flex-1">
                        <div className="text-center h-full flex flex-col items-center justify-center">
                          <Calculator className="h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-muted-foreground">
                            Enter a problem above to get a step-by-step solution
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent 
                value="visualize" 
                className="flex-1 flex flex-col overflow-hidden p-4"
              >
                <Card className="w-full h-full flex flex-col">
                  <CardHeader>
                    <CardTitle>Visualize Concepts</CardTitle>
                    <CardDescription>
                      Generate visual explanations for complex topics
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="h-full flex flex-col">
                      <div className="flex gap-2 mb-4">
                        <div className="flex-1">
                          <Input 
                            placeholder="What would you like to visualize?" 
                            className="w-full"
                          />
                        </div>
                        <Button>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="p-2 border rounded-md cursor-pointer hover:border-primary/50 hover:bg-primary/5">
                          <p className="text-xs font-medium mb-1">Diagram</p>
                          <p className="text-xs text-muted-foreground">For processes and structures</p>
                        </div>
                        <div className="p-2 border rounded-md cursor-pointer hover:border-primary/50 hover:bg-primary/5">
                          <p className="text-xs font-medium mb-1">Chart/Graph</p>
                          <p className="text-xs text-muted-foreground">For data relationships</p>
                        </div>
                        <div className="p-2 border rounded-md cursor-pointer hover:border-primary/50 hover:bg-primary/5">
                          <p className="text-xs font-medium mb-1">Illustration</p>
                          <p className="text-xs text-muted-foreground">For concepts and ideas</p>
                        </div>
                      </div>
                      
                      <div className="bg-muted rounded-md p-4 flex-1">
                        <div className="text-center h-full flex flex-col items-center justify-center">
                          <Image className="h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-muted-foreground">
                            Enter a concept above to visualize it
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <MobileNav />
      </div>
    </div>
  );
}

// Utility function to get initials from name
function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

// Format timestamp in a readable format
function formatTime(date: Date) {
  return new Date(date).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}