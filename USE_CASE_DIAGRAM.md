# Sơ Đồ Use Case - Hệ Thống Bán Laptop Cũ

## Tổng Quan Hệ Thống

```
┌────────────────────────────────────────────────────────────────────────────┐
│                                                                            │
│  ┌─────────────┐                                                          │
│  │ Khách Hàng  │                                                          │
│  └────┬────────┘                                                          │
│       │                                                                   │
│       │                                                                   │
│  ┌────┴────────────────────────────────────────────────┐                 │
│  │                                                      │                 │
│  ├─→ Duyệt sản phẩm                                   │                 │
│  ├─→ Tìm kiếm sản phẩm                               │                 │
│  ├─→ Xem chi tiết sản phẩm                           │                 │
│  ├─→ Xem đánh giá & bình luận                         │                 │
│  ├─→ Thêm vào danh sách yêu thích                     │                 │
│  ├─→ Thêm vào giỏ hàng                               │                 │
│  ├─→ Xem giỏ hàng                                    │                 │
│  ├─→ Thanh toán & đặt hàng                           │                 │
│  ├─→ Xem lịch sử đơn hàng                            │                 │
│  ├─→ Theo dõi trạng thái đơn hàng                    │                 │
│  ├─→ Viết đánh giá & bình luận                       │                 │
│  ├─→ Xác thực sinh viên (nhận giảm giá)             │                 │
│  ├─→ Cập nhật hồ sơ cá nhân                          │                 │
│  ├─→ Tải ảnh đại diện                                │                 │
│  └─→ Liên hệ hỗ trợ                                  │                 │
│                                                        │                 │
│                                                        │                 │
│  ┌─────────────┐                                      │                 │
│  │ Nhân Viên   │                                      │                 │
│  └────┬────────┘                                      │                 │
│       │                                               │                 │
│       │                                               │                 │
│  ┌────┴────────────────────────────────────────────────┤                 │
│  │                                                      │                 │
│  ├─→ Quản lý sản phẩm (tạo, sửa, xóa)              │                 │
│  ├─→ Quản lý ảnh sản phẩm (tải, xóa, sắp xếp)      │                 │
│  ├─→ Quản lý danh mục (tạo, sửa, xóa)              │                 │
│  ├─→ Quản lý banner (tạo, sửa, xóa, bật/tắt)      │                 │
│  ├─→ Xem đơn hàng                                   │                 │
│  ├─→ Cập nhật trạng thái đơn hàng                  │                 │
│  ├─→ Duyệt & xóa đánh giá                           │                 │
│  ├─→ Xem tin nhắn khách hàng                        │                 │
│  └─→ Trả lời yêu cầu hỗ trợ                         │                 │
│                                                        │                 │
│                                                        │                 │
│  ┌─────────────┐                                      │                 │
│  │   Admin     │                                      │                 │
│  └────┬────────┘                                      │                 │
│       │                                               │                 │
│       │                                               │                 │
│  ┌────┴──────────────────────────────────────────────┬─┘                 │
│  │                                                    │                   │
│  ├─→ Xem Dashboard & thống kê                        │                   │
│  ├─→ Quản lý sản phẩm (tạo, sửa, xóa)               │                   │
│  ├─→ Quản lý ảnh sản phẩm (tải, xóa, sắp xếp)       │                   │
│  ├─→ Quản lý danh mục (tạo, sửa, xóa)               │                   │
│  ├─→ Quản lý banner (tạo, sửa, xóa, bật/tắt)       │                   │
│  ├─→ Xem tất cả đơn hàng                            │                   │
│  ├─→ Cập nhật trạng thái đơn hàng                   │                   │
│  ├─→ Duyệt & xóa đánh giá                           │                   │
│  ├─→ Quản lý tài khoản khách hàng (xem, xóa)       │                   │
│  ├─→ Duyệt xác thực sinh viên                       │                   │
│  ├─→ Xem & trả lời tin nhắn khách hàng              │                   │
│  ├─→ Quản lý tài khoản nhân viên (tạo, xóa)        │                   │
│  └─→ Xuất báo cáo & biểu đồ thống kê               │                   │
│                                                       │                   │
└───────────────────────────────────────────────────────┘                   │
```

---

## Chi Tiết Các Use Case

### 👤 **KHÁCH HÀNG**

