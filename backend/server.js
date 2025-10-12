require("dotenv").config({ path: require('path').join(__dirname, '.env') });
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const http = require('http');
const { Server } = require("socket.io");
const cron = require('node-cron');
const { exec } = require('child_process');
const mysql = require('mysql2/promise');

const routes = require("./routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  }
});

// Kiểm tra biến môi trường
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASS:', process.env.DB_PASS);
console.log('DB_NAME:', process.env.DB_NAME);

// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '12345678',
  database: process.env.DB_NAME || 'sv_cho',
  connectionLimit: 10,
  connectTimeout: 10000
});

// Test pool connection
pool.getConnection()
  .then(connection => {
    console.log('MySQL pool connected successfully');
    connection.release();
  })
  .catch(err => console.error('Error connecting to MySQL:', err));

const uploadDir = path.join(__dirname, "Uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use("/uploads", express.static(uploadDir));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

const setupSwagger = (app) => {};

app.use(cors());
setupSwagger(app);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import ChatSocket và middleware
const ChatSocket = require('./socket/chatSocket');
const { socketAuth, socketRateLimit, socketLogger, updateOnlineStatus } = require('./socket/socketMiddleware');

// Cấu hình Socket.IO với middleware
io.use(socketAuth); // Xác thực JWT
io.use(socketRateLimit(100, 60000)); // Rate limiting: 100 events/phút
io.use(socketLogger); // Logging
io.use(updateOnlineStatus); // Cập nhật trạng thái online

// Khởi tạo ChatSocket
const chatSocket = new ChatSocket(io);

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('✅ Socket connected:', socket.id, 'User:', socket.userId || 'Unknown');
  
  // Lưu trữ socket instance để sử dụng trong API
  socket.userSocket = chatSocket;
  
  socket.on('disconnect', (reason) => {
    console.log('❌ Socket disconnected:', socket.id, 'Reason:', reason, 'User:', socket.userId || 'Unknown');
  });
  
  // Xử lý lỗi
  socket.on('error', (error) => {
    console.error('Socket error:', error, 'Socket ID:', socket.id, 'User:', socket.userId || 'Unknown');
  });
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

// Cron job chạy Python script mỗi 10 phút
let isRecommendationRunning = false;
cron.schedule('*/1000000 */10 * * *', () => {
  if (isRecommendationRunning) {
    console.log('⏳ Script gợi ý đang chạy, bỏ qua cron job');
    return;
  }
  isRecommendationRunning = true;
  console.log('🚀 Bắt đầu script gợi ý'); 
  exec('python recommend.py', (error, stdout, stderr) => {
    isRecommendationRunning = false;
    if (error) {
      console.error(`❌ Lỗi khi chạy script gợi ý: ${error.message}`);
      io.emit('recommendation_status', { status: 'error', message: error.message });
      return;
    }
    if (stderr) {
      console.error(`❌ Stderr: ${stderr}`);
      io.emit('recommendation_status', { status: 'error', message: stderr });
      return;
    }
    console.log(`✅ Script gợi ý hoàn thành: ${stdout}`);
    io.emit('recommendation_status', { status: 'success', message: 'Gợi ý đã được cập nhật' });
  });
});

// API kiểm tra trạng thái gợi ý
app.get('/api/recommendation-status', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT COUNT(*) AS record_count FROM goiy_baidang'
    );
    res.json({
      isRunning: isRecommendationRunning,
      hasRecords: rows[0].record_count > 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// API lấy gợi ý bài đăng cho người dùng
app.get('/api/recommendations/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    // Lấy gợi ý từ goiy_baidang (chỉ lấy những bài có Score > 0, tối đa 10)
    const [rows] = await pool.query(
      'SELECT ID_BaiDang, Score FROM goiy_baidang WHERE ID_NguoiDung = ? AND Score > 0 ORDER BY Score DESC LIMIT 10',
      [userId]
    );

    if (rows.length > 0) {
      const postIds = rows.map(row => row.ID_BaiDang);
      const [likes] = await pool.query(
        `SELECT ID_BaiDang FROM likebaidang WHERE ID_NguoiDung = ? AND ID_BaiDang IN (?)`,
        [userId, postIds]
      );
      const [comments] = await pool.query(
        `SELECT ID_BaiDang FROM binhluanbaidang WHERE ID_NguoiDung = ? AND ID_BaiDang IN (?)`,
        [userId, postIds]
      );

      const likedPosts = new Set(likes.map(l => l.ID_BaiDang));
      const commentedPosts = new Set(comments.map(c => c.ID_BaiDang));

      const recommendations = rows.map(row => ({
        ID_BaiDang: row.ID_BaiDang,
        Score: row.Score,
        isFriendPost: false,
        hasLiked: likedPosts.has(row.ID_BaiDang),
        hasCommented: commentedPosts.has(row.ID_BaiDang)
      }));
      return res.json(recommendations);
    }

    // Lấy danh sách bạn bè từ quanhebanbe
    const [friends] = await pool.query(
      `SELECT ID_NguoiGui AS friend_id FROM quanhebanbe WHERE ID_NguoiNhan = ? AND trang_thai = 'da_dong_y'
       UNION
       SELECT ID_NguoiNhan AS friend_id FROM quanhebanbe WHERE ID_NguoiGui = ? AND trang_thai = 'da_dong_y'`,
      [userId, userId]
    );

    const friendIds = friends.map(f => f.friend_id);

    // Lấy bài đăng của bạn bè
    let friendPosts = [];
    if (friendIds.length > 0) {
      const [friendPostsResult] = await pool.query(
        `SELECT ID_BaiDang 
         FROM baidang 
         WHERE ID_NguoiDung IN (?) AND trang_thai = 'dang_ban'`,
        [friendIds]
      );
      friendPosts = friendPostsResult.map(row => ({
        ID_BaiDang: row.ID_BaiDang,
        Score: 0,
        isFriendPost: true
      }));
    }

    // Lấy tất cả bài đăng ngẫu nhiên từ baidang
    const [randomPosts] = await pool.query(
      `SELECT ID_BaiDang 
       FROM baidang 
       WHERE trang_thai = 'dang_ban'
       ORDER BY RAND()`
    );

    // Kết hợp bài đăng của bạn bè và bài ngẫu nhiên, loại bỏ trùng lặp
    const allPosts = [
      ...friendPosts,
      ...randomPosts
        .filter(row => !friendPosts.some(f => f.ID_BaiDang === row.ID_BaiDang))
        .map(row => ({ ID_BaiDang: row.ID_BaiDang, Score: 0, isFriendPost: false }))
    ];

    // Loại bỏ trùng lặp dựa trên ID_BaiDang
    const uniquePosts = Array.from(
      new Map(allPosts.map(post => [post.ID_BaiDang, post])).values()
    );

    // Kiểm tra tương tác like và bình luận
    const postIds = uniquePosts.map(post => post.ID_BaiDang);
    const [likes] = await pool.query(
      `SELECT ID_BaiDang FROM likebaidang WHERE ID_NguoiDung = ? AND ID_BaiDang IN (?)`,
      [userId, postIds]
    );
    const [comments] = await pool.query(
      `SELECT ID_BaiDang FROM binhluanbaidang WHERE ID_NguoiDung = ? AND ID_BaiDang IN (?)`,
      [userId, postIds]
    );

    const likedPosts = new Set(likes.map(l => l.ID_BaiDang));
    const commentedPosts = new Set(comments.map(c => c.ID_BaiDang));

    // Thêm hasLiked và hasCommented
    const finalPosts = uniquePosts.map(post => ({
      ID_BaiDang: post.ID_BaiDang,
      Score: post.Score,
      isFriendPost: post.isFriendPost,
      hasLiked: likedPosts.has(post.ID_BaiDang),
      hasCommented: commentedPosts.has(post.ID_BaiDang)
    }));

    // Trả về tất cả bài đăng
    res.json(finalPosts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/upload", upload.single("avatar"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Không có file nào được tải lên." });
  }
  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  console.log("File đã được tải lên thành công:", fileUrl);
  res.json({ imageUrl: fileUrl });
});

app.use("/api", routes);
app.use((req, res, next) => {
  res.status(404).json({ message: "Route không tồn tại" });
});
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server đang chạy trên http://localhost:${PORT}`);
});