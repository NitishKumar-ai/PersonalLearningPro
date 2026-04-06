import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

export default function MessagesScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const conversations = [
    {
      id: 1,
      name: 'AI Tutor',
      lastMessage: 'How can I help you today?',
      time: '10:30 AM',
      unread: 2,
      avatar: '🤖',
    },
    {
      id: 2,
      name: 'Mr. Smith',
      lastMessage: 'Great work on your assignment!',
      time: 'Yesterday',
      unread: 0,
      avatar: '👨‍🏫',
    },
    {
      id: 3,
      name: 'Study Group',
      lastMessage: 'Meeting at 3 PM today',
      time: '2 days ago',
      unread: 5,
      avatar: '👥',
    },
  ];

  return (
    <View className="flex-1 bg-gray-50">
      {/* Search Bar */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-2 text-gray-900"
            placeholder="Search messages..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Conversations List */}
      <ScrollView className="flex-1">
        {conversations.map((conversation) => (
          <Pressable
            key={conversation.id}
            className="bg-white border-b border-gray-200 px-4 py-4"
          >
            <View className="flex-row items-center">
              {/* Avatar */}
              <View className="w-12 h-12 rounded-full bg-gray-200 items-center justify-center mr-3">
                <Text className="text-2xl">{conversation.avatar}</Text>
              </View>

              {/* Content */}
              <View className="flex-1">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-gray-900 font-semibold text-base">
                    {conversation.name}
                  </Text>
                  <Text className="text-gray-500 text-xs">
                    {conversation.time}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text
                    className="text-gray-600 text-sm flex-1"
                    numberOfLines={1}
                  >
                    {conversation.lastMessage}
                  </Text>
                  {conversation.unread > 0 && (
                    <View className="bg-primary-600 rounded-full w-5 h-5 items-center justify-center ml-2">
                      <Text className="text-white text-xs font-bold">
                        {conversation.unread}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {/* New Message Button */}
      <Pressable className="absolute bottom-6 right-6 bg-primary-600 rounded-full w-14 h-14 items-center justify-center shadow-lg">
        <Ionicons name="create" size={24} color="white" />
      </Pressable>
    </View>
  );
}
