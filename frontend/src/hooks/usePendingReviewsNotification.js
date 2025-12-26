import { useEffect } from 'react';
import { apiFetch } from '../services/apiClient';

export function usePendingReviewsNotification(user, token) {
  useEffect(() => {
    console.log('[usePendingReviewsNotification] user:', user?.id, 'token:', token ? token.substring(0, 20) + '...' : null);
    
    if (!user || !token) {
      console.log('[usePendingReviewsNotification] Skipping - user/token missing');
      return;
    }

    // Check if notification has been shown for this user in this session
    const notificationKey = `pending_reviews_notified_${user.id}`;
    if (localStorage.getItem(notificationKey)) {
      console.log('[usePendingReviewsNotification] Notification already shown for this user');
      return;
    }

    (async () => {
      try {
        console.log('[usePendingReviewsNotification] Fetching /reviews/pending');
        const response = await apiFetch('/reviews/pending');
        console.log('[usePendingReviewsNotification] API Response:', response);
        
        // Handle different response types
        let pendingReviews = response;
        if (response && response.error) {
          console.warn('[usePendingReviewsNotification] API returned error:', response.error);
          return;
        }
        
        if (!Array.isArray(pendingReviews)) {
          console.warn('[usePendingReviewsNotification] Response is not array:', typeof pendingReviews);
          return;
        }
        
        const pending = pendingReviews.filter(p => !p.da_review);
        console.log('[usePendingReviewsNotification] Pending reviews count:', pending.length, 'out of', pendingReviews.length);
        
        if (pending.length > 0) {
          // Mark as notified
          localStorage.setItem(notificationKey, '1');
          console.log('[usePendingReviewsNotification] Showing modal for', pending.length, 'products');
          
          // Small delay to ensure DOM is ready
          setTimeout(() => {
            // Create and show modal
            const modalId = 'pending-reviews-modal';
            if (!document.getElementById(modalId)) {
              const modalHTML = `
                <div id="${modalId}" style="
                  position: fixed;
                  top: 0;
                  left: 0;
                  right: 0;
                  bottom: 0;
                  background: rgba(0, 0, 0, 0.5);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  z-index: 9999;
                ">
                  <div style="
                    background: white;
                    border-radius: 12px;
                    padding: 32px 24px;
                    max-width: 400px;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                    text-align: center;
                  ">
                    <div style="font-size: 48px; margin-bottom: 16px;">⭐</div>
                    <h2 style="
                      font-size: 20px;
                      font-weight: 600;
                      color: #111827;
                      margin: 0 0 12px 0;
                    ">
                      Bạn có ${pending.length} sản phẩm chờ đánh giá
                    </h2>
                    <p style="
                      font-size: 14px;
                      color: #6b7280;
                      margin: 0 0 24px 0;
                    ">
                      Vui lòng để lại nhận xét về các sản phẩm bạn đã mua
                    </p>
                    <button onclick="window.location.href = '/reviews'" style="
                      background: #667eea;
                      color: white;
                      border: none;
                      border-radius: 6px;
                      padding: 10px 20px;
                      font-size: 14px;
                      font-weight: 600;
                      cursor: pointer;
                      margin-right: 8px;
                      transition: background 0.2s;
                    " onmouseover="this.style.background='#5568d3'" onmouseout="this.style.background='#667eea'">
                      Đánh giá ngay
                    </button>
                    <button onclick="document.getElementById('${modalId}').remove()" style="
                      background: #f3f4f6;
                      color: #111827;
                      border: none;
                      border-radius: 6px;
                      padding: 10px 20px;
                      font-size: 14px;
                      font-weight: 600;
                      cursor: pointer;
                      transition: background 0.2s;
                    " onmouseover="this.style.background='#e5e7eb'" onmouseout="this.style.background='#f3f4f6'">
                      ✕ Đóng
                    </button>
                  </div>
                </div>
              `;
              
              const div = document.createElement('div');
              div.innerHTML = modalHTML;
              const modalElement = div.firstElementChild;
              document.body.appendChild(modalElement);
              console.log('[usePendingReviewsNotification] Modal appended to DOM:', modalElement);
            } else {
              console.log('[usePendingReviewsNotification] Modal already exists in DOM');
            }
          }, 100);
        } else {
          console.log('[usePendingReviewsNotification] No pending reviews');
        }
      } catch (err) {
        console.error('[usePendingReviewsNotification] Error checking pending reviews:', err);
      }
    })();
  }, [user, token]);
}
