import { useState, useEffect } from 'react';
import { Search, Eye, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { postAPI } from '../services/api';
import './Posts.css';

interface Post {
  ID_BaiDang: string;
  tieu_de: string;
  mo_ta: string;
  gia: number;
  vi_tri: string;
  trang_thai: string;
  thoi_gian_tao: string;
  ho_ten?: string;
}

const Posts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await postAPI.getAll();
      setPosts(response.data);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa bài đăng này?')) return;

    try {
      await postAPI.delete(id);
      setPosts(posts.filter(p => p.ID_BaiDang !== id));
      alert('Xóa bài đăng thành công!');
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Không thể xóa bài đăng!');
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.tieu_de?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.mo_ta?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || post.trang_thai === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'dang_ban', label: 'Đang bán' },
    { value: 'da_ban', label: 'Đã bán' },
    { value: 'an', label: 'Ẩn' },
  ];

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="posts-page">
      <div className="page-header">
        <h2 className="page-title">Quản lý bài đăng</h2>
      </div>

      <div className="page-toolbar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm bài đăng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="filter-info">
          Hiển thị <strong>{filteredPosts.length}</strong> / {posts.length} bài đăng
        </div>
      </div>

      <div className="posts-grid">
        {filteredPosts.map((post) => (
          <div key={post.ID_BaiDang} className="post-card">
            <div className="post-header">
              <h3 className="post-title">{post.tieu_de}</h3>
              <span className={`post-status ${post.trang_thai}`}>
                {post.trang_thai === 'dang_ban' && <><CheckCircle size={14} /> Đang bán</>}
                {post.trang_thai === 'da_ban' && <><XCircle size={14} /> Đã bán</>}
                {post.trang_thai === 'an' && <><XCircle size={14} /> Ẩn</>}
              </span>
            </div>
            
            <p className="post-description">
              {post.mo_ta?.substring(0, 150)}{post.mo_ta?.length > 150 ? '...' : ''}
            </p>
            
            <div className="post-details">
              <div className="post-detail-item">
                <span className="detail-label">Giá:</span>
                <span className="detail-value price">{post.gia?.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="post-detail-item">
                <span className="detail-label">Vị trí:</span>
                <span className="detail-value">{post.vi_tri || 'N/A'}</span>
              </div>
              <div className="post-detail-item">
                <span className="detail-label">Ngày đăng:</span>
                <span className="detail-value">
                  {new Date(post.thoi_gian_tao).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>

            <div className="post-actions">
              <button className="btn-icon btn-view" title="Xem chi tiết">
                <Eye size={16} />
              </button>
              <button
                className="btn-icon btn-delete"
                onClick={() => handleDelete(post.ID_BaiDang)}
                title="Xóa"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="no-data">
          <p>Không tìm thấy bài đăng nào</p>
        </div>
      )}
    </div>
  );
};

export default Posts;





