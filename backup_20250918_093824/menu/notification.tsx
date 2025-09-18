
'use client';

import { useEffect } from 'react';

interface NotificationProps {
  show: boolean;
  message: string;
  onHide: () => void;
}

export default function Notification({ show, message, onHide }: NotificationProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onHide();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onHide]);

  return (
    <div className={`notification ${show ? 'show' : ''}`}>
      <div className="notification-content">
        <span className="notification-icon">✅</span>
        <div>
          <strong>Adicionado ao carrinho!</strong>
          <p>{message}</p>
        </div>
      </div>
    </div>
  );
}
