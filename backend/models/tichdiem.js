const pool = require("../config/database");

const tichdiem = {};

// Lấy tất cả tích điểm
tichdiem.getAll = async () => {
  const [rows] = await pool.query("SELECT * FROM tichdiem ORDER BY thoi_gian_tao DESC");
  return rows;
};

// Lấy tích điểm theo ID
tichdiem.getById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM tichdiem WHERE ID_TichDiem = ?", [id]);
  return rows[0];
};

// Lấy tích điểm theo loại
tichdiem.getByType = async (loai) => {
  const [rows] = await pool.query("SELECT * FROM tichdiem WHERE loai = ? AND trang_thai = 'hoat_dong'", [loai]);
  return rows;
};

// Lấy tích điểm hoạt động (tăng điểm)
tichdiem.getActivePoints = async () => {
  const [rows] = await pool.query("SELECT * FROM tichdiem WHERE loai IN ('tang_diem', 'tru_diem') AND trang_thai = 'hoat_dong'");
  return rows;
};

// Lấy tích điểm trao đổi
tichdiem.getExchangePoints = async () => {
  const [rows] = await pool.query("SELECT * FROM tichdiem WHERE loai = 'trao_doi' AND trang_thai = 'hoat_dong'");
  return rows;
};

// Thêm tích điểm
tichdiem.insert = async (data) => {
  const [result] = await pool.query("INSERT INTO tichdiem SET ?", [data]);
  return result.insertId;
};

// Cập nhật tích điểm
tichdiem.update = async (id, data) => {
  const [result] = await pool.query("UPDATE tichdiem SET ? WHERE ID_TichDiem = ?", [data, id]);
  return result.affectedRows;
};

// Xóa tích điểm
tichdiem.delete = async (id) => {
  const [result] = await pool.query("DELETE FROM tichdiem WHERE ID_TichDiem = ?", [id]);
  return result.affectedRows;
};

// Cập nhật số lượng đã sử dụng
tichdiem.updateUsedQuantity = async (id) => {
  const [result] = await pool.query("UPDATE tichdiem SET so_luong_da_su_dung = so_luong_da_su_dung + 1 WHERE ID_TichDiem = ?", [id]);
  return result.affectedRows;
};

// Kiểm tra có thể trao đổi không
tichdiem.canExchange = async (id) => {
  const [rows] = await pool.query(`
    SELECT * FROM tichdiem 
    WHERE ID_TichDiem = ? 
    AND trang_thai = 'hoat_dong' 
    AND (so_luong_toi_da IS NULL OR so_luong_da_su_dung < so_luong_toi_da)
    AND (ngay_bat_dau IS NULL OR ngay_bat_dau <= CURDATE())
    AND (ngay_ket_thuc IS NULL OR ngay_ket_thuc >= CURDATE())
  `, [id]);
  return rows[0];
};

module.exports = tichdiem;





