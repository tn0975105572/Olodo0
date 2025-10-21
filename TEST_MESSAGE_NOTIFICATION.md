# 💌 Test Thông Báo Tin Nhắn

## ✅ Đã Hoàn Thành

Thông báo tin nhắn đã được tích hợp vào:
- ✅ `sendMessage` - Gửi tin nhắn text
- ✅ `uploadAndSendMessage` - Gửi tin nhắn với file đính kèm

## 🧪 Cách Test

### Bước 1: Restart Backend Server

```bash
# Tắt server hiện tại (Ctrl + C)
cd backend
node server.js
# hoặc
npm start
```

### Bước 2: Test Gửi Tin Nhắn

#### Cách 1: Dùng App Mobile

1. **Đăng nhập 2 tài khoản**:
   - Tài khoản A trên điện thoại/simulator 1
   - Tài khoản B trên điện thoại/simulator 2

2. **Tài khoản A: Gửi tin nhắn cho B**:
   - Mở danh sách tin nhắn
   - Chọn chat với tài khoản B
   - Gửi tin nhắn: "Hello!"

3. **Tài khoản B: Kiểm tra thông báo**:
   - Xem icon 🔔 ở header
   - Sẽ thấy badge số 1 xuất hiện
   - Click vào icon 🔔
   - Sẽ thấy thông báo: "Tên A đã gửi tin nhắn cho bạn"

#### Cách 2: Test API Trực Tiếp

**Gửi tin nhắn test:**

```bash
curl -X POST http://localhost:3000/api/tinnhan/send \
  -H "Content-Type: application/json" \
  -d '{
    "ID_NguoiGui": "user-id-1",
    "ID_NguoiNhan": "user-id-2",
    "noi_dung": "Test tin nhắn"
  }'
```

**Kiểm tra thông báo đã tạo:**

```bash
curl http://localhost:3000/api/thongbao/user/user-id-2
```

**Kết quả mong đợi:**

```json
{
  "success": true,
  "data": [
    {
      "ID_ThongBao": "uuid...",
      "ID_NguoiDung": "user-id-2",
      "ID_NguoiGui": "user-id-1",
      "loai": "tin_nhan",
      "noi_dung": "Tên người gửi đã gửi tin nhắn cho bạn",
      "lien_ket": "/chat/user-id-1",
      "da_doc": 0,
      "thoi_gian_tao": "2025-01-20T...",
      "nguoi_gui_ten": "Tên người gửi",
      "nguoi_gui_avatar": "..."
    }
  ]
}
```

### Bước 3: Kiểm Tra Backend Logs

Khi gửi tin nhắn, backend sẽ log:

```
✅ Thông báo tin nhắn đã được tạo cho user: user-id-2
```

Nếu có lỗi:

```
❌ Lỗi tạo thông báo tin nhắn: [error details]
```

## 🔍 Kiểm Tra Database

```sql
USE sv_cho;

-- Xem thông báo tin nhắn mới nhất
SELECT 
  tb.*,
  nd_gui.ho_ten as nguoi_gui,
  nd_nhan.ho_ten as nguoi_nhan
FROM thongbao tb
LEFT JOIN nguoidung nd_gui ON tb.ID_NguoiGui = nd_gui.ID_NguoiDung
LEFT JOIN nguoidung nd_nhan ON tb.ID_NguoiDung = nd_nhan.ID_NguoiDung
WHERE tb.loai = 'tin_nhan'
ORDER BY tb.thoi_gian_tao DESC
LIMIT 10;

-- Đếm thông báo tin nhắn chưa đọc
SELECT COUNT(*) 
FROM thongbao 
WHERE loai = 'tin_nhan' AND da_doc = 0;
```

## 📊 Luồng Hoạt Động

```
1. User A gửi tin nhắn cho User B
   ↓
2. Backend lưu tin nhắn vào database
   ↓
3. Backend tạo thông báo cho User B
   ↓
4. Backend gửi tin nhắn qua Socket.IO
   ↓
5. User B nhận thông báo real-time
   ↓
6. Badge số lượng trên icon 🔔 tăng lên
   ↓
7. User B click icon 🔔 xem thông báo
   ↓
8. Thông báo được đánh dấu đã đọc
```

## ⚙️ Cấu Hình

### Chỉ tạo thông báo cho:
- ✅ Tin nhắn riêng tư (1-1 chat)
- ❌ KHÔNG tạo cho tin nhắn group

### Điều kiện:
- Phải có `ID_NguoiNhan` (không null)
- Không có `ID_GroupChat` (null)
- Không gửi thông báo cho chính mình

## 🐛 Troubleshooting

### ❌ Không nhận được thông báo?

**1. Kiểm tra backend logs:**
```bash
# Xem có log "✅ Thông báo tin nhắn đã được tạo" không?
```

**2. Kiểm tra database:**
```sql
SELECT * FROM thongbao WHERE loai = 'tin_nhan' ORDER BY thoi_gian_tao DESC LIMIT 5;
```

**3. Kiểm tra API:**
```bash
curl http://localhost:3000/api/thongbao/unread/YOUR_USER_ID
```

**4. Kiểm tra User ID:**
```javascript
// Trong app, log user ID
const userInfo = await AsyncStorage.getItem('userInfo');
console.log('User Info:', JSON.parse(userInfo));
```

### ❌ Lỗi "Unknown column 'ho_ten'"?

Đã được fix! Tất cả queries đã dùng cột `ho_ten` đúng.

### ❌ Badge không cập nhật?

1. Reload app (nhấn 'r' trong Expo)
2. Badge tự động refresh mỗi 30 giây
3. Hoặc vào màn hình thông báo rồi quay lại

## ✨ Tính Năng Tự Động

Thông báo tự động tạo khi:

### 💌 Tin nhắn text
- **Endpoint:** POST `/api/tinnhan/send`
- **Controller:** `sendMessage()` - line 138-150
- **Thông báo:** "X đã gửi tin nhắn cho bạn"

### 📎 Tin nhắn với file
- **Endpoint:** POST `/api/tinnhan/upload-and-send`
- **Controller:** `uploadAndSendMessage()` - line 399-411
- **Thông báo:** "X đã gửi tin nhắn cho bạn"

## 🎯 Tổng Kết

**3 loại thông báo đã hoạt động:**

1. ❤️ **Like bài đăng**: "X đã thích bài đăng của bạn"
2. 💬 **Bình luận**: "X đã bình luận bài đăng của bạn"
3. 💌 **Tin nhắn**: "X đã gửi tin nhắn cho bạn"

**Badge số lượng:**
- Hiển thị tổng số thông báo chưa đọc
- Auto-refresh mỗi 30 giây
- Cập nhật ngay khi vào màn hình thông báo

---

## 🚀 Test Ngay!

1. ✅ Restart backend server
2. ✅ Reload app mobile
3. ✅ Đăng nhập 2 tài khoản
4. ✅ Gửi tin nhắn từ A → B
5. ✅ Check icon 🔔 của tài khoản B

**Thành công!** 🎉



