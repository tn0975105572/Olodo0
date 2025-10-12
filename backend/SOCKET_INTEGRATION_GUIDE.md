# 🚀 HƯỚNG DẪN TÍCH HỢP SOCKET.IO CHO CHAT

## 📋 **TỔNG QUAN**

Đã tích hợp Socket.io vào hệ thống chat với các tính năng:
- ✅ Real-time messaging
- ✅ Online/Offline status
- ✅ Typing indicators
- ✅ Message read receipts
- ✅ Group chat support
- ✅ Authentication & authorization
- ✅ Rate limiting
- ✅ Auto-reconnection

---

## 📁 **FILES ĐÃ TẠO/CẬP NHẬT**

### ✅ **Backend Files:**
- ✅ `socket/chatSocket.js` - Socket event handlers
- ✅ `socket/socketMiddleware.js` - Authentication & middleware
- ✅ `controllers/tinnhan.js` - **ĐÃ CẬP NHẬT** (tích hợp socket)
- ✅ `server.js` - **ĐÃ CẬP NHẬT** (cấu hình socket)

### ✅ **Frontend Files:**
- ✅ `client/socket-client.js` - Client-side socket integration

---

## 🔧 **CÀI ĐẶT**

### **1. Dependencies:**
```bash
npm install socket.io jsonwebtoken uuid
```

### **2. Environment Variables:**
```env
JWT_SECRET=your-jwt-secret-key
```

### **3. Database:**
Chạy file `simple_tinnhan_with_group.sql` để tạo bảng `trang_thai_hoat_dong`

---

## 🎮 **SOCKET EVENTS**

### **📥 Client → Server Events:**

#### **Authentication:**
```javascript
socket.emit('user_login', { userId: 'user-id' });
socket.emit('user_logout');
```

#### **Chat Management:**
```javascript
// Tham gia chat
socket.emit('join_chat', {
  userId: 'user-id',
  chatType: 'private', // hoặc 'group'
  chatId: 'chat-id'
});

// Rời chat
socket.emit('leave_chat', {
  chatType: 'private',
  chatId: 'chat-id'
});
```

#### **Messaging:**
```javascript
// Gửi tin nhắn
socket.emit('send_message', {
  ID_NguoiGui: 'user-id',
  ID_NguoiNhan: 'receiver-id', // cho chat 1-1
  ID_GroupChat: 'group-id', // cho group chat
  noi_dung: 'Hello!',
  loai_tin_nhan: 'text',
  file_dinh_kem: 'file-url',
  tin_nhan_phu_thuoc: 'reply-message-id'
});

// Đánh dấu đã đọc
socket.emit('mark_read', {
  userId: 'user-id',
  chatType: 'private',
  chatId: 'chat-id'
});
```

#### **Typing Indicators:**
```javascript
socket.emit('typing_start', {
  userId: 'user-id',
  chatType: 'private',
  chatId: 'chat-id'
});

socket.emit('typing_stop', {
  userId: 'user-id',
  chatType: 'private',
  chatId: 'chat-id'
});
```

#### **Status Updates:**
```javascript
socket.emit('update_status', {
  status: 'online' // online, away, busy, offline
});
```

### **📤 Server → Client Events:**

#### **System Events:**
```javascript
// Kết nối thành công
socket.on('login_success', (data) => {
  console.log('Login successful:', data);
});

// Tham gia chat thành công
socket.on('join_success', (data) => {
  console.log('Joined chat:', data);
});

// Lỗi
socket.on('error', (data) => {
  console.error('Error:', data);
});
```

#### **Messaging Events:**
```javascript
// Tin nhắn mới
socket.on('new_message', (data) => {
  console.log('New message:', data);
  // data.message chứa thông tin tin nhắn
  // data.type: 'private' hoặc 'group'
});

// Tin nhắn đã được đọc
socket.on('message_read', (data) => {
  console.log('Message read:', data);
});

// Gửi tin nhắn thành công
socket.on('message_sent', (data) => {
  console.log('Message sent:', data);
});
```

#### **Typing Events:**
```javascript
socket.on('typing_start', (data) => {
  console.log('User typing:', data);
  // Hiển thị typing indicator
});

socket.on('typing_stop', (data) => {
  console.log('User stopped typing:', data);
  // Ẩn typing indicator
});
```

#### **Status Events:**
```javascript
// Trạng thái bạn bè thay đổi
socket.on('friend_status_change', (data) => {
  console.log('Friend status:', data);
  // data.userId, data.status
});

// Trạng thái đã cập nhật
socket.on('status_updated', (data) => {
  console.log('Status updated:', data);
});
```

#### **Notifications:**
```javascript
socket.on('notification', (data) => {
  console.log('Notification:', data);
  // Hiển thị notification
});
```

---

## 💻 **CLIENT-SIDE INTEGRATION**

### **1. Khởi tạo Client:**
```javascript
const chatClient = new ChatSocketClient();
const token = 'your-jwt-token';
const userId = 'user-id';

// Kết nối
chatClient.connect(token, userId);
```

### **2. Event Handlers:**
```javascript
// Kết nối thành công
chatClient.on('connected', () => {
  console.log('Connected to chat server');
  chatClient.login(userId);
});

// Tin nhắn mới
chatClient.on('new_message', (data) => {
  displayNewMessage(data.message);
});

// Typing indicator
chatClient.on('typing_start', (data) => {
  showTypingIndicator(data.userId);
});

chatClient.on('typing_stop', (data) => {
  hideTypingIndicator(data.userId);
});
```

