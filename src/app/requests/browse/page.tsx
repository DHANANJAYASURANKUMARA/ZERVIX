'use client';
import { useState, useEffect } from 'react';

interface Request {
    id: string; description: string; category: string; budget: number; deliveryTime: number;
    buyerName: string; buyerImage: string; createdAt: string;
}

export default function BrowseRequestsPage() {
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState('');
    const [offerForm, setOfferForm] = useState<{ requestId: string | null, price: number, delivery: number, message: string }>({ requestId: null, price: 0, delivery: 0, message: '' });

    useEffect(() => {
        const stored = localStorage.getItem('zervix_user');
        if (stored) setUserId(JSON.parse(stored).id);

        fetch('/api/requests').then(r => r.json()).then(data => {
            if (Array.isArray(data)) setRequests(data);
        }).finally(() => setLoading(false));
    }, []);

    const handleSendOffer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!offerForm.requestId) return;

        await fetch('/api/offers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                requestId: offerForm.requestId,
                sellerId: userId,
                price: offerForm.price,
                deliveryTime: offerForm.delivery,
                message: offerForm.message
            })
        });

        alert('Offer sent successfully!');
        setOfferForm({ requestId: null, price: 0, delivery: 0, message: '' });
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px', minHeight: '100vh', background: 'var(--bg-main)' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '30px' }}>Browse Requests</h1>

            <div style={{ display: 'grid', gap: '20px' }}>
                {requests.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-muted)' }}>No requests available at the moment.</div>
                ) : requests.map(r => (
                    <div key={r.id} className="glass-card" style={{ padding: '25px', display: 'flex', gap: '20px', alignItems: 'start' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--glass-highlight)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {r.buyerName[0]}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: '600' }}>{r.buyerName}</h3>
                                <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '15px' }}>{r.description}</p>
                            <div style={{ display: 'flex', gap: '15px', fontSize: '13px', color: 'var(--text-dim)' }}>
                                <span style={{ background: 'var(--glass-highlight)', padding: '4px 10px', borderRadius: '4px' }}>{r.category}</span>
                                <span style={{ background: 'var(--glass-highlight)', padding: '4px 10px', borderRadius: '4px' }}>Budget: ${r.budget}</span>
                                <span style={{ background: 'var(--glass-highlight)', padding: '4px 10px', borderRadius: '4px' }}>Duration: {r.deliveryTime} Days</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setOfferForm({ requestId: r.id, price: r.budget, delivery: r.deliveryTime, message: '' })}
                            className="btn-secondary"
                            style={{ whiteSpace: 'nowrap' }}
                        >
                            Send Offer
                        </button>
                    </div>
                ))}
            </div>

            {/* Offer Modal */}
            {offerForm.requestId && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div className="glass-card" style={{ width: '500px', padding: '30px', background: '#111' }}>
                        <h2 style={{ marginBottom: '20px' }}>Send Custom Offer</h2>
                        <form onSubmit={handleSendOffer} style={{ display: 'grid', gap: '15px' }}>
                            <textarea
                                value={offerForm.message}
                                onChange={e => setOfferForm({ ...offerForm, message: e.target.value })}
                                placeholder="Describe your offer..."
                                style={{ width: '100%', padding: '12px', background: 'var(--bg-main)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', minHeight: '100px' }}
                                required
                            />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px' }}>Price ($)</label>
                                    <input type="number" value={offerForm.price} onChange={e => setOfferForm({ ...offerForm, price: Number(e.target.value) })} style={{ width: '100%', padding: '10px', background: 'var(--bg-main)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px' }}>Days</label>
                                    <input type="number" value={offerForm.delivery} onChange={e => setOfferForm({ ...offerForm, delivery: Number(e.target.value) })} style={{ width: '100%', padding: '10px', background: 'var(--bg-main)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button type="button" onClick={() => setOfferForm({ requestId: null, price: 0, delivery: 0, message: '' })} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Submit Offer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
