import { useState, useMemo } from 'react';
import { Conversation } from '@/types/chat';
import { getConversationsForRole } from '@/data/mockData';
import { useRole, ChatRoleProvider } from '@/contexts/chat-role-context';
import ConversationList from './ConversationList';
import ChatThread from './ChatThread';
import { MessageSquare } from 'lucide-react';

const ChatLayoutInner = () => {
  const { currentRole } = useRole();
  const conversations = useMemo(() => getConversationsForRole(currentRole), [currentRole]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(conversations[0] || null);
  const [showList, setShowList] = useState(true);

  // Reset active conversation when role changes
  const [prevRole, setPrevRole] = useState(currentRole);
  if (prevRole !== currentRole) {
    setPrevRole(currentRole);
    setActiveConv(conversations[0] || null);
    setShowList(true);
  }

  const handleSelect = (conv: Conversation) => {
    setActiveConv(conv);
    setShowList(false);
  };

  const handleBack = () => {
    setShowList(true);
  };

  return (
    <div className="flex flex-1 overflow-hidden h-full">
      {/* Conversation sidebar */}
      <div
        className={`${showList ? 'flex' : 'hidden'
          } md:flex w-full md:w-[320px] lg:w-[360px] flex-shrink-0 border-r border-border bg-sidebar`}
      >
        <div className="w-full">
          <ConversationList
            conversations={conversations}
            activeId={activeConv?.id}
            onSelect={handleSelect}
          />
        </div>
      </div>

      {/* Chat area */}
      <div className={`${!showList ? 'flex' : 'hidden'} md:flex flex-1 flex-col min-w-0`}>
        {activeConv ? (
          <ChatThread conversation={activeConv} onBack={handleBack} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm mt-1">
                {currentRole === 'student'
                  ? 'Choose from your classes, teachers, or friends'
                  : currentRole === 'teacher'
                    ? 'Choose from your classes, students, or parents'
                    : 'Choose from your teachers or announcements'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ChatLayout = () => (
  <ChatRoleProvider>
    <ChatLayoutInner />
  </ChatRoleProvider>
);

export default ChatLayout;
