'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EarningsPage() {
    const router = useRouter();
    const [earnings, setEarnings] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('zervix_user');
        if (!stored) { router.push('/auth/login'); return; }
        const uId = JSON.parse(stored).id;

        fetch(`/api/earnings?userId=${uId}`).then(r => r.json()).then(data => {
            if (!data.error) setEarnings(data);
        }).finally(() => setLoading(false));
    }, [router]);

    if (loading) return <div style={{ color: 'white', textAlign: 'center', marginTop: '100px' }}>Loading Earnings...</div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', minHeight: '100vh', background: 'var(--bg-main)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '800' }}>Earnings</h1>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Expected clearing time: 14 days</div>
            </div>

            {/* Main Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <div className="glass-card" style={{ padding: '25px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px' }}>Net Income</div>
                    <div style={{ fontSize: '28px', fontWeight: '700' }}>${earnings?.netIncome?.toFixed(2) || '0.00'}</div>
                </div>
                <div className="glass-card" style={{ padding: '25px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px' }}>Withdrawn</div>
                    <div style={{ fontSize: '28px', fontWeight: '700' }}>${earnings?.withdrawn?.toFixed(2) || '0.00'}</div>
                </div>
                <div className="glass-card" style={{ padding: '25px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px' }}>Pending Clearance</div>
                    <div style={{ fontSize: '28px', fontWeight: '700' }}>${earnings?.pendingClearance?.toFixed(2) || '0.00'}</div>
                </div>
                <div className="glass-card" style={{ padding: '25px', background: 'var(--aurora-primary)', border: 'none' }}>
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', marginBottom: '10px' }}>Available for Withdrawal</div>
                    <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '15px' }}>${earnings?.availableForWithdrawal?.toFixed(2) || '0.00'}</div>
                    <button
                        className="btn-secondary"
                        style={{ width: '100%', background: 'white', color: 'black', fontWeight: '700', border: 'none' }}
                        onClick={() => alert(`Withdrawal for $${earnings?.availableForWithdrawal} initiated!`)}
                        disabled={!earnings?.availableForWithdrawal}
                    >
                        Withdraw Balance
                    </button>
                </div>
            </div>

            {/* Analytics / Chart Placeholder */}
            <div className="glass-card" style={{ padding: '30px', marginBottom: '40px', textAlign: 'center' }}>
                <h3 style={{ marginBottom: '20px', textAlign: 'left' }}>Analytics</h3>
                <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', border: '1px dashed var(--glass-border)', borderRadius: '8px' }}>
                    Chart Visualization Coming Soon
                </div>
            </div>

        </div>
    );
}
