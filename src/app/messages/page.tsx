'use client';
import { useState, useEffect, useRef } from 'react';

interface Conversation {
    id: string; otherUserId: string; otherUserName: string; lastMessage: string;
    lastMessageAt: string; unreadCount: number;
}

interface Message { id: string; senderId: string; content: string; isRead: number; createdAt: string; }

export default function MessagesPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConv, setActiveConv] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [userId, setUserId] = useState('');
    const [userName, setUserName] = useState('');
    const [loading, setLoading] = useState(true);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const stored = localStorage.getItem('zervix_user');
        if (!stored) { window.location.href = '/auth/login'; return; }
        const u = JSON.parse(stored);
        setUserId(u.id);
        setUserName(u.name);
        fetchConversations(u.id);
    }, []);

    useEffect(() => {
        if (activeConv) fetchMessages(activeConv);
        const interval = activeConv ? setInterval(() => fetchMessages(activeConv), 5000) : undefined;
        return () => clearInterval(interval);
    }, [activeConv]);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const fetchConversations = async (uid: string) => {
        const res = await fetch(`/api/messages?userId=${uid}`);
        const data = await res.json();
        setConversations(data.conversations || []);
        setLoading(false);
        if (data.conversations?.length > 0 && !activeConv) setActiveConv(data.conversations[0].id);
    };

    const fetchMessages = async (convId: string) => {
        const res = await fetch(`/api/messages/${convId}?userId=${userId}`);
        const data = await res.json();
        setMessages(data.messages || []);
    };

    const sendMessage = async () => {
        if (!input.trim() || !activeConv) return;
        await fetch(`/api/messages/${activeConv}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ senderId: userId, content: input })
        });
        setInput('');
        fetchMessages(activeConv);
        fetchConversations(userId);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>Loading...</div>;

    const activeConvData = conversations.find(c => c.id === activeConv);

    return (
        <div style={{ width: '90%', maxWidth: '1200px', margin: '0 auto', padding: '20px 0', height: 'calc(100vh - 120px)' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '20px' }}>
                <span className="aurora-text">Messages</span>
            </h1>

            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '0', height: 'calc(100% - 60px)', borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                {/* Sidebar */}
                <div style={{ background: 'rgba(15,16,26,0.8)', borderRight: '1px solid var(--glass-border)', overflowY: 'auto' }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)' }}>
                        <input placeholder="Search conversations..." style={{
                            width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)',
                            padding: '10px 14px', borderRadius: '10px', color: 'white', outline: 'none', fontSize: '14px'
                        }} />
                    </div>
                    {conversations.length === 0 ? (
                        <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-dim)' }}>No conversations yet</div>
                    ) : conversations.map(c => (
                        <div key={c.id} onClick={() => setActiveConv(c.id)} style={{
                            padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px',
                            borderBottom: '1px solid var(--glass-border)',
                            background: activeConv === c.id ? 'rgba(99,102,241,0.1)' : 'transparent',
                            borderLeft: activeConv === c.id ? '3px solid var(--aurora-primary)' : '3px solid transparent',
                            transition: 'all 0.2s'
                        }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--aurora-primary), var(--aurora-secondary))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '16px', fontWeight: '700', flexShrink: 0
                            }}>{c.otherUserName?.[0] || '?'}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: '600', fontSize: '14px' }}>{c.otherUserName}</span>
                                    {c.unreadCount > 0 && (
                                        <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--aurora-primary)', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{c.unreadCount}</span>
                                    )}
                                </div>
                                <div style={{ fontSize: '13px', color: 'var(--text-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.lastMessage}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Chat Area */}
                <div style={{ display: 'flex', flexDirection: 'column', background: 'rgba(5,5,8,0.6)' }}>
                    {/* Chat Header */}
                    {activeConvData && (
                        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(15,16,26,0.5)' }}>
                            <div style={{
                                width: '36px', height: '36px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--aurora-primary), var(--aurora-secondary))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700'
                            }}>{activeConvData.otherUserName?.[0]}</div>
                            <div>
                                <div style={{ fontWeight: '600' }}>{activeConvData.otherUserName}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Online</div>
                            </div>
                        </div>
                    )}

                    {/* Messages */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {messages.map(m => (
                            <div key={m.id} style={{ display: 'flex', justifyContent: m.senderId === userId ? 'flex-end' : 'flex-start' }}>
                                <div style={{
                                    maxWidth: '70%', padding: '12px 16px', borderRadius: m.senderId === userId ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                    background: m.senderId === userId ? 'linear-gradient(135deg, var(--aurora-primary), var(--aurora-secondary))' : 'rgba(255,255,255,0.05)',
                                    border: m.senderId === userId ? 'none' : '1px solid var(--glass-border)',
                                }}>
                                    <div style={{ fontSize: '14px', lineHeight: '1.5' }}>{m.content}</div>
                                    <div style={{ fontSize: '11px', color: m.senderId === userId ? 'rgba(255,255,255,0.6)' : 'var(--text-dim)', marginTop: '4px', textAlign: 'right' }}>
                                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    {activeConv && (
                        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '12px', background: 'rgba(15,16,26,0.5)' }}>
                            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
                                placeholder="Type a message..." style={{
                                    flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)',
                                    padding: '12px 16px', borderRadius: '12px', color: 'white', outline: 'none', fontSize: '14px'
                                }} />
                            <button onClick={sendMessage} disabled={!input.trim()} className="btn-premium" style={{ padding: '12px 24px', opacity: input.trim() ? 1 : 0.5 }}>
                                Send
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
