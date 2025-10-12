# 📱 API TIN NHẮN - DOCUMENTATION

## 🔗 **BASE URL**
```
http://localhost:3000/tinnhan
```

---

## 📋 **DANH SÁCH TẤT CẢ API ENDPOINTS**

### 1. **GET /tinnhan/getAll**
**Mô tả:** Lấy tất cả tin nhắn trong hệ thống
**Method:** GET
**URL:** `GET /tinnhan/getAll`
**Headers:** 
```
Content-Type: application/json
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "ID_TinNhan": "uuid",
      "ID_NguoiGui": "user-id",
      "ID_NguoiNhan": "user-id",
      "ID_GroupChat": null,
      "noi_dung": "Nội dung tin nhắn",
      "loai_tin_nhan": "text",
      "trang_thai": "da_gui",
      "thoi_gian_gui": "2024-01-01T10:00:00.000Z",
      "thoi_gian_doc": null,
      "da_xoa_gui": 0,
      "da_edit": 0,
      "file_dinh_kem": null,
      "tin_nhan_phu_thuoc": null
    }
  ],
  "message": "Lấy danh sách tin nhắn thành công"
}
```

---

### 2. **GET /tinnhan/getById/:id**
**Mô tả:** Lấy tin nhắn theo ID cụ thể
**Method:** GET
**URL:** `GET /tinnhan/getById/{messageId}`
**Parameters:**
- `id` (path): ID của tin nhắn cần lấy
**Example:** `GET /tinnhan/getById/abc123-def456-ghi789`
**Response:**
```json
{
  "success": true,
  "data": {
    "ID_TinNhan": "abc123-def456-ghi789",
    "ID_NguoiGui": "user-1",
    "ID_NguoiNhan": "user-2",
    "noi_dung": "Tin nhắn cụ thể",
    "loai_tin_nhan": "text",
    "trang_thai": "da_doc",
    "thoi_gian_gui": "2024-01-01T10:00:00.000Z",
    "thoi_gian_doc": "2024-01-01T10:05:00.000Z"
  },
  "message": "Lấy tin nhắn thành công"
}
```

---

### 3. **GET /tinnhan/private/:user1Id/:user2Id**
**Mô tả:** Lấy tin nhắn giữa 2 người (chat 1-1)
**Method:** GET
**URL:** `GET /tinnhan/private/{user1Id}/{user2Id}`
**Parameters:**
- `user1Id` (path): ID người dùng thứ nhất
- `user2Id` (path): ID người dùng thứ hai
**Query Parameters:**
- `limit` (optional): Số lượng tin nhắn tối đa (default: 50)
- `offset` (optional): Vị trí bắt đầu (default: 0)
**Example:** `GET /tinnhan/private/user1/user2?limit=20&offset=0`
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "ID_TinNhan": "msg-1",
      "ID_NguoiGui": "user1",
      "ID_NguoiNhan": "user2",
      "noi_dung": "Xin chào!",
      "trang_thai": "da_doc",
      "thoi_gian_gui": "2024-01-01T10:00:00.000Z"
    }
  ],
  "message": "Lấy tin nhắn riêng tư thành công"
}
```

---

### 4. **GET /tinnhan/group/:groupId/:userId**
**Mô tả:** Lấy tin nhắn trong group chat
**Method:** GET
**URL:** `GET /tinnhan/group/{groupId}/{userId}`
**Parameters:**
- `groupId` (path): ID của group chat
- `userId` (path): ID người dùng (để kiểm tra quyền truy cập)
**Query Parameters:**
- `limit` (optional): Số lượng tin nhắn tối đa (default: 50)
- `offset` (optional): Vị trí bắt đầu (default: 0)
**Example:** `GET /tinnhan/group/group123/user456?limit=30&offset=0`
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "ID_TinNhan": "group-msg-1",
      "ID_NguoiGui": "user1",
      "ID_GroupChat": "group123",
      "noi_dung": "Chào mọi người!",
      "trang_thai": "da_gui",
      "thoi_gian_gui": "2024-01-01T10:00:00.000Z"
    }
  ],
  "message": "Lấy tin nhắn group thành công"
}
```

---

