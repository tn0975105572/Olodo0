import 'dotenv/config';
import os from 'os';

/**
 * Hàm lấy địa chỉ IPv4 LAN của máy
 * Dùng để thiết bị di động trong cùng Wi-Fi có thể gọi API.
 */
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const ifaceName of Object.keys(interfaces)) {
    for (const alias of interfaces[ifaceName] || []) {
      if (alias.family === 'IPv4' && !alias.internal) {
        return alias.address;
      }
    }
  }
  return 'localhost'; // fallback nếu không tìm thấy IP
}

// --- Cấu hình địa chỉ API ---
const ipAddress = getLocalIpAddress();
const port = process.env.PORT || 3000; // lấy từ env nếu có, mặc định 3000
const apiUrl = `http://${ipAddress}:${port}`;

// In ra terminal để debug
console.log('====================================================');
console.log(`[CONFIG] API URL: ${apiUrl}`);
console.log('[CONFIG] Điện thoại và máy tính phải chung mạng Wi-Fi');
console.log('====================================================');

// --- Cấu hình chính cho Expo ---
export default {
  expo: {
    name: 'OLODO',
    slug: 'OLODO',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/logo.png',
    scheme: 'OLODO',
    userInterfaceStyle: 'automatic',
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/logo.png',
        backgroundColor: '#ffffff',
      },
      permissions: [
        'android.permission.READ_EXTERNAL_STORAGE',
        'android.permission.WRITE_EXTERNAL_STORAGE',
        'android.permission.ACCESS_MEDIA_LOCATION',
        'android.permission.RECORD_AUDIO',
      ],
      package: 'com.anonymous.OLODO',
      usesCleartextTraffic: true, // Cho phép kết nối HTTP
      edgeToEdge: true, // ✅ Thêm để hết warning edge-to-edge
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/logo.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-media-library',
        {
          photosPermission: 'Cho phép $(PRODUCT_NAME) truy cập ảnh của bạn để bạn có thể tạo Tin.',
          savePhotosPermission: 'Cho phép $(PRODUCT_NAME) lưu ảnh vào thư viện của bạn.',
          isAccessMediaLocationEnabled: true,
        },
      ],
      [
        'expo-image-picker',
        {
          cameraPermission:
            'Cho phép $(PRODUCT_NAME) truy cập camera để bạn có thể chụp ảnh và quay video.',
        },
      ],
      [
        'expo-splash-screen',
        {
          image: './assets/images/logo.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
        },
      ],
      'expo-font',
    ],
    experiments: {
      typedRoutes: true,
    },
    updates: {
      fallbackToCacheTimeout: 0,
      url: process.env.EXPO_UPDATES_URL || '', // dùng cho OTA updates nếu có
    },
    runtimeVersion: {
      policy: 'appVersion', // đồng bộ với version
    },
    extra: {
      apiUrl: apiUrl,
      url_uploads: `${apiUrl}/uploads`,
      env: process.env.NODE_ENV || 'development',
    },
  },
};
