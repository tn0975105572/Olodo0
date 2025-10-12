const pool = require("../config/database");

const thongbao = {}; // Using an object to hold methods

// Lấy tất cả thongbao
thongbao.getAll = async () => {
  const [rows] = await pool.query("SELECT * FROM thongbao");
  return rows;
};

// Lấy thongbao theo ID
thongbao.getById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM thongbao WHERE ID_ThongBao = ?", [id]);
  return rows[0];
};

// Thêm thongbao
thongbao.insert = async (data) => {
  const [result] = await pool.query("INSERT INTO thongbao SET ?", [data]);
  return result.insertId;
};

// Cập nhật thongbao
thongbao.update = async (id, data) => {
  const [result] = await pool.query("UPDATE thongbao SET ? WHERE ID_ThongBao = ?", [data, id]);
  return result.affectedRows;
};

// Xóa thongbao
thongbao.delete = async (id) => {
  const [result] = await pool.query("DELETE FROM thongbao WHERE ID_ThongBao = ?", [id]);
  return result.affectedRows;
};

module.exports = thongbao;
