const nguoidungvoucher = require('../models/nguoidungvoucher');

exports.getAll = async (req, res) => {
    try {
        const data = await nguoidungvoucher.getAll();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ', error });
    }
};

exports.getById = async (req, res) => {
    try {
        const id = req.params.id;
        const data = await nguoidungvoucher.getById(id);
        if (!data) {
            return res.status(404).json({ message: 'nguoidungvoucher không tồn tại' });
        }
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ', error });
    }
};

exports.insert = async (req, res) => {
    try {
        const newData = req.body;
        const insertId = await nguoidungvoucher.insert(newData);
        res.status(201).json({ id: insertId, message: 'Thêm mới thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ', error });
    }
};

exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const updatedData = req.body;
        const affectedRows = await nguoidungvoucher.update(id, updatedData);
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'nguoidungvoucher không tồn tại' });
        }
        res.json({ message: 'Cập nhật thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ', error });
    }
};

exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        const affectedRows = await nguoidungvoucher.delete(id);
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'nguoidungvoucher không tồn tại' });
        }
        res.json({ message: 'Xóa thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ', error });
    }
};
