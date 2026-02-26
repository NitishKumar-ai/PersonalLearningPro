import { useEffect, useRef, useState } from 'react';
import { Conversation, Message } from '@/types/chat';
import { mockMessages, users as allUsers } from '@/data/mockData';
import { useRole } from '@/contexts/chat-role-context';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import ChatHeader from './ChatHeader';
import { format, isToday, isYesterday } from 'date-fns';

interface ChatThreadProps {
  conversation: Conversation;
  onBack?: () => void;
}

function getDayLabel(date: Date) {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMMM d, yyyy');
}

const ChatThread = ({ conversation, onBack }: ChatThreadProps) => {
  const { currentUser } = useRole();
  const [messages, setMessages] = useState<Message[]>(mockMessages[conversation.id] || []);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(mockMessages[conversation.id] || []);
  }, [conversation.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = (content: string, type?: 'text' | 'doubt') => {
    const newMsg: Message = {
      id: crypto.randomUUID(),
      conversationId: conversation.id,
      senderId: currentUser.id,
      senderRole: currentUser.role,
      type: type || 'text',
      content,
      status: 'sending',
      timestamp: new Date(),
      deliveredTo: [],
      readBy: [],
      isDoubtAnswered: type === 'doubt' ? false : undefined,
    };
    setMessages((prev) => [...prev, newMsg]);

    // Simulate status progression
    setTimeout(() => {
      setMessages((prev) => prev.map((m) => (m.id === newMsg.id ? { ...m, status: 'sent' as const } : m)));
    }, 400);
    setTimeout(() => {
      setMessages((prev) => prev.map((m) => (m.id === newMsg.id ? { ...m, status: 'delivered' as const } : m)));
    }, 1200);
    setTimeout(() => {
      setMessages((prev) => prev.map((m) => (m.id === newMsg.id ? { ...m, status: 'read' as const } : m)));
    }, 3000);
  };

  // Build a name map for sender lookup
  const nameMap: Record<string, string> = {};
  conversation.participants.forEach((p) => { nameMap[p.id] = p.name; });
  nameMap[currentUser.id] = currentUser.name;
  // Also pull from allUsers
  Object.values(allUsers).forEach((u) => { nameMap[u.id] = u.name; });

  // Group messages by day
  let lastDay = '';

  // Find reply content
  const msgById: Record<string, Message> = {};
  messages.forEach((m) => { msgById[m.id] = m; });

  // Typing user name
  const typingUserName = conversation.typing?.[0] ? allUsers[conversation.typing[0]]?.name : undefined;

  // Is read-only for current user?
  const isReadOnly = conversation.isReadOnly && currentUser.role !== 'teacher';

  return (
    <div className="flex flex-col h-full">
      <ChatHeader conversation={conversation} onBack={onBack} />

      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin py-3">
        <div className="flex flex-col gap-0.5">
          {messages.map((msg, i) => {
            const isOwn = msg.senderId === currentUser.id;
            const showSender =
              conversation.isGroup &&
              !isOwn &&
              msg.type !== 'announcement' &&
              msg.type !== 'assignment' &&
              (i === 0 || messages[i - 1].senderId !== msg.senderId);

            // Day separator
            const dayLabel = getDayLabel(msg.timestamp);
            let showDaySep = false;
            if (dayLabel !== lastDay) {
              lastDay = dayLabel;
              showDaySep = true;
            }

            const replyContent = msg.replyTo ? msgById[msg.replyTo]?.content?.slice(0, 60) : undefined;

            return (
              <div key={msg.id}>
                {showDaySep && (
                  <div className="flex justify-center my-3">
                    <span className="text-[11px] text-muted-foreground bg-muted px-3 py-1 rounded-full">
                      {dayLabel}
                    </span>
                  </div>
                )}
                <MessageBubble
                  message={msg}
                  isOwn={isOwn}
                  showSender={showSender}
                  senderName={nameMap[msg.senderId] || 'Unknown'}
                  replyContent={replyContent}
                />
              </div>
            );
          })}
          {conversation.typing && conversation.typing.length > 0 && (
            <TypingIndicator name={typingUserName} />
          )}
        </div>
      </div>

      <MessageInput onSend={handleSend} isReadOnly={isReadOnly} />
    </div>
  );
};

export default ChatThread;
