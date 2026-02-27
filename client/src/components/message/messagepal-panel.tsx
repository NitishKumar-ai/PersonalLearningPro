import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  MessageCircle, 
  Send, 
  Users, 
  Search, 
  MoreVertical,
  Check,
  CheckCheck,
  Paperclip,
  Smile
} from "lucide-react";
import { useMessagePalWebSocket } from "./use-messagepal-ws";

interface User {
  id: number;
  name: string;
  role: string;
  avatar?: string;
}

interface ConversationPreview {
  id: string;
  participants: User[];
  lastMessage?: {
    content: string;
    timestamp: string;
    senderName: string;
  };
  unreadCount: number;
}

interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: {
    id: string;
    content: string;
    timestamp: string;
    senderName: string;
    senderId: number;
  };
  unreadCount: number;
}

export function MessageSidebar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const {
    conversations,
    activeConversation,
    setActiveConversation,
    subscribeToConversation,
    unsubscribeFromConversation
  } = useMessagePalWebSocket();

  const filteredConversations = conversations.filter(conv => {
    if (!searchTerm) return true;
    return conv.participants.some(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleConversationClick = (conversationId: string) => {
    if (activeConversation === conversationId) {
      unsubscribeFromConversation(conversationId);
      setSelectedConversation(null);
    } else {
      if (activeConversation) {
        unsubscribeFromConversation(activeConversation);
      }
      subscribeToConversation(conversationId);
      setSelectedConversation(conversationId);
    }
  };

  return (
    <div className="flex flex-col h-full border-r bg-background">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Messages
          </h2>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No conversations yet</p>
              <p className="text-sm">Start a conversation with someone</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              const otherParticipant = conversation.participants.find(p => p.id !== 1); // TODO: Get current user ID
              const isActive = activeConversation === conversation.id;
              
              return (
                <button
                  key={conversation.id}
                  onClick={() => handleConversationClick(conversation.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-primary/10 border border-primary/20' 
                      : 'hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={otherParticipant?.avatar} />
                      <AvatarFallback>
                        {otherParticipant?.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium truncate">
                          {otherParticipant?.name}
                        </h3>
                        {conversation.unreadCount > 0 && (
                          <Badge variant="default" className="h-5 px-2">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {conversation.lastMessage 
                          ? `${conversation.lastMessage.senderName}: ${conversation.lastMessage.content}`
                          : 'No messages yet'}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export function MessageChatWindow() {
  const [message, setMessage] = useState('');
  const {
    messages,
    activeConversation,
    sendMessage,
    sendTyping,
    markMessageAsRead
  } = useMessagePalWebSocket();

  const handleSend = () => {
    if (!message.trim() || !activeConversation) return;
    
    // TODO: Get recipient ID from active conversation
    const recipientId = 2; // Placeholder
    
    if (sendMessage(recipientId, message.trim())) {
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Mark messages as read when chat window is active
  useEffect(() => {
    if (activeConversation) {
      messages.forEach(msg => {
        if (!msg.isRead && msg.recipientId === 1) { // TODO: Current user ID
          markMessageAsRead(msg.id);
        }
      });
    }
  }, [activeConversation, messages, markMessageAsRead]);

  if (!activeConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background">
        <MessageCircle className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">No conversation selected</h3>
        <p className="text-muted-foreground">
          Select a conversation from the sidebar to start chatting
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Chat Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">John Doe</h3>
            <p className="text-sm text-muted-foreground">Online</p>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.senderId === 1 ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  msg.senderId === 1
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {msg.senderId !== 1 && (
                  <p className="text-xs font-medium mb-1">{msg.senderName}</p>
                )}
                <p className="text-sm">{msg.content}</p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className="text-xs opacity-70">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {msg.senderId === 1 && (
                    msg.isRead ? (
                      <CheckCheck className="h-3 w-3" />
                    ) : (
                      <Check className="h-3 w-3" />
                    )
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t">
        <div className="flex items-end gap-2">
          <Button variant="ghost" size="icon">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Smile className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full"
            />
          </div>
          <Button 
            onClick={handleSend}
            disabled={!message.trim()}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function MessagePanel() {
  return (
    <div className="flex h-full bg-background">
      <div className="w-80 flex-shrink-0">
        <MessageSidebar />
      </div>
      <Separator orientation="vertical" />
      <MessageChatWindow />
    </div>
  );
}