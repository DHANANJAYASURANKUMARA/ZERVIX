'use client';
import { useState, useEffect } from 'react';

interface Request {
    id: string; description: string; category: string; budget: number; deliveryTime: number; status: string; createdAt: string;
}

export default function BuyerRequestsPage() {
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState('');
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [formData, setFormData] = useState({ description: '', category: '', budget: 50, deliveryTime: 3 });

    useEffect(() => {
        const stored = localStorage.getItem('zervix_user');
        if (!stored) { window.location.href = '/auth/login'; return; }
        setUserId(JSON.parse(stored).id);
        // Load user's requests (TODO: API endpoint needs to support filtering by userId for this view, adding support now via GET param convention or new endpoint)
        // For now, fetching all and filtering client side as a quick MVP
        fetch('/api/requests').then(r => r.json()).then(data => {
            if (Array.isArray(data)) {
                setRequests(data.filter((r: any) => r.userId === JSON.parse(stored).id));
            }
        }).finally(() => setLoading(false));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch('/api/requests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...formData, userId })
        });
        setShowForm(false);
        setFormData({ description: '', category: '', budget: 50, deliveryTime: 3 });
        // Refresh
        window.location.reload();
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px', minHeight: '100vh', background: 'var(--bg-main)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '800' }}>Manage Requests</h1>
                <button onClick={() => setShowForm(!showForm)} className="btn-primary">Post a Request</button>
            </div>

            {showForm && (
                <div className="glass-card" style={{ padding: '30px', marginBottom: '30px' }}>
                    <h2 style={{ marginBottom: '20px' }}>What are you looking for?</h2>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px' }}>Description</label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe the service you are looking for..."
                                style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', minHeight: '100px' }}
                                required
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px' }}>Category</label>
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    style={{ width: '100%', padding: '10px', background: 'var(--bg-main)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }}
                                    required
                                >
                                    <option value="">Select...</option>
                                    <option value="Graphics & Design">Graphics & Design</option>
                                    <option value="Programming & Tech">Programming & Tech</option>
                                    <option value="Digital Marketing">Digital Marketing</option>
                                    <option value="Video & Animation">Video & Animation</option>
                                    <option value="Writing & Translation">Writing & Translation</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px' }}>Budget ($)</label>
                                <input
                                    type="number"
                                    value={formData.budget}
                                    onChange={e => setFormData({ ...formData, budget: Number(e.target.value) })}
                                    style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }}
                                    min={5}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px' }}>Delivery (Days)</label>
                                <input
                                    type="number"
                                    value={formData.deliveryTime}
                                    onChange={e => setFormData({ ...formData, deliveryTime: Number(e.target.value) })}
                                    style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }}
                                    min={1}
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn-primary" style={{ justifySelf: 'start', padding: '12px 30px' }}>Submit Request</button>
                    </form>
                </div>
            )}

            <div className="glass-card" style={{ padding: '0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left' }}>
                            <th style={{ padding: '20px' }}>Date</th>
                            <th style={{ padding: '20px' }}>Request</th>
                            <th style={{ padding: '20px' }}>Category</th>
                            <th style={{ padding: '20px' }}>Budget</th>
                            <th style={{ padding: '20px' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.length === 0 ? (
                            <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No active requests found.</td></tr>
                        ) : requests.map(r => (
                            <tr key={r.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                <td style={{ padding: '20px', color: 'var(--text-dim)' }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                                <td style={{ padding: '20px', fontWeight: '600', maxWidth: '300px' }}>{r.description}</td>
                                <td style={{ padding: '20px' }}>{r.category}</td>
                                <td style={{ padding: '20px' }}>${r.budget}</td>
                                <td style={{ padding: '20px' }}><span style={{ padding: '4px 10px', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', borderRadius: '100px', fontSize: '12px', fontWeight: '700' }}>{r.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
