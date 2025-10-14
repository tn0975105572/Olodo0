-- Test script để kiểm tra hệ thống điểm

-- 1. Xem điểm hiện tại của tất cả user
SELECT ID_NguoiDung, ho_ten, diem_so 
FROM nguoidung 
ORDER BY diem_so DESC;

-- 2. Xem lịch sử giao dịch gần đây
SELECT 
    l.ID_LichSu,
    n.ho_ten,
    l.loai_giao_dich,
    l.diem_thay_doi,
    l.diem_truoc,
    l.diem_sau,
    l.mo_ta,
    l.thoi_gian_tao
FROM lich_su_tich_diem l
JOIN nguoidung n ON l.ID_NguoiDung = n.ID_NguoiDung
ORDER BY l.thoi_gian_tao DESC
LIMIT 10;

-- 3. Test trừ điểm cho user (thay 'USER_ID' bằng ID thật)
-- CALL AddPointsToUser('USER_ID', -50, 'dang_bai', 'Test đăng bài', NULL);

-- 4. Kiểm tra stored procedure có tồn tại không
SHOW PROCEDURE STATUS WHERE Name = 'AddPointsToUser';