### 5. **GET /tinnhan/conversations/:userId**
**Mô tả:** Lấy danh sách cuộc trò chuyện của user
**Method:** GET
**URL:** `GET /tinnhan/conversations/{userId}`
**Parameters:**
- `userId` (path): ID người dùng
**Example:** `GET /tinnhan/conversations/user123`
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "conversation_id": "user456",
      "conversation_type": "private",
      "conversation_name": "Nguyễn Văn A",
      "conversation_avatar": "avatar-url",
      "last_message": "Tin nhắn cuối cùng",
      "last_message_time": "2024-01-01T10:00:00.000Z",
      "unread_count": 3
    },
    {
      "conversation_id": "group789",
      "conversation_type": "group",
      "conversation_name": "Nhóm bạn bè",
      "conversation_avatar": "group-avatar-url",
      "last_message": "Tin nhắn group cuối",
      "last_message_time": "2024-01-01T09:30:00.000Z",
      "unread_count": 1
    }
  ],
  "message": "Lấy danh sách cuộc trò chuyện thành công"
}
```

---

### 6. **GET /tinnhan/unread/:userId**
**Mô tả:** Đếm số tin nhắn chưa đọc của user
**Method:** GET
**URL:** `GET /tinnhan/unread/{userId}`
**Parameters:**
- `userId` (path): ID người dùng
**Example:** `GET /tinnhan/unread/user123`
**Response:**
```json
{
  "success": true,
  "data": {
    "unread_private": 5,
    "unread_group": 3,
    "total_unread": 8
  },
  "message": "Lấy số tin nhắn chưa đọc thành công"
}
```

---

### 7. **POST /tinnhan/upload**
**Mô tả:** Upload file cho tin nhắn (hình ảnh, file đính kèm)
**Method:** POST
**URL:** `POST /tinnhan/upload`
**Content-Type:** `multipart/form-data`
**Body:**
```
file: [File object]
```
**Response:**
```json
{
  "success": true,
  "filename": "msg-uuid-generated.jpg",
  "message": "Upload file thành công"
}
```

---

### 8. **POST /tinnhan/send**
**Mô tả:** Gửi tin nhắn mới
**Method:** POST
**URL:** `POST /tinnhan/send`
**Headers:**
```
Content-Type: application/json
```
**Body (Chat 1-1):**
```json
{
  "ID_NguoiGui": "user123",
  "ID_NguoiNhan": "user456",
  "noi_dung": "Nội dung tin nhắn",
  "loai_tin_nhan": "text",
  "file_dinh_kem": null,
  "tin_nhan_phu_thuoc": null
}
```
**Body (Group Chat):**
```json
{
  "ID_NguoiGui": "user123",
  "ID_GroupChat": "group789",
  "noi_dung": "Tin nhắn group",
  "loai_tin_nhan": "text",
  "file_dinh_kem": null,
  "tin_nhan_phu_thuoc": null
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "messageId": "new-message-uuid",
    "message": {
      "ID_TinNhan": "new-message-uuid",
      "ID_NguoiGui": "user123",
      "noi_dung": "Nội dung tin nhắn",
      "trang_thai": "da_gui",
      "thoi_gian_gui": "2024-01-01T10:00:00.000Z"
    }
  },
  "message": "Gửi tin nhắn thành công"
}
```

---

### 9. **PUT /tinnhan/update/:id**
**Mô tả:** Cập nhật tin nhắn (chỉnh sửa)
**Method:** PUT
**URL:** `PUT /tinnhan/update/{messageId}`
**Parameters:**
- `id` (path): ID tin nhắn cần cập nhật
**Headers:**
```
Content-Type: application/json
```
**Body:**
```json
{
  "noi_dung": "Nội dung tin nhắn đã chỉnh sửa",
  "userId": "user123"
}
```
**Example:** `PUT /tinnhan/update/msg123`
**Response:**
```json
{
  "success": true,
  "message": "Cập nhật tin nhắn thành công"
}
```

---

### 10. **DELETE /tinnhan/delete/:id**
**Mô tả:** Xóa tin nhắn (soft delete cho người gửi)
**Method:** DELETE
**URL:** `DELETE /tinnhan/delete/{messageId}`
**Parameters:**
- `id` (path): ID tin nhắn cần xóa
**Headers:**
```
Content-Type: application/json
```
**Body:**
```json
{
  "userId": "user123"
}
```
**Example:** `DELETE /tinnhan/delete/msg123`
**Response:**
```json
{
  "success": true,
  "message": "Xóa tin nhắn thành công"
}
```

---

### 11. **POST /tinnhan/mark-read**
**Mô tả:** Đánh dấu tin nhắn đã đọc (chat 1-1)
**Method:** POST
**URL:** `POST /tinnhan/mark-read`
**Headers:**
```
Content-Type: application/json
```
**Body:**
```json
{
  "userId": "user123",
  "senderId": "user456"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "markedCount": 5
  },
  "message": "Đánh dấu đã đọc thành công"
}
```

---

### 12. **POST /tinnhan/mark-group-read**
**Mô tả:** Đánh dấu tin nhắn group đã đọc
**Method:** POST
**URL:** `POST /tinnhan/mark-group-read`
**Headers:**
```
Content-Type: application/json
```
**Body:**
```json
{
  "userId": "user123",
  "groupId": "group789"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "markedCount": 3
  },
  "message": "Đánh dấu đã đọc thành công"
}
```

---

## 🔌 **SOCKET.IO EVENTS**

### **Client → Server Events:**

#### 1. **user_login**
```javascript
socket.emit('user_login', {
  userId: 'user123'
});
```

#### 2. **user_logout**
```javascript
socket.emit('user_logout');
```

#### 3. **join_chat**
```javascript
// Join private chat
socket.emit('join_chat', {
  userId: 'user123',
  chatType: 'private',
  chatId: 'user456'
});

