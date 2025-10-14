# 🔌 API Integration Guide - Admin Dashboard

## 📋 Tổng quan

Admin Dashboard đã được tích hợp đầy đủ với Backend API. Tài liệu này hướng dẫn cách sử dụng và troubleshoot các vấn đề API.

## 🚀 Cách chạy

### 1. Chạy Backend
```bash
cd backend
npm start
```
Backend sẽ chạy tại: `http://localhost:3000`

### 2. Chạy Admin Dashboard
```bash
cd admin
npm run dev
```
Admin Dashboard sẽ chạy tại: `http://localhost:5173`

## 🔗 API Endpoints

### Users API (`/nguoidung`)
- `GET /nguoidung/getAll` - Lấy danh sách tất cả người dùng
- `GET /nguoidung/get/:id` - Lấy thông tin người dùng theo ID
- `POST /nguoidung/create` - Tạo người dùng mới
- `PUT /nguoidung/update/:id` - Cập nhật thông tin người dùng
- `DELETE /nguoidung/delete/:id` - Xóa người dùng
- `POST /nguoidung/login` - Đăng nhập
- `GET /nguoidung/search` - Tìm kiếm người dùng

### Posts API (`/baidang`)
- `GET /baidang/getAll` - Lấy danh sách tất cả bài đăng
- `GET /baidang/getAllWithDetails` - Lấy bài đăng với thông tin chi tiết
- `GET /baidang/getById/:id` - Lấy bài đăng theo ID
- `GET /baidang/getByUserId/:userId` - Lấy bài đăng của người dùng
- `POST /baidang/create` - Tạo bài đăng mới
- `PUT /baidang/update/:id` - Cập nhật bài đăng
- `DELETE /baidang/delete/:id` - Xóa bài đăng
- `GET /baidang/search?keyword=...` - Tìm kiếm bài đăng

### Points API (`/lich_su_tich_diem`)
- `GET /lich_su_tich_diem/getAll` - Lấy lịch sử giao dịch điểm
- `GET /lich_su_tich_diem/getByUserId/:userId` - Lấy lịch sử điểm của người dùng
- `GET /lich_su_tich_diem/getOverallStats` - Thống kê tổng quan điểm
- `GET /lich_su_tich_diem/getUserStats/:userId` - Thống kê điểm của người dùng
- `POST /lich_su_tich_diem/addPoints` - Cộng/trừ điểm thủ công

### Categories API (`/danhmuc`)
- `GET /danhmuc/getAll` - Lấy danh sách danh mục
- `GET /danhmuc/getById/:id` - Lấy danh mục theo ID
- `POST /danhmuc/create` - Tạo danh mục mới
- `PUT /danhmuc/update/:id` - Cập nhật danh mục
- `DELETE /danhmuc/delete/:id` - Xóa danh mục

### Reports API (`/baocao`)
- `GET /baocao/getAll` - Lấy danh sách báo cáo
- `GET /baocao/getById/:id` - Lấy báo cáo theo ID
- `PUT /baocao/resolve/:id` - Xử lý báo cáo

## 🛠️ Cấu hình

### API Base URL
```typescript
// admin/src/config/api.ts
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3000',
  // ...
};
```

### Proxy Configuration
```typescript
// admin/vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
});
```

## 🔍 API Testing

### 1. Health Check
Admin Dashboard tự động kiểm tra kết nối API khi load:
- ✅ **Connected**: API hoạt động bình thường
- ❌ **Disconnected**: Không thể kết nối đến API

### 2. Manual Testing
```typescript
import { testApiConnection, healthCheck } from '../utils/apiTest';

// Test tất cả API endpoints
await testApiConnection();

// Test kết nối cơ bản
await healthCheck();
```

### 3. Browser Console
Mở Developer Tools (F12) để xem:
- API requests/responses
- Error messages
- Network status

## 🐛 Troubleshooting

### Lỗi thường gặp

#### 1. "Cannot connect to API"
**Nguyên nhân**: Backend không chạy hoặc sai port
**Giải pháp**:
- Kiểm tra backend có chạy tại `http://localhost:3000`
- Restart backend server
- Kiểm tra firewall/antivirus

#### 2. "CORS Error"
**Nguyên nhân**: CORS không được cấu hình đúng
**Giải pháp**:
- Backend đã có `cors()` middleware
- Kiểm tra `server.js` có `app.use(cors())`

#### 3. "404 Not Found"
**Nguyên nhân**: API endpoint không tồn tại
**Giải pháp**:
- Kiểm tra route trong `backend/routes/`
- Kiểm tra URL trong `admin/src/services/api.ts`

#### 4. "401 Unauthorized"
**Nguyên nhân**: Token không hợp lệ hoặc hết hạn
**Giải pháp**:
- Đăng nhập lại admin dashboard
- Kiểm tra localStorage có token không

### Debug Steps

1. **Kiểm tra Backend**:
   ```bash
   curl http://localhost:3000/nguoidung/getAll
   ```

2. **Kiểm tra Network Tab**:
   - Mở DevTools → Network
   - Reload admin dashboard
   - Xem API calls có thành công không

3. **Kiểm tra Console**:
   - Mở DevTools → Console
   - Xem error messages
   - Chạy `testApiConnection()` trong console

## 📊 API Response Format

### Success Response
```json
{
  "success": true,
  "data": [...],
  "message": "Success message"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error"
}
```

## 🔐 Authentication

### Current Implementation
- Demo authentication: `admin` / `admin123`
- Token stored in localStorage
- Auto-redirect to login on 401 error

### Future Enhancement
- JWT authentication với backend
- Role-based access control
- Session management

## 📱 API Usage Examples

### Get All Users
```typescript
import { userAPI } from '../services/api';

const users = await userAPI.getAll();
console.log(users.data);
```

### Add Points to User
```typescript
import { pointsAPI } from '../services/api';

await pointsAPI.addPoints({
  userId: 'user-id',
  pointChange: 100,
  transactionType: 'tang_diem',
  description: 'Admin cộng điểm',
});
```

### Search Posts
```typescript
import { postAPI } from '../services/api';

const posts = await postAPI.search('keyword');
console.log(posts.data);
```

## 🎯 Best Practices

1. **Error Handling**: Luôn wrap API calls trong try-catch
2. **Loading States**: Hiển thị loading khi gọi API
3. **User Feedback**: Hiển thị toast notifications
4. **Data Validation**: Validate data trước khi gửi API
5. **Caching**: Cache data khi có thể để giảm API calls

## 📞 Support

Nếu gặp vấn đề:
1. Kiểm tra backend có chạy không
2. Kiểm tra console errors
3. Kiểm tra network requests
4. Restart cả backend và frontend

## 🧪 Testing Commands

### Quick Test
```bash
cd admin
npm run quick-test
```

### Full API Test
```bash
cd admin
npm run test-api
```

### Manual Test
```bash
# Test users endpoint
curl http://localhost:3000/api/nguoidung/getAll

# Test posts endpoint  
curl http://localhost:3000/api/baidang/getAll

# Test points endpoint
curl http://localhost:3000/api/lich_su_tich_diem/getOverallStats
```

---

**🎉 Admin Dashboard đã sẵn sàng sử dụng với Backend API!**
