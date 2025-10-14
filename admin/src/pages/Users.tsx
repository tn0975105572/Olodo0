import { useState, useEffect } from 'react';
import { Search, Edit, Trash2, UserPlus, Eye, CheckCircle, XCircle } from 'lucide-react';
import { userAPI } from '../services/api';
import './Users.css';

interface User {
  ID_NguoiDung: string;
  ten_dang_nhap: string;
  email: string;
  ho_ten: string;
  so_dien_thoai?: string;
  diem_so: number;
  da_xac_thuc: number;
  vi_tri: string | null;
  thoi_gian_tao: string;
  truong_hoc?: string;
  que_quan?: string;
  anh_dai_dien?: string;
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAll();
      console.log('API Response:', response.data);
      setUsers(response.data.data || response.data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa người dùng này?')) return;

    try {
      await userAPI.delete(id);
      setUsers(users.filter(u => u.ID_NguoiDung !== id));
      alert('Xóa người dùng thành công!');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Không thể xóa người dùng!');
    }
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const filteredUsers = users.filter(user =>
    user.ho_ten?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.ten_dang_nhap?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="users-page">
      <div className="page-header">
        <h2 className="page-title">Quản lý người dùng</h2>
        <button className="btn-primary">
          <UserPlus size={18} />
          Thêm người dùng
        </button>
      </div>

      <div className="page-toolbar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm người dùng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-info">
          Hiển thị <strong>{filteredUsers.length}</strong> / {users.length} người dùng
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Tên đăng nhập</th>
              <th>Điểm</th>
              <th>Vị trí</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.ID_NguoiDung}>
                <td>{user.ho_ten || 'N/A'}</td>
                <td>{user.email}</td>
                <td>{user.ten_dang_nhap}</td>
                <td className="points-cell">{user.diem_so || 0}</td>
                <td>
                  <span className={`badge badge-${user.vi_tri ? 'user' : 'admin'}`}>
                    {user.vi_tri || 'N/A'}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${user.da_xac_thuc === 1 ? 'active' : 'inactive'}`}>
                    {user.da_xac_thuc === 1 ? (
                      <>
                        <CheckCircle size={14} />
                        Đã xác thực
                      </>
                    ) : (
                      <>
                        <XCircle size={14} />
                        Chưa xác thực
                      </>
                    )}
                  </span>
                </td>
                <td>{new Date(user.thoi_gian_tao).toLocaleDateString('vi-VN')}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-icon btn-view"
                      onClick={() => handleViewDetails(user)}
                      title="Xem chi tiết"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className="btn-icon btn-edit"
                      title="Chỉnh sửa"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => handleDelete(user.ID_NguoiDung)}
                      title="Xóa"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết người dùng</h3>
              <button onClick={() => setShowModal(false)} className="modal-close">×</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <span className="detail-label">ID:</span>
                <span className="detail-value">{selectedUser.ID_NguoiDung}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Họ tên:</span>
                <span className="detail-value">{selectedUser.ho_ten}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{selectedUser.email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Trường học:</span>
                <span className="detail-value">{selectedUser.truong_hoc || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Điểm:</span>
                <span className="detail-value points">{selectedUser.diem_so}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Vị trí:</span>
                <span className="detail-value">{selectedUser.vi_tri || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Trạng thái:</span>
                <span className="detail-value">{selectedUser.da_xac_thuc === 1 ? 'Đã xác thực' : 'Chưa xác thực'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Quê quán:</span>
                <span className="detail-value">{selectedUser.que_quan || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;




