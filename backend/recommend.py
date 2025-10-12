import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.decomposition import TruncatedSVD
from sklearn.preprocessing import StandardScaler
from sqlalchemy import create_engine, text
import logging
import time
import re

# Thiết lập logging
logging.basicConfig(
    filename='recommend.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# Hàm chuẩn hóa văn bản
def preprocess_text(text):
    text = text.lower()
    text = re.sub(r'[^\w\s]', '', text)
    return text

logging.info("Bắt đầu script gợi ý")
start_time = time.time()

try:
    # Kết nối MySQL bằng SQLAlchemy
    engine = create_engine('mysql+mysqlconnector://root:12345678@localhost/sv_cho')

    # Fetch dữ liệu bài đăng
    logging.info("Lấy dữ liệu bài đăng")
    query_posts = "SELECT ID_BaiDang, CONCAT(tieu_de, ' ', mo_ta) AS content FROM baidang WHERE trang_thai = 'dang_ban'"
    df_posts = pd.read_sql(query_posts, engine)
    
    logging.info(f"Số bài đăng lấy được: {len(df_posts)}")
    post_ids = df_posts['ID_BaiDang'].values

    # Chuẩn hóa nội dung
    logging.info("Chuẩn hóa nội dung bài đăng")
    df_posts['content'] = df_posts['content'].apply(preprocess_text)

    # Content-based
    logging.info("Tính toán vector TF-IDF")
    vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))
    tfidf_matrix = vectorizer.fit_transform(df_posts['content'])

    # Fetch tương tác (likes)
    logging.info("Lấy dữ liệu likes")
    query_likes = "SELECT ID_NguoiDung, ID_BaiDang FROM likebaidang"
    df_likes = pd.read_sql(query_likes, engine)
    
    # Fetch tất cả users
    logging.info("Lấy dữ liệu người dùng")
    query_users = "SELECT ID_NguoiDung FROM nguoidung"
    df_users = pd.read_sql(query_users, engine)
    
    user_ids = df_users['ID_NguoiDung'].values

    # Collaborative
    logging.info("Xây dựng ma trận người dùng-bài đăng")
    user_post_matrix = df_likes.pivot_table(index='ID_NguoiDung', columns='ID_BaiDang', aggfunc='size', fill_value=0).clip(upper=1)
    user_post_matrix = user_post_matrix.reindex(index=user_ids, columns=post_ids, fill_value=0)

    logging.info(f"Kích thước ma trận người dùng-bài đăng: {user_post_matrix.shape}")

    # Kiểm tra dữ liệu ma trận
    if user_post_matrix.shape[0] == 0:
        logging.warning("Ma trận người dùng-bài đăng trống. Không thể tính toán SVD.")
        raise ValueError("Ma trận người dùng-bài đăng trống.")

    logging.info("Tính toán SVD")
    scaler = StandardScaler()
    normalized_matrix = scaler.fit_transform(user_post_matrix)
    
    if normalized_matrix.shape[0] == 0 or normalized_matrix.shape[1] == 0:
        logging.warning("Ma trận bình thường hóa trống. Không thể tính toán SVD.")
        raise ValueError("Ma trận bình thường hóa trống.")
    
    svd = TruncatedSVD(n_components=50)
    user_factors = svd.fit_transform(normalized_matrix)
    post_factors = svd.components_.T
    collab_scores_matrix = np.dot(user_factors, post_factors.T)

    # Hybrid
    alpha = 0.5
    logging.info("Tính toán gợi ý hybrid")
    for i, user_id in enumerate(user_ids):
        logging.info(f"Xử lý gợi ý cho người dùng {user_id}")
        liked_posts = df_likes[df_likes['ID_NguoiDung'] == user_id]['ID_BaiDang'].values
        if len(liked_posts) > 0:
            liked_indices = df_posts[df_posts['ID_BaiDang'].isin(liked_posts)].index
            content_scores = cosine_similarity(tfidf_matrix[liked_indices], tfidf_matrix).mean(axis=0)
        else:
            content_scores = np.zeros(len(post_ids))

        collab_scores = collab_scores_matrix[i]
        hybrid_scores = alpha * content_scores + (1 - alpha) * collab_scores

        not_liked_indices = np.where(~user_post_matrix.loc[user_id].values.astype(bool))[0]
        top_indices = not_liked_indices[np.argsort(hybrid_scores[not_liked_indices])[::-1][:10]]
        top_posts = post_ids[top_indices]
        top_scores = hybrid_scores[top_indices]

        # Xóa gợi ý cũ
        with engine.connect() as connection:
            connection.execute(text("DELETE FROM goiy_baidang WHERE ID_NguoiDung = :user_id"), {'user_id': user_id})
            for post, score in zip(top_posts, top_scores):
                connection.execute(
                    text("INSERT INTO goiy_baidang (ID_NguoiDung, ID_BaiDang, Score, thoi_gian_cap_nhat) VALUES (:user_id, :post, :score, NOW())"), 
                    {'user_id': user_id, 'post': post, 'score': score}
                )

    logging.info(f"Gợi ý đã cập nhật thành công trong {time.time() - start_time:.2f} giây")

except Exception as e:
    logging.error(f"Lỗi trong script gợi ý: {str(e)}")
    raise
finally:
    engine.dispose()

logging.info("Script gợi ý đã kết thúc")