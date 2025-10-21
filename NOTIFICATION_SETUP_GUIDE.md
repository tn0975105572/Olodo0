# 🔔 Hướng Dẫn Thiết Lập Hệ Thống Thông Báo

## ✅ Đã Hoàn Thành

Hệ thống thông báo đã được tích hợp hoàn chỉnh với các tính năng:
- ❤️ Thông báo khi có người like bài đăng
- 💬 Thông báo khi có người bình luận
- 💌 Thông báo tin nhắn mới (ready to use)
- 🔔 Badge hiển thị số lượng thông báo chưa đọc
- ♻️ Auto-refresh mỗi 30 giây

---

## 📋 Bước 1: Chạy Migration Database

### Mở MySQL Workbench hoặc Terminal

```bash
cd backend
mysql -u root -p sv_cho < scripts/add_notification_sender.sql
```

Hoặc trong MySQL Workbench:
1. Mở file `backend/scripts/add_notification_sender.sql`
2. Chọn database `sv_cho`
3. Click Execute (⚡)

**Kết quả:** Sẽ thấy message "Migration completed successfully!"

---

## 📋 Bước 2: Kiểm Tra API Backend

### Đảm bảo backend server đang chạy:

```bash
cd backend
npm start
# hoặc
node server.js
```

### Test API:

```bash
cd backend
node test/test-notification-api.js
```

**Kết quả mong đợi:**
```
✅ Status: 200
📦 Response: {
  "success": true,
  "data": []
}
```

---

## 📋 Bước 3: Test Frontend Mobile App

### 1. Khởi động app:

```bash
cd BTL
npx expo start
```

### 2. Kiểm tra trong Console:

Khi mở màn hình thông báo, bạn sẽ thấy logs:
```
📡 Fetching notifications from: http://192.168.x.x:3000/api/thongbao/user/xxx
✅ Notifications loaded: { success: true, data: [...] }
```

### 3. Test các tính năng:

#### ✅ Xem thông báo:
1. Mở app
2. Click vào icon 🔔 ở header
3. Sẽ hiển thị danh sách thông báo

#### ✅ Tạo thông báo tự động:
1. Đăng nhập 2 tài khoản khác nhau
2. Tài khoản A: Đăng một bài viết
3. Tài khoản B: Like hoặc bình luận bài đó
4. Tài khoản A: Sẽ nhận thông báo ngay lập tức

#### ✅ Badge số lượng:
- Icon 🔔 sẽ hiển thị số lượng thông báo chưa đọc
- Tự động cập nhật mỗi 30 giây

---

## 🔧 Xử Lý Sự Cố

### ❌ Lỗi: "Network request failed"

**Nguyên nhân:** Frontend không kết nối được backend

**Giải pháp:**
1. Kiểm tra backend server đang chạy:
   ```bash
   netstat -ano | findstr :3000
   ```

2. Kiểm tra IP address trong console:
   ```bash
   cd BTL
   npx expo start
   # Xem dòng: [CONFIG] API URL: http://192.168.x.x:3000
   ```

3. Đảm bảo điện thoại và máy tính cùng Wi-Fi

4. Restart expo:
   ```bash
   # Tắt expo (Ctrl+C)
   cd BTL
   rm -rf .expo node_modules/.cache
   npx expo start --clear
   ```

### ❌ Lỗi: "Unknown column 'ten_nguoi_dung'"

**Nguyên nhân:** Đã được fix! Database sử dụng cột `ho_ten`

**Đã sửa:** Tất cả queries đã được cập nhật sử dụng `ho_ten`

### ❌ Không nhận được thông báo

**Kiểm tra:**

1. **Migration đã chạy chưa?**
   ```sql
   USE sv_cho;
   DESCRIBE thongbao;
   -- Phải có cột: ID_NguoiGui
   ```

2. **Backend có log lỗi không?**
   - Check terminal backend
   - Tìm dòng "Error creating notification"

