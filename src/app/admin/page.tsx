'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock admin check - in real app, check role
        const stored = localStorage.getItem('zervix_user');
        if (!stored) { router.push('/auth/login'); return; }

        fetch('/api/admin/stats').then(r => r.json()).then(data => {
            if (!data.error) setStats(data);
        }).finally(() => setLoading(false));
    }, [router]);

    if (loading) return <div style={{ color: 'white', textAlign: 'center', marginTop: '100px' }}>Loading Admin Panel...</div>;

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px', minHeight: '100vh', background: 'var(--bg-main)' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '10px', background: 'linear-gradient(to right, #ef4444, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                ADMIN DASHBOARD
            </h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>Platform Overview & Moderation</p>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                {[
                    { label: 'Total Revenue', value: `$${stats?.revenue?.toLocaleString() || 0}`, color: '#10b981' },
                    { label: 'Total Orders', value: stats?.orders || 0, color: '#3b82f6' },
                    { label: 'Active Gigs', value: stats?.gigs || 0, color: '#8b5cf6' },
                    { label: 'Total Users', value: stats?.users || 0, color: '#f59e0b' }
                ].map((s, i) => (
                    <div key={i} className="glass-card" style={{ padding: '25px' }}>
                        <h3 style={{ fontSize: '14px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>{s.label}</h3>
                        <div style={{ fontSize: '32px', fontWeight: '700', color: s.color }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', fontWeight: '700' }}>Recent Orders</div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.02)', textAlign: 'left' }}>
                            <th style={{ padding: '15px 20px' }}>Order ID</th>
                            <th style={{ padding: '15px 20px' }}>Buyer</th>
                            <th style={{ padding: '15px 20px' }}>Amount</th>
                            <th style={{ padding: '15px 20px' }}>Status</th>
                            <th style={{ padding: '15px 20px' }}>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats?.recentOrders?.map((o: any) => (
                            <tr key={o.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                <td style={{ padding: '15px 20px', fontFamily: 'monospace' }}>#{o.id.slice(-6).toUpperCase()}</td>
                                <td style={{ padding: '15px 20px' }}>{o.buyerName}</td>
                                <td style={{ padding: '15px 20px' }}>${o.total}</td>
                                <td style={{ padding: '15px 20px' }}>
                                    <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', background: 'rgba(255,255,255,0.1)' }}>
                                        {o.status}
                                    </span>
                                </td>
                                <td style={{ padding: '15px 20px', fontSize: '13px', color: 'var(--text-dim)' }}>
                                    {new Date(o.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
