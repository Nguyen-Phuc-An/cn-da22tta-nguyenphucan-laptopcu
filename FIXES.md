# 🔧 Hướng Dẫn Sửa Chữa - Admin Login & Data Persistence

## 📋 Vấn Đề Tìm Thấy

### 1. ❌ Admin User Không Được Tạo Tự Động
- **Nguyên nhân**: File `ensureAdmin.js` không tồn tại
- **Kết quả**: Lỗi "invalid credentials" khi đăng nhập admin
- **Giải pháp**: Tạo file `backend/src/scripts/ensureAdmin.js` để tự động tạo admin user khi backend khởi động

### 2. ❌ Seed Data Không Khớp Với Schema
- **Nguyên nhân**: `seed_users.sql` cũ dùng `name`, `password` nhưng schema dùng `ten`, `mat_khau`
- **Kết quả**: Insert admin thất bại khi database khởi tạo
- **Giải pháp**: Cập nhật `seed_users.sql` với cột đúng và password hashed

### 3. ❌ Dữ Liệu Upload Images Mất Khi Xóa Container
- **Nguyên nhân**: Chỉ có `mysql_data` volume, uploads không được persist
- **Kết quả**: Xóa container → mất tất cả files upload
- **Giải pháp**: Thêm `uploads_data` volume cho `backend/public/uploads`

---

## ✅ Các Sửa Chữa Đã Thực Hiện

### 1. Tạo `backend/src/scripts/ensureAdmin.js`
```javascript
// Tự động tạo admin user nếu chưa tồn tại
// Email: admin@gmail.com
// Password: admin123
// Chạy khi backend khởi động
```

### 2. Cập Nhật `backend/src/sql/seed_users.sql`
```sql
-- Dùng cột đúng: ten, mat_khau, vai_tro, dien_thoai, dia_chi
-- Password được hash với bcrypt (admin123)
-- Dùng INSERT IGNORE để tránh lỗi nếu admin đã tồn tại
```

### 3. Cập Nhật `docker-compose.yml`
```yaml
# Backend service: Thêm uploads_data volume
volumes:
  - ./backend/public:/app/public
  - uploads_data:/app/public/uploads

# Root volumes section: Thêm uploads_data định nghĩa
volumes:
  mysql_data:
  uploads_data:
```

### 4. Fix `backend/src/models/users.js`
- Simplified alias `mat_khau` query cho rõ ràng

---

## 🚀 Cách Sử Dụng

### Chạy Docker lần đầu tiên:
```bash
docker-compose down -v  # Xóa tất cả (nếu muốn làm sạch)
docker-compose up --build
```

### Kết quả:
1. ✅ MySQL khởi tạo schema + seed data
2. ✅ Backend tự động tạo admin user (nếu chưa tồn tại)
3. ✅ Đăng nhập admin: `admin@gmail.com` / `admin123`
4. ✅ Dữ liệu MySQL được lưu tại `mysql_data` volume
5. ✅ Upload images được lưu tại `uploads_data` volume

### Xóa container mà giữ dữ liệu:
```bash
docker-compose down  # Chỉ xóa container, không xóa volume
docker-compose up    # Dữ liệu vẫn còn
```

### Xóa hoàn toàn cả volume:
```bash
docker-compose down -v  # Xóa container + volume
```

---

## 📊 Kiểm Tra Volumes

```bash
# Xem danh sách volumes
docker volume ls

# Xem chi tiết volume
docker volume inspect laptopcu_mysql_data
docker volume inspect laptopcu_uploads_data

# Xóa tất cả unused volumes
docker volume prune
```

---

## 🔐 Thông Tin Đăng Nhập Mặc Định

| Loại | Email | Mật khẩu | Vai trò |
|------|-------|----------|--------|
| Admin | admin@gmail.com | admin123 | admin |

---

## 📝 Ghi Chú

- Mật khẩu admin được hash với bcrypt (cost factor: 12)
- Khi thay đổi mật khẩu, luôn sử dụng bcrypt hash
- Volumes được tạo tự động khi chạy `docker-compose up`
- Dữ liệu volumes được lưu tại `/var/lib/docker/volumes/` trên host

---

## ⚠️ Troubleshooting

### Lỗi: "Admin login failed"
- **Check**: Container backend log: `docker logs laptopcu_backend`
- **Fix**: Xóa container + rebuild: `docker-compose down && docker-compose up --build`

### Lỗi: "Database connection failed"
- **Check**: MySQL container log: `docker logs laptopcu_mysql`
- **Fix**: Đợi MySQL ready (~5-10 giây)

### Images upload mất sau restart
- **Check**: Volumes config trong docker-compose.yml
- **Fix**: Đảm bảo `uploads_data:/app/public/uploads` được định nghĩa

