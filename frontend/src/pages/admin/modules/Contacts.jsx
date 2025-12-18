import React, { useState, useEffect, useContext, useCallback } from 'react';
import { getAllContacts, deleteContact } from '../../../services/contacts';
import { ToastContext } from '../../../context/ToastContext';
import '../styles/Contacts.css';

export default function Contacts() {
  const { addToast } = useContext(ToastContext);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllContacts();
      setContacts(data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      addToast('Không thể tải danh sách liên hệ', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleDelete = async (id) => {
    if (window.confirm('Bạn chắc chắn muốn xóa liên hệ này?')) {
      try {
        await deleteContact(id);
        setContacts(contacts.filter(c => c.id !== id));
        setSelectedContact(null);
        addToast('Xóa liên hệ thành công', 'success');
      } catch (error) {
        console.error('Error deleting contact:', error);
        addToast('Không thể xóa liên hệ', 'error');
      }
    }
  };

  if (loading) {
    return <div className="contacts-container"><p>Đang tải...</p></div>;
  }

  return (
    <div className="contacts-container">
      <div className="contacts-header">
        <span className="contact-count">{contacts.length} liên hệ</span>
      </div>

      <div className="contacts-layout">
        {/* Contacts List */}
        <div className="contacts-list">
          {contacts.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
              Chưa có liên hệ nào
            </p>
          ) : (
            contacts.map(contact => (
              <div
                key={contact.id}
                className={`contact-item ${selectedContact?.id === contact.id ? 'active' : ''}`}
                onClick={() => setSelectedContact(contact)}
              >
                <div className="contact-item-header">
                  <strong>{contact.ten}</strong>
                  <span className="contact-date">
                    {new Date(contact.tao_luc).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <p className="contact-email">{contact.email}</p>
                <p className="contact-subject">{contact.tieu_de}</p>
              </div>
            ))
          )}
        </div>

        {/* Contact Details */}
        <div className="contacts-detail">
          {selectedContact ? (
            <div>
              <div className="detail-header">
                <div>
                  <h3>{selectedContact.ten}</h3>
                  <p className="detail-date">
                    {new Date(selectedContact.tao_luc).toLocaleString('vi-VN')}
                  </p>
                </div>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(selectedContact.id)}
                  title="Xóa liên hệ"
                >
                  🗑️ Xóa
                </button>
              </div>

              <div className="detail-info">
                <div className="info-row">
                  <label>Email:</label>
                  <span>{selectedContact.email}</span>
                </div>
                {selectedContact.dien_thoai && (
                  <div className="info-row">
                    <label>Điện thoại:</label>
                    <span>{selectedContact.dien_thoai}</span>
                  </div>
                )}
                <div className="info-row">
                  <label>Tiêu đề:</label>
                  <span>{selectedContact.tieu_de}</span>
                </div>
              </div>

              <div className="detail-message">
                <label>Nội dung:</label>
                <div className="message-content">
                  {selectedContact.noi_dung}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
              <p>Chọn một liên hệ để xem chi tiết</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
