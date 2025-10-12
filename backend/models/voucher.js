const pool = require("../config/database");

const voucher = {}; // Using an object to hold methods

// Lấy tất cả voucher
voucher.getAll = async () => {
  const [rows] = await pool.query("SELECT * FROM voucher");
  return rows;
};

// Lấy voucher theo ID
voucher.getById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM voucher WHERE ID_Voucher = ?", [id]);
  return rows[0];
};

// Thêm voucher
voucher.insert = async (data) => {
  const [result] = await pool.query("INSERT INTO voucher SET ?", [data]);
  return result.insertId;
};

// Cập nhật voucher
voucher.update = async (id, data) => {
  const [result] = await pool.query("UPDATE voucher SET ? WHERE ID_Voucher = ?", [data, id]);
  return result.affectedRows;
};

// Xóa voucher
voucher.delete = async (id) => {
  const [result] = await pool.query("DELETE FROM voucher WHERE ID_Voucher = ?", [id]);
  return result.affectedRows;
};

module.exports = voucher;
