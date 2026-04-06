import { View, Text, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TasksScreen() {
  const tasks = [
    { id: 1, title: 'Complete Math Assignment', status: 'pending', dueDate: '2026-04-10' },
    { id: 2, title: 'Read Chapter 5', status: 'in_progress', dueDate: '2026-04-08' },
    { id: 3, title: 'Science Project', status: 'completed', dueDate: '2026-04-05' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return 'checkmark-circle';
      case 'in_progress':
        return 'time';
      default:
        return 'ellipse-outline';
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6">
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-900">My Tasks</Text>
          <Text className="text-gray-600 mt-1">
            {tasks.filter(t => t.status !== 'completed').length} tasks remaining
          </Text>
        </View>

        <View className="space-y-3">
          {tasks.map((task) => (
            <Pressable
              key={task.id}
              className="bg-white rounded-lg p-4 shadow-sm"
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-1">
                  <Text className="text-gray-900 font-medium text-base mb-2">
                    {task.title}
                  </Text>
                  <View className="flex-row items-center">
                    <Ionicons name="calendar-outline" size={14} color="#9CA3AF" />
                    <Text className="text-gray-500 text-sm ml-1">
                      Due: {task.dueDate}
                    </Text>
                  </View>
                </View>
                <View className="ml-3">
                  <Ionicons
                    name={getStatusIcon(task.status) as any}
                    size={24}
                    color={task.status === 'completed' ? '#10B981' : '#3B82F6'}
                  />
                </View>
              </View>
              <View className="mt-3">
                <View className={`px-3 py-1 rounded-full self-start ${getStatusColor(task.status)}`}>
                  <Text className="text-xs font-medium capitalize">
                    {task.status.replace('_', ' ')}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        <Pressable className="bg-primary-600 rounded-lg py-4 mt-6">
          <Text className="text-white text-center font-semibold">
            Add New Task
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
