# CN-Web-BanLaptopCu 🛒

**Đồ án Công nghệ**: Website mua bán laptop cũ chất lượng cao

**Tác giả**: Nguyễn Phúc An  
**MSSV**: DA22TTA  
**Lớp**: DA22TTA  
**Ngành**: Công Nghệ Thông Tin

---

## 📋 Mục đích đồ án

Xây dựng một nền tảng e-commerce chuyên về bán laptop cũ với các tính năng:
- ✅ Quản lý sản phẩm (CRUD)
- ✅ Hệ thống xác thực người dùng (register, login, logout)
- ✅ Giỏ hàng với lưu trữ localStorage
- ✅ Danh sách yêu thích (wishlist)
- ✅ Hệ thống thông báo Toast
- ✅ Trang chi tiết sản phẩm đầy đủ
- ✅ Giao diện responsive
- ✅ Admin dashboard (đang phát triển)

---

## 🏗️ Cấu trúc dự án

```
CN-Web-BanLaptopCu/
├── backend/                 # Server Express + MySQL
│   ├── src/
│   │   ├── app.js          # Express app setup
│   │   ├── db.js           # Database connection
│   │   ├── socket.js       # Socket.IO config
│   │   ├── controllers/    # Business logic
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middlewares/    # Auth, upload, etc
│   │   └── sql/            # Database schemas & migrations
│   ├── public/uploads/     # Uploaded images
│   └── package.json
│
├── frontend/                # React + Vite app
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── styles/         # CSS files
│   │   ├── context/        # Context API (Auth, Cart, Toast)
│   │   ├── api/            # API calls
│   │   ├── services/       # Helper services
│   │   ├── App.jsx         # Main app
│   │   └── main.jsx        # Entry point
│   └── package.json
│
└── README.md               # Documentation

```

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Token)
- **Real-time**: Socket.IO
- **File Upload**: Multer
- **Password**: bcryptjs

### Frontend
- **Library**: React 19.1.1
- **Build Tool**: Vite 7.1.7
- **Styling**: CSS3 + Flexbox + Grid
- **State Management**: React Context API
- **HTTP Client**: Fetch API
- **Icons**: react-icons
- **Storage**: localStorage

---

## 📦 Yêu cầu hệ thống

- **Node.js** >= 16
- **npm** >= 8 hoặc **pnpm**
- **MySQL** >= 5.7
- **Git**
- **PowerShell** (Windows) hoặc **bash** (Linux/Mac)

---

## ⚙️ Hướng dẫn cài đặt

### 1️⃣ Clone repository
```bash
git clone https://github.com/Nguyen-Phuc-An/cn-da22tta-nguyenphucan-laptopcu.git
cd CN-Web-BanLaptopCu
```

### 2️⃣ Thiết lập Database

#### Tạo database và schema
```bash
mysql -u root -p < backend/src/sql/schema.sql
```

#### (Tùy chọn) Thêm cột nếu chưa có
```sql
USE used_laptops;

ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at 
  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;

-- Cập nhật giá trị mặc định nếu cần
UPDATE users SET address = 'N/A' WHERE address IS NULL;
```

### 3️⃣ Cấu hình Backend

#### Tạo file `.env` trong folder `backend/`
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASS=your_mysql_password
DB_NAME=used_laptops
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRES_IN=7d
```

#### Cài đặt dependencies
```powershell
cd backend
npm install
```

#### Chạy server
```powershell
npm run dev
# Server sẽ chạy trên http://localhost:3000
```

### 4️⃣ Cấu hình Frontend

#### Cài đặt dependencies
```powershell
cd frontend
npm install
```

#### Chạy ứng dụng
```powershell
npm run dev
# Frontend sẽ chạy trên http://localhost:5173
```

---

## 👤 Tài khoản mặc định

### Admin Account
- **Email**: `admin@example.com`
- **Password**: `admin123`

### Test User
- **Email**: `user@example.com`
- **Password**: `user123`

> Nếu muốn reset password admin:
```powershell
cd backend
node -e "console.log(require('bcryptjs').hashSync('admin123', 12))"
```
Sau đó copy hash vào database:
```sql
UPDATE users SET password='HASH_HERE' WHERE email='admin@example.com';
```

---

## 🎯 Các tính năng chính

### 👥 Quản lý người dùng
- ✅ Đăng ký tài khoản
- ✅ Đăng nhập / Đăng xuất
- ✅ Xác thực JWT
- ✅ Hồ sơ người dùng

### 📦 Quản lý sản phẩm
- ✅ Danh sách sản phẩm (Home page)
- ✅ Chi tiết sản phẩm với ảnh, mô tả, specs
- ✅ Lọc theo giá & danh mục
- ✅ Tìm kiếm sản phẩm
- ✅ Xếp loại & đánh giá

### 🛒 Giỏ hàng
- ✅ Thêm/xóa sản phẩm
- ✅ Cập nhật số lượng (với kiểm tra tồn kho)
- ✅ Lưu giỏ hàng vào localStorage
- ✅ Hiển thị tổng tiền
- ✅ Giao diện grid card responsive

### ❤️ Danh sách yêu thích
- ✅ Thêm/xóa sản phẩm yêu thích
- ✅ Xem danh sách yêu thích
- ✅ Lưu vào database
- ✅ Hiển thị trên wishlist page

### 🔔 Thông báo
- ✅ Toast notifications (success, error, warning, info)
- ✅ Auto-dismiss sau 3 giây
- ✅ Stacking notifications
- ✅ Thay thế alert() cũ

### 📱 Giao diện
- ✅ Header với logo, tìm kiếm, giỏ hàng badge
- ✅ Footer với social links
- ✅ Responsive design (mobile-first)
- ✅ Dark/Light elements (tuỳ theo trang)

---

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
```

