'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Order {
    id: string; status: string; total: number; createdAt: string; deliveryDate: string | null;
    buyerId: string; sellerId: string; gigId: string;
    buyerName: string; sellerName: string; gigTitle: string; gigImage: string;
    requirements: string[];
    deliveries: { id: string; message: string; files: string[]; createdAt: string }[];
    revisions: { id: string; message: string; createdAt: string }[];
    activityLog: { id: string; type: string; message: string; createdAt: string }[];
}

export default function OrderPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState('');

    // Action States
    const [deliveryMessage, setDeliveryMessage] = useState('');
    const [deliveryFile, setDeliveryFile] = useState('');
    const [revisionMessage, setRevisionMessage] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [showDeliveryForm, setShowDeliveryForm] = useState(false);
    const [showRevisionForm, setShowRevisionForm] = useState(false);

    // Review State
    const [reviewSubmitted, setReviewSubmitted] = useState(false);
    const [reviewData, setReviewData] = useState({ rating: 5, communication: 5, service: 5, recommend: 5, comment: '' });

    useEffect(() => {
        const stored = localStorage.getItem('zervix_user');
        if (stored) setUserId(JSON.parse(stored).id);

        params.then(p => fetchOrder(p.id));
    }, [params]);

    const fetchOrder = (id: string) => {
        setLoading(true);
        fetch(`/api/orders/${id}`).then(r => r.json()).then(data => {
            if (!data.error) {
                setOrder(data);
                // Check if already reviewed (naive check for now, ideally API returns this)
                const hasReview = data.activityLog.some((log: any) => log.type === 'REVIEW');
                if (hasReview) setReviewSubmitted(true);
            }
        }).finally(() => setLoading(false));
    };

    const handleSubmitReview = async () => {
        if (!order) return;
        setActionLoading(true);
        try {
            await fetch('/api/reviews', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    gigId: order.gigId, orderId: order.id, userId,
                    rating: reviewData.rating, comment: reviewData.comment,
                    communicationRating: reviewData.communication,
                    serviceRating: reviewData.service,
                    recommendRating: reviewData.recommend
                })
            });
            setReviewSubmitted(true);
            fetchOrder(order.id);
        } finally { setActionLoading(false); }
    };

    const handleDeliver = async () => {
        if (!order || !deliveryMessage) return;
        setActionLoading(true);
        try {
            await fetch(`/api/orders/${order.id}/deliver`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: deliveryMessage, files: deliveryFile ? [deliveryFile] : [] })
            });
            setShowDeliveryForm(false);
            setDeliveryMessage('');
            fetchOrder(order.id);
        } finally { setActionLoading(false); }
    };

    const handleRevise = async () => {
        if (!order || !revisionMessage) return;
        setActionLoading(true);
        try {
            await fetch(`/api/orders/${order.id}/revise`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: revisionMessage, buyerId: userId })
            });
            setShowRevisionForm(false);
            setRevisionMessage('');
            fetchOrder(order.id);
        } finally { setActionLoading(false); }
    };

    const handleComplete = async () => {
        if (!order) return;
        if (!confirm('Are you sure you want to accept this delivery? This will complete the order.')) return;
        setActionLoading(true);
        try {
            await fetch(`/api/orders/${order.id}/complete`, { method: 'POST' });
            fetchOrder(order.id);
        } finally { setActionLoading(false); }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>Loading order...</div>;
    if (!order) return <div style={{ textAlign: 'center', padding: '100px' }}><h2>Order not found</h2></div>;

    const isBuyer = userId === order.buyerId;
    const isSeller = userId === order.sellerId;

    const statusColors: Record<string, string> = {
        PENDING: 'var(--text-muted)',
        ACTIVE: 'var(--aurora-primary)',
        DELIVERED: '#10b981', // Green
        REVISION: '#f59e0b', // Orange
        COMPLETED: '#3b82f6', // Blue
        CANCELLED: '#ef4444'  // Red
    };

    return (
        <div style={{ padding: '40px 0', minHeight: '100vh', background: 'var(--bg-main)' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', width: '90%', display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px' }}>

                {/* Left Column: Activity & Actions */}
                <div>
                    {/* Header */}
                    <div className="glass-card" style={{ padding: '25px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '5px' }}>Order #{order.id.slice(-6).toUpperCase()}</h1>
                            <div style={{ color: 'var(--text-dim)', fontSize: '14px' }}>
                                Needs to be delivered by <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{order.deliveryDate ? new Date(order.deliveryDate).toDateString() : 'ASAP'}</span>
                            </div>
                        </div>
                        <div style={{ padding: '8px 16px', borderRadius: '100px', background: 'var(--glass-highlight)', color: statusColors[order.status] || 'white', fontWeight: '700', fontSize: '14px' }}>
                            {order.status}
                        </div>
                    </div>

                    {/* Requirements (if any) */}
                    {order.requirements && order.requirements.length > 0 && (
                        <div className="glass-card" style={{ padding: '25px', marginBottom: '25px' }}>
                            <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>Order Requirements</h3>
                            <ul style={{ paddingLeft: '20px', color: 'var(--text-muted)' }}>
                                {order.requirements.map((r, i) => <li key={i}>{r}</li>)}
                            </ul>
                        </div>
                    )}

                    {/* Delivery Section (Latest Delivery) */}
                    {order.status === 'DELIVERED' && order.deliveries.length > 0 && (
                        <div className="glass-card" style={{ padding: '25px', marginBottom: '25px', border: '1px solid #10b981' }}>
                            <h3 style={{ color: '#10b981', marginBottom: '15px' }}>⚡ Delivery Received</h3>
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                                <p style={{ color: 'var(--text-main)', marginBottom: '10px' }}>{order.deliveries[0].message}</p>
                                {order.deliveries[0].files.length > 0 && (
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        {/* Simplified File Display */}
                                        <div style={{ padding: '10px', background: 'var(--bg-main)', borderRadius: '6px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            📎 Product File
                                        </div>
                                    </div>
                                )}
                            </div>

                            {isBuyer && (
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <button onClick={handleComplete} disabled={actionLoading} className="btn-primary" style={{ flex: 1, background: '#10b981' }}>
                                        Accept & Complete Order
                                    </button>
                                    <button onClick={() => setShowRevisionForm(!showRevisionForm)} disabled={actionLoading} className="btn-secondary" style={{ flex: 1 }}>
                                        Request Revision
                                    </button>
                                </div>
                            )}

                            {isBuyer && showRevisionForm && (
                                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--glass-border)' }}>
                                    <textarea
                                        value={revisionMessage}
                                        onChange={e => setRevisionMessage(e.target.value)}
                                        placeholder="Describe what needs to be changed..."
                                        style={{ width: '100%', padding: '12px', background: 'var(--bg-main)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', minHeight: '100px', marginBottom: '10px' }}
                                    />
                                    <button onClick={handleRevise} disabled={actionLoading} className="btn-primary">Send Revision Request</button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Review Section (Completed Orders) */}
                    {order.status === 'COMPLETED' && (
                        <div className="glass-card" style={{ padding: '25px', marginBottom: '25px', border: '1px solid #3b82f6' }}>
                            <h3 style={{ color: '#3b82f6', marginBottom: '15px' }}>★ Order Completed</h3>
                            {!reviewSubmitted ? (
                                isBuyer ? (
                                    <div>
                                        <p style={{ marginBottom: '20px' }}>How was your experience?</p>
                                        <div style={{ display: 'grid', gap: '15px', marginBottom: '20px' }}>
                                            {[
                                                { label: 'Overall Rating', field: 'rating' },
                                                { label: 'Communication', field: 'communication' },
                                                { label: 'Service as Described', field: 'service' },
                                                { label: 'Recommendation', field: 'recommend' }
                                            ].map((f, i) => (
                                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ color: 'var(--text-muted)' }}>{f.label}</span>
                                                    <div style={{ display: 'flex', gap: '5px' }}>
                                                        {[1, 2, 3, 4, 5].map(star => (
                                                            <button
                                                                key={star}
                                                                onClick={() => setReviewData(prev => ({ ...prev, [f.field]: star }))}
                                                                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: star <= (reviewData as any)[f.field] ? '#fbbf24' : 'var(--text-dim)' }}
                                                            >★</button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <textarea
                                            value={reviewData.comment}
                                            onChange={e => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                                            placeholder="Share your experience..."
                                            style={{ width: '100%', padding: '12px', background: 'var(--bg-main)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', minHeight: '100px', marginBottom: '15px' }}
                                        />
                                        <button onClick={handleSubmitReview} disabled={actionLoading} className="btn-primary" style={{ width: '100%' }}>Submit Review</button>
                                    </div>
                                ) : (
                                    <p style={{ color: 'var(--text-muted)' }}>Waiting for buyer review...</p>
                                )
                            ) : (
                                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>🎉</div>
                                    <p>Review submitted! Thank you.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Activity Feed */}
                    <div className="glass-card" style={{ padding: '25px' }}>
                        <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>Activity Log</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {/* Combine logs, deliveries, revisions into one sorted list? For now just logs */}
                            {order.activityLog.map((log) => (
                                <div key={log.id} style={{ display: 'flex', gap: '15px' }}>
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '50%',
                                        background: log.type === 'DELIVERY' ? '#10b981' : log.type === 'REVISION' ? '#f59e0b' : 'var(--glass-highlight)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px'
                                    }}>
                                        {log.type === 'DELIVERY' ? '🎁' : log.type === 'REVISION' ? '↺' : 'ℹ️'}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '2px' }}>
                                            {log.type === 'DELIVERY' ? 'Delivery Submitted' : log.type === 'REVISION' ? 'Revision Requested' : 'Order Update'}
                                        </div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '4px' }}>{log.message}</div>
                                        <div style={{ color: 'var(--text-dim)', fontSize: '12px' }}>{new Date(log.createdAt).toLocaleString()}</div>
                                    </div>
                                </div>
                            ))}

                            {/* Start of Order */}
                            <div style={{ display: 'flex', gap: '15px', opacity: 0.7 }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--glass-highlight)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🚀</div>
                                <div>
                                    <div style={{ fontWeight: '600', fontSize: '14px' }}>Order Placed</div>
                                    <div style={{ color: 'var(--text-dim)', fontSize: '12px' }}>{new Date(order.createdAt).toLocaleString()}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Seller Delivery Action */}
                    {isSeller && (order.status === 'ACTIVE' || order.status === 'REVISION') && (
                        <div style={{ marginTop: '25px' }}>
                            {!showDeliveryForm ? (
                                <button onClick={() => setShowDeliveryForm(true)} className="btn-premium" style={{ width: '100%', padding: '15px' }}>
                                    Deliver Now
                                </button>
                            ) : (
                                <div className="glass-card" style={{ padding: '25px' }}>
                                    <h3 style={{ marginBottom: '15px' }}>Deliver Your Work</h3>
                                    <textarea
                                        value={deliveryMessage}
                                        onChange={e => setDeliveryMessage(e.target.value)}
                                        placeholder="Describe your delivery..."
                                        style={{ width: '100%', padding: '12px', background: 'var(--bg-main)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', minHeight: '120px', marginBottom: '15px' }}
                                    />
                                    <input
                                        type="text"
                                        value={deliveryFile}
                                        onChange={e => setDeliveryFile(e.target.value)}
                                        placeholder="Paste File URL (e.g. Dropbox/Drive link)"
                                        style={{ width: '100%', padding: '12px', background: 'var(--bg-main)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', marginBottom: '20px' }}
                                    />
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button onClick={() => setShowDeliveryForm(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                                        <button onClick={handleDeliver} disabled={actionLoading} className="btn-primary" style={{ flex: 2 }}>Send Delivery</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                </div>

                {/* Right Column: Order Details */}
                <div>
                    <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                        <div style={{ height: '150px', background: order.gigImage ? `url(${order.gigImage}) center/cover` : 'var(--glass-highlight)' }} />
                        <div style={{ padding: '20px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '10px', lineHeight: '1.4' }}>{order.gigTitle}</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <span style={{ padding: '4px 10px', background: 'var(--glass-highlight)', borderRadius: '4px', fontSize: '12px' }}>{order.status}</span>
                                <span style={{ fontSize: '20px', fontWeight: '700' }}>${order.total}</span>
                            </div>
                            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '15px', display: 'grid', gap: '10px', fontSize: '13px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Buyer</span>
                                    <span style={{ fontWeight: '600' }}>{order.buyerName}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Seller</span>
                                    <span style={{ fontWeight: '600' }}>{order.sellerName}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Order ID</span>
                                    <span style={{ fontFamily: 'monospace' }}>#{order.id.slice(0, 8)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
