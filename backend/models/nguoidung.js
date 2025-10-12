const pool = require("../config/database");
const { v4: uuidv4 } = require("uuid");

const nguoidung = {};

// Tìm user theo email
nguoidung.getByEmail = async (email) => {
  const [rows] = await pool.query("SELECT * FROM nguoidung WHERE email = ?", [email]);
  return rows[0];
};

// Lấy tất cả user
nguoidung.getAll = async () => {
  const [rows] = await pool.query("SELECT * FROM nguoidung");
  return rows;
};

// Lấy user theo ID
nguoidung.getById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM nguoidung WHERE ID_NguoiDung = ?", [id]);
  return rows[0];
};

nguoidung.insert = async (data) => {
  data.ID_NguoiDung = uuidv4(); // 👈 sinh UUID
  const [result] = await pool.query("INSERT INTO nguoidung SET ?", [data]);
  return { insertId: data.ID_NguoiDung, ...result };
};


// Cập nhật user
nguoidung.update = async (id, data) => {
  const [result] = await pool.query("UPDATE nguoidung SET ? WHERE ID_NguoiDung = ?", [data, id]);
  return result.affectedRows;
};

// Xóa user
nguoidung.delete = async (id) => {
  const [result] = await pool.query("DELETE FROM nguoidung WHERE ID_NguoiDung = ?", [id]);
  return result.affectedRows;
};
nguoidung.timKiem = async (tuKhoa, idNguoiDungHienTai) => {
  const searchQuery = `%${tuKhoa}%`;
  const query = `SELECT ID_NguoiDung, ho_ten, email, anh_dai_dien, que_quan, truong_hoc 
    FROM nguoidung 
    WHERE (ho_ten LIKE ? OR email LIKE ?) 
    AND ID_NguoiDung != ?`;
  const [rows] = await pool.query(query, [searchQuery, searchQuery, idNguoiDungHienTai]);
  return rows;
};
module.exports = nguoidung;
