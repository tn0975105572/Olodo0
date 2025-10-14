-- Tạo stored procedure AddPointsToUser
DELIMITER ;;

DROP PROCEDURE IF EXISTS `AddPointsToUser`;;

CREATE PROCEDURE `AddPointsToUser`(
    IN p_user_id VARCHAR(36),
    IN p_point_change INT,
    IN p_transaction_type VARCHAR(50),
    IN p_description TEXT,
    IN p_reference_id VARCHAR(36)
)
BEGIN
    DECLARE current_points INT DEFAULT 0;
    DECLARE new_points INT DEFAULT 0;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- Lấy điểm hiện tại của user
    SELECT COALESCE(diem_so, 0) INTO current_points 
    FROM nguoidung 
    WHERE ID_NguoiDung = p_user_id;

    -- Tính điểm mới
    SET new_points = current_points + p_point_change;

    -- Đảm bảo điểm không âm
    IF new_points < 0 THEN
        SET new_points = 0;
    END IF;

    -- Cập nhật điểm trong bảng nguoidung
    UPDATE nguoidung 
    SET diem_so = new_points 
    WHERE ID_NguoiDung = p_user_id;

    -- Ghi lịch sử giao dịch
    INSERT INTO lich_su_tich_diem (
        ID_LichSu,
        ID_NguoiDung,
        loai_giao_dich,
        diem_thay_doi,
        diem_truoc,
        diem_sau,
        mo_ta,
        ID_ThamChieu,
        thoi_gian_tao
    ) VALUES (
        UUID(),
        p_user_id,
        p_transaction_type,
        p_point_change,
        current_points,
        new_points,
        p_description,
        p_reference_id,
        NOW()
    );

    -- Trả về điểm mới
    SELECT new_points as new_points;

    COMMIT;
END;;

DELIMITER ;