| Use Case | Mô Tả | Luồng | Kết Quả |
|----------|-------|-------|---------|
| Duyệt sản phẩm | Xem danh sách tất cả sản phẩm | Vào trang chủ | Hiển thị danh sách sản phẩm |
| Tìm kiếm sản phẩm | Tìm kiếm sản phẩm theo từ khóa | Nhập từ khóa → Click tìm | Hiển thị kết quả tìm kiếm |
| Xem chi tiết sản phẩm | Xem thông tin chi tiết, ảnh, giá | Click vào sản phẩm | Hiển thị đầy đủ thông tin |
| Xem đánh giá | Xem bình luận & đánh giá từ khác | Cuộn xuống trang chi tiết | Hiển thị tất cả review |
| Thêm vào yêu thích | Lưu sản phẩm yêu thích | Click ♡ | Sản phẩm được lưu |
| Thêm vào giỏ hàng | Thêm sản phẩm vào giỏ | Click "Thêm giỏ" → Chọn số lượng | Cập nhật giỏ hàng |
| Xem giỏ hàng | Xem chi tiết sản phẩm trong giỏ | Click biểu tượng giỏ | Hiển thị danh sách, giá, tổng tiền |
| Thanh toán & đặt hàng | Thanh toán & tạo đơn hàng | Xem giỏ → Chọn địa chỉ → Xác nhận | Tạo order, nhận mã theo dõi |
| Xem lịch sử đơn hàng | Xem tất cả đơn hàng đã đặt | Click "Đơn hàng của tôi" | Hiển thị danh sách order |
| Theo dõi đơn hàng | Theo dõi trạng thái đơn | Click vào order | Hiển thị: Chờ xác nhận → Đóng gói → Gửi → Đã nhận |
| Viết đánh giá | Viết bình luận & đánh giá sản phẩm | Mua hàng → Click "Viết review" | Lưu review (chờ nhân viên duyệt) |
| Xác thực sinh viên | Xác thực để nhận giảm giá | Upload chứng chỉ học sinh | Nếu duyệt: nhận % giảm giá |
| Cập nhật hồ sơ | Sửa thông tin cá nhân | Vào Profile → Chỉnh sửa | Lưu thay đổi |
| Tải ảnh đại diện | Tải ảnh đại diện | Vào Profile → Chọn ảnh → Upload | Cập nhật ảnh user |
| Liên hệ hỗ trợ | Gửi tin nhắn hỗ trợ | Click "Liên hệ" → Điền form → Gửi | Lưu yêu cầu, nhân viên sẽ trả lời |

---

### 👨‍💼 **NHÂN VIÊN**

| Use Case | Mô Tả | Phạm Vi |
|----------|-------|---------|
| **Quản lý sản phẩm** | Tạo, sửa, xóa sản phẩm | Tên, giá, thông số, mô tả, danh mục |
| **Quản lý ảnh sản phẩm** | Tải, xóa, sắp xếp ảnh | Sản phẩm sẽ hiển thị hình ảnh chính xác |
| **Quản lý danh mục** | Tạo, sửa, xóa danh mục sản phẩm | Tổ chức sản phẩm theo nhóm |
| **Quản lý banner** | Tạo, sửa, xóa banner quảng cáo | Bật/tắt banner trên trang chủ |
| **Xem đơn hàng** | Xem danh sách tất cả đơn hàng | Thông tin khách, sản phẩm, giá |
| **Cập nhật trạng thái đơn hàng** | Thay đổi trạng thái đơn | Pending → Confirmed → Shipped → Delivered |
| **Duyệt & xóa đánh giá** | Duyệt review trước khi hiển thị | Xóa review spam/không phù hợp |
| **Xem tin nhắn khách hàng** | Xem thư từ khách hàng | Danh sách tất cả liên hệ |
| **Trả lời yêu cầu hỗ trợ** | Trả lời tin nhắn khách hàng | Gửi phản hồi qua email/hệ thống |

---

### 🔐 **ADMIN**

| Use Case | Mô Tả | Quyền Hạn |
|----------|-------|----------|
| **Xem Dashboard & thống kê** | Xem tổng quan hệ thống | Doanh thu, đơn hàng, khách mới, sản phẩm bán chạy |
| **Quản lý sản phẩm** | Tạo, sửa, xóa sản phẩm | Toàn quyền như nhân viên |
| **Quản lý ảnh sản phẩm** | Tải, xóa, sắp xếp ảnh | Toàn quyền |
| **Quản lý danh mục** | Tạo, sửa, xóa danh mục | Toàn quyền |
| **Quản lý banner** | Tạo, sửa, xóa, bật/tắt banner | Toàn quyền |
| **Xem tất cả đơn hàng** | Xem & quản lý đơn hàng | Toàn quyền |
| **Cập nhật trạng thái đơn hàng** | Thay đổi trạng thái đơn | Toàn quyền |
| **Duyệt & xóa đánh giá** | Quản lý review | Toàn quyền |
| **Quản lý tài khoản khách hàng** | Xem, xóa tài khoản khách | Tạo, xóa tài khoản |
| **Duyệt xác thực sinh viên** | Duyệt/từ chối xác thực sinh viên | Cho phép/hủy giảm giá |
| **Xem & trả lời tin nhắn** | Quản lý liên hệ khách hàng | Toàn quyền |
| **Quản lý tài khoản nhân viên** | Tạo, xóa tài khoản nhân viên | Phân quyền nhân viên |
| **Xuất báo cáo & biểu đồ** | Xuất báo cáo chi tiết | Doanh thu, orders, người dùng theo thời kỳ |

