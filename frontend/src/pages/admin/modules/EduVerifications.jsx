import React, { useState, useEffect, useContext, useCallback } from 'react';
import { apiFetch } from '../../../services/apiClient';
import { ToastContext } from '../../../context/Toast';

export default function EduVerifications() {
  const { addToast } = useContext(ToastContext);
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [filterStatus, setFilterStatus] = useState('pending'); // pending, approved, rejected, all
  // Tải danh sách xác thực Edu khi component mount
  const fetchVerifications = useCallback(async () => {
    setLoading(true);
    try {
      console.log('[EduVerifications] Fetching from /admin/edu-verifications');
      const data = await apiFetch('/admin/edu-verifications');
      console.log('[EduVerifications] Response:', data);
      if (data && Array.isArray(data)) {
        setVerifications(data);
      } else if (data && data.data && Array.isArray(data.data)) {
        setVerifications(data.data);
      } else {
        console.warn('[EduVerifications] Unexpected data format:', data);
        setVerifications([]);
      }
    } catch (error) {
      console.error('[EduVerifications] Error fetching:', error);
      addToast('Lỗi: ' + (error.message || 'Không thể tải danh sách xác thực Edu'), 'error');
      setVerifications([]);
    } finally {
      setLoading(false);
    }
  }, [addToast]);
  // Tải xác thực khi component mount
  useEffect(() => {
    fetchVerifications();
  }, [fetchVerifications]);
  // Xử lý phê duyệt xác thực
  const handleApprove = async (userId) => {
    if (window.confirm('Xác nhận phê duyệt xác thực Edu cho người dùng này?')) {
      try {
        const result = await apiFetch('/admin/edu-verifications/approve', {
          method: 'POST',
          body: { user_id: userId }
        });
        if (result.success) {
          setVerifications(verifications.map(v => 
            v.id === userId ? { ...v, edu_verified: 1, status: 'approved' } : v
          ));
          setSelectedVerification(null);
          addToast('Phê duyệt xác thực Edu thành công', 'success');
        }
      } catch (error) {
        console.error('Error approving verification:', error);
        addToast('Lỗi phê duyệt xác thực', 'error');
      }
    }
  };
  // Từ chối xác thực
  const handleReject = async (userId) => {
    if (window.confirm('Từ chối xác thực Edu cho người dùng này?')) {
      try {
        const result = await apiFetch('/admin/edu-verifications/reject', {
          method: 'POST',
          body: { user_id: userId }
        });
        if (result.success) {
          setVerifications(verifications.filter(v => v.id !== userId));
          setSelectedVerification(null);
          addToast('Từ chối xác thực Edu', 'success');
        }
      } catch (error) {
        console.error('Error rejecting verification:', error);
        addToast('Lỗi từ chối xác thực', 'error');
      }
    }
  };
  // Lọc xác thực theo trạng thái
  const filteredVerifications = verifications.filter(v => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'pending') return !v.edu_verified;
    if (filterStatus === 'approved') return v.edu_verified === 1;
    if (filterStatus === 'rejected') return v.edu_verified === -1;
    return true;
  });
  // Hiển thị giao diện khi đang tải
  if (loading) {
    return <div className="edu-verifications-container"><p>Đang tải...</p></div>;
  }
  // Giao diện chính
  return (
    <div className="edu-verifications-container">
      <div className="edu-verifications-header">
        <h2>Quản lý Xác thực Edu</h2>
        <span className="edu-count">{filteredVerifications.length} yêu cầu</span>
      </div>

      {/* Filters */}
      <div className="edu-filters">
        <button 
          className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
          onClick={() => setFilterStatus('pending')}
        >
          Chờ xác nhận ({verifications.filter(v => !v.edu_verified).length})
        </button>
        <button 
          className={`filter-btn ${filterStatus === 'approved' ? 'active' : ''}`}
          onClick={() => setFilterStatus('approved')}
        >
          Đã phê duyệt ({verifications.filter(v => v.edu_verified === 1).length})
        </button>
        <button 
          className={`filter-btn ${filterStatus === 'rejected' ? 'active' : ''}`}
          onClick={() => setFilterStatus('rejected')}
        >
          Từ chối ({verifications.filter(v => v.edu_verified === -1).length})
        </button>
        <button 
          className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
          onClick={() => setFilterStatus('all')}
        >
          Tất cả ({verifications.length})
        </button>
      </div>

      <div className="edu-content">
        {/* List */}
        <div className="edu-list">
          {filteredVerifications.length === 0 ? (
            <p className="no-data">Không có yêu cầu xác thực Edu</p>
          ) : (
            filteredVerifications.map(verification => (
              <div
                key={verification.id}
                className={`edu-item ${selectedVerification?.id === verification.id ? 'active' : ''}`}
                onClick={() => setSelectedVerification(verification)}
              >
                <div className="edu-item-header">
                  <h3>{verification.ten || verification.name || 'N/A'}</h3>
                  <span className={`status-badge ${verification.edu_verified === 1 ? 'approved' : verification.edu_verified === -1 ? 'rejected' : 'pending'}`}>
                    {verification.edu_verified === 1 ? 'Đã duyệt' : verification.edu_verified === -1 ? '❌ Từ chối' : '⏳ Chờ duyệt'}
                  </span>
                </div>
                <div className="edu-item-info">
                  <p><strong>Email:</strong> {verification.email}</p>
                  <p><strong>Email Edu:</strong> {verification.edu_email}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail Panel */}
        {selectedVerification && (
          <div className="edu-detail">
            <h3>Chi tiết xác thực</h3>
            <div className="detail-fields">
              <div className="field">
                <label>Tên người dùng:</label>
                <p>{selectedVerification.ten || selectedVerification.name || 'N/A'}</p>
              </div>
              <div className="field">
                <label>Email tài khoản:</label>
                <p>{selectedVerification.email}</p>
              </div>
              <div className="field">
                <label>Email Edu:</label>
                <p>{selectedVerification.edu_email}</p>
              </div>
              <div className="field">
                <label>MSSV:</label>
                <p>{selectedVerification.edu_mssv}</p>
              </div>
              <div className="field">
                <label>CMND/CCCD:</label>
                <p>{selectedVerification.edu_cccd}</p>
              </div>
              <div className="field">
                <label>Trường/Đại học:</label>
                <p>{selectedVerification.edu_school}</p>
              </div>
              <div className="field">
                <label>Trạng thái:</label>
                <p>
                  <span className={`status-badge ${selectedVerification.edu_verified === 1 ? 'approved' : selectedVerification.edu_verified === -1 ? 'rejected' : 'pending'}`}>
                    {selectedVerification.edu_verified === 1 ? 'Đã phê duyệt' : selectedVerification.edu_verified === -1 ? '❌ Từ chối' : '⏳ Chờ xác nhận'}
                  </span>
                </p>
              </div>
            </div>

            {/* Actions */}
            {!selectedVerification.edu_verified && (
              <div className="edu-actions">
                <button 
                  className="btn-approve" 
                  onClick={() => handleApprove(selectedVerification.id)}
                >
                  Phê duyệt
                </button>
                <button 
                  className="btn-reject" 
                  onClick={() => handleReject(selectedVerification.id)}
                >
                  Từ chối
                </button>
              </div>
            )}
            {selectedVerification.edu_verified === 1 && (
              <div className="approved-message">
                Xác thực Edu đã được phê duyệt
              </div>
            )}
            {selectedVerification.edu_verified === -1 && (
              <div className="rejected-message">
                Xác thực Edu đã bị từ chối
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
