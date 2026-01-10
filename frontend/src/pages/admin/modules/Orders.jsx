import React, { useState, useEffect } from 'react';
import { BsFileEarmarkText, BsMapMarkerFill, BsPhone, BsEnvelope, BsBuilding, BsCheckCircle, BsXCircle, BsChevronRight, BsDownload, BsX, BsHandThumbsUp, BsExclamationTriangle } from 'react-icons/bs';
import { apiFetch } from '../../../services/apiClient';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderStatus, setOrderStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);
  // Tải đơn hàng từ API
  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/orders');
      const data = Array.isArray(res) ? res : res?.data || [];
      setOrders(data);
      setFilteredOrders(data);
    } catch (err) {
      setError('Lỗi tải đơn hàng: ' + err.message);
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };
  // Lọc đơn hàng theo trạng thái
  useEffect(() => {
    if (orderStatus === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(o => o.trang_thai === orderStatus));
    }
  }, [orderStatus, orders]);
  // Trạng thái đơn hàng
  const statuses = [
    { id: 'all', label: 'Tất cả' },
    { id: 'pending', label: 'Chờ xác nhận' },
    { id: 'confirmed', label: 'Đã xác nhận' },
    { id: 'shipping', label: 'Đang giao' },
    { id: 'completed', label: 'Hoàn thành' },
    { id: 'canceled', label: 'Đã hủy' }
  ];
  // Lấy nhãn trạng thái
  const getStatusLabel = (status) => {
    const s = statuses.find(st => st.id === status);
    return s ? s.label : status || '-';
  };
  // Lấy màu trạng thái
  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#ffc107';
      case 'confirmed': return '#17a2b8';
      case 'shipping': return '#007bff';
      case 'completed': return '#28a745';
      case 'canceled': return '#dc3545';
      default: return '#6c757d';
    }
  };
  // Luồng tiến trình trạng thái: pending -> confirmed -> shipping -> completed
  const getNextStatus = (currentStatus) => {
    switch(currentStatus) {
      case 'pending':
        return 'confirmed';
      case 'confirmed':
        return 'shipping';
      case 'shipping':
        return 'completed';
      case 'completed':
        return 'completed'; // Cannot progress further
      case 'canceled':
        return 'canceled'; // Cannot change if cancelled
      default:
        return 'pending';
    }
  };
  // Kiểm tra xem có thể tiến hành trạng thái tiếp theo không
  const canProgressStatus = (currentStatus) => {
    return currentStatus !== 'completed' && currentStatus !== 'canceled';
  };
  // Xử lý tiến trình trạng thái
  const handleProgressStatus = async () => {
    const nextStatus = getNextStatus(selectedOrder.trang_thai);
    if (nextStatus !== selectedOrder.trang_thai) {
      await handleUpdateOrderStatus(nextStatus);
    }
  };
  // Xác nhận hủy đơn hàng
  const handleCancelOrder = async () => {
    if (window.confirm('Bạn chắc chắn muốn hủy đơn hàng này?')) {
      await handleUpdateOrderStatus('canceled');
    }
  };
  // Cập nhật trạng thái đơn hàng
  const handleUpdateOrderStatus = async (newStatus) => {
    try {
      setLoading(true);
      await apiFetch(`/orders/${selectedOrder.id}/status`, {
        method: 'PUT',
        body: { trang_thai: newStatus }
      });
      
      // Update local state
      const updatedOrders = orders.map(o => 
        o.id === selectedOrder.id ? { ...o, trang_thai: newStatus } : o
      );
      setOrders(updatedOrders);
      setSelectedOrder({ ...selectedOrder, trang_thai: newStatus });
      
      setError('');
    } catch (err) {
      setError('Lỗi cập nhật trạng thái: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  // Xuất hóa đơn đơn hàng
  const handleExportInvoice = () => {
    // Thông tin cửa hàng
    const storeInfo = {
      name: 'AN LAPTOP CŨ',
      address: '123 Lê Lợi, Quận 1, TP. Hồ Chí Minh',
      phone: '0988 123 456',
      mst: '0123456789',
      email: 'contact@anlaptopcu.vn'
    };

    // Tính tổng tiền sản phẩm (trước giảm giá)
    const totalProductPrice = selectedOrder.items && selectedOrder.items.length > 0
      ? selectedOrder.items.reduce((sum, item) => {
          const quantity = item.so_luong || item.quantity || 0;
          const unitPrice = item.don_gia || item.gia || item.gia_ban || item.price || 0;
          return sum + (quantity * unitPrice);
        }, 0)
      : 0;

    const eduDiscount = selectedOrder.giam_gia_edu || 0;
    const finalTotal = totalProductPrice - eduDiscount;
    const invoiceDate = selectedOrder.tao_luc ? new Date(selectedOrder.tao_luc) : new Date();

    const invoiceWindow = window.open('', '', 'width=950,height=800');
    // Tạo nội dung hóa đơn
    const invoiceContent = `
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Hóa đơn bán hàng #${selectedOrder.id}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Arial', 'Times New Roman', serif;
            color: #333;
            background: white;
            line-height: 1.6;
          }
          .invoice-container {
            width: 210mm;
            height: 297mm;
            margin: 0 auto;
            padding: 15mm;
            background: white;
          }
          .invoice-header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #333;
            padding-bottom: 15px;
          }
          .store-name {
            font-size: 18px;
            font-weight: bold;
            color: #d32f2f;
            margin-bottom: 10px;
          }
          .store-contact {
            font-size: 11px;
            color: #666;
            line-height: 1.5;
          }
          .invoice-title {
            text-align: center;
            font-size: 16px;
            font-weight: bold;
            margin: 15px 0;
            text-transform: uppercase;
            color: #111;
            border-bottom: 1px solid #999;
            padding-bottom: 10px;
          }
          .invoice-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 15px;
            font-size: 11px;
          }
          .info-item {
            margin-bottom: 4px;
          }
          .info-label {
            font-weight: bold;
            color: #333;
            display: inline-block;
            width: 90px;
          }
          .section-title {
            font-weight: bold;
            font-size: 12px;
            margin: 12px 0 8px 0;
            color: #111;
            text-transform: uppercase;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
          }
          .customer-info {
            font-size: 11px;
            margin-bottom: 12px;
          }
          .customer-info p {
            margin: 3px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
            font-size: 11px;
          }
          th {
            background-color: #f0f0f0;
            border: 1px solid #999;
            padding: 6px;
            text-align: left;
            font-weight: bold;
            color: #333;
          }
          td {
            border: 1px solid #999;
            padding: 6px;
            color: #666;
          }
          .text-center {
            text-align: center;
          }
          .text-right {
            text-align: right;
          }
          .summary-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
            font-size: 11px;
          }
          .summary-table th {
            background-color: #f0f0f0;
            border: 1px solid #999;
            padding: 6px;
            text-align: right;
            font-weight: bold;
          }
          .summary-table td {
            border: 1px solid #999;
            padding: 6px;
            text-align: right;
          }
          .total-row {
            font-weight: bold;
            background-color: #fffbeb;
            color: #111;
          }
          .warranty-section {
            font-size: 10px;
            margin: 10px 0;
            padding: 8px;
            background-color: #f9f9f9;
            border-left: 3px solid #d32f2f;
          }
          .warranty-section ul {
            margin: 5px 0 0 20px;
            padding: 0;
          }
          .warranty-section li {
            margin: 3px 0;
          }
          .notes-section {
            font-size: 10px;
            margin: 10px 0;
            padding: 8px;
            background-color: #f0f8ff;
            border-left: 3px solid #007bff;
          }
          .notes-section ul {
            margin: 5px 0 0 20px;
            padding: 0;
          }
          .notes-section li {
            margin: 3px 0;
          }
          .footer {
            text-align: center;
            font-size: 10px;
            color: #666;
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px solid #ddd;
            line-height: 1.5;
          }
          .footer-thank {
            font-weight: bold;
            color: #d32f2f;
            margin-bottom: 5px;
          }
          @media print {
            body {
              margin: 0;
              padding: 0;
            }
            .invoice-container {
              margin: 0;
              padding: 10mm;
              box-shadow: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <!-- Header -->
          <div class="invoice-header">
            <div class="store-name">${storeInfo.name}</div>
            <div class="store-contact">
              <div>Địa chỉ: ${storeInfo.address}</div>
              <div>Hotline: ${storeInfo.phone}</div>
              <div>Email: ${storeInfo.email}</div>
              <div>Mã số thuế: ${storeInfo.mst}</div>
            </div>
          </div>

          <!-- Tiêu đề -->
          <div class="invoice-title">Hóa Đơn Bán Hàng</div>

          <!-- Thông tin hóa đơn -->
          <div class="invoice-info">
            <div>
              <div class="info-item">
                <span class="info-label">Mã đơn hàng:</span>
                <span>#${selectedOrder.id}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Ngày tạo:</span>
                <span>${invoiceDate.toLocaleDateString('vi-VN')}</span>
              </div>
              <div class="info-item">
                <span class="info-label">P.T. thanh toán:</span>
                <span>${selectedOrder.phuong_thuc_thanh_toan === 'cod' ? 'COD (Thanh toán khi nhận hàng)' : 'Chuyển khoản'}</span>
              </div>
            </div>
            <div>
              ${selectedOrder.ghi_chu ? `
              <div class="info-item">
                <span class="info-label">Ghi chú:</span>
                <span>${selectedOrder.ghi_chu}</span>
              </div>
              ` : ''}
            </div>
          </div>

          <!-- 1. Thông tin khách hàng -->
          <div class="section-title">1. Thông tin khách hàng</div>
          <div class="customer-info">
            <p><strong>Họ tên:</strong> ${selectedOrder.ten_nguoi_nhan || '-'}</p>
            <p><strong>Số điện thoại:</strong> ${selectedOrder.dien_thoai_nhan || '-'}</p>
            <p><strong>Địa chỉ giao hàng:</strong> ${selectedOrder.dia_chi_nhan || '-'}</p>
          </div>

          <!-- 2. Danh sách sản phẩm -->
          <div class="section-title">2. Danh sách sản phẩm</div>
          <table>
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th class="text-center">Số lượng</th>
                <th class="text-right">Đơn giá</th>
                <th class="text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              ${selectedOrder.items && selectedOrder.items.length > 0 ? selectedOrder.items.map(item => {
                const quantity = item.so_luong || item.quantity || 0;
                const unitPrice = item.don_gia || item.gia || item.gia_ban || item.price || 0;
                const itemTotal = item.thanh_tien || (quantity * unitPrice);
                return `
                  <tr>
                    <td>${item.ten || item.tieu_de || item.ten_san_pham || item.product_name || '-'}</td>
                    <td class="text-center">${quantity}</td>
                    <td class="text-right">${Number(unitPrice).toLocaleString('vi-VN')}₫</td>
                    <td class="text-right">${Number(itemTotal).toLocaleString('vi-VN')}₫</td>
                  </tr>
                `;
              }).join('') : '<tr><td colspan="4" class="text-center">Không có sản phẩm</td></tr>'}
            </tbody>
          </table>

          <!-- 3. Tổng hợp thanh toán -->
          <div class="section-title">3. Tổng hợp thanh toán</div>
          <table class="summary-table">
            <thead>
              <tr>
                <th style="text-align: left; width: 70%;">Mục</th>
                <th style="text-align: right; width: 30%;">Số tiền</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="text-align: left;">Tổng tiền hàng</td>
                <td class="text-right">${Number(totalProductPrice).toLocaleString('vi-VN')}₫</td>
              </tr>
              ${eduDiscount > 0 ? `
              <tr>
                <td style="text-align: left;">Giảm giá EDU</td>
                <td class="text-right">-${Number(eduDiscount).toLocaleString('vi-VN')}₫</td>
              </tr>
              ` : ''}
              <tr class="total-row">
                <td style="text-align: left;">Tổng thanh toán</td>
                <td class="text-right">${Number(finalTotal).toLocaleString('vi-VN')}₫</td>
              </tr>
            </tbody>
          </table>

          <!-- 4. Điều kiện bảo hành -->
          <div class="section-title">4. Điều kiện bảo hành</div>
          <div class="warranty-section">
            <ul>
              <li>Laptop cũ được bảo hành 6 tháng (Main – RAM – SSD)</li>
              <li>Không bảo hành lỗi do người dùng gây ra (rơi, nước vào, va đập, cháy nổ…)</li>
              <li>Phụ kiện tặng kèm bảo hành 1 tháng</li>
            </ul>
          </div>

          <!-- 5. Ghi chú -->
          <div class="section-title">5. Ghi chú</div>
          <div class="notes-section">
            <ul>
              <li>Khách hàng kiểm tra kỹ trước khi nhận hàng</li>
              <li>Hỗ trợ cài đặt phần mềm miễn phí trọn đời</li>
            </ul>
          </div>

          <!-- Footer -->
          <div class="footer">
            <div class="footer-thank">Cảm ơn quý khách!</div>
            <p style="margin: 5px 0;">Cảm ơn quý khách đã tin tưởng và mua hàng tại ${storeInfo.name}.</p>
            <p style="margin: 0;">Hẹn gặp lại quý khách trong những lần mua hàng tiếp theo!</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    invoiceWindow.document.write(invoiceContent);
    invoiceWindow.document.close();
    invoiceWindow.focus();
    
    // Auto print after a short delay to ensure content is loaded
    setTimeout(() => {
      invoiceWindow.print();
    }, 250);
  };
  // Giao diện chính
  return (
    <div className="admin-panel">
      <div className="panel-header">
        <button className="btn btn-primary" onClick={loadOrders} disabled={loading}>
          {loading ? 'Đang tải...' : 'Tải lại'}
        </button>
      </div>

      {error && <div className="alert alert-error" style={{marginBottom: '20px'}}>{error}</div>}

      <div className="tabs">
        {statuses.map(s => (
          <button
            key={s.id}
            className={`tab ${orderStatus === s.id ? 'active' : ''}`}
            onClick={() => setOrderStatus(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>
      {/* Bảng danh sách đơn hàng */}
      <table className="data-table">
        <thead>
          <tr>
            <th>Mã đơn</th>
            <th>Khách hàng</th>
            <th>SĐT</th>
            <th>Ngày đặt</th>
            <th>Tổng tiền</th>
            <th>P.T. thanh toán</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.length === 0 ? (
            <tr><td colSpan="7" style={{ textAlign: 'center', color: '#999' }}>Không có đơn nào</td></tr>
          ) : (
            filteredOrders.map(o => (
              <tr key={o.id} onClick={() => setSelectedOrder(o)} style={{ cursor: 'pointer' }}>
                <td>#{o.id}</td>
                <td>{o.ten_nguoi_nhan || '-'}</td>
                <td>{o.dien_thoai_nhan || '-'}</td>
                <td>{o.tao_luc ? new Date(o.tao_luc).toLocaleDateString('vi-VN') : '-'}</td>
                <td>{(o.tong_tien || 0).toLocaleString('vi-VN')}₫</td>
                <td>
                  <span style={{fontSize: '12px', color: '#666'}}>
                    {o.phuong_thuc_thanh_toan === 'cod' ? 'COD' : 'Chuyển khoản'}
                  </span>
                </td>
                <td>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600',
                    background: getStatusColor(o.trang_thai),
                    color: 'white',
                    display: 'inline-block'
                  }}>
                    {getStatusLabel(o.trang_thai)}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {/* Modal chi tiết đơn hàng */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <h3>Chi tiết đơn hàng #{selectedOrder.id}</h3>
              <div style={{display: 'flex', gap: '10px'}}>
                <button 
                  className="btn btn-primary" 
                  onClick={handleExportInvoice}
                  style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    borderRadius: '4px'
                  }}
                  title="Xuất hóa đơn"
                >
                  <i class="bi bi-file-earmark-pdf"></i> Xuất hóa đơn
                </button>
                <button className="close-btn" onClick={() => setSelectedOrder(null)}><i class="bi bi-x-lg"></i></button>
              </div>
            </div>
            
            <div className="modal-body">
            
            <div className="customer-info-section">
              <div style={{marginBottom: '16px'}}>
                <h4 style={{margin: '0', fontSize: '16px', fontWeight: '700', color: '#111827'}}>Thông tin giao hàng</h4>
              </div>
              <div className="info-field">
                <span className="info-label">Tên nhận:</span>
                <span className="info-value">{selectedOrder.ten_nguoi_nhan || '-'}</span>
              </div>
              <div className="info-field">
                <span className="info-label">SĐT:</span>
                <span className="info-value">{selectedOrder.dien_thoai_nhan || '-'}</span>
              </div>
              <div className="info-field">
                <span className="info-label">Ngày đặt:</span>
                <span className="info-value">{selectedOrder.tao_luc ? new Date(selectedOrder.tao_luc).toLocaleDateString('vi-VN') : '-'}</span>
              </div>
              <div className="info-field">
                <span className="info-label">P.T. thanh toán:</span>
                <span className="info-value">{selectedOrder.phuong_thuc_thanh_toan === 'cod' ? 'COD (Thanh toán khi nhận)' : 'Chuyển khoản ngân hàng'}</span>
              </div>
              <div className="info-field">
                <span className="info-label">Địa chỉ:</span>
                <span className="info-value">{selectedOrder.dia_chi_nhan || '-'}</span>
              </div>
              <div className="info-field" style={{borderBottom: 'none'}}>
                <span className="info-label">Ghi chú:</span>
                <span className="info-value">{selectedOrder.ghi_chu || '-'}</span>
              </div>
            </div>

            <div className="orders-section">
              <h4>Danh sách sản phẩm</h4>
              {Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 ? (
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Sản phẩm</th>
                      <th style={{textAlign: 'center'}}>Số lượng</th>
                      <th style={{textAlign: 'right'}}>Đơn giá</th>
                      <th style={{textAlign: 'right'}}>Tổng cộng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, i) => {
                      const quantity = item.so_luong || item.quantity || 0;
                      const unitPrice = item.don_gia || item.gia || item.gia_ban || item.price || item.don_gia || 0;
                      // Use thanh_tien from order_items if available, otherwise calculate
                      const itemTotal = item.thanh_tien || (quantity * unitPrice);
                      return (
                        <tr key={i}>
                          <td>{item.ten || item.tieu_de || item.ten_san_pham || item.product_name || '-'}</td>
                          <td style={{textAlign: 'center'}}>{quantity}</td>
                          <td style={{textAlign: 'right'}}>{Number(unitPrice).toLocaleString('vi-VN')}₫</td>
                          <td style={{textAlign: 'right', fontWeight: '600', color: '#d32f2f'}}>
                            {Number(itemTotal).toLocaleString('vi-VN')}₫
                          </td>
                        </tr>
                      );
                    })}
                    {(selectedOrder.giam_gia_edu || 0) > 0 && (
                      <tr style={{borderTop: '2px solid #e5e7eb', background: '#fffbeb'}}>
                        <td colSpan="3" style={{textAlign: 'right', paddingRight: '12px', fontWeight: '600', color: '#92400e'}}>Giảm giá EDU:</td>
                        <td style={{textAlign: 'right', color: '#10b981', fontSize: '14px', paddingRight: '12px', fontWeight: '600'}}>
                          -{Number(selectedOrder.giam_gia_edu || 0).toLocaleString('vi-VN')}₫
                        </td>
                      </tr>
                    )}
                    <tr style={{borderTop: '2px solid #667eea', fontWeight: '600', background: '#f9fafb'}}>
                      <td colSpan="3" style={{textAlign: 'right', paddingRight: '12px'}}>Tổng thanh toán:</td>
                      <td style={{textAlign: 'right', color: '#667eea', fontSize: '16px', paddingRight: '12px'}}>
                        {(selectedOrder.tong_tien || 0).toLocaleString('vi-VN')}₫
                      </td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <div className="empty-state">Không có sản phẩm</div>
              )}
            </div>

            <div className="orders-section">
              <h4>Cập nhật trạng thái</h4>
              <div style={{marginBottom: '15px'}}>
                <p style={{fontSize: '13px', color: '#6b7280', marginBottom: '10px'}}>
                  Trạng thái hiện tại: <strong style={{color: getStatusColor(selectedOrder.trang_thai)}}>{getStatusLabel(selectedOrder.trang_thai)}</strong>
                </p>
              </div>
              <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap'}}>
                <button
                  onClick={handleProgressStatus}
                  disabled={loading || !canProgressStatus(selectedOrder.trang_thai)}
                  style={{
                    padding: '10px 20px',
                    background: canProgressStatus(selectedOrder.trang_thai) ? '#10b981' : '#d1d5db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: canProgressStatus(selectedOrder.trang_thai) ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (canProgressStatus(selectedOrder.trang_thai) && !loading) {
                      e.target.style.background = '#059669';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = canProgressStatus(selectedOrder.trang_thai) ? '#10b981' : '#d1d5db';
                  }}
                >
                  {selectedOrder.trang_thai === 'completed' ? '✓ Hoàn thành' : '→ ' + getStatusLabel(getNextStatus(selectedOrder.trang_thai))}
                </button>
                <button
                  onClick={handleCancelOrder}
                  disabled={loading || selectedOrder.trang_thai === 'canceled' || selectedOrder.trang_thai === 'completed'}
                  style={{
                    padding: '10px 20px',
                    background: (selectedOrder.trang_thai === 'canceled' || selectedOrder.trang_thai === 'completed') ? '#d1d5db' : '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: (selectedOrder.trang_thai === 'canceled' || selectedOrder.trang_thai === 'completed') ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedOrder.trang_thai !== 'canceled' && selectedOrder.trang_thai !== 'completed' && !loading) {
                      e.target.style.background = '#dc2626';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = (selectedOrder.trang_thai === 'canceled' || selectedOrder.trang_thai === 'completed') ? '#d1d5db' : '#ef4444';
                  }}
                >
                  {selectedOrder.trang_thai === 'canceled' ? '✗ Đã hủy' : selectedOrder.trang_thai === 'completed' ? '✓ Hoàn thành (không hủy)' : '✕ Hủy đơn'}
                </button>
              </div>
            </div>

            </div>

            <div className="modal-footer">
              <button className="btn" onClick={() => setSelectedOrder(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
