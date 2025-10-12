import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, Image } from 'react-native';

const NotificationsScreen = () => {
  const [notifications] = useState([
    {
      id: '1',
      icon: '❤️',
      title: '"Tim" yêu đề khen bơ!',
      time: '11 giờ trước',
      description: 'Lưu tin đăng đề xem lại đề dành vào dực giỏi món tuồng tửn.',
    },
    {
      id: '2',
      icon: '⭐',
      title: 'Tin đăng bị tủ chối',
      time: '22 giờ trước',
      description: 'Tin Bán chùa dực cấm do vi phạm Quy Định Đăng Tin của Tốt. Sua ngay!',
    },
    {
      id: '3',
      icon: '🔊',
      title: 'Sự kiện hôm này',
      time: 'Thứ 6, 12/09',
      description:
        'Tao thi khoai mỏi, nhan qua ngay! Xe máy diện, laptop, dien thoai, tai nghe cung rat nhieu voucher 500K dang cho ban do! Tham gia ngay!',
    },
    {
      id: '4',
      icon: '💰',
      title: 'Chớt phát đồng cuốc...',
      time: 'Thứ 6, 12/09',
      description: 'Ban lên tiền. Cho tiền lên! @ Tham gia cuộc đe 💰 Qua',
    },
  ]);

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{item.icon}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
      <Text style={styles.time}>{item.time}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Thông báo</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFD700',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  itemContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  icon: {
    fontSize: 20,
    color: '#000',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  time: {
    fontSize: 12,
    color: '#888',
  },
  separator: {
    height: 1,
    backgroundColor: '#ccc',
  },
});

export default NotificationsScreen;