// Join group chat
socket.emit('join_chat', {
  userId: 'user123',
  chatType: 'group',
  chatId: 'group789'
});
```

#### 4. **leave_chat**
```javascript
socket.emit('leave_chat', {
  chatType: 'private',
  chatId: 'user456'
});
```

#### 5. **send_message**
```javascript
// Private message
socket.emit('send_message', {
  ID_NguoiGui: 'user123',
  ID_NguoiNhan: 'user456',
  noi_dung: 'Hello!',
  loai_tin_nhan: 'text'
});

// Group message
socket.emit('send_message', {
  ID_NguoiGui: 'user123',
  ID_GroupChat: 'group789',
  noi_dung: 'Hello group!',
  loai_tin_nhan: 'text'
});
```

#### 6. **mark_read**
```javascript
socket.emit('mark_read', {
  userId: 'user123',
  chatType: 'private',
  chatId: 'user456'
});
```

#### 7. **typing_start**
```javascript
socket.emit('typing_start', {
  chatType: 'private',
  chatId: 'user456',
  userId: 'user123'
});
```

#### 8. **typing_stop**
```javascript
socket.emit('typing_stop', {
  chatType: 'private',
  chatId: 'user456',
  userId: 'user123'
});
```

#### 9. **update_status**
```javascript
socket.emit('update_status', {
  status: 'online' // online, away, busy, offline
});
```

### **Server → Client Events:**

#### 1. **login_success**
```javascript
socket.on('login_success', (data) => {
  console.log(data); // { userId: 'user123', socketId: 'socket-id' }
});
```

#### 2. **join_success**
```javascript
socket.on('join_success', (data) => {
  console.log(data); // { chatType: 'private', chatId: 'user456' }
});
```

#### 3. **new_message**
```javascript
socket.on('new_message', (data) => {
  console.log(data); // { type: 'private', message: {...}, senderId: 'user123' }
});
```

#### 4. **message_sent**
```javascript
socket.on('message_sent', (data) => {
  console.log(data); // { messageId: 'msg-uuid' }
});
```

#### 5. **message_read**
```javascript
socket.on('message_read', (data) => {
  console.log(data); // { receiverId: 'user456', chatId: 'user123' }
});
```

#### 6. **mark_read_success**
```javascript
socket.on('mark_read_success', (data) => {
  console.log(data); // { chatType: 'private', chatId: 'user456' }
});
```

#### 7. **typing_start**
```javascript
socket.on('typing_start', (data) => {
  console.log(data); // { userId: 'user123', chatType: 'private', chatId: 'user456' }
});
```

#### 8. **typing_stop**
```javascript
socket.on('typing_stop', (data) => {
  console.log(data); // { userId: 'user123', chatType: 'private', chatId: 'user456' }
});
```

#### 9. **status_updated**
```javascript
socket.on('status_updated', (data) => {
  console.log(data); // { status: 'online' }
});
```

#### 10. **friend_status_change**
```javascript
socket.on('friend_status_change', (data) => {
  console.log(data); // { userId: 'user123', status: 'online' }
});
```

#### 11. **notification**
```javascript
socket.on('notification', (data) => {
  console.log(data); // { type: 'new_message', message: {...}, senderId: 'user123' }
});
```

#### 12. **error**
```javascript
socket.on('error', (error) => {
  console.log(error); // { message: 'Error description' }
});
```

---

## 📝 **LOẠI TIN NHẮN (loai_tin_nhan)**
- `text`: Tin nhắn văn bản
- `image`: Tin nhắn hình ảnh
- `file`: Tin nhắn file đính kèm
- `audio`: Tin nhắn âm thanh
- `video`: Tin nhắn video
- `sticker`: Tin nhắn sticker
- `location`: Tin nhắn vị trí

---

## 📊 **TRẠNG THÁI TIN NHẮN (trang_thai)**
- `da_gui`: Đã gửi
- `da_doc`: Đã đọc
- `da_nhan`: Đã nhận (chưa đọc)

---

## ⚠️ **ERROR CODES**
- `400`: Bad Request - Thiếu thông tin bắt buộc
- `401`: Unauthorized - Không có quyền truy cập
- `403`: Forbidden - Không phải thành viên group
- `404`: Not Found - Tin nhắn/User không tồn tại
- `500`: Internal Server Error - Lỗi máy chủ

---

## 🧪 **TESTING EXAMPLES**

### **Test với cURL:**

```bash
# Lấy tất cả tin nhắn
curl -X GET http://localhost:3000/tinnhan/getAll

