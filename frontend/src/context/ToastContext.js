import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

let nextId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((msg, { icon = '🔔', duration = 4000 } = {}) => {
    const id = ++nextId;
    setToasts(prev => [...prev, { id, msg, icon }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 280);
    }, duration);
  }, []);

  const remove = (id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 280);
  };

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="mv-toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`mv-toast${t.exiting ? ' mv-toast-exit' : ''}`}>
            <span className="mv-toast-icon">{t.icon}</span>
            <span className="mv-toast-msg">{t.msg}</span>
            <button className="mv-toast-close" onClick={() => remove(t.id)}>✕</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
