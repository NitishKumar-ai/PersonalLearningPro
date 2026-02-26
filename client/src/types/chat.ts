export type UserRole = 'student' | 'teacher' | 'parent';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';
export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'doc' | 'announcement' | 'assignment' | 'doubt' | 'system';
export type ConversationCategory = 'announcement' | 'class' | 'teacher' | 'friend' | 'parent';

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    senderRole: UserRole;
    type: MessageType;
    content: string;
    mediaId?: string;
    mediaUrl?: string;
    status: MessageStatus;
    timestamp: Date;
    deliveredTo: string[];
    readBy: string[];
    isPinned?: boolean;
    isDoubtAnswered?: boolean;
    assignmentData?: {
        title: string;
        dueDate: Date;
        fileUrl?: string;
        subject: string;
    };
    replyTo?: string;
    mentions?: string[];
}

export interface User {
    id: string;
    name: string;
    role: UserRole;
    avatar?: string;
    isOnline: boolean;
    lastSeen?: Date;
    subject?: string;
}

export interface Conversation {
    id: string;
    name?: string;
    category: ConversationCategory;
    isGroup: boolean;
    isReadOnly?: boolean;
    participants: User[];
    lastMessage?: Message;
    unreadCount: number;
    typing?: string[];
    pinnedMessages?: string[];
    subject?: string;
    icon?: string;
}
