import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons as Icon, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { chatService } from '../../services/chatService';
import SearchUsers from '../components/TinNhan/timkiem';

// Lấy User ID từ AsyncStorage
const getUserId = async (): Promise<string> => {
  try {
    const userInfo = await AsyncStorage.getItem('userInfo');
    if (userInfo) {
      const user = JSON.parse(userInfo);
      return user.ID_NguoiDung || '';
    }
    return '';
  } catch {
    return '';
  }
};

// Interface cho dữ liệu chat
interface ChatItemData {
  conversation_id: string;
  conversation_type: string;
  conversation_name: string;
  conversation_avatar: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

interface ChatItemProps {
  item: ChatItemData;
  onPress: () => void;
}

const ChatItem = ({ item, onPress }: ChatItemProps) => (
  <TouchableOpacity style={styles.chatItemContainer} onPress={onPress}>
    <Image
      source={{ uri: item.conversation_avatar || 'https://i.pravatar.cc/150?img=1' }}
      style={styles.avatar}
    />
    <View style={styles.middleContainer}>
      <Text style={styles.name}>{item.conversation_name || 'Unknown'}</Text>
      <Text style={styles.lastMessage} numberOfLines={1}>
        {item.last_message || ''}
      </Text>
    </View>
    <View style={styles.rightContainer}>
      <Text style={styles.timestamp}>
        {item.last_message_time
          ? new Date(item.last_message_time).toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })
          : ''}
      </Text>
      {(item.unread_count || 0) > 0 ? (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{item.unread_count}</Text>
        </View>
      ) : null}
    </View>
  </TouchableOpacity>
);

const ChatListScreen = () => {
  const [activeTab, setActiveTab] = useState('All Chats');
  const [chatsData, setChatsData] = useState<ChatItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const TABS = ['All Chats', 'Groups', 'Contacts'];

  const handleChatPress = (item: ChatItemData) => {
    router.push({
      pathname: '/components/TinNhan/chitiettinnhan',
      params: {
        userId: item.conversation_id,
        userName: item.conversation_name,
        userAvatar: item.conversation_avatar,
        hasExistingConversation: 'true',
      },
    });
  };

  // Load dữ liệu từ API
  const loadConversations = async () => {
    try {
      setLoading(true);
      const userId = await getUserId();
      if (!userId) {
        setChatsData([]);
        setLoading(false);
        return;
      }

      const response = await chatService.getConversations(userId);

      if (response.success && response.data && response.data.length > 0) {
        setChatsData(response.data);
      } else {
        setChatsData([]);
      }
    } catch {
      setChatsData([
        {
          conversation_id: 'demo-1',
          conversation_type: 'private',
          conversation_name: 'Bà Lâm Dương',
          conversation_avatar: 'https://i.pravatar.cc/150?img=11',
          last_message: 'Xin chào, bạn khỏe không?',
          last_message_time: '2025-01-07T07:24:32.000Z',
          unread_count: 1,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Load dữ liệu khi component mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Refresh danh sách khi quay lại từ chat
  useFocusEffect(
    React.useCallback(() => {
      loadConversations();
    }, []),
  );

  // Lọc dữ liệu theo tab
  const getFilteredChats = () => {
    return chatsData;
  };

  // Render empty state
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="chatbubbles-outline" size={64} color="#ccc" />
      <Text style={styles.emptyText}>Bắt đầu trò chuyện</Text>
      <Text style={styles.emptySubText}>Nhắn tin với bạn bè ngay bây giờ!</Text>
    </View>
  );

  // Hiển thị màn hình tìm kiếm
  if (showSearch) {
    return <SearchUsers onClose={() => setShowSearch(false)} />;
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#fffcef" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Hello,</Text>
              <Text style={styles.userName}>Johan</Text>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.iconButton} onPress={() => setShowSearch(true)}>
                <Icon name="search" size={20} color="#333" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Icon name="ellipsis-horizontal" size={20} color="#333" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            {TABS.map((tabName) => {
              const isActive = activeTab === tabName;
              return (
                <TouchableOpacity
                  key={tabName}
                  style={[
                    styles.tabButton,
                    isActive ? styles.tabButtonActive : styles.tabButtonInactive,
                  ]}
                  onPress={() => setActiveTab(tabName)}
                >
                  <Text
                    style={[
                      styles.tabText,
                      isActive ? styles.tabTextActive : styles.tabTextInactive,
                    ]}
                  >
                    {tabName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Danh sách Chat */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={PRIMARY_COLOR} />
              <Text style={styles.loadingText}>Đang tải danh sách chat...</Text>
            </View>
          ) : (
            <FlatList
              style={{ flex: 1 }}
              data={getFilteredChats()}
              renderItem={({ item }) => (
                <ChatItem item={item} onPress={() => handleChatPress(item)} />
              )}
              keyExtractor={(item) => item.conversation_id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingBottom: 100,
                flexGrow: getFilteredChats().length === 0 ? 1 : 0,
              }}
              ListEmptyComponent={renderEmpty}
            />
          )}

          {/* FAB */}
          <TouchableOpacity style={styles.fab} onPress={loadConversations}>
            <MaterialCommunityIcons name="sync" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
};

const PRIMARY_COLOR = '#7f001f';
const LIGHT_GRAY = '#f0f0f0';
const BACKGROUND_GRAY = '#fffcef';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND_GRAY,
  },
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_GRAY,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingTop: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 16,
    color: '#888',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: LIGHT_GRAY,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    backgroundColor: LIGHT_GRAY,
    borderRadius: 30,
    marginHorizontal: 20,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: PRIMARY_COLOR,
  },
  tabButtonInactive: {
    backgroundColor: 'transparent',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
  },
  tabTextInactive: {
    color: '#888',
  },
  chatItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    marginRight: 15,
  },
  middleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#888',
  },
  rightContainer: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    paddingLeft: 10,
  },
  timestamp: {
    fontSize: 12,
    color: '#aaa',
    marginBottom: 8,
  },
  unreadBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
});

export default ChatListScreen;
