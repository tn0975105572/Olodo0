import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  Dimensions,
  ScrollView,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Stop, Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');
const STORY_SIZE = 60;
const AVATAR_SIZE = 40;

export default function BaiDang() {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(4400000);
  const scaleValue = useSharedValue(1);

  const post = {
    user: {
      name: 'kyliejenner',
      avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    },
    // The post now has an array of images for the gallery
    images: [
      'https://picsum.photos/600/800?random=1',
      'https://picsum.photos/600/800?random=2',
      'https://picsum.photos/600/800?random=3',
      'https://picsum.photos/600/800?random=4',
      'https://picsum.photos/600/800?random=5',
    ],
    comments: 8864,
    caption: 'bday film 🎞️',
  };

  const handleLike = () => {
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);

    scaleValue.value = withSpring(1.5, {}, () => {
      scaleValue.value = withSpring(1);
    });
  };

  const animatedHeartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));

  const stories = [
    { name: 'Tin Cũ', avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
    { name: 'kyliejenner', avatar: 'https://randomuser.me/api/portraits/women/65.jpg' },
    { name: 'Your Story', avatar: 'https://randomuser.me/api/portraits/women/2.jpg' },
    { name: 'duongha', avatar: 'https://randomuser.me/api/portraits/men/3.jpg' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Stories Header */}
      <View style={styles.storiesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {stories.map((story, index) => (
            <Pressable key={index} style={styles.storyItem}>
              <Svg height={STORY_SIZE} width={STORY_SIZE}>
                <Defs>
                  <LinearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <Stop offset="0%" stopColor="#f095ff" />
                    <Stop offset="25%" stopColor="#bb4bf9" />
                    <Stop offset="50%" stopColor="#8338ec" />
                    <Stop offset="100%" stopColor="#3a86ff" />
                  </LinearGradient>
                </Defs>
                <Circle
                  cx={STORY_SIZE / 2}
                  cy={STORY_SIZE / 2}
                  r={STORY_SIZE / 2 - 2}
                  fill="url(#grad)"
                  stroke="white"
                  strokeWidth="2"
                />
              </Svg>
              <Image source={{ uri: story.avatar }} style={styles.storyAvatar} />
              <Text style={styles.storyName} numberOfLines={1}>
                {story.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Post Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image source={{ uri: post.user.avatar }} style={styles.avatar} />
          <Text style={styles.username}>{post.user.name}</Text>
        </View>
        <Ionicons name="ellipsis-vertical" size={20} color="#333" />
      </View>

      {/* Swipeable Image Gallery */}
      <FlatList
        data={post.images}
        renderItem={({ item }) => <Image source={{ uri: item }} style={styles.postImage} />}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.imageGallery}
      />

      {/* Actions */}
      <View style={styles.actions}>
        <View style={styles.leftActions}>
          <Pressable onPress={handleLike} style={styles.iconButton}>
            <Animated.View style={animatedHeartStyle}>
              <Ionicons
                name={liked ? 'heart' : 'heart-outline'}
                size={26}
                color={liked ? '#ff0000' : '#000'}
              />
            </Animated.View>
          </Pressable>
          <Pressable style={styles.iconButton}>
            <Ionicons name="chatbubble-outline" size={26} color="#000" />
          </Pressable>
          <Pressable style={styles.iconButton}>
            <Ionicons name="paper-plane-outline" size={26} color="#000" />
          </Pressable>
        </View>
        <Pressable style={styles.iconButton}>
          <Ionicons name="bookmark-outline" size={26} color="#000" />
        </Pressable>
      </View>

      {/* Likes */}
      <Text style={styles.likes}>{likes.toLocaleString()} lượt thích</Text>

      {/* Caption */}
      <View style={styles.captionContainer}>
        <Text style={styles.username}>{post.user.name} </Text>
        <Text>{post.caption}</Text>
      </View>

      {/* Comments Link */}
      <Pressable style={styles.commentsLink}>
        <Text style={styles.comments}>Xem tất cả {post.comments.toLocaleString()} bình luận</Text>
      </Pressable>

      {/* Time and More */}
      <Text style={styles.time}>2 giờ trước</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  storiesContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  storyItem: {
    alignItems: 'center',
    marginRight: 15,
    width: STORY_SIZE,
  },
  storyAvatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    position: 'absolute',
    top: (STORY_SIZE - AVATAR_SIZE) / 2,
    left: (STORY_SIZE - AVATAR_SIZE) / 2,
    borderWidth: 2,
    borderColor: 'white',
  },
  storyName: {
    fontSize: 12,
    color: '#000',
    marginTop: 5,
    textAlign: 'center',
    maxWidth: STORY_SIZE,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  // Style for the FlatList container
  imageGallery: {
    width: width,
    height: 400, // Make sure the container has a height
  },
  // Style for each image, should match screen width
  postImage: {
    width: width,
    height: '100%',
    resizeMode: 'cover',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  leftActions: {
    flexDirection: 'row',
  },
  iconButton: {
    marginRight: 15,
  },
  likes: {
    fontWeight: 'bold',
    marginHorizontal: 10,
    marginTop: 5,
    fontSize: 16,
  },
  captionContainer: {
    marginHorizontal: 10,
    marginTop: 5,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  caption: {
    fontSize: 14,
  },
  commentsLink: {
    marginHorizontal: 10,
    marginTop: 5,
  },
  comments: {
    color: 'gray',
    fontSize: 14,
  },
  time: {
    color: 'gray',
    marginHorizontal: 10,
    marginTop: 5,
    fontSize: 12,
  },
});
