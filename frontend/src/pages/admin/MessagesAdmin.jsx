import React, { useState, useEffect, useRef } from 'react';
import { messagesAPI } from '../../services/api';
import AdminNavbar from '../../components/AdminNavbar';

export default function MessagesAdmin() {
  const [conversations, setConversations] = useState([]);
  const [selected,      setSelected]      = useState(null);
  const [thread,        setThread]        = useState([]);
  const [newMsg,        setNewMsg]        = useState('');
  const [loading,       setLoading]       = useState(true);
  const [sending,       setSending]       = useState(false);
  const bottomRef = useRef(null);

  const loadConversations = () => {
    messagesAPI.conversations()
      .then(({ data }) => setConversations(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(loadConversations, []);

  useEffect(() => {
    if (!selected) return;
    messagesAPI.thread(selected.user_id)
      .then(({ data }) => { setThread(data); loadConversations(); })
      .catch(() => {});
  }, [selected]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !selected) return;
    setSending(true);
    try {
      const { data } = await messagesAPI.send(selected.user_id, newMsg.trim());
      setThread(prev => [...prev, data]);
      setNewMsg('');
    } catch {}
    setSending(false);
  };

  const totalUnread = conversations.reduce((acc, c) => acc + (c.unread || 0), 0);

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0F', fontFamily: 'var(--font-body)' }}>
      <AdminNavbar />

      <div style={{ paddingTop: 64, height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '1.5rem 2rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(8,8,16,0.9)', flexShrink: 0 }}>
          <div style={{ maxWidth: 1300, margin: '0 auto', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.5rem', color: '#fff', fontWeight: 700 }}>Messagerie</h1>
            {totalUnread > 0 && (
              <span style={{ background: 'var(--burgundy)', color: '#fff', borderRadius: 50, padding: '0.12rem 0.55rem', fontSize: '0.68rem', fontWeight: 800 }}>{totalUnread}</span>
            )}
            <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Chat layout */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', maxWidth: 1300, margin: '0 auto', width: '100%', padding: '1.25rem 2rem', gap: '1.25rem' }}>

          {/* Conversations sidebar */}
          <div style={{ width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
            <div style={{ padding: '0.85rem 1.1rem', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '0.74rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Clients
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {loading ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}><div className="spinner" /></div>
              ) : conversations.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>
                  Aucune conversation
                </div>
              ) : (
                conversations.map(c => (
                  <button key={c.user_id} onClick={() => setSelected(c)} style={{
                    width: '100%', textAlign: 'left',
                    padding: '1rem 1.1rem',
                    background: selected?.user_id === c.user_id ? 'rgba(201,168,76,0.1)' : 'transparent',
                    border: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)',
                    borderLeft: `3px solid ${selected?.user_id === c.user_id ? 'var(--gold)' : 'transparent'}`,
                    cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'background 0.2s',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem', color: selected?.user_id === c.user_id ? 'var(--gold)' : '#fff' }}>
                        {c.full_name}
                      </span>
                      {c.unread > 0 && (
                        <span style={{ minWidth: 18, height: 18, borderRadius: 50, background: 'var(--burgundy)', color: '#fff', fontSize: '0.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>{c.unread}</span>
                      )}
                    </div>
                    {c.last_message && (
                      <div style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.last_message}
                      </div>
                    )}
                    {c.last_at && (
                      <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', marginTop: '0.18rem' }}>
                        {new Date(c.last_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat panel */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
            {!selected ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)' }}>
                <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ marginBottom: '1rem', opacity: 0.5 }}>
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
                <p style={{ fontSize: '0.88rem' }}>Sélectionnez une conversation</p>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div style={{ padding: '1rem 1.4rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.02)', flexShrink: 0 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,var(--burgundy),var(--burgundy-dk))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                    {selected.full_name[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#fff' }}>{selected.full_name}</div>
                    <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)' }}>Client</div>
                  </div>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.4rem' }}>
                  {thread.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.2)', fontSize: '0.88rem' }}>
                      Commencez la conversation
                    </div>
                  ) : thread.map(m => (
                    <div key={m.id} style={{ display: 'flex', justifyContent: m.is_from_admin ? 'flex-end' : 'flex-start', marginBottom: '0.85rem' }}>
                      <div style={{
                        maxWidth: '70%',
                        background: m.is_from_admin
                          ? 'linear-gradient(135deg,var(--burgundy),#6B1220)'
                          : 'rgba(255,255,255,0.07)',
                        color: '#fff',
                        borderRadius: m.is_from_admin ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
                        padding: '0.75rem 1rem',
                        fontSize: '0.875rem', lineHeight: 1.55,
                        border: m.is_from_admin ? 'none' : '1px solid rgba(255,255,255,0.08)',
                      }}>
                        {!m.is_from_admin && (
                          <div style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--gold)', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            {selected.full_name}
                          </div>
                        )}
                        {m.body}
                        <div style={{ fontSize: '0.6rem', opacity: 0.45, marginTop: '0.3rem', textAlign: 'right' }}>
                          {new Date(m.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <form onSubmit={sendMessage} style={{ padding: '1rem 1.4rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '0.75rem', background: 'rgba(255,255,255,0.02)', flexShrink: 0 }}>
                  <input
                    value={newMsg}
                    onChange={e => setNewMsg(e.target.value)}
                    placeholder={`Répondre à ${selected.full_name}…`}
                    style={{
                      flex: 1, padding: '0.75rem 1rem',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 'var(--radius-sm)',
                      color: '#fff', fontSize: '0.875rem',
                      fontFamily: 'var(--font-body)', outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => (e.target.style.borderColor = 'rgba(201,168,76,0.5)')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                  />
                  <button type="submit" disabled={sending || !newMsg.trim()} style={{
                    background: 'linear-gradient(135deg,var(--burgundy),#6B1220)',
                    color: '#fff', border: 'none',
                    padding: '0.75rem 1.4rem', borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                    opacity: (!newMsg.trim() || sending) ? 0.5 : 1,
                    transition: 'opacity 0.2s',
                  }}>
                    {sending ? '…' : 'Envoyer'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
