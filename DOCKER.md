# Hướng Dẫn Chạy Docker

## 1. Yêu Cầu
- Docker Desktop đã cài đặt và chạy
- Port 3000, 3306, 5173 trống

## 2. Khởi Chạy

### Windows (PowerShell):
```powershell
docker-compose up -d
```

### Linux/Mac:
```bash
docker-compose up -d
```

## 3. Truy Cập
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Database**: localhost:3307

## 4. Đăng Nhập Database
```
Host: localhost:3307
User: user
Password: password123
Database: laptopcu
```

## 5. Lệnh Hữu Ích

**Xem logs:**
```
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
```

**Dừng các container:**
```
docker-compose down
```

**Xóa toàn bộ (bao gồm dữ liệu):**
```
docker-compose down -v
```

**Rebuild images:**
```
docker-compose up -d --build
```

**Vào container MySQL:**
```
docker exec -it laptopcu_mysql mysql -u user -ppassword123 laptopcu
```

## 6. Lưu Ý
- Dữ liệu MySQL sẽ được lưu trong volume `mysql_data`
- Files tĩnh backend (uploads) được mount từ `./backend/public`
- Frontend chạy ở development mode với hot reload
