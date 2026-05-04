import React, { useState, useEffect, useRef } from 'react';
import { notificationsAPI, messagesAPI, authAPI } from '../../services/api';

export default function Messages() {
  const [tab,           setTab]           = useState('notifications'); // 'notifications' | 'chat'
  const [notifications, setNotifications] = useState([]);
  const [messages,      setMessages]      = useState([]);
  const [newMsg,        setNewMsg]        = useState('');
  const [adminId,       setAdminId]       = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [sending,       setSending]       = useState(false);
  const bottomRef = useRef(null);

  // Fetch notifications
  useEffect(() => {
    notificationsAPI.list()
      .then(({ data }) => setNotifications(data.results || data))
      .catch(() => {})
      .finally(() => setLoading(false));
    // Get admin user ID for chat
    authAPI.getAdminId()
      .then(({ data }) => setAdminId(data.id))
      .catch(() => {});
  }, []);

  // Fetch chat thread with admin
  useEffect(() => {
    if (tab !== 'chat' || !adminId) return;
    messagesAPI.thread(adminId)
      .then(({ data }) => setMessages(data))
      .catch(() => {});
  }, [tab, adminId]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const markRead = async (id) => {
    await notificationsAPI.markRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    await notificationsAPI.markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !adminId) return;
    setSending(true);
    try {
      const { data } = await messagesAPI.send(adminId, newMsg.trim());
      setMessages(prev => [...prev, data]);
      setNewMsg('');
    } catch {}
    setSending(false);
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const typeIcon = (type) => ({
    reservation_confirmed: '✅',
    reservation_cancelled: '❌',
    reservation_pending:   '⏳',
    order_update:          '📦',
    message:               '💬',
  }[type] || '🔔');

  const typeColor = (type) => ({
    reservation_confirmed: '#27AE60',
    reservation_cancelled: '#E74C3C',
    reservation_pending:   '#F39C12',
    order_update:          '#3498DB',
    message:               '#635BFF',
  }[type] || '#888');

  if (loading) return (
    <div style={{ padding: '3rem', textAlign: 'center' }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: 780, margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.8rem', marginBottom: '0.5rem', color: 'var(--dark)' }}>
        Messagerie
      </h1>
      <p style={{ color: 'var(--muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
        Notifications et communication avec l'équipe Maison Velours.
      </p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '2px solid var(--border)', paddingBottom: 0 }}>
        {[
          { id: 'notifications', label: `Notifications${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
          { id: 'chat', label: 'Contacter l\'équipe' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '0.75rem 1.5rem',
            background: 'none', border: 'none',
            borderBottom: tab === t.id ? '2px solid var(--burgundy)' : '2px solid transparent',
            marginBottom: -2,
            color: tab === t.id ? 'var(--burgundy)' : 'var(--muted)',
            fontWeight: tab === t.id ? 700 : 500,
            fontSize: '0.875rem', cursor: 'pointer',
            fontFamily: 'var(--font-body)', transition: 'color 0.2s',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* NOTIFICATIONS TAB */}
      {tab === 'notifications' && (
        <div>
          {unreadCount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <button onClick={markAllRead} style={{
                background: 'none', border: '1px solid var(--border)',
                color: 'var(--muted)', padding: '0.4rem 1rem',
                borderRadius: 'var(--radius-sm)', fontSize: '0.8rem',
                cursor: 'pointer', fontFamily: 'var(--font-body)',
              }}>
                Tout marquer comme lu
              </button>
            </div>
          )}

          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔔</div>
              <p>Aucune notification pour l'instant.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {notifications.map(n => (
                <div key={n.id}
                  onClick={() => !n.is_read && markRead(n.id)}
                  style={{
                    background: n.is_read ? 'var(--white)' : 'rgba(139,26,46,0.03)',
                    border: `1px solid ${n.is_read ? 'var(--border)' : 'rgba(139,26,46,0.15)'}`,
                    borderLeft: `4px solid ${typeColor(n.type)}`,
                    borderRadius: 'var(--radius-sm)',
                    padding: '1.1rem 1.25rem',
                    cursor: n.is_read ? 'default' : 'pointer',
                    transition: 'box-shadow 0.2s',
                    display: 'flex', gap: '1rem', alignItems: 'flex-start',
                  }}
                  onMouseEnter={e => { if (!n.is_read) e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                >
                  <span style={{ fontSize: '1.4rem', flexShrink: 0, marginTop: 2 }}>{typeIcon(n.type)}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.35rem' }}>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--dark)' }}>{n.title}</strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--muted)', flexShrink: 0 }}>
                        {new Date(n.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.55, margin: 0 }}>{n.body}</p>
                    {!n.is_read && (
                      <span style={{
                        display: 'inline-block', marginTop: '0.5rem',
                        fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: '0.08em', color: 'var(--burgundy)',
                        background: 'rgba(139,26,46,0.08)', padding: '0.15rem 0.6rem', borderRadius: 50,
                      }}>Nouveau</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CHAT TAB */}
      {tab === 'chat' && (
        <div style={{ display: 'flex', flexDirection: 'column', height: '60vh' }}>
          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '1rem',
            background: 'rgba(0,0,0,0.02)', borderRadius: 'var(--radius)',
            border: '1px solid var(--border)', marginBottom: '1rem',
          }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>💬</div>
                <p style={{ fontSize: '0.9rem' }}>Commencez la conversation avec l'équipe.</p>
              </div>
            ) : (
              messages.map(m => (
                <div key={m.id} style={{
                  display: 'flex',
                  justifyContent: m.is_from_admin ? 'flex-start' : 'flex-end',
                  marginBottom: '0.75rem',
                }}>
                  <div style={{
                    maxWidth: '72%',
                    background: m.is_from_admin ? '#fff' : 'var(--burgundy)',
                    color: m.is_from_admin ? 'var(--dark)' : '#fff',
                    border: m.is_from_admin ? '1px solid var(--border)' : 'none',
                    borderRadius: m.is_from_admin
                      ? '4px 14px 14px 14px'
                      : '14px 4px 14px 14px',
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem', lineHeight: 1.55,
                    boxShadow: 'var(--shadow-sm)',
                  }}>
                    {m.is_from_admin && (
                      <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--burgundy)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Maison Velours
                      </div>
                    )}
                    {m.body}
                    <div style={{ fontSize: '0.62rem', opacity: 0.55, marginTop: '0.35rem', textAlign: 'right' }}>
                      {new Date(m.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              value={newMsg}
              onChange={e => setNewMsg(e.target.value)}
              placeholder="Écrivez votre message..."
              style={{
                flex: 1, padding: '0.85rem 1rem',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                fontSize: '0.9rem', fontFamily: 'var(--font-body)',
                outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--burgundy)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <button type="submit" disabled={sending || !newMsg.trim() || !adminId}
              className="btn btn-primary"
              style={{ whiteSpace: 'nowrap', opacity: (!newMsg.trim() || !adminId) ? 0.5 : 1 }}>
              {sending ? '…' : 'Envoyer'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