### Products
```
GET    /api/products
GET    /api/products/:id
GET    /api/products/search?q=keyword
```

### Cart (Client-side với localStorage)
```
localStorage['cart'] = JSON.stringify(items)
```

### Wishlists
```
GET    /api/wishlists/:userId
POST   /api/wishlists
DELETE /api/wishlists/:userId/:productId
```

### Users
```
GET    /api/users/profile
PUT    /api/users/:id
```

---

## 🚀 Chạy ứng dụng đầy đủ

### Terminal 1 - Backend
```powershell
cd C:\CN-Web-BanLaptopCu\backend
npm run dev
# Mở http://localhost:3000 để kiểm tra server
```

### Terminal 2 - Frontend
```powershell
cd C:\CN-Web-BanLaptopCu\frontend
npm run dev
# Mở http://localhost:5173 trên trình duyệt
```

---

## 🧪 Test API (PowerShell)

### Login example
```powershell
$body = @{
  email = "admin@example.com"
  password = "admin123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

### Get products
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/products" -Method Get
```

---

## 🐛 Xử lý lỗi phổ biến

### ❌ "email and password required"
**Nguyên nhân**: Payload không đúng format  
**Giải pháp**: Kiểm tra `frontend/src/api/auth.js` và DevTools → Network

### ❌ "email exists" (409)
**Nguyên nhân**: Email đã tồn tại trong database  
**Giải pháp**: 
```sql
SELECT id, email FROM users WHERE email='email@example.com';
DELETE FROM users WHERE email='email@example.com';
```

### ❌ "Unknown column 'updated_at'"
**Nguyên nhân**: Cột chưa được thêm vào database  
**Giải pháp**: Chạy ALTER TABLE (xem phần thiết lập database)

### ❌ Ảnh logo không hiển thị
**Nguyên nhân**: Đường dẫn ảnh sai  
**Giải pháp**: Đặt ảnh logo tại `backend/public/uploads/products/Logo.png`

### ❌ CORS errors
**Nguyên nhân**: Frontend và backend domain khác  
**Giải pháp**: Backend đã cấu hình CORS trong `app.js`

### ❌ Giỏ hàng không lưu
**Nguyên nhân**: localStorage bị disabled hoặc quota vượt quá  
**Giải pháp**: Kiểm tra DevTools → Application → Local Storage

---

## 📚 Hướng dẫn phát triển thêm

### Thêm tính năng mới
1. Backend: Thêm controller, route, middleware
2. Frontend: Thêm component, page, API service
3. Test API endpoint
4. Cập nhật README.md

### Database migrations
```sql
-- Ví dụ: thêm cột mới
ALTER TABLE products ADD COLUMN `discount` INT DEFAULT 0;

-- Backup database
mysqldump -u root -p used_laptops > backup.sql
```

### Deploy (tương lai)
- Backend: Heroku, Railway, DigitalOcean
- Frontend: Vercel, Netlify, GitHub Pages
- Database: AWS RDS, Google Cloud SQL

---

## 📝 Ghi chú

- **Ngôn ngữ**: Tiếng Việt (UI), English (code comments)
- **License**: Personal use
- **Last Updated**: December 4, 2025
- **Status**: 🔄 In Development (Phase 5)

---

## 📞 Liên hệ & Hỗ trợ

- **Email**: nguyenphucan@example.com
- **GitHub**: https://github.com/Nguyen-Phuc-An
- **Repository**: https://github.com/Nguyen-Phuc-An/cn-da22tta-nguyenphucan-laptopcu

---

**Cảm ơn bạn đã quan tâm đến dự án này!** 🙏

