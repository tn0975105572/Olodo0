const tichdiem = require('../models/tichdiem');
const { v4: uuidv4 } = require('uuid');

exports.getAll = async (req, res) => {
    try {
        const data = await tichdiem.getAll();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const id = req.params.id;
        const data = await tichdiem.getById(id);
        if (!data) {
            return res.status(404).json({ message: 'Tích điểm không tồn tại' });
        }
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
};

exports.getByType = async (req, res) => {
    try {
        const { loai } = req.params;
        const data = await tichdiem.getByType(loai);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
};

exports.getActivePoints = async (req, res) => {
    try {
        const data = await tichdiem.getActivePoints();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
};

exports.getExchangePoints = async (req, res) => {
    try {
        const data = await tichdiem.getExchangePoints();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const newData = {
            ID_TichDiem: uuidv4(),
            ...req.body
        };
        const insertId = await tichdiem.insert(newData);
        res.status(201).json({ id: insertId, message: 'Thêm mới thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const updatedData = req.body;
        const affectedRows = await tichdiem.update(id, updatedData);
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Tích điểm không tồn tại' });
        }
        res.json({ message: 'Cập nhật thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        const affectedRows = await tichdiem.delete(id);
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Tích điểm không tồn tại' });
        }
        res.json({ message: 'Xóa thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
};

exports.exchange = async (req, res) => {
    try {
        const { userId, tichdiemId } = req.body;
        
        // Kiểm tra có thể trao đổi không
        const canExchange = await tichdiem.canExchange(tichdiemId);
        if (!canExchange) {
            return res.status(400).json({ message: 'Không thể trao đổi tích điểm này' });
        }

        // Gọi stored procedure để trao đổi điểm
        const pool = require('../config/database');
        const [result] = await pool.query('CALL ExchangePoints(?, ?)', [userId, tichdiemId]);
        
        if (result[0][0].result === 'SUCCESS') {
            res.json({ 
                message: 'Trao đổi thành công', 
                newPoints: result[0][0].new_points 
            });
        } else {
            res.status(400).json({ 
                message: result[0][0].result === 'INSUFFICIENT_POINTS' ? 
                    'Không đủ điểm để trao đổi' : 
                    result[0][0].result === 'OUT_OF_STOCK' ? 
                        'Hết số lượng trao đổi' : 
                        'Không tìm thấy tích điểm'
            });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
};





