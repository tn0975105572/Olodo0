const pool = require("../config/database");

const nguoidungvoucher = {}; // Using an object to hold methods

// Lấy tất cả nguoidungvoucher
nguoidungvoucher.getAll = async () => {
  const [rows] = await pool.query("SELECT * FROM nguoidungvoucher");
  return rows;
};

// Lấy nguoidungvoucher theo ID
nguoidungvoucher.getById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM nguoidungvoucher WHERE ID_NguoiDungVoucher = ?", [id]);
  return rows[0];
};

// Thêm nguoidungvoucher
nguoidungvoucher.insert = async (data) => {
  const [result] = await pool.query("INSERT INTO nguoidungvoucher SET ?", [data]);
  return result.insertId;
};

// Cập nhật nguoidungvoucher
nguoidungvoucher.update = async (id, data) => {
  const [result] = await pool.query("UPDATE nguoidungvoucher SET ? WHERE ID_NguoiDungVoucher = ?", [data, id]);
  return result.affectedRows;
};

// Xóa nguoidungvoucher
nguoidungvoucher.delete = async (id) => {
  const [result] = await pool.query("DELETE FROM nguoidungvoucher WHERE ID_NguoiDungVoucher = ?", [id]);
  return result.affectedRows;
};

module.exports = nguoidungvoucher;