3. **User ID có đúng không?**
   ```javascript
   // Trong console app
   console.log('User ID:', userId);
   ```

---

## 📊 Kiểm Tra Database

### Xem thông báo đã tạo:

```sql
USE sv_cho;

-- Xem tất cả thông báo
SELECT * FROM thongbao ORDER BY thoi_gian_tao DESC LIMIT 10;

-- Đếm thông báo chưa đọc của user
SELECT COUNT(*) FROM thongbao WHERE ID_NguoiDung = 'your-user-id' AND da_doc = 0;

-- Xem thông báo chi tiết với tên người gửi
SELECT 
  tb.*,
  nd.ho_ten as nguoi_gui
FROM thongbao tb
LEFT JOIN nguoidung nd ON tb.ID_NguoiGui = nd.ID_NguoiDung
WHERE tb.ID_NguoiDung = 'your-user-id'
ORDER BY tb.thoi_gian_tao DESC;
```

### Tạo thông báo test:

```sql
USE sv_cho;

INSERT INTO thongbao (
  ID_ThongBao,
  ID_NguoiDung,
  ID_NguoiGui,
  loai,
  noi_dung,
  lien_ket,
  da_doc
) VALUES (
  UUID(),
  'user-id-nhan-thong-bao',
  'user-id-gui-thong-bao',
  'phan_hoi_bai_dang',
  'Bạn có một thông báo test',
  '/test',
  0
);
```

---

## 🎯 API Endpoints Đã Có

| Endpoint | Method | Mô tả |
|----------|--------|-------|
| `/api/thongbao/user/:userId` | GET | Lấy thông báo của user |
| `/api/thongbao/unread/:userId` | GET | Đếm thông báo chưa đọc |
| `/api/thongbao/mark-read/:id` | PUT | Đánh dấu 1 thông báo đã đọc |
| `/api/thongbao/mark-all-read/:userId` | PUT | Đánh dấu tất cả đã đọc |
| `/api/thongbao/create` | POST | Tạo thông báo thủ công |

---

## 🚀 Tính Năng Tự Động

Thông báo được tự động tạo khi:

### ❤️ Like bài đăng
- File: `backend/controllers/likebaidang.js` (line 77)
- Trigger: POST `/api/likebaidang/create`
- Nội dung: "X đã thích bài đăng của bạn"

### 💬 Bình luận bài đăng  
- File: `backend/controllers/binhluanbaidang.js` (line 106)
- Trigger: POST `/api/binhluanbaidang/create`
- Nội dung: "X đã bình luận bài đăng của bạn"

### 💌 Tin nhắn (Ready - chưa tích hợp)
- File: `backend/models/thongbao.js` có function `createMessageNotification()`
- Chỉ cần gọi trong `tinnhan` controller khi gửi tin nhắn

---

## 📱 Frontend Components

### Màn hình thông báo
- File: `BTL/app/components/Home/thongbao.tsx`
- Features: Pull-to-refresh, đánh dấu đã đọc, hiển thị thời gian

### Badge trong header
- File: `BTL/app/(tabs)/home.tsx` (line 110-137)
- Auto-refresh: Mỗi 30 giây
- Hiển thị: Số lượng hoặc "99+"

### Service
- File: `BTL/services/notificationService.js`
- Methods: getByUserId, countUnread, markAsRead, markAllAsRead

---

## ✨ Hoàn Tất!

Hệ thống thông báo đã sẵn sàng sử dụng. Hãy test bằng cách:

1. ✅ Đăng nhập 2 tài khoản
2. ✅ Tạo bài đăng từ tài khoản A
3. ✅ Like/comment từ tài khoản B
4. ✅ Check thông báo ở tài khoản A
5. ✅ Xem badge số lượng cập nhật

---

## 📞 Cần Trợ Giúp?

- Check logs trong terminal (backend & expo)
- Run test: `node backend/test/test-notification-api.js`
- Check database: `SELECT * FROM thongbao;`

Good luck! 🎉