---

## Bảng Đặc Tính Chính

### Các Actor (Diễn Viên)
- **Khách hàng**: Người mua sắm trên hệ thống
- **Nhân viên**: Quản lý sản phẩm, đơn hàng, review, liên hệ
- **Admin**: Quản lý toàn bộ hệ thống + nhân viên + khách hàng

### Tổng Số Use Cases
**Khách hàng**: 15 use case
**Nhân viên**: 9 use case  
**Admin**: 13 use case
**Tổng cộng**: 37+ use case

### Mối Quan Hệ Giữa Các Actor
```
Khách hàng
    ↓ (được phục vụ bởi)
Nhân viên
    ↓ (được giám sát bởi)
Admin
```

---

## Luồng Chính - Khách Hàng Mua Hàng

```
Khách hàng vào trang chủ
    ↓
Duyệt sản phẩm / Tìm kiếm
    ↓
Xem chi tiết sản phẩm & đánh giá
    ↓
Thêm vào giỏ hàng / Danh sách yêu thích
    ↓
Xem giỏ hàng & kiểm tra
    ↓
Thanh toán & đặt hàng
    ↓
Xem lịch sử đơn hàng & theo dõi
    ↓
Nhận hàng
    ↓
Viết đánh giá ⭐
```

---

## Luồng Chính - Nhân Viên Quản Lý

```
Nhân viên đăng nhập
    ↓
    ├─→ Quản lý sản phẩm
    │   ├─ Tạo sản phẩm mới
    │   ├─ Sửa/xóa sản phẩm
    │   └─ Quản lý ảnh & danh mục
    │
    ├─→ Quản lý banner
    │   ├─ Tạo banner quảng cáo
    │   └─ Bật/tắt banner
    │
    ├─→ Quản lý đơn hàng
    │   ├─ Xem danh sách order
    │   └─ Cập nhật trạng thái
    │
    ├─→ Duyệt & xóa đánh giá
    │
    └─→ Trả lời yêu cầu hỗ trợ khách hàng
```

---

## Luồng Chính - Admin Quản Trị

```
Admin đăng nhập
    ↓
    ├─→ Xem Dashboard & thống kê
    │
    ├─→ Quản lý sản phẩm, banner, danh mục (như nhân viên)
    │
    ├─→ Quản lý đơn hàng (như nhân viên)
    │
    ├─→ Quản lý khách hàng
    │   ├─ Xem danh sách
    │   ├─ Duyệt xác thực sinh viên
    │   └─ Xóa tài khoản
    │
    ├─→ Quản lý nhân viên
    │   ├─ Tạo tài khoản nhân viên
    │   └─ Xóa tài khoản nhân viên
    │
    └─→ Xuất báo cáo & biểu đồ
```

---

## Tính Năng Nổi Bật

✅ **Cho Khách Hàng**
- Duyệt sản phẩm, tìm kiếm, lọc theo danh mục & giá
- Giỏ hàng, danh sách yêu thích
- Thanh toán & theo dõi đơn hàng
- Viết đánh giá & bình luận
- Xác thực sinh viên để nhận giảm giá
- Cập nhật hồ sơ cá nhân

✅ **Cho Nhân Viên**
- Quản lý sản phẩm, ảnh, danh mục
- Quản lý banner quảng cáo
- Xem & cập nhật trạng thái đơn hàng
- Duyệt đánh giá
- Quản lý liên hệ khách hàng

✅ **Cho Admin**
- Dashboard thống kê doanh số
- Toàn quyền quản lý sản phẩm, banner, danh mục
- Quản lý tài khoản khách hàng & nhân viên
- Duyệt xác thực sinh viên
- Xuất báo cáo chi tiết

---

**Sơ đồ này bao hàm 37+ use case chính của hệ thống bán laptop cũ với 3 actor: Khách hàng, Nhân viên, Admin.**