### **3. Gửi Tin Nhắn:**
```javascript
// Chat 1-1
chatClient.sendMessage({
  ID_NguoiNhan: 'receiver-id',
  noi_dung: 'Hello!',
  loai_tin_nhan: 'text'
});

// Group chat
chatClient.sendMessage({
  ID_GroupChat: 'group-id',
  noi_dung: 'Hello group!',
  loai_tin_nhan: 'text'
});
```

### **4. Tham Gia Chat:**
```javascript
// Chat 1-1
chatClient.joinChat('private', otherUserId);

// Group chat
chatClient.joinChat('group', groupId);
```

### **5. Typing Indicator:**
```javascript
let typingTimer;

function onTypingStart() {
  chatClient.startTyping('private', chatId);
  
  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => {
    chatClient.stopTyping('private', chatId);
  }, 3000);
}
```

---

## 🔐 **AUTHENTICATION**

### **JWT Token Required:**
```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### **Token Format:**
```javascript
{
  userId: 'user-id',
  iat: timestamp,
  exp: timestamp
}
```

---

## 🛡️ **SECURITY FEATURES**

### **1. Rate Limiting:**
- 100 events/phút per socket
- Tự động disconnect nếu vượt quá

### **2. Authentication:**
- JWT token validation
- User existence check

### **3. Authorization:**
- Room access control
- Group membership verification

### **4. Input Validation:**
- Message content validation
- Chat type verification

---

## 📱 **REAL-TIME FEATURES**

### **1. Online Status:**
```javascript
// Cập nhật trạng thái
chatClient.updateStatus('online');

// Nhận thông báo trạng thái bạn bè
chatClient.on('friend_status_change', (data) => {
  updateFriendStatus(data.userId, data.status);
});
```

### **2. Typing Indicators:**
```javascript
// Bắt đầu typing
chatClient.startTyping('private', chatId);

// Dừng typing (tự động sau 3s)
chatClient.stopTyping('private', chatId);
```

### **3. Read Receipts:**
```javascript
// Đánh dấu đã đọc
chatClient.markAsRead('private', chatId);

// Nhận thông báo đã đọc
chatClient.on('message_read', (data) => {
  updateReadStatus(data);
});
```

---

## 🔄 **AUTO-RECONNECTION**

Client tự động kết nối lại với exponential backoff:
- Attempt 1: 1s
- Attempt 2: 2s
- Attempt 3: 4s
- Attempt 4: 8s
- Attempt 5: 16s

```javascript
chatClient.on('reconnect_failed', () => {
  console.log('Failed to reconnect');
  // Hiển thị thông báo lỗi
});
```

---

## 🎯 **ROOM MANAGEMENT**

### **Room Names:**
- Private chat: `private_user1_user2` (sorted)
- Group chat: `group_groupId`
- User room: `user_userId`

### **Join/Leave:**
```javascript
// Tự động join user room khi login
socket.join(`user_${userId}`);

// Join chat room
socket.join(`private_${chatId}`);
socket.join(`group_${groupId}`);
```

---

## 📊 **MONITORING**

### **Server Logs:**
```javascript
// Connection logs
console.log('✅ Socket connected:', socket.id, 'User:', socket.userInfo?.ho_ten);
console.log('❌ Socket disconnected:', socket.id);

// Event logs
console.log('📤 Socket emit:', event, data);
console.log('📥 Socket received:', event, data);
```

### **Client Status:**
```javascript
const status = chatClient.getConnectionStatus();
console.log(status);
// { isConnected: true, reconnectAttempts: 0, socketId: 'abc123' }
```

---

## 🚀 **DEPLOYMENT**

### **Production Considerations:**
1. **CORS Configuration:**
```javascript
const io = new Server(server, {
  cors: {
    origin: "https://yourdomain.com",
    methods: ["GET", "POST"]
  }
});
```

2. **Rate Limiting:**
```javascript
io.use(socketRateLimit(50, 60000)); // 50 events/phút cho production
```

3. **Redis Adapter (cho multiple servers):**
```bash
npm install @socket.io/redis-adapter redis
```

```javascript
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');

const pubClient = createClient({ host: 'localhost', port: 6379 });
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));
```

---

## ✅ **TESTING**

### **Test Socket Connection:**
```javascript
// Test basic connection
const testSocket = io('http://localhost:3000', {
  auth: { token: 'test-token' }
});

testSocket.on('connect', () => {
  console.log('✅ Socket connection test passed');
});

testSocket.on('connect_error', (error) => {
  console.error('❌ Socket connection test failed:', error);
});
```

### **Test Chat Flow:**
```javascript
// 1. Login
testSocket.emit('user_login', { userId: 'test-user' });

// 2. Join chat
testSocket.emit('join_chat', {
  userId: 'test-user',
  chatType: 'private',
  chatId: 'other-user'
});

// 3. Send message
testSocket.emit('send_message', {
  ID_NguoiGui: 'test-user',
  ID_NguoiNhan: 'other-user',
  noi_dung: 'Test message'
});

// 4. Check response
testSocket.on('new_message', (data) => {
  console.log('✅ Message test passed:', data);
});
```

---

## 🎉 **KẾT LUẬN**

Hệ thống Socket.io đã được tích hợp hoàn chỉnh với:
- ✅ Real-time messaging
- ✅ Authentication & security
- ✅ Auto-reconnection
- ✅ Typing indicators
- ✅ Read receipts
- ✅ Online status
- ✅ Group chat support
- ✅ Rate limiting
- ✅ Error handling

**Chat system giờ đây đã có đầy đủ tính năng real-time!** 🚀

