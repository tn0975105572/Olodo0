# 🐛 Debug: Tại Sao Gửi Tin Nhắn Không Tạo Thông Báo?

## ✅ Đã Xác Nhận:

1. ✅ Database có cột `ID_NguoiGui` 
2. ✅ Tạo thông báo thủ công thành công
3. ✅ Frontend có thể load thông báo
4. ✅ User tồn tại trong database

## ❌ Vấn Đề:

Khi gửi tin nhắn qua app mobile, backend **KHÔNG tự động tạo thông báo**.

---

## 🔍 Các Nguyên Nhân Có Thể:

### 1. Backend Server Không Chạy hoặc Crash

**Kiểm tra:**
```bash
cd backend
# Xem có process nào đang chạy không?
netstat -ano | findstr :3000
```

**Giải pháp:**
```bash
cd backend
node server.js
```

**Quan sát logs:**
- Khi gửi tin nhắn, phải thấy log:
  ```
  ✅ Thông báo tin nhắn đã được tạo cho user: xxx
  📡 Socket event emitted for user: xxx
  ```

- Nếu **KHÔNG** thấy logs trên → Backend không chạy đúng logic

---

### 2. API Tin Nhắn Không Được Gọi

**Kiểm tra:**
- Xem console frontend khi gửi tin nhắn
- Phải thấy request: `POST /api/tinnhan/send`

**Test thủ công:**
```bash
curl -X POST http://localhost:3000/api/tinnhan/send \
  -H "Content-Type: application/json" \
  -d '{
    "ID_NguoiGui": "000a9363-dead-4554-986d-9b9725cfd739",
    "ID_NguoiNhan": "1d22a4c4-ab8d-4d83-a997-f67671755820",
    "noi_dung": "Test message"
  }'
```

**Kết quả mong đợi:**
- Backend log: `✅ Thông báo tin nhắn đã được tạo`
- Database: Tăng 1 thông báo

---

### 3. req.io Không Tồn Tại

**Nguyên nhân**: Middleware chưa attach `io` vào `req`

**Kiểm tra file `server.js`:**
```javascript
// Dòng 104-107
app.use((req, res, next) => {
  req.io = io;  // ← Phải có dòng này!
  next();
});
```

**Giải pháp**: Đảm bảo middleware này được đăng ký TRƯỚC routes:
```javascript
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/api", routes); // ← Routes phải sau middleware
```

---

### 4. Error Bị Bắt và Không Throw

**Kiểm tra `backend/controllers/tinnhan.js` line 138-150:**

```javascript
// 🔔 Tạo thông báo cho tin nhắn riêng tư
if (messageData.ID_NguoiNhan && !messageData.ID_GroupChat) {
    try {
        await thongbao.createMessageNotification(
            messageData.ID_NguoiNhan,
            messageData.ID_NguoiGui,
            req.io  // ← Kiểm tra req.io có undefined không?
        );
        console.log('✅ Thông báo tin nhắn đã được tạo'); // ← Có thấy log này không?
    } catch (notifError) {
        console.error('❌ Lỗi tạo thông báo tin nhắn:', notifError);
        // ← Có log lỗi gì không?
    }
}
```

**Thêm log debug:**
```javascript
console.log('🔍 messageData:', messageData);
console.log('🔍 req.io:', req.io ? 'EXISTS' : 'UNDEFINED');

if (messageData.ID_NguoiNhan && !messageData.ID_GroupChat) {
    console.log('🔍 Điều kiện OK, tạo thông báo...');
    // ...
}
```

---

## 🧪 Test Step-by-Step:

### Bước 1: Kiểm Tra Backend Logs

```bash
cd backend
node server.js
```

**Quan sát khi start:**
```
🚀 Server đang chạy trên http://localhost:3000
✅ MySQL pool connected successfully
```

### Bước 2: Test API Thủ Công

**Mở terminal mới:**
```bash
cd backend
node test/test-send-message.js
```

**Tạo file test:**
```javascript
// backend/test/test-send-message.js
const http = require('http');

const messageData = {
  ID_NguoiGui: '000a9363-dead-4554-986d-9b9725cfd739',
  ID_NguoiNhan: '1d22a4c4-ab8d-4d83-a997-f67671755820',
  noi_dung: 'Test message from script'
};

const data = JSON.stringify(messageData);

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/tinnhan/send',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let responseData = '';
  res.on('data', (chunk) => { responseData += chunk; });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', responseData);
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(data);
req.end();
```

### Bước 3: Kiểm Tra Database

```bash
cd backend
node test/check-table-structure.js
```

**Xem số thông báo tăng:**
```
📈 Tổng số thông báo: 2  ← Phải tăng từ 1 lên 2
```

### Bước 4: Test Từ App

1. **Mở app mobile**
2. **Gửi tin nhắn**
3. **Xem backend terminal** → Phải thấy logs:
   ```
   ✅ Thông báo tin nhắn đã được tạo cho user: xxx
   📡 Socket event emitted for user: xxx
   ```

---

## 📊 Checklist Debug:

- [ ] Backend server đang chạy
- [ ] Port 3000 listening
- [ ] req.io được attach trong middleware
- [ ] Middleware được đăng ký trước routes
- [ ] Test API thủ công → Tạo được thông báo
- [ ] Backend logs hiện khi gửi tin nhắn
- [ ] Database tăng số thông báo
- [ ] Frontend nhận được thông báo

---

## ✅ Giải Pháp Nhanh:

### 1. Restart Backend:
```bash
# Ctrl+C để tắt
cd backend
node server.js
```

### 2. Kiểm Tra Middleware trong server.js:

**Phải có thứ tự này:**
```javascript
// 1. Socket.IO setup
const io = new Server(server, { cors: { origin: "*" } });

// 2. Middleware attach io
app.use((req, res, next) => {
  req.io = io;
  next();
});

// 3. Routes (PHẢI SAU middleware)
app.use("/api", routes);
```

### 3. Test Ngay:

```bash
# Terminal 1: Backend
cd backend
node server.js

# Terminal 2: Test
cd backend
node test/manual-create-notification.js

# Reload app mobile → Xem thông báo
```

---

## 📝 Ghi Nhớ:

**Thông báo đã được tạo thành công bằng script:**
- ✅ ID: `3c8a3264-a6ca-452e-9c62-aed45d9a8032`
- ✅ Nội dung: "Lan Mai đã gửi tin nhắn cho bạn (TEST MANUAL)"
- ✅ Reload app sẽ thấy!

**Vấn đề còn lại:**
- ❌ Gửi tin nhắn từ app không tự động tạo thông báo
- 🔧 Cần check backend logs khi gửi tin nhắn

---

Hãy restart backend server và test lại! 🚀



