const likebaidang = require('../models/likebaidang');
const { v4: uuidv4 } = require("uuid");

exports.getAll = async (req, res) => {
    try {
        const data = await likebaidang.getAll();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ', error });
    }
};

exports.getById = async (req, res) => {
    try {
        const id = req.params.id;
        const data = await likebaidang.getById(id);
       
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ', error });
    }
};

exports.insert = async (req, res) => {
  try {
    const newData = req.body;
    const newId = await likebaidang.insert(newData);
    res.status(201).json({ ID_Like: newId, message: "Thêm mới thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi máy chủ", error });
  }
};

exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const updatedData = req.body;
        const affectedRows = await likebaidang.update(id, updatedData);
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'likebaidang không tồn tại' });
        }
        res.json({ message: 'Cập nhật thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ', error });
    }
};

exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        const affectedRows = await likebaidang.delete(id);
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'likebaidang không tồn tại' });
        }
        res.json({ message: 'Xóa thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ', error });
    }
};

// Lấy thông tin người đã like bài đăng với thời gian like
exports.getLikesByPostId = async (req, res) => {
    try {
        const postId = req.params.postId;
        
        if (!postId) {
            return res.status(400).json({
                success: false,
                message: "ID bài đăng không được để trống"
            });
        }

        const likes = await likebaidang.getLikesByPostId(postId);
        const likeCount = await likebaidang.getLikeCountByPostId(postId);

        res.json({
            success: true,
            data: likes,
            total: likeCount,
            message: `Đã lấy thành công ${likes.length} người like bài đăng`
        });

    } catch (error) {
        console.error("Error getting post likes:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi máy chủ",
            error: error.message
        });
    }
};

// Lấy số lượng like của bài đăng
exports.getLikeCountByPostId = async (req, res) => {
    try {
        const postId = req.params.postId;
        
        if (!postId) {
            return res.status(400).json({
                success: false,
                message: "ID bài đăng không được để trống"
            });
        }

        const likeCount = await likebaidang.getLikeCountByPostId(postId);

        res.json({
            success: true,
            data: {
                ID_BaiDang: postId,
                SoLuongLike: likeCount
            },
            message: `Bài đăng có ${likeCount} lượt like`
        });

    } catch (error) {
        console.error("Error getting like count:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi máy chủ",
            error: error.message
        });
    }
};

// Kiểm tra người dùng đã like bài đăng chưa
exports.checkUserLiked = async (req, res) => {
    try {
        const { postId, userId } = req.params;
        
        if (!postId || !userId) {
            return res.status(400).json({
                success: false,
                message: "ID bài đăng và ID người dùng không được để trống"
            });
        }

        const likeInfo = await likebaidang.checkUserLiked(postId, userId);

        res.json({
            success: true,
            data: {
                hasLiked: !!likeInfo,
                likeInfo: likeInfo
            },
            message: likeInfo ? "Người dùng đã like bài đăng này" : "Người dùng chưa like bài đăng này"
        });

    } catch (error) {
        console.error("Error checking user like:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi máy chủ",
            error: error.message
        });
    }
};