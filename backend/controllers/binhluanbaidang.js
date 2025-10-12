const binhluanbaidang = require('../models/binhluanbaidang');
const { v4: uuidv4 } = require('uuid'); // Dùng để tạo ID duy nhất

// Lấy tất cả
exports.getAll = async (req, res) => {
    try {
        const data = await binhluanbaidang.getAll();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ', error });
    }
};
exports.getbyID_BaiDang = async (req, res) => {
    try {
        const data = await binhluanbaidang.getbyID_BaiDang(req.params.id);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ', error });
    }
};

// Lấy một bình luận theo ID
exports.getById = async (req, res) => {
    try {
        const data = await binhluanbaidang.getById(req.params.id);
        if (!data) {
            return res.status(404).json({ message: 'Bình luận không tồn tại' });
        }
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ', error });
    }
};

exports.getCommentTreeByPost = async (req, res) => {
    try {
        const flatComments = await binhluanbaidang.getCommentTreeByPostId(req.params.id);
        if (!flatComments || flatComments.length === 0) {
            return res.status(404).json({ message: 'Chưa có bình luận nào' });
        }

        const commentsMap = {};
        const rootComments = [];
        flatComments.forEach(c => { c.children = []; commentsMap[c.ID_BinhLuan] = c; });
        flatComments.forEach(c => {
            if (c.ID_BinhLuanCha && commentsMap[c.ID_BinhLuanCha]) {
                commentsMap[c.ID_BinhLuanCha].children.push(c);
            } else {
                rootComments.push(c);
            }
        });

        res.json(rootComments);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ', error });
    }
};

// Tạo bình luận mới
exports.insert = async (req, res) => {
    try {
        const newId = uuidv4();
        const newData = { ID_BinhLuan: newId, ...req.body };
        await binhluanbaidang.insert(newData);
        res.status(201).json({ id: newId, message: 'Thêm mới thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ', error });
    }
};

// Cập nhật bình luận
exports.update = async (req, res) => {
    try {
        const affectedRows = await binhluanbaidang.update(req.params.id, req.body);
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Bình luận không tồn tại' });
        }
        res.json({ message: 'Cập nhật thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ', error });
    }
};

// Xóa bình luận
exports.delete = async (req, res) => {
    try {
        const affectedRows = await binhluanbaidang.delete(req.params.id);
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Bình luận không tồn tại' });
        }
        res.json({ message: 'Xóa thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ', error });
    }
};