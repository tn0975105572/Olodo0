import React, { useState, useEffect, useCallback } from 'react';
import { router } from 'expo-router';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ImageBackground,
  Share,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import Toast from 'react-native-toast-message';
import { io } from 'socket.io-client';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl as string;
const API_URLS = {
  RECOMMENDATIONS: `${API_BASE_URL}/api/recommendations/`,
  GET_POST_BY_ID: `${API_BASE_URL}/api/baidang/getById/`,
  GET_POST_IMAGE_BY_ID: `${API_BASE_URL}/api/baidang_anh/getById/`,
  GET_USER_INFO: `${API_BASE_URL}/api/nguoidung/get/`,
  LIKE_BY_POST: `${API_BASE_URL}/api/likebaidang/getByPostId/`,
  COMMENT_BY_POST: `${API_BASE_URL}/api/binhluanbaidang/getCommentTreeByPost/`,
  LIKE_CREATE: `${API_BASE_URL}/api/likebaidang/create`,
  LIKE_DELETE: `${API_BASE_URL}/api/likebaidang/delete/`,
};

const COLORS = {
  primary: '#7f001f',
  background: '#fffcef',
  white: '#FFFFFF',
  text: '#222222',
  textSecondary: '#777777',
  border: '#EEEEEE',
  lightGray: '#F5F5F5',
};

interface Recommendation {
  ID_BaiDang: string;
  Score: number;
  isFriendPost: boolean;
  hasLiked: boolean;
  hasCommented: boolean;
}

interface PostDetail {
  ID_BaiDang: string;
  ID_NguoiDung: string;
  tieu_de: string;
  mo_ta: string;
  gia: string;
  vi_tri: string;
  thoi_gian_tao: string;
}

interface PostImage {
  ID_BaiDang: string;
  LinkAnh: string;
  ID: string;
}

interface UserProfile {
  ID_NguoiDung: string | number;
  ho_ten?: string;
  anh_dai_dien?: string;
  email?: string;
}

interface Like {
  ID_Like: string;
  ID_NguoiDung: string;
  ID_BaiDang: string;
}

interface HydratedPost {
  type: 'post';
  ID_BaiDang: string;
  ID_NguoiDung: string;
  authorName: string;
  authorAvatar: string;
  title: string;
  description: string;
  price: string;
  location: string;
  time: string;
  imageUrls: string[];
  liked: boolean;
  likeCount: number;
  commentCount: number;
  userLikeId?: string;
}

interface PeopleYouMayKnow {
  type: 'people_you_may_know';
}

type FeedItem = HydratedPost | PeopleYouMayKnow;

const MOCK_PEOPLE_YOU_MAY_KNOW: FeedItem = { type: 'people_you_may_know' };

