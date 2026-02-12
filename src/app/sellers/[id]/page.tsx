'use client';
import { useState, useEffect } from 'react';

interface Gig {
    id: string; title: string; image: string; price: number; category: string;
    startingPrice?: number; rating?: number; reviewCount?: number; avgRating?: number;
}

interface Review {
    id: string; rating: number; comment: string; userName: string; userImage: string; createdAt: string;
}

interface User {
    id: string; name: string; image: string; bio: string; country: string;
    skills: string[]; languages: string[]; sellerLevel: string; responseTime: number;
    memberSince: string; reviewCount: number; avgRating: number;
}

export default function SellerProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const [user, setUser] = useState<User | null>(null);
    const [gigs, setGigs] = useState<Gig[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        params.then(p => {
            fetch(`/api/sellers/${p.id}`).then(r => r.json()).then(data => {
                if (!data.error) {
                    setUser(data.user);
                    setGigs(data.gigs);
                    setReviews(data.reviews);
                }
            }).finally(() => setLoading(false));
        });
    }, [params]);

    if (loading) return <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>Loading seller profile...</div>;
    if (!user) return <div style={{ textAlign: 'center', padding: '100px' }}><h2>Seller not found</h2></div>;

    const stats = [
        { label: 'From', value: user.country || 'Unknown' },
        { label: 'Member since', value: new Date(user.memberSince).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) },
        { label: 'Avg. Response', value: user.responseTime ? `${user.responseTime} hours` : '1 hour' },
        { label: 'Last Delivery', value: '1 day ago' } // Mocked for now
    ];

    return (
        <div style={{ width: '90%', maxWidth: '1200px', margin: '0 auto', padding: '40px 0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>

                {/* Left Column: User Card */}
                <div style={{ flex: '0 0 320px' }}>
                    <div className="glass-card" style={{ padding: '30px', textAlign: 'center' }}>
                        {/* Avatar */}
                        <div style={{
                            width: '120px', height: '120px', borderRadius: '50%', margin: '0 auto 20px',
                            background: user.image ? `url(${user.image}) center/cover` : 'var(--glass-highlight)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '40px', fontWeight: '700', color: 'var(--text-main)',
                            border: '4px solid rgba(255,255,255,0.1)'
                        }}>
                            {!user.image && user.name[0]}
                        </div>

                        {/* Name & Badge */}
                        <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '5px' }}>{user.name}</h1>
                        <p style={{ color: 'var(--text-dim)', marginBottom: '15px' }}>{user.sellerLevel?.replace('_', ' ')}</p>

                        {/* Rating */}
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px', marginBottom: '25px' }}>
                            <span style={{ color: '#fbbf24' }}>{'⭐'.repeat(Math.round(user.avgRating || 5))}</span>
                            <span style={{ fontWeight: '600' }}>{user.avgRating?.toFixed(1)}</span>
                            <span style={{ color: 'var(--text-muted)' }}>({user.reviewCount} reviews)</span>
                        </div>

                        {/* Contact Button */}
                        <a href={`/messages?to=${user.id}`} className="btn-premium" style={{ display: 'block', width: '100%', padding: '12px', marginBottom: '25px', textDecoration: 'none' }}>
                            Contact Me
                        </a>

                        <div style={{ height: '1px', background: 'var(--glass-border)', margin: '0 0 25px' }} />

                        {/* Stats Grid */}
                        <div style={{ textAlign: 'left', display: 'grid', gap: '15px' }}>
                            {stats.map((s, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>{s.label}</span>
                                    <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{s.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Description & Skills */}
                    <div className="glass-card" style={{ padding: '30px', marginTop: '25px' }}>
                        <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>Description</h3>
                        <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '25px' }}>
                            {user.bio || 'No description provided.'}
                        </p>

                        <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>Skills</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '25px' }}>
                            {user.skills.length > 0 ? user.skills.map((skill, i) => (
                                <span key={i} style={{ padding: '6px 14px', borderRadius: '20px', background: 'var(--glass-highlight)', fontSize: '13px', color: 'var(--text-dim)' }}>
                                    {skill}
                                </span>
                            )) : <span style={{ color: 'var(--text-dim)' }}>None listed</span>}
                        </div>

                        <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>Languages</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {user.languages.length > 0 ? user.languages.map((lang, i) => (
                                <span key={i} style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                                    {lang}
                                    {i < user.languages.length - 1 && ', '}
                                </span>
                            )) : <span style={{ color: 'var(--text-dim)' }}>None listed</span>}
                        </div>
                    </div>
                </div>

                {/* Right Column: Gigs & Reviews */}
                <div style={{ minWidth: 0 }}> {/* minWidth fix for grid overflow */}

                    {/* Active Gigs */}
                    <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '20px' }}>Active Gigs</h2>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '25px', marginBottom: '50px' }}>
                        {gigs.length === 0 ? <p style={{ color: 'var(--text-dim)' }}>No active gigs.</p> : gigs.map(gig => (
                            <a key={gig.id} href={`/gigs/${gig.id}`} className="glass-card hover-lift" style={{ display: 'block', textDecoration: 'none', padding: '0', overflow: 'hidden' }}>
                                <div style={{ height: '160px', background: gig.image ? `url(${gig.image}) center/cover` : 'var(--glass-highlight)' }} />
                                <div style={{ padding: '15px' }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '10px', lineHeight: '1.4', height: '44px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                        {gig.title}
                                    </h3>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ fontSize: '13px', color: '#fbbf24' }}>★ {gig.avgRating?.toFixed(1)} <span style={{ color: 'var(--text-dim)' }}>({gig.reviewCount})</span></div>
                                        <div style={{ fontWeight: '700', fontSize: '16px' }}>From ${gig.startingPrice || gig.price}</div>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>

                    {/* Reviews */}
                    <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '20px' }}>Reviews as Seller</h2>
                    <div className="glass-card" style={{ padding: '0 25px' }}>
                        {reviews.length === 0 ? (
                            <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-dim)' }}>No reviews yet.</div>
                        ) : reviews.map((r, i) => (
                            <div key={r.id} style={{ padding: '25px 0', borderBottom: i < reviews.length - 1 ? '1px solid var(--glass-border)' : 'none' }}>
                                <div style={{ display: 'flex', gap: '15px', marginBottom: '10px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--glass-highlight)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                        {r.userName?.[0]}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '600', fontSize: '15px' }}>{r.userName}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-dim)' }}>
                                            <span style={{ color: '#fbbf24' }}>{'⭐'.repeat(r.rating)}</span>
                                            <span>|</span>
                                            <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '15px' }}>{r.comment}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
