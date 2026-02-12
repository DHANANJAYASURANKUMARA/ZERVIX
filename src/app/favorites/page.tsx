'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Favorite {
    id: string; gigId: string; title: string; image: string; price: number; category: string;
    avgRating: number; reviewCount: number; sellerName: string; sellerImage: string;
}

export default function FavoritesPage() {
    const router = useRouter();
    const [favorites, setFavorites] = useState<Favorite[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState('');

    useEffect(() => {
        const stored = localStorage.getItem('zervix_user');
        if (!stored) { router.push('/auth/login'); return; }
        const uId = JSON.parse(stored).id;
        setUserId(uId);
        fetchFavorites(uId);
    }, [router]);

    const fetchFavorites = (uId: string) => {
        setLoading(true);
        fetch(`/api/favorites?userId=${uId}`).then(r => r.json()).then(data => {
            if (!data.error) setFavorites(data);
        }).finally(() => setLoading(false));
    };

    const removeFavorite = async (e: React.MouseEvent, gigId: string) => {
        e.preventDefault();
        e.stopPropagation();
        await fetch('/api/favorites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, gigId })
        });
        fetchFavorites(userId);
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>Loading favorites...</div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', minHeight: '100vh', background: 'var(--bg-main)' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '30px' }}>My Lists <span style={{ fontSize: '16px', color: 'var(--text-muted)', fontWeight: '400' }}>({favorites.length})</span></h1>

            {favorites.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '48px', marginBottom: '20px' }}>❤️</div>
                    <h3 style={{ marginBottom: '10px' }}>No favorites yet</h3>
                    <p>Save gigs you love to find them easily later.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
                    {favorites.map(fav => (
                        <a key={fav.id} href={`/gigs/${fav.gigId}`} className="glass-card hover-lift" style={{ display: 'block', textDecoration: 'none', padding: '0', overflow: 'hidden', position: 'relative' }}>
                            <button onClick={(e) => removeFavorite(e, fav.gigId)} style={{
                                position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)',
                                border: 'none', borderRadius: '50%', width: '30px', height: '30px', color: '#ef4444', cursor: 'pointer', zIndex: 10
                            }}>
                                ❤️
                            </button>
                            <div style={{ height: '180px', background: fav.image ? `url(${fav.image}) center/cover` : 'var(--glass-highlight)' }} />
                            <div style={{ padding: '15px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--glass-highlight)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>{fav.sellerName?.[0]}</div>
                                    <span style={{ fontSize: '13px', fontWeight: '600' }}>{fav.sellerName}</span>
                                </div>
                                <h3 style={{ fontSize: '15px', fontWeight: '500', marginBottom: '10px', lineHeight: '1.4', height: '42px', overflow: 'hidden' }}>{fav.title}</h3>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--glass-border)' }}>
                                    <div style={{ fontSize: '13px', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        ★ <span style={{ fontWeight: '700' }}>{fav.avgRating?.toFixed(1) || 'New'}</span> <span style={{ color: 'var(--text-dim)' }}>({fav.reviewCount})</span>
                                    </div>
                                    <div style={{ fontWeight: '700', fontSize: '16px' }}>From ${fav.price}</div>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}