const AppHeader = () => {
  const navigation = useNavigation<any>();
  const [unreadCount, setUnreadCount] = useState(0);

  // Load notification count
  const loadUnreadCount = async () => {
    try {
      const userInfo = await AsyncStorage.getItem('userInfo');
      if (userInfo) {
        const user = JSON.parse(userInfo);
        const userId = user.ID_NguoiDung;
        if (userId) {
          const response = await fetch(`${API_BASE_URL}/api/thongbao/unread/${userId}`);
          const data = await response.json();
          if (data.success) {
            setUnreadCount(data.unread_count || 0);
          }
        }
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  useEffect(() => {
    loadUnreadCount();
    
    // 🔔 Kết nối Socket.IO để cập nhật badge ngay lập tức
    const setupSocket = async () => {
      const userInfo = await AsyncStorage.getItem('userInfo');
      if (userInfo) {
        const user = JSON.parse(userInfo);
        const userId = user.ID_NguoiDung;
        if (userId) {
          try {
            const socket = io(API_BASE_URL);
            
            socket.on('connect', () => {
              // Socket connected
            });
            
            // Lắng nghe thông báo mới
            socket.on(`notification_${userId}`, (data: any) => {
              // Reload badge count ngay lập tức
              loadUnreadCount();
            });
            
            return () => socket.disconnect();
          } catch (error) {
            // Silent error
          }
        }
      }
    };
    
    setupSocket();
    
    // Fallback: Reload every 30 seconds nếu socket fail
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View className="flex-row justify-between items-center px-4 py-2 bg-white border-b border-[#EEEEEE]">
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Text className="text-[45px] text-[#7f001f] leading-[45px] font-[Oughter]">OLODO</Text>
      <View className="flex-row">
        <TouchableOpacity onPress={() => router.push('/components/Home/timkiem')}>
          <Ionicons name="search" size={24} color={COLORS.text} style={{ marginLeft: 20 }} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('tinnhan')}>
          <View>
            <MaterialCommunityIcons
              name="message-text-outline"
              size={24}
              color={COLORS.text}
              style={{ marginLeft: 20 }}
            />
            <View className="absolute -right-1 -top-1 w-2 h-2 rounded-full bg-[#7f001f] border border-white" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => {
            router.push('/components/Home/thongbao');
            loadUnreadCount(); // Refresh sau khi vào thông báo
          }}
        >
          <View style={{ marginLeft: 20 }}>
            <FontAwesome name="bell-o" size={24} color={COLORS.text} />
            {unreadCount > 0 && (
              <View style={{
                position: 'absolute',
                right: -6,
                top: -4,
                backgroundColor: '#ff0000',
                borderRadius: 10,
                minWidth: 18,
                height: 18,
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 4,
              }}>
                <Text style={{
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 'bold',
                }}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const TabSelector = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) => (
  <View className="flex-row px-4 py-2 bg-white">
    <TouchableOpacity
      className={`px-5 py-2 rounded-full mr-2 ${
        activeTab === 'news' ? 'bg-[#7f001f]' : 'bg-[#F5F5F5]'
      }`}
      onPress={() => setActiveTab('news')}
    >
      <Text
        className={`font-bold text-sm ${activeTab === 'news' ? 'text-white' : 'text-[#777777]'}`}
      >
        News
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      className={`px-5 py-2 rounded-full mr-2 ${
        activeTab === 'popular' ? 'bg-[#7f001f]' : 'bg-[#F5F5F5]'
      }`}
      onPress={() => setActiveTab('popular')}
    >
      <Text
        className={`font-bold text-sm ${activeTab === 'popular' ? 'text-white' : 'text-[#777777]'}`}
      >
        Popular Posts
      </Text>
    </TouchableOpacity>
  </View>
);

const CreatePost = () => (
  <View className="p-4 bg-white border-b-8 border-[#fffcef]">
    <View className="flex-row items-center">
      <Image className="w-10 h-10 rounded-full" source={{ uri: 'https://i.pravatar.cc/50' }} />
      <View className="ml-3">
        <Text className="text-base font-bold text-[#222]">What&apos;s Going On?</Text>
        <Text className="text-sm text-[#777] mt-1">Type Something Here...</Text>
      </View>
    </View>
    <View className="h-[1px] bg-[#EEEEEE] my-3" />
    <View className="flex-row justify-between">
      <TouchableOpacity className="flex-row items-center">
        <Ionicons name="image-outline" size={20} color="#4CAF50" />
        <Text className="ml-2 text-xs text-[#777] font-medium">Gallery</Text>
      </TouchableOpacity>
      <TouchableOpacity className="flex-row items-center">
        <FontAwesome5 name="user-tag" size={20} color="#1E88E5" />
        <Text className="ml-2 text-xs text-[#777] font-medium">Tag People</Text>
      </TouchableOpacity>
      <TouchableOpacity className="flex-row items-center">
        <MaterialCommunityIcons name="emoticon-happy-outline" size={20} color="#FFC107" />
        <Text className="ml-2 text-xs text-[#777] font-medium">Feeling</Text>
      </TouchableOpacity>
      <TouchableOpacity className="flex-row items-center">
        <MaterialCommunityIcons name="video-outline" size={20} color="#E63946" />
        <Text className="ml-2 text-xs text-[#777] font-medium">Live</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const Stories = () => (
  <View className="bg-white pb-4">
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingLeft: 15 }}
    >
      <TouchableOpacity className="w-24 h-40 rounded-lg mr-3">
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1579626343210-9b6d611f8b33?q=80' }}
          className="w-full h-full justify-end rounded-lg overflow-hidden"
          imageStyle={{ borderRadius: 10, opacity: 0.7 }}
        >
          <View className="items-center pb-4">
            <TouchableOpacity
              className="w-8 h-8 rounded-full bg-white justify-center items-center mb-2"
              onPress={() => router.push('/components/Home/TaoTin')}
            >
              <Ionicons name="add" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <Text className="text-white font-bold text-xs">Add Story</Text>
          </View>
        </ImageBackground>
      </TouchableOpacity>
      {[
        {
          name: 'Alexfin',
          img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80',
        },
        {
          name: 'Harinax',
          img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80',
        },
        { name: 'Sonix', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80' },
      ].map((story) => (
        <TouchableOpacity className="w-24 h-40 rounded-lg mr-3" key={story.name}>
          <ImageBackground
            source={{ uri: story.img }}
            className="w-full h-full justify-between p-2 rounded-lg overflow-hidden"
            imageStyle={{ borderRadius: 10 }}
          >
            <Image
              className="w-8 h-8 rounded-full border-2 border-[#7f001f]"
              source={{ uri: story.img }}
            />
            <Text className="text-white font-bold text-xs">{story.name}</Text>
          </ImageBackground>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

const PeopleMayKnow = () => (
  <View className="bg-white pt-4 pb-2">
    <Text className="text-lg font-bold mb-4 ml-4 text-[#222]">People you may know</Text>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 15 }}
    >
      {[
        { name: 'Cooper George', mutual: 2 },
        { name: 'Terry Bator', mutual: 2 },
        { name: 'Skylar Affhoff', mutual: 5 },
      ].map((person) => (
        <View
          key={person.name}
          className="w-40 border border-[#EEE] rounded-lg p-3 items-center mr-3 bg-white"
          style={Platform.OS === 'ios' ? { shadowOpacity: 0.1, shadowRadius: 1 } : { elevation: 1 }}
        >
          <Image
            className="w-20 h-20 rounded-full mb-3"
            source={{ uri: `https://i.pravatar.cc/150?u=${person.name}` }}
          />
          <Text className="font-bold text-sm text-[#222] text-center">{person.name}</Text>
          <Text className="text-xs text-[#777] mb-3 text-center">
            {person.mutual} Mutual friends
          </Text>
          <TouchableOpacity className="bg-[#7f001f] py-2 rounded w-full mb-2 items-center">
            <Text className="text-white font-bold text-sm">Add Friend</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-[#F5F5F5] py-2 rounded w-full items-center">
            <Text className="text-[#222] font-bold text-sm">Remove</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  </View>
);

// Memoized FeedPost component để tránh re-render không cần thiết
const FeedPost = React.memo(
  ({
    post,
    onLike,
    canPress,
  }: {
    post: HydratedPost;
    onLike: (id: string) => void;
    canPress: boolean;
  }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const maxLines = 3;
    const description = post.description || ''; // Ensure string

    const onShare = async () => {
      const shareMessage = `Hãy xem bài đăng "${post.title}" của ${post.authorName} trên OLODO!${
        description ? `\n\n"${description}"` : ''
      }`;
      try {
        await Share.share({ message: shareMessage });
      } catch (error: any) {
        console.error('Error sharing:', error.message);
      }
    };

    const formatCount = (count: number) =>
      count >= 1000 ? `${(count / 1000).toFixed(1)}K` : count.toString();

    const toggleExpand = () => setIsExpanded(!isExpanded);

    return (
      <View className="bg-white my-1">
        <View className="flex-row items-center p-4">
          <Image
            className="w-10 h-10 rounded-full mr-3"
            source={{ uri: post.authorAvatar || 'https://i.pravatar.cc/50' }}
          />
          <View className="flex-1">
            <Text className="text-base font-bold text-[#222]">{post.authorName}</Text>
            <Text className="text-xs text-[#777]">
              {post.time} | {post.location}
            </Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="ellipsis-horizontal" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
        <Text className="text-base font-bold text-[#222] leading-6 px-4 mb-2">{post.title}</Text>
        <Text
          className={`text-sm text-[#777] leading-5 px-4 mb-2 ${
            isExpanded ? '' : 'max-h-[60px] overflow-hidden'
          }`}
          numberOfLines={isExpanded ? 0 : maxLines}
        >
          {description}
        </Text>
        {description.length > 100 && !isExpanded && (
          <TouchableOpacity onPress={toggleExpand} className="px-4 mb-2">
            <Text className="text-sm text-[#7f001f] font-medium">Xem thêm</Text>
          </TouchableOpacity>
        )}
        {isExpanded && (
          <TouchableOpacity onPress={toggleExpand} className="px-4 mb-2 self-start">
            <Text className="text-sm text-[#7f001f] font-medium">Thu gọn</Text>
          </TouchableOpacity>
        )}
        <Text className="text-base font-bold text-red-600 px-4 mb-2">{post.price} VNĐ</Text>
        {post.imageUrls.length > 0 && (
          <TouchableOpacity
            className="w-full relative"
            onPress={() => {
              if (!canPress) return;
              try {
                router.push({
                  pathname: '/components/BaiDang/chitietbaidang',
                  params: { postId: post.ID_BaiDang },
                });
              } catch (error) {
                console.error('Navigation error:', error);
              }
            }}
            activeOpacity={0.8}
            delayPressIn={50}
            disabled={!canPress}
          >
            <View className="w-full h-52 relative overflow-hidden rounded-lg">
              {post.imageUrls.length === 1 ? (
                <Image
                  source={{ uri: post.imageUrls[0] }}
                  className="w-full h-full"
                  resizeMode="cover"
                  loadingIndicatorSource={{
                    uri: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
                  }}
                  fadeDuration={300}
                />
              ) : post.imageUrls.length === 2 ? (
                <View className="flex-row h-full">
                  <Image
                    source={{ uri: post.imageUrls[0] }}
                    className="w-1/2 h-full rounded-l-lg"
                    resizeMode="cover"
                    loadingIndicatorSource={{
                      uri: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
                    }}
                    fadeDuration={300}
                  />
                  <Image
                    source={{ uri: post.imageUrls[1] }}
                    className="w-1/2 h-full rounded-r-lg"
                    resizeMode="cover"
                    loadingIndicatorSource={{
                      uri: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
                    }}
                    fadeDuration={300}
                  />
                </View>
              ) : post.imageUrls.length === 3 ? (
                <View className="w-full h-full">
                  <Image
                    source={{ uri: post.imageUrls[0] }}
                    className="w-full h-2/3 rounded-t-lg"
                    resizeMode="cover"
                  />
                  <View className="flex-row w-full h-1/3">
                    <Image
                      source={{ uri: post.imageUrls[1] }}
                      className="w-1/2 h-full"
                      resizeMode="cover"
                    />
                    <Image
                      source={{ uri: post.imageUrls[2] }}
                      className="w-1/2 h-full rounded-br-lg"
                      resizeMode="cover"
                    />
                  </View>
                </View>
              ) : post.imageUrls.length === 4 ? (
                <View className="flex-row w-full h-full">
                  <View className="w-1/2 h-full flex-col">
                    <Image
                      source={{ uri: post.imageUrls[0] }}
                      className="w-full h-1/2 rounded-tl-lg"
                      resizeMode="cover"
                    />
                    <Image
                      source={{ uri: post.imageUrls[2] }}
                      className="w-full h-1/2 rounded-bl-lg"
                      resizeMode="cover"
                    />
                  </View>
                  <View className="w-1/2 h-full flex-col">
                    <Image
                      source={{ uri: post.imageUrls[1] }}
                      className="w-full h-1/2 rounded-tr-lg"
                      resizeMode="cover"
                    />
                    <Image
                      source={{ uri: post.imageUrls[3] }}
                      className="w-full h-1/2 rounded-br-lg"
                      resizeMode="cover"
                    />
                  </View>
                </View>
              ) : (
                <View className="w-full h-full relative">
                  <View className="flex-row w-full h-full">
                    <View className="w-1/2 h-full flex-col">
                      <Image
                        source={{ uri: post.imageUrls[0] }}
                        className="w-full h-1/2 rounded-tl-lg"
                        resizeMode="cover"
                      />
                      <Image
                        source={{ uri: post.imageUrls[2] }}
                        className="w-full h-1/2 rounded-bl-lg"
                        resizeMode="cover"
                      />
                    </View>
                    <View className="w-1/2 h-full flex-col">
                      <Image
                        source={{ uri: post.imageUrls[1] }}
                        className="w-full h-1/2 rounded-tr-lg"
                        resizeMode="cover"
                      />
                      <Image
                        source={{ uri: post.imageUrls[3] }}
                        className="w-full h-1/2 rounded-br-lg"
                        resizeMode="cover"
                      />
                    </View>
                  </View>
                  {post.imageUrls.length > 4 && (
                    <View className="absolute bottom-2 right-2 bg-black/60 rounded-full px-3 py-1 items-center justify-center min-w-[40px]">
                      <Text className="text-white font-bold text-base">
                        +{post.imageUrls.length - 4}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
        <View className="flex-row px-4 py-2">
          <TouchableOpacity
            onPress={() => {
              if (post.likeCount > 0) {
                router.push({
                  pathname: '/components/BaiDang/danhsachlike',
                  params: { postId: post.ID_BaiDang },
                });
              }
            }}
            disabled={post.likeCount === 0}
          >
            <Text className={`text-xs text-[#777] mr-4 ${post.likeCount > 0 ? 'underline' : ''}`}>
              {formatCount(post.likeCount)} Likes
            </Text>
          </TouchableOpacity>
          <Text className="text-xs text-[#777] mr-4">
            {formatCount(post.commentCount)} Comments
          </Text>
          <Text className="text-xs text-[#777]">12K Shares</Text>
        </View>
        <View className="h-[1px] bg-[#EEE] mx-4 my-2" />
        <View className="flex-row justify-around px-4 pb-3">
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => onLike(post.ID_BaiDang)}
          >
            <Ionicons
              name={post.liked ? 'heart' : 'heart-outline'}
              size={22}
              color={post.liked ? COLORS.primary : COLORS.textSecondary}
            />
            <Text
              className={`ml-2 text-sm font-medium ${post.liked ? 'text-[#7f001f]' : 'text-[#777]'}`}
            >
              {post.liked ? 'Liked' : 'Like'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() =>
              router.push({
                pathname: '/components/BaiDang/binhluanbaidang',
                params: { postId: post.ID_BaiDang },
              })
            }
          >
            <Ionicons name="chatbubble-outline" size={22} color={COLORS.textSecondary} />
            <Text className="ml-2 text-sm font-medium text-[#777]">Comment</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center" onPress={onShare}>
            <Ionicons name="share-social-outline" size={22} color={COLORS.textSecondary} />
            <Text className="ml-2 text-sm font-medium text-[#777]">Share</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => {
              router.push({
                pathname: '/components/TinNhan/chitiettinnhan',
                params: {
                  userId: post.ID_NguoiDung || post.authorName,
                  userName: post.authorName,
                  userAvatar: post.authorAvatar,
                  hasExistingConversation: 'false',
                  sharePost: 'true',
                  postId: post.ID_BaiDang,
                  postTitle: post.title,
                  postImage: post.imageUrls[0] || '',
                },
              });
            }}
          >
            <Ionicons name="chatbox-outline" size={22} color={COLORS.primary} />
            <Text className="ml-2 text-sm font-medium text-[#7f001f]">Message</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function để tối ưu re-render
    return (
      prevProps.post.ID_BaiDang === nextProps.post.ID_BaiDang &&
      prevProps.post.liked === nextProps.post.liked &&
      prevProps.post.likeCount === nextProps.post.likeCount &&
      prevProps.canPress === nextProps.canPress
    );
  },
);

FeedPost.displayName = 'FeedPost';

const POSTS_PER_CHUNK = 5; // Tăng chunk size để giảm số lần load
const INITIAL_LOAD_COUNT = 8; // Load nhiều bài hơn ban đầu
const USER_CACHE_SIZE = 50; // Tăng cache size

// Enhanced caching system
const userInfoCache = new Map();
const postDetailCache = new Map();
const imageUrlCache = new Map();
const pendingRequests = new Map(); // Prevent duplicate requests

// Debounce helper để tránh load quá thường xuyên
let loadMoreTimeout: ReturnType<typeof setTimeout> | null = null;

const HomeScreen = () => {
  const [activeTab, setActiveTab] = useState('news');
  const [token, setToken] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [canPress, setCanPress] = useState(true);
  const isFocused = useIsFocused();

  const [allRecommendations, setAllRecommendations] = useState<Recommendation[]>([]);
  const [feedData, setFeedData] = useState<FeedItem[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastLoadTime, setLastLoadTime] = useState(0);
  const [hasError, setHasError] = useState(false);

  // Enhanced fetchUserInfo with better error handling and retry logic
  const fetchUserInfo = useCallback(async (id: string, token: string): Promise<UserProfile> => {
    // Check cache first
    if (userInfoCache.has(id)) {
      return userInfoCache.get(id)!;
    }

    // Check if request is already pending
    const requestKey = `user_${id}`;
    if (pendingRequests.has(requestKey)) {
      return pendingRequests.get(requestKey)!;
    }

    const url = `${API_URLS.GET_USER_INFO}${id}`;
    const requestPromise = (async () => {
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000); // Tăng timeout

          const response = await fetch(url, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          // Kiểm tra status 0 (network error)
          if (response.status === 0) {
            throw new Error('Network Error: Không thể kết nối đến máy chủ');
          }

          if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
          }

          const data = await response.json();
          const user = data.user || {};

          const userProfile: UserProfile = {
            ID_NguoiDung: user.ID_NguoiDung || id,
            ho_ten: user.ho_ten || 'Người dùng OLODO',
            anh_dai_dien: user.anh_dai_dien || `https://i.pravatar.cc/50?u=${id}`,
            email: user.email,
          };

          // Cache result with LRU eviction
          if (userInfoCache.size >= USER_CACHE_SIZE) {
            const firstKey = userInfoCache.keys().next().value;
            userInfoCache.delete(firstKey);
          }
          userInfoCache.set(id, userProfile);

          return userProfile;
        } catch (error: any) {
          retryCount++;
          console.warn(
            `❌ Fetch user info attempt ${retryCount}/${maxRetries} failed:`,
            error.message,
          );

          if (retryCount >= maxRetries) {
            // Fallback profile after all retries failed
            const fallbackProfile: UserProfile = {
              ID_NguoiDung: id,
              ho_ten: 'Người dùng OLODO',
              anh_dai_dien: `https://i.pravatar.cc/50?u=${id}`,
            };

            userInfoCache.set(id, fallbackProfile);
            return fallbackProfile;
          }

          // Wait before retry (exponential backoff)
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        }
      }
    })();

    // Store pending request
    pendingRequests.set(requestKey, requestPromise);
    return requestPromise as Promise<UserProfile>;
  }, []);

  // Optimized hydratePostChunk with enhanced caching and batching
  const hydratePostChunk = useCallback(
    async (chunk: Recommendation[]) => {
      if (!token) return [];

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Process all posts in parallel for maximum speed
      const results = await Promise.allSettled(
        chunk.map(async (reco) => {
          try {
            // Check cache first
            const cacheKey = `post_${reco.ID_BaiDang}`;
            if (postDetailCache.has(cacheKey)) {
              return postDetailCache.get(cacheKey);
            }

            // Create timeout controllers with optimized timeouts
            const controllers = [
              new AbortController(),
              new AbortController(),
              new AbortController(),
              new AbortController(),
            ];

            const timeouts = controllers.map((controller, i) =>
              setTimeout(() => controller.abort(), i < 2 ? 6000 : 4000),
            );

            // Execute all 4 requests in parallel
            const [postDetailRes, postImageRes, likeRes, commentRes] = await Promise.allSettled([
              fetch(`${API_URLS.GET_POST_BY_ID}${reco.ID_BaiDang}`, {
                headers,
                signal: controllers[0].signal,
              }),
              fetch(`${API_URLS.GET_POST_IMAGE_BY_ID}${reco.ID_BaiDang}`, {
                headers,
                signal: controllers[1].signal,
              }),
              fetch(`${API_URLS.LIKE_BY_POST}${reco.ID_BaiDang}`, {
                headers,
                signal: controllers[2].signal,
              }),
              fetch(`${API_URLS.COMMENT_BY_POST}${reco.ID_BaiDang}`, {
                headers,
                signal: controllers[3].signal,
              }),
            ]);

            // Clear all timeouts
            timeouts.forEach(clearTimeout);

            // Process results with fallbacks
            const postDetail: PostDetail =
              postDetailRes.status === 'fulfilled' && postDetailRes.value.ok
                ? await postDetailRes.value.json()
                : {};

            if (!postDetail.ID_BaiDang) return null;

            const postImages: PostImage[] =
              postImageRes.status === 'fulfilled' && postImageRes.value.ok
                ? await postImageRes.value.json()
                : [];

            if (postImages.length === 0) return null;

            const likes =
              likeRes.status === 'fulfilled' && likeRes.value.ok ? await likeRes.value.json() : [];

            const comments =
              commentRes.status === 'fulfilled' && commentRes.value.ok
                ? await commentRes.value.json()
                : [];

            const authorProfile = await fetchUserInfo(postDetail.ID_NguoiDung, token);
            const userLike = likes.find(
              (like: Like) => String(like.ID_NguoiDung) === String(userId),
            );

            // Memoized price formatting
            const rawPrice = parseFloat(postDetail.gia) || 0;
            const formattedPrice = rawPrice.toLocaleString('en-US', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            });

            // Optimized image URL processing with caching
            const imageCacheKey = `images_${reco.ID_BaiDang}`;
            let limitedImageUrls;

            if (imageUrlCache.has(imageCacheKey)) {
              limitedImageUrls = imageUrlCache.get(imageCacheKey);
            } else {
              const baseUrl = Constants.expoConfig?.extra?.apiUrl || 'http://192.168.0.108:3000';
              const API_BASE_URL = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
              const uploadBaseUrl = API_BASE_URL.replace('/api', '');

              limitedImageUrls = postImages.slice(0, 5).map((img) => {
                const linkAnh = img.LinkAnh;
                if (linkAnh.startsWith('http://') || linkAnh.startsWith('https://')) {
                  return linkAnh;
                }
                return `${uploadBaseUrl}/uploads/${linkAnh}`;
              });

              // Cache processed image URLs
              imageUrlCache.set(imageCacheKey, limitedImageUrls);
            }

            const hydratedPost = {
              type: 'post' as const,
              ID_BaiDang: postDetail.ID_BaiDang,
              ID_NguoiDung: postDetail.ID_NguoiDung,
              authorName: authorProfile.ho_ten || 'Người dùng OLODO',
              authorAvatar: authorProfile.anh_dai_dien || 'https://i.pravatar.cc/50',
              title: postDetail.tieu_de,
              description: postDetail.mo_ta || '',
              price: formattedPrice,
              location: postDetail.vi_tri,
              time: new Date(postDetail.thoi_gian_tao).toLocaleDateString('vi-VN'),
              imageUrls: limitedImageUrls,
              liked: !!userLike,
              likeCount: likes.length,
              commentCount: comments.length,
              userLikeId: userLike?.ID_Like,
            };

            // Cache the complete hydrated post
            postDetailCache.set(cacheKey, hydratedPost);
            return hydratedPost;
          } catch (error) {
            console.warn(`Error hydrating post ${reco.ID_BaiDang}:`, error);
            return null;
          }
        }),
      );

      // Filter successful results
      return results
        .filter((result) => result.status === 'fulfilled' && result.value !== null)
        .map((result) => (result as PromiseFulfilledResult<HydratedPost>).value);
    },
    [token, userId, fetchUserInfo],
  );

  // Optimized fetchInitialData with better error handling and retry logic
  const fetchInitialData = useCallback(
    async (isRefresh = false) => {
      if (!token || !userId) return;

      if (isRefresh) {
        setIsRefreshing(true);
        setHasError(false);
        // Clear caches on refresh
        userInfoCache.clear();
        postDetailCache.clear();
        imageUrlCache.clear();
        pendingRequests.clear();
        // Reset states
        setCurrentPage(0);
        setFeedData([]);
        setAllRecommendations([]);
      } else {
        setIsLoading(true);
        setHasError(false);
      }

      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        try {
          // Create timeout controller for recommendations
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000); // Tăng timeout

          const recoResponse = await fetch(`${API_URLS.RECOMMENDATIONS}${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          // Kiểm tra status 0 (network error)
          if (recoResponse.status === 0) {
            throw new Error('Network Error: Không thể kết nối đến máy chủ');
          }

          if (!recoResponse.ok) {
            throw new Error(`Failed to fetch recommendations: ${recoResponse.status}`);
          }

          const recommendations: Recommendation[] = await recoResponse.json();
          setAllRecommendations(recommendations);

          if (recommendations.length > 0) {
            // Load initial chunk with optimized processing
            const firstChunk = recommendations.slice(0, INITIAL_LOAD_COUNT);
            const initialPosts = await hydratePostChunk(firstChunk);

            // Create feed with unique posts
            const finalFeed: FeedItem[] = [];
            initialPosts.forEach((post, index) => {
              finalFeed.push(post);
              if (index === 0) finalFeed.push(MOCK_PEOPLE_YOU_MAY_KNOW);
            });

            setFeedData(finalFeed);
            setCurrentPage(1);

            // Preload next chunk in background for better UX
            if (recommendations.length > INITIAL_LOAD_COUNT) {
              setTimeout(() => {
                const nextChunk = recommendations.slice(
                  INITIAL_LOAD_COUNT,
                  INITIAL_LOAD_COUNT + POSTS_PER_CHUNK,
                );
                hydratePostChunk(nextChunk).then((preloadedPosts) => {
                  // Cache preloaded posts for instant loading
                  preloadedPosts.forEach((post) => {
                    const cacheKey = `post_${post.ID_BaiDang}`;
                    postDetailCache.set(cacheKey, post);
                  });
                });
              }, 2000);
            }
          } else {
            setFeedData([MOCK_PEOPLE_YOU_MAY_KNOW]);
          }

          // Success - break out of retry loop
          break;
        } catch (error: any) {
          retryCount++;
          console.warn(
            `❌ Fetch initial data attempt ${retryCount}/${maxRetries} failed:`,
            error.message,
          );

          if (retryCount >= maxRetries) {
            console.error('❌ All retry attempts failed for fetchInitialData');
            setHasError(true);
            Toast.show({
              type: 'error',
              text1: 'Lỗi tải dữ liệu',
              text2: 'Vui lòng kiểm tra kết nối mạng và thử lại',
            });

            // Show cached data if available
            if (feedData.length > 0 && !isRefresh) {
              Toast.show({ type: 'info', text1: 'Hiển thị dữ liệu đã lưu' });
            } else {
              // Show empty state with retry option
              setFeedData([MOCK_PEOPLE_YOU_MAY_KNOW]);
            }
            break;
          }

          // Wait before retry (exponential backoff)
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        }
      }

      setIsLoading(false);
      setIsRefreshing(false);
    },
    [token, userId, hydratePostChunk, feedData.length],
  );

  // Optimized handleLoadMore with smart caching and throttling
  const handleLoadMore = useCallback(async () => {
    const now = Date.now();

    // More restrictive conditions to prevent frequent loading
    if (
      isLoadingMore ||
      isRefreshing ||
      currentPage * POSTS_PER_CHUNK >= allRecommendations.length ||
      feedData.length === 0 ||
      now - lastLoadTime < 1500 // Reduced throttle time for better UX
    ) {
      return;
    }

    const remainingPosts = allRecommendations.length - currentPage * POSTS_PER_CHUNK;
    if (remainingPosts <= 0) return;

    setLastLoadTime(now);
    setIsLoadingMore(true);

    try {
      const nextPage = currentPage + 1;
      const start = currentPage * POSTS_PER_CHUNK;
      const end = start + POSTS_PER_CHUNK;

      const nextChunk = allRecommendations.slice(start, end);

      // Check cache first for instant loading
      const cachedPosts: HydratedPost[] = [];
      const uncachedIds: string[] = [];

      nextChunk.forEach((reco) => {
        const cacheKey = `post_${reco.ID_BaiDang}`;
        if (postDetailCache.has(cacheKey)) {
          cachedPosts.push(postDetailCache.get(cacheKey)!);
        } else {
          uncachedIds.push(reco.ID_BaiDang);
        }
      });

      // Only fetch uncached posts
      let newPosts = [...cachedPosts];
      if (uncachedIds.length > 0) {
        const uncachedChunk = nextChunk.filter((reco) => uncachedIds.includes(reco.ID_BaiDang));
        const fetchedPosts = await hydratePostChunk(uncachedChunk);
        newPosts.push(...fetchedPosts);
      }

      if (newPosts.length > 0) {
        setFeedData((prevData) => {
          const existingPostIds = new Set(
            prevData
              .filter((item) => item.type === 'post')
              .map((item) => (item as HydratedPost).ID_BaiDang),
          );

          const uniqueNewPosts = newPosts.filter((post) => !existingPostIds.has(post.ID_BaiDang));
          return [...prevData, ...uniqueNewPosts];
        });
        setCurrentPage(nextPage);
      }
    } catch (error) {
      console.error('Error loading more:', error);
      Toast.show({ type: 'error', text1: 'Lỗi tải thêm dữ liệu' });
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    isLoadingMore,
    isRefreshing,
    currentPage,
    allRecommendations,
    hydratePostChunk,
    feedData.length,
    lastLoadTime,
  ]);

  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const [tokenResult, userInfoResult] = await Promise.all([
          AsyncStorage.getItem('userToken'),
          AsyncStorage.getItem('userInfo'),
        ]);
        setToken(tokenResult || '');
        const userInfo = userInfoResult ? JSON.parse(userInfoResult) : {};
        setUserId(userInfo.ID_NguoiDung ? String(userInfo.ID_NguoiDung) : '');
      } catch (error) {
        console.error('Error loading auth data:', error);
      }
    };
    loadAuthData();
  }, []);

  useEffect(() => {
    let mounted = true;
    if (isFocused && token && userId && allRecommendations.length === 0 && mounted) {
      fetchInitialData();
    }
    return () => {
      mounted = false;
    };
  }, [isFocused, token, userId, allRecommendations.length, fetchInitialData]);

  // Optimized handleLike with debouncing
  const handleLike = useCallback(
    async (postId: string) => {
      if (!token || !userId) {
        Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Vui lòng đăng nhập lại.' });
        return;
      }

      const originalFeedData = [...feedData];
      const postIndex = feedData.findIndex(
        (item) => item.type === 'post' && item.ID_BaiDang === postId,
      );
      if (postIndex === -1) return;

      const postToUpdate = { ...feedData[postIndex] } as HydratedPost;
      const isCurrentlyLiked = postToUpdate.liked;

      // Optimistic update
      const updatedPost = {
        ...postToUpdate,
        liked: !isCurrentlyLiked,
        likeCount: isCurrentlyLiked ? postToUpdate.likeCount - 1 : postToUpdate.likeCount + 1,
      };

      setFeedData((prev) => {
        const newFeed = [...prev];
        newFeed[postIndex] = updatedPost;
        return newFeed;
      });

      try {
        if (isCurrentlyLiked) {
          let likeIdToDelete = postToUpdate.userLikeId;
          if (!likeIdToDelete) {
            const likeController = new AbortController();
            const likeTimeoutId = setTimeout(() => likeController.abort(), 5000);

            const likeResponse = await fetch(`${API_URLS.LIKE_BY_POST}${postId}`, {
              headers: { Authorization: `Bearer ${token}` },
              signal: likeController.signal,
            });

            clearTimeout(likeTimeoutId);
            const likes: Like[] = likeResponse.ok ? await likeResponse.json() : [];
            const userLike = likes.find((like) => String(like.ID_NguoiDung) === String(userId));
            likeIdToDelete = userLike?.ID_Like;
          }

          if (!likeIdToDelete) throw new Error('Không tìm thấy ID_Like để xóa');

          const deleteController = new AbortController();
          const deleteTimeoutId = setTimeout(() => deleteController.abort(), 5000);

          await fetch(`${API_URLS.LIKE_DELETE}${likeIdToDelete}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
            signal: deleteController.signal,
          });

          clearTimeout(deleteTimeoutId);
        } else {
          const createController = new AbortController();
          const createTimeoutId = setTimeout(() => createController.abort(), 5000);

          const response = await fetch(API_URLS.LIKE_CREATE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ ID_BaiDang: postId, ID_NguoiDung: userId }),
            signal: createController.signal,
          });

          clearTimeout(createTimeoutId);
          if (!response.ok) throw new Error('Tạo like thất bại');

          const newLikeData = await response.json();
          setFeedData((prev) => {
            const newFeed = [...prev];
            const finalPost = newFeed[postIndex] as HydratedPost;
            newFeed[postIndex] = { ...finalPost, userLikeId: newLikeData.ID_Like };
            return newFeed;
          });
        }
      } catch (error) {
        console.error('❌ Lỗi khi like/unlike:', error);
        Toast.show({ type: 'error', text1: 'Thao tác thất bại' });
        setFeedData(originalFeedData);
      }
    },
    [token, userId, feedData],
  );

  // Memoized render function for better performance
  const renderFeedItem = useCallback(
    ({ item }: { item: FeedItem }) => {
      switch (item.type) {
        case 'people_you_may_know':
          return <PeopleMayKnow />;
        case 'post':
          return <FeedPost post={item} onLike={handleLike} canPress={canPress} />;
        default:
          return null;
      }
    },
    [handleLike, canPress],
  );

  // Memoized key extractor với timestamp để đảm bảo unique
  const keyExtractor = useCallback((item: FeedItem, index: number) => {
    if (item.type === 'post') {
      return `${item.type}-${item.ID_BaiDang}-${index}`;
    }
    return `${item.type}-${index}`;
  }, []);

  // Memoized header for better performance
  const ListHeader = useCallback(
    () => (
      <>
        <AppHeader />
        <TabSelector activeTab={activeTab} setActiveTab={setActiveTab} />
        <CreatePost />
        <Stories />
        <Text className="text-lg font-bold text-[#222] px-4 pt-4 pb-2">
          {activeTab === 'news' ? 'News Feed' : 'Popular Posts'}
        </Text>
      </>
    ),
    [activeTab, setActiveTab],
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return <ActivityIndicator style={{ marginVertical: 20 }} size="large" color={COLORS.primary} />;
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-[#fffcef]">
        <ListHeader />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text className="text-[#777] mt-4 text-center">Đang tải dữ liệu...</Text>
          <Text className="text-[#777] mt-2 text-center text-xs">Vui lòng đợi trong giây lát</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state with retry button
  if (hasError && feedData.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-[#fffcef]">
        <ListHeader />
        <View className="flex-1 justify-center items-center px-4">
          <Ionicons name="cloud-offline-outline" size={64} color={COLORS.textSecondary} />
          <Text className="text-[#222] text-lg font-bold mt-4 text-center">
            Không thể tải dữ liệu
          </Text>
          <Text className="text-[#777] mt-2 text-center">
            Vui lòng kiểm tra kết nối mạng và thử lại
          </Text>
          <TouchableOpacity
            className="bg-[#7f001f] px-6 py-3 rounded-full mt-6"
            onPress={() => fetchInitialData(true)}
          >
            <Text className="text-white font-bold">Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#fffcef]">
      <FlatList
        data={feedData}
        renderItem={renderFeedItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        onEndReached={() => {
          // Optimized debounce for better performance
          if (loadMoreTimeout) clearTimeout(loadMoreTimeout);
          loadMoreTimeout = setTimeout(() => {
            handleLoadMore();
          }, 300); // Reduced debounce time
        }}
        onEndReachedThreshold={0.2} // Increased threshold for earlier loading
        refreshing={isRefreshing}
        onRefresh={() => fetchInitialData(true)}
        onScrollBeginDrag={() => setCanPress(false)}
        onScrollEndDrag={() => setCanPress(true)}
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews={true}
        maxToRenderPerBatch={3} // Reduced for better performance
        updateCellsBatchingPeriod={100} // Faster updates
        initialNumToRender={6} // Optimized initial render
        windowSize={8} // Reduced window size
        getItemLayout={undefined}
        disableVirtualization={false}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;
