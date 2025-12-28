# 💻 Website Mua Bán Laptop Cũ Chất Lượng Cao

<div align="center">

![Status](https://img.shields.io/badge/Status-Complete-brightgreen)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)
![Node](https://img.shields.io/badge/Node.js-v16%2B-green)
![React](https://img.shields.io/badge/React-19.1.1-61DAFB?logo=react)

**Nền tảng e-commerce chuyên biệt cho mua bán laptop cũ với chất lượng cao**

</div>

---

## 👤 Thông tin dự án

| Thông tin | Chi tiết |
|-----------|---------|
| **Tên dự án** | Xây dựng website bán Laptop đã qua sử dụng |
| **Tác giả** | Nguyễn Phúc An |
| **MSSV** | 110122214 |
| **Lớp** | DA22TTA |
| **Ngành** | Công nghệ Thông tin |
| **Repository** | [GitHub](https://github.com/Nguyen-Phuc-An/cn-da22tta-nguyenphucan-laptopcu) |

---

## ✨ Tính năng chính

### 👥 Cho Khách hàng
- ✅ Duyệt và tìm kiếm sản phẩm
- ✅ Lọc theo danh mục, giá, thông số kỹ thuật
- ✅ Xem chi tiết sản phẩm với ảnh, đánh giá
- ✅ Giỏ hàng với lưu trữ localStorage
- ✅ Danh sách yêu thích (Wishlist)
- ✅ Đặt hàng với thông tin giao hàng
- ✅ Xác thực sinh viên qua email `.edu.vn` → Giảm giá 500K
- ✅ Đánh giá và bình luận sản phẩm
- ✅ Chat real-time với admin

### 🔧 Cho Admin
- ✅ Quản lý sản phẩm (Thêm, sửa, xóa)
- ✅ Upload hình ảnh sản phẩm (tối đa 5 ảnh/sản phẩm)
- ✅ Quản lý danh mục sản phẩm
- ✅ Quản lý đơn hàng & cập nhật trạng thái
- ✅ Quản lý người dùng
- ✅ Bảng điều khiển thống kê (Dashboard)
- ✅ Biểu đồ doanh số theo tuần/tháng/năm
- ✅ Duyệt xác thực sinh viên

---

## 🎯 Hiệu năng

| Chỉ số | Giá trị |
|--------|--------|
| **Tổng thời gian tải trang** | 1.8 - 2.3 giây |
| **API Response Time** | 110 - 180 ms |
| **Concurrent Users** | 100+ |
| **Database Query Time** | < 50 ms |

---

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│   React Client  │◄──────┤  Express Server  │◄──────┤   MySQL 8.0      │
│   (Port 5173)   │       │  (Port 3000)     │       │  (Port 3306)     │
└─────────────────┘       └──────────────────┘       └──────────────────┘
        ▲                           ▲                          ▲
        │                           │                          │
     Vite                        Node.js                   Database
     React 19                   Express.js                  Schema
     Context API                Socket.IO                  Queries
```

---

## 📚 Tech Stack

### 🎨 Frontend
```javascript
✓ React 19.1.1         // UI Framework
✓ Vite 7.1.7           // Build Tool
✓ React Router          // Navigation
✓ Context API           // State Management
✓ Fetch API             // HTTP Requests
✓ CSS3                  // Styling (Flexbox, Grid)
✓ Socket.IO Client      // Real-time Chat
✓ React Icons           // Icons
```

### 🔧 Backend
```javascript
✓ Node.js 16+           // Runtime
✓ Express.js 4.x        // Web Framework
✓ MySQL2 / Promise      // Database Driver
✓ JWT                   // Authentication
✓ bcryptjs              // Password Hashing
✓ Multer                // File Upload
✓ Socket.IO             // Real-time Communication
✓ CORS                  // Cross-Origin
```

### 📦 DevOps
```
✓ Docker                // Containerization
✓ Docker Compose        // Orchestration
✓ Git / GitHub          // Version Control
✓ MySQL Phpmyadmin      // Database UI
```

---

## 🚀 Quick Start

### Điều kiện tiên quyết
- **Node.js** >= 16
- **Docker & Docker Compose** (khuyến nghị)
- **MySQL** >= 8.0
- **Git**

### Cài đặt & Chạy

#### 🐳 Với Docker (Khuyến nghị)
```bash
# Clone dự án
git clone https://github.com/Nguyen-Phuc-An/cn-da22tta-nguyenphucan-laptopcu.git
cd CN-Web-BanLaptopCu

# Chạy Docker
docker-compose up --build

# Truy cập
# Frontend: http://localhost:5173
# Backend:  http://localhost:3000
# Admin DB: http://localhost:8080
```

#### 💻 Local Development
```bash
# Clone
git clone <repo-url>
cd CN-Web-BanLaptopCu

# Backend
cd backend
npm install
npm run dev
# Chạy trên: http://localhost:3000

# Frontend (terminal khác)
cd frontend
npm install
npm run dev
# Chạy trên: http://localhost:5173
```

---

## 📁 Cấu trúc dự án

```
CN-Web-BanLaptopCu/
│
├── 📂 backend/
│   ├── 📂 src/
│   │   ├── app.js
│   │   ├── db.js
│   │   ├── 📂 api/
│   │   ├── 📂 controllers/
│   │   ├── 📂 models/
│   │   ├── 📂 middlewares/
│   │   ├── 📂 routes/
│   │   └── 📂 sql/
│   ├── 📂 public/uploads/
│   ├── Dockerfile
│   └── package.json
│
├── 📂 frontend/
│   ├── 📂 src/
│   │   ├── 📂 api/
│   │   ├── 📂 components/
│   │   ├── 📂 pages/
│   │   ├── 📂 context/
│   │   ├── 📂 styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile
│   └── package.json
│
├── 📄 docker-compose.yml
├── 📄 API_TESTS.http
├── 📄 CHUONG_3_HIEN_THUC_HOA.md
├── 📄 CHUONG_4_KET_QUA_NGHIEN_CUU.md
├── 📄 CHUONG_5_KET_LUAN_VA_HUONG_PHAT_TRIEN.md
├── 📄 PHU_LUC.md
└── 📄 README.md
```

---

## 🔐 Tài khoản Test

| Loại | Email | Password | Quyền |
|------|-------|----------|-------|
| **Admin** | `admin@gmail.com` | `admin123` | Quản lý toàn hệ thống |
| **Khách hàng** | `an@gmail.com` | `123` | Mua hàng, đánh giá |
| **Sinh viên** | `phucan@gmail.com` | `123` | Mua hàng + Giảm giá Edu |

---

## 📊 Các API Endpoint Chính

### Authentication
```http
POST   /api/auth/register                 # Đăng ký
POST   /api/auth/login                    # Đăng nhập
POST   /api/auth/change-password          # Đổi mật khẩu
GET    /api/auth/edu-status               # Kiểm tra Edu
```

### Products
```http
GET    /api/products                      # Danh sách (support filter)
GET    /api/products/:id                  # Chi tiết
POST   /api/products                      # Tạo mới (admin)
PUT    /api/products/:id                  # Cập nhật (admin)
DELETE /api/products/:id                  # Xóa (admin)
```

### Orders
```http
POST   /api/orders                        # Tạo đơn hàng
GET    /api/orders                        # Danh sách đơn (user)
GET    /api/orders/:id                    # Chi tiết đơn
PUT    /api/orders/:id                    # Cập nhật trạng thái (admin)
```

### Reviews
```http
GET    /api/products/:id/reviews          # Danh sách đánh giá
POST   /api/reviews                       # Tạo/cập nhật đánh giá
DELETE /api/products/:id/reviews/:userId  # Xóa đánh giá
```

### Wishlist
```http
GET    /api/users/:userId/wishlists       # Danh sách yêu thích
POST   /api/wishlists                     # Thêm vào wishlist
DELETE /api/wishlists/:id                 # Xóa khỏi wishlist
```

### Admin
```http
GET    /api/admin/stats?period=week|month|year    # Thống kê
GET    /api/admin/orders                          # Quản lý đơn
GET    /api/admin/users                           # Quản lý user
```

👉 **Xem đầy đủ**: [API_TESTS.http](./API_TESTS.http) (58 endpoints)

---

## 🔍 Tính năng Chi tiết

### 📦 Quản lý Sản phẩm
- CRUD sản phẩm (Admin)
- Upload tối đa 5 ảnh/sản phẩm
- Hỗ trợ 15 trường thông tin: CPU, RAM, Storage, Screen, Graphics, Color, Resolution, v.v.
- Phân loại theo danh mục
- Tìm kiếm và lọc nâng cao

### 💳 Quản lý Đơn hàng
- Trạng thái đơn: Chờ → Xác nhận → Đang giao → Hoàn thành
- Thông tin giao hàng chi tiết
- Lịch sử mua hàng
- Tính năng hủy đơn

### ⭐ Đánh giá & Bình luận
- Chấm điểm 1-5 sao
- Viết review chi tiết
- Hiển thị tên người dùng thực
- Sắp xếp theo ngày mới nhất

### 🎓 Xác thực Sinh viên
- Kiểm tra email `.edu.vn`
- Nhập MSSV, CCCD, tên trường
- Giảm giá 500.000 VNĐ
- Badge xác thực trên trang

### 📊 Dashboard Admin
- Thống kê doanh thu (hôm nay, tháng, năm)
- Biểu đồ lượt mua theo hãng (Tuần/Tháng/Năm)
- Số lượng khách mới
- Sản phẩm bán chạy
- Real-time stats

---

## 🛠️ Troubleshooting

### Port đã được sử dụng
```bash
# Đổi port trong docker-compose.yml
ports:
  - "5174:5173"  # 5173 → 5174
```

### MySQL connection error
```bash
# Kiểm tra Docker running
docker ps

# Xem logs
docker-compose logs mysql
```

### Images không hiển thị
```bash
# Tạo folder uploads nếu chưa tồn tại
mkdir -p backend/public/uploads/products
mkdir -p backend/public/uploads/users
```

### Cache issues
```bash
# Clear cache
Ctrl + Shift + Delete  # Browser cache
docker-compose down -v  # Docker volumes
```

👉 **Chi tiết hơn**: [PHU_LUC.md - Troubleshooting](./PHU_LUC.md#g-troubleshooting)

---

## 📞 Liên hệ & Hỗ trợ

- **Tác giả**: Nguyễn Phúc An
- **Email**: anphuc1203@gmail.com
- **GitHub**: [@Nguyen-Phuc-An](https://github.com/Nguyen-Phuc-An)
- **Issues**: [GitHub Issues](https://github.com/Nguyen-Phuc-An/cn-da22tta-nguyenphucan-laptopcu/issues)

---

## 📄 Giấy phép

Dự án này được cấp phép dưới **MIT License**. Bạn có quyền sử dụng, sửa đổi và phân phối mã nguồn miễn là ghi công và giữ nguyên license.

```
MIT License © 2024 Nguyễn Phúc An
```

---

## 🙏 Cảm ơn

Cảm ơn các thư viện và công cụ đã giúp xây dựng dự án này:
- React & Vite Team
- Express.js Community
- MySQL Contributors
- Docker Team

---

<div align="center">

**Made with ❤️ by Nguyễn Phúc An**

⭐ Nếu bạn thích dự án này, hãy cho một ngôi sao!

[⬆ Back to top](#-website-mua-bán-laptop-cũ-chất-lượng-cao)

</div>
