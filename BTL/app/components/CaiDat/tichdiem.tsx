import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig!.extra!.apiUrl as string;

interface UserInfo {
  ID_NguoiDung: string;
  ho_ten?: string;
  diem_so?: number;
}

interface PointHistory {
  ID_LichSu: string;
  loai_giao_dich: string;
  diem_thay_doi: number;
  diem_truoc: number;
  diem_sau: number;
  mo_ta: string;
  thoi_gian_tao: string;
}

const TichDiemScreen = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [pointHistory, setPointHistory] = useState<PointHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadUserData = useCallback(async () => {
    try {
      const userJson = await AsyncStorage.getItem('userInfo');
      if (userJson) {
        const userData = JSON.parse(userJson);
        setUserInfo(userData);
      }
    } catch (error) {
      console.error('Lỗi khi tải thông tin người dùng:', error);
    }
  }, []);

  const loadPointHistory = useCallback(async () => {
    if (!userInfo?.ID_NguoiDung) return;

    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(
        `${API_BASE_URL}/api/lich_su_tich_diem/getByUserId/${userInfo.ID_NguoiDung}?limit=20`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPointHistory(data);
      }
    } catch (error) {
      console.error('Lỗi khi tải lịch sử điểm:', error);
    }
  }, [userInfo?.ID_NguoiDung]);

  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([loadUserData(), loadPointHistory()]);
    setIsRefreshing(false);
  }, [loadUserData, loadPointHistory]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await loadUserData();
      setIsLoading(false);
    };
    loadData();
  }, [loadUserData]);

  // Tự động refresh khi focus vào trang
  useFocusEffect(
    useCallback(() => {
      if (userInfo?.ID_NguoiDung) {
        loadPointHistory();
      }
    }, [userInfo?.ID_NguoiDung, loadPointHistory])
  );

  useEffect(() => {
    if (userInfo) {
      loadPointHistory();
    }
  }, [userInfo, loadPointHistory]);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'dang_bai':
        return 'create-outline';
      case 'like':
        return 'heart-outline';
      case 'binh_luan':
        return 'chatbubble-outline';
      case 'nhan_like':
        return 'heart';
      case 'nhan_binh_luan':
        return 'chatbubble';
      case 'tang_diem':
        return 'gift-outline';
      default:
        return 'ellipse-outline';
    }
  };

  const getTransactionColor = (type: string, change: number) => {
    if (change > 0) return '#4CAF50';
    if (change < 0) return '#F44336';
    return '#FF9800';
  };

  const getTransactionText = (type: string) => {
    switch (type) {
      case 'dang_bai':
        return 'Đăng bài';
      case 'like':
        return 'Like bài đăng';
      case 'binh_luan':
        return 'Bình luận';
      case 'nhan_like':
        return 'Nhận like';
      case 'nhan_binh_luan':
        return 'Nhận bình luận';
      case 'tang_diem':
        return 'Điểm thưởng';
      default:
        return 'Giao dịch khác';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#791228" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={refreshData} />
      }
    >
      {/* Header với điểm hiện tại */}
      <View style={styles.header}>
        <View style={styles.pointCard}>
          <View style={styles.pointIcon}>
            <Ionicons name="star" size={32} color="#FFD700" />
          </View>
          <View style={styles.pointInfo}>
            <Text style={styles.pointLabel}>Điểm hiện tại</Text>
            <Text style={styles.pointValue}>{userInfo?.diem_so || 0}</Text>
          </View>
        </View>
      </View>

      {/* Thông tin về hệ thống điểm */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Cách kiếm điểm</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoItem}>
            <Ionicons name="create-outline" size={20} color="#F44336" />
            <Text style={styles.infoText}>Đăng bài: -20 điểm</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="heart-outline" size={20} color="#4CAF50" />
            <Text style={styles.infoText}>Like bài đăng: +2 điểm</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="chatbubble-outline" size={20} color="#4CAF50" />
            <Text style={styles.infoText}>Bình luận: +5 điểm</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="heart" size={20} color="#4CAF50" />
            <Text style={styles.infoText}>Nhận like: +3 điểm</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="chatbubble" size={20} color="#4CAF50" />
            <Text style={styles.infoText}>Nhận bình luận: +10 điểm</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="play-circle-outline" size={20} color="#FF9800" />
            <Text style={styles.infoText}>Xem video quảng cáo: +100 điểm</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="gift-outline" size={20} color="#FF9800" />
            <Text style={styles.infoText}>Điểm thưởng hàng ngày: +200 điểm</Text>
          </View>
        </View>
      </View>

      {/* Lịch sử giao dịch */}
      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>Lịch sử giao dịch</Text>
        {pointHistory.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Chưa có giao dịch nào</Text>
          </View>
        ) : (
          <View style={styles.historyList}>
            {pointHistory.map((item) => (
              <View key={item.ID_LichSu} style={styles.historyItem}>
                <View style={styles.historyIcon}>
                  <Ionicons
                    name={getTransactionIcon(item.loai_giao_dich) as any}
                    size={24}
                    color={getTransactionColor(item.loai_giao_dich, item.diem_thay_doi)}
                  />
                </View>
                <View style={styles.historyContent}>
                  <Text style={styles.historyTitle}>
                    {getTransactionText(item.loai_giao_dich)}
                  </Text>
                  <Text style={styles.historyDescription}>{item.mo_ta}</Text>
                  <Text style={styles.historyTime}>
                    {new Date(item.thoi_gian_tao).toLocaleString('vi-VN')}
                  </Text>
                </View>
                <View style={styles.historyPoints}>
                  <Text
                    style={[
                      styles.pointsChange,
                      {
                        color: getTransactionColor(item.loai_giao_dich, item.diem_thay_doi),
                      },
                    ]}
                  >
                    {item.diem_thay_doi > 0 ? '+' : ''}{item.diem_thay_doi}
                  </Text>
                  <Text style={styles.pointsAfter}>{item.diem_sau}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  header: {
    padding: 20,
    backgroundColor: '#791228',
  },
  pointCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pointIcon: {
    marginRight: 16,
  },
  pointInfo: {
    flex: 1,
  },
  pointLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  pointValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#791228',
  },
  infoSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#333',
  },
  historySection: {
    padding: 20,
    paddingTop: 0,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
  historyList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyIcon: {
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  historyDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  historyTime: {
    fontSize: 12,
    color: '#999',
  },
  historyPoints: {
    alignItems: 'flex-end',
  },
  pointsChange: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  pointsAfter: {
    fontSize: 12,
    color: '#999',
  },
});

export default TichDiemScreen;