# Lấy tin nhắn theo ID
curl -X GET http://localhost:3000/tinnhan/getById/msg123

# Lấy tin nhắn chat 1-1
curl -X GET "http://localhost:3000/tinnhan/private/user1/user2?limit=20&offset=0"

# Gửi tin nhắn
curl -X POST http://localhost:3000/tinnhan/send \
  -H "Content-Type: application/json" \
  -d '{
    "ID_NguoiGui": "user123",
    "ID_NguoiNhan": "user456",
    "noi_dung": "Hello!",
    "loai_tin_nhan": "text"
  }'

# Đánh dấu đã đọc
curl -X POST http://localhost:3000/tinnhan/mark-read \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "senderId": "user456"
  }'
```

### **Test với JavaScript:**

```javascript
// Fetch API
const response = await fetch('http://localhost:3000/tinnhan/getAll');
const data = await response.json();
console.log(data);

// Axios
const response = await axios.get('http://localhost:3000/tinnhan/getAll');
console.log(response.data);

// Socket.io
const socket = io('http://localhost:3000');
socket.emit('user_login', { userId: 'user123' });
socket.on('login_success', (data) => console.log(data));
```

---

## 🔧 **CẤU HÌNH SOCKET.IO**

```javascript
// Client side
const socket = io('http://localhost:3000', {
  auth: {
    token: 'jwt-token-here'
  }
});

// Server side middleware
io.use(socketAuth);
io.use(checkRoomAccess);
io.use(socketRateLimit(100, 60000));
io.use(socketLogger);
io.use(updateOnlineStatus);
```

---

## 📁 **UPLOAD FILE CHO TIN NHẮN**

### **Workflow Upload File:**

1. **Upload file trước:**
```javascript
const formData = new FormData();
formData.append('file', fileObject);

const uploadResponse = await fetch('/tinnhan/upload', {
  method: 'POST',
  body: formData
});

const { filename } = await uploadResponse.json();
// filename = "msg-uuid-generated.jpg"
```

2. **Gửi tin nhắn với file:**
```javascript
await fetch('/tinnhan/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ID_NguoiGui: userId,
    ID_NguoiNhan: receiverId,
    noi_dung: "Caption cho file",
    loai_tin_nhan: "image", // hoặc "file"
    file_dinh_kem: filename // Chỉ tên file, không phải URL
  })
});
```

3. **Truy cập file:**
```
URL: http://localhost:3000/uploads/messages/filename
```

### **Ví dụ Frontend:**
```javascript
// Upload hình ảnh
const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/tinnhan/upload', {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  return result.filename; // "msg-uuid-generated.jpg"
};

// Gửi tin nhắn hình ảnh
const sendImageMessage = async (imageFile, receiverId) => {
  const filename = await uploadImage(imageFile);
  
  await fetch('/tinnhan/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ID_NguoiGui: currentUserId,
      ID_NguoiNhan: receiverId,
      noi_dung: "Xem hình này!",
      loai_tin_nhan: "image",
      file_dinh_kem: filename
    })
  });
};
```

---

## 📈 **PERFORMANCE NOTES**
- Sử dụng pagination cho các API lấy danh sách
- Limit mặc định: 50 items
- Socket.io có rate limiting: 100 events/phút
- Database connection pooling được sử dụng
- Soft delete cho tin nhắn (không xóa thật)

---

## 🔐 **SECURITY NOTES**
- JWT authentication cho Socket.io
- Kiểm tra quyền truy cập group
- Rate limiting cho Socket events
- Validation input data
- SQL injection protection với prepared statements
