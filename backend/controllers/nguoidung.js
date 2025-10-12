require("dotenv").config();
const jwt = require("jsonwebtoken");
const nguoidung = require("../models/nguoidung");
const fs = require("fs");
const path = require("path");

const SECRET_KEY = process.env.JWT_SECRET || "default_secret";
const EXPIRES = process.env.JWT_EXPIRES || "7d";
const authenticateToken = (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ message: "Không có token, từ chối truy cập" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token không hợp lệ" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    return res
      .status(403)
      .json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
};

const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.Role)) {
      return res.status(403).json({ message: "Bạn không có quyền truy cập" });
    }
    next();
  };
};

// Async handler
const asyncHandler =
  (fn) =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// 1️⃣ LOGIN (CÓ TOKEN)
exports.login = asyncHandler(async (req, res) => {
  const { email, mat_khau } = req.body;
  console.log(`🔑 Login attempt for email: ${email}`);

  if (!email || !mat_khau) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng cung cấp email và mật khẩu.",
    });
  }

  const user = await nguoidung.getByEmail(email.trim());
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "Email không tồn tại.",
    });
  }

  const isMatch = mat_khau.trim() === user.mat_khau.trim();
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Mật khẩu không chính xác.",
    });
  }

  const { mat_khau: _, ...userWithoutPassword } = user;

  // 🔑 Sinh token
  const token = jwt.sign(
    { id: user.ID_NguoiDung, email: user.email, Role: user.Role || "user" },
    SECRET_KEY,
    { expiresIn: EXPIRES }
  );

  res.status(200).json({
    success: true,
    message: "Đăng nhập thành công",
    token,
    user: userWithoutPassword,
  });
});
exports.insert = asyncHandler(async (req, res) => {
  const newData = { ...req.body };

  if (!newData.email || !newData.mat_khau || !newData.ho_ten) {
    return res.status(400).json({
      success: false,
      message: "Email, mật khẩu và họ tên là bắt buộc.",
    });
  }

  if (!newData.email.includes("@")) {
    return res.status(400).json({
      success: false,
      message: "Email không hợp lệ.",
    });
  }

  const existingUser = await nguoidung.getByEmail(newData.email);
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: "Email đã được sử dụng.",
    });
  }

  const result = await nguoidung.insert(newData);
  res.status(201).json({
    success: true,
    id: result.insertId,
    message: "Tạo người dùng thành công.",
  });
});

// UPDATE USER (KHÔNG CẦN TOKEN, CHỈ CẦN ID)
exports.update = asyncHandler(async (req, res) => {
    const updatedData = { ...req.body };
    const userId = req.params.id;

    const currentUser = await nguoidung.getById(userId);
    if (!currentUser) {
        return res.status(404).json({
            success: false,
            message: "Người dùng không tồn tại.",
        });
    }

    if (updatedData.mat_khau_cu && updatedData.mat_khau) {
        const isOldPasswordValid = updatedData.mat_khau_cu.trim() === currentUser.mat_khau.trim();
        if (!isOldPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Mật khẩu cũ không chính xác.",
            });
        }
        delete updatedData.mat_khau_cu;
    } else {
        delete updatedData.mat_khau;
        delete updatedData.mat_khau_cu;
    }

    const affectedRows = await nguoidung.update(userId, updatedData);
    if (affectedRows === 0) {
        return res.status(404).json({
            success: false,
            message: "Người dùng không tồn tại hoặc không có gì thay đổi.",
        });
    }

    res.status(200).json({
        success: true,
        message: "Cập nhật thành công.",
        affectedRows,
    });
});

// GET ALL USERS (Không thay đổi)
exports.getAll = asyncHandler(async (req, res) => {
  const data = await nguoidung.getAll();

  const users = data.map(user => {
    const { mat_khau, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });

  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

// GET USER BY ID (KHÔNG CẦN TOKEN)
exports.getById = asyncHandler(async (req, res) => {
    const userId = req.params.id;

    const user = await nguoidung.getById(userId);
    if (!user) {
        return res.status(404).json({
            success: false,
        });
    }

    const { mat_khau, ...userWithoutPassword } = user;
    res.status(200).json({
        success: true,
        user: userWithoutPassword,
    });
});

exports.delete = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const { mat_khau } = req.body;

    if (!mat_khau || mat_khau.trim() === '') {
        return res.status(400).json({
            success: false,
            message: 'Vui lòng cung cấp mật khẩu để xác nhận xóa.',
        });
    }

    const user = await nguoidung.getById(userId);
    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'Người dùng không tồn tại.',
        });
    }

    const isPasswordValid = mat_khau.trim() === user.mat_khau.trim();
    if (!isPasswordValid) {
        return res.status(401).json({
            success: false,
            message: 'Mật khẩu xác nhận không chính xác.',
        });
    }

    if (user.anh_dai_dien && user.anh_dai_dien !== 'https://i.pravatar.cc/150') {
        try {
            const uploadsDir = path.join(__dirname, '../uploads');
            const imageFilename = path.basename(user.anh_dai_dien);
            const imagePath = path.join(uploadsDir, imageFilename);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        } catch (fileError) {
            // Bỏ qua lỗi
        }
    }

    const affectedRows = await nguoidung.delete(userId);
    if (affectedRows === 0) {
        return res.status(404).json({
            success: false,
            message: 'Không thể xóa. Người dùng không tồn tại.',
        });
    }

    res.status(200).json({
        success: true,
        message: 'Xóa tài khoản thành công!',
    });
});

// VERIFY PASSWORD (KHÔNG CẦN TOKEN)
exports.verifyPassword = asyncHandler(async (req, res) => {
    const { mat_khau } = req.body;
    const userId = req.params.id;

    if (!mat_khau) {
        return res.status(400).json({
            success: false,
            valid: false,
            message: 'Mật khẩu là bắt buộc.',
        });
    }

    const user = await nguoidung.getById(userId);
    if (!user) {
        return res.status(404).json({
            success: false,
            valid: false,
            message: 'Người dùng không tồn tại.',
        });
    }

    const isValid = mat_khau.trim() === user.mat_khau.trim();
    res.status(200).json({
        success: true,
        valid: isValid,
        message: isValid ? 'Mật khẩu chính xác' : 'Mật khẩu không chính xác',
    });
});

// SEARCH USERS (Không thay đổi)
exports.timKiem = asyncHandler(async (req, res) => {
    const { tuKhoa, idNguoiDungHienTai } = req.query;
    if (!tuKhoa) {
        return res.status(400).json({ success: false, message: "Thiếu từ khóa tìm kiếm." });
    }
    if (!idNguoiDungHienTai) {
        return res.status(400).json({ success: false, message: "Thiếu ID người dùng hiện tại." });
    }
    const users = await nguoidung.timKiem(tuKhoa, idNguoiDungHienTai);
    res.status(200).json({ success: true, count: users.length, data: users });
});

// ✅ EXPORT TẤT CẢ METHODS
module.exports = {
    login: exports.login,
    insert: exports.insert,
    update: exports.update,
    getAll: exports.getAll,
    getById: exports.getById,
    delete: exports.delete,
    verifyPassword: exports.verifyPassword,
    timKiem: exports.timKiem
};