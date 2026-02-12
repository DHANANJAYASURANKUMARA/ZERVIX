'use client';
import { useState, useEffect } from 'react';

interface Gig {
    id: string; title: string; description: string; category: string; subcategory: string;
    price: number; location: string; sellerId: string; sellerName: string; sellerLevel: string;
    tags: string[]; faq: { q: string; a: string }[]; requirements: string[]; gallery: string[]; image: string;
    avgRating: number; reviewCount: number;
    tiers: { id: string; name: string; title: string; description: string; price: number; delivery: number; revisions: number; features: string[] }[];
    reviews: { id: string; rating: number; comment: string; userName: string; createdAt: string; communicationRating: number; serviceRating: number; recommendRating: number; sellerResponse: string; }[];
}

export default function GigDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const [gig, setGig] = useState<Gig | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTier, setActiveTier] = useState(0);
    const [userId, setUserId] = useState('');
    const [isFav, setIsFav] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [ordering, setOrdering] = useState(false);
    const [gigId, setGigId] = useState('');
    const [currentImage, setCurrentImage] = useState(0);

    useEffect(() => {
        const stored = localStorage.getItem('zervix_user');
        if (stored) setUserId(JSON.parse(stored).id);

        params.then(p => {
            setGigId(p.id);
            fetch(`/api/gigs/${p.id}`).then(r => r.json()).then(data => {
                if (!data.error) {
                    setGig({
                        ...data,
                        tags: typeof data.tags === 'string' ? JSON.parse(data.tags) : data.tags || [],
                        faq: typeof data.faq === 'string' ? JSON.parse(data.faq) : data.faq || [],
                        requirements: typeof data.requirements === 'string' ? JSON.parse(data.requirements) : data.requirements || [],
                        gallery: typeof data.gallery === 'string' ? JSON.parse(data.gallery) : data.gallery || [data.image].filter(Boolean),
                    });
                }
            }).finally(() => setLoading(false));
        });
    }, [params]);

    const toggleFav = async () => {
        if (!userId) return;
        await fetch('/api/favorites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, gigId }) });
        setIsFav(!isFav);
    };

    const handleOrder = async () => {
        if (!userId || !gig) { window.location.href = '/auth/login'; return; }
        setOrdering(true);
        const tier = gig.tiers[activeTier];
        const res = await fetch('/api/orders', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ buyerId: userId, gigId, tierId: tier?.id, tierName: tier?.name || 'Basic', total: tier?.price || gig.price, sellerId: gig.sellerId })
        });
        const data = await res.json();
        if (data.id) window.location.href = `/orders/${data.id}`;
        setOrdering(false);
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>Loading gig...</div>;
    if (!gig) return <div style={{ textAlign: 'center', padding: '100px' }}><h2>Gig not found</h2><a href="/marketplace" className="aurora-text">Back to Marketplace</a></div>;

    const tier = gig.tiers[activeTier];
    const tierStyles = [
        { color: 'var(--text-muted)', bg: 'transparent' },
        { color: 'var(--aurora-primary)', bg: 'rgba(99,102,241,0.08)' },
        { color: 'var(--aurora-secondary)', bg: 'rgba(168,85,247,0.08)' },
    ];

    const images = gig.gallery?.length ? gig.gallery : [gig.image].filter(Boolean);

    return (
        <div style={{ width: '90%', maxWidth: '1200px', margin: '0 auto', padding: '40px 0' }}>
            {/* Breadcrumb */}
            <div style={{ display: 'flex', gap: '8px', fontSize: '13px', color: 'var(--text-dim)', marginBottom: '25px' }}>
                <a href="/marketplace" style={{ color: 'var(--text-dim)' }}>Marketplace</a> / <span>{gig.category}</span> {gig.subcategory && <><span>/</span> <span>{gig.subcategory}</span></>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '30px' }}>
                {/* Left Column */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
                        <h1 style={{ fontSize: '28px', fontWeight: '800', lineHeight: '1.3', flex: 1, paddingRight: '20px' }}>{gig.title}</h1>
                        <button onClick={toggleFav} style={{
                            background: 'none', border: '1px solid var(--glass-border)', borderRadius: '50%',
                            width: '40px', height: '40px', cursor: 'pointer', fontSize: '18px', flexShrink: 0,
                            color: isFav ? '#ef4444' : 'var(--text-dim)', transition: 'all 0.2s'
                        }}>{isFav ? '♥' : '♡'}</button>
                    </div>

                    {/* Seller Badge */}
                    <a href={`/sellers/${gig.sellerId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '20px', textDecoration: 'none', color: 'inherit' }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--aurora-primary), var(--aurora-secondary))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700'
                        }}>{gig.sellerName?.[0]}</div>
                        <div>
                            <div style={{ fontWeight: '600', fontSize: '15px' }}>{gig.sellerName}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{gig.sellerLevel?.replace('_', ' ')} · ⭐ {gig.avgRating?.toFixed(1)} ({gig.reviewCount})</div>
                        </div>
                    </a>

                    {/* Gallery Carousel */}
                    <div className="glass-card" style={{ marginBottom: '25px', overflow: 'hidden', padding: 0 }}>
                        <div style={{ height: '400px', background: images[currentImage] ? `url(${images[currentImage]}) center/contain no-repeat #000` : 'var(--glass-highlight)', position: 'relative' }}>
                            {images.length > 1 && (
                                <>
                                    <button onClick={() => setCurrentImage((curr) => (curr === 0 ? images.length - 1 : curr - 1))} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer' }}>❮</button>
                                    <button onClick={() => setCurrentImage((curr) => (curr === images.length - 1 ? 0 : curr + 1))} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer' }}>❯</button>
                                </>
                            )}
                        </div>
                        {images.length > 1 && (
                            <div style={{ display: 'flex', gap: '10px', padding: '10px', overflowX: 'auto' }}>
                                {images.map((img, i) => (
                                    <button key={i} onClick={() => setCurrentImage(i)} style={{
                                        width: '60px', height: '40px', borderRadius: '4px', border: currentImage === i ? '2px solid var(--aurora-primary)' : '2px solid transparent',
                                        background: `url(${img}) center/cover`, flexShrink: 0, cursor: 'pointer'
                                    }} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '25px' }}>
                        {gig.tags.map((tag, i) => (
                            <span key={i} style={{ padding: '5px 14px', borderRadius: '100px', fontSize: '12px', background: 'var(--glass-highlight)', color: 'var(--text-muted)' }}>{tag}</span>
                        ))}
                    </div>

                    {/* Description */}
                    <div className="glass-card" style={{ padding: '25px', marginBottom: '25px' }}>
                        <h3 style={{ marginBottom: '15px', fontSize: '18px' }}>About This Gig</h3>
                        <p style={{ color: 'var(--text-muted)', lineHeight: '1.8', fontSize: '15px', whiteSpace: 'pre-wrap' }}>{gig.description}</p>
                    </div>

                    {/* FAQ */}
                    {gig.faq.length > 0 && (
                        <div className="glass-card" style={{ padding: '25px', marginBottom: '25px' }}>
                            <h3 style={{ marginBottom: '15px', fontSize: '18px' }}>FAQ</h3>
                            {gig.faq.map((f, i) => (
                                <div key={i} style={{ borderBottom: i < gig.faq.length - 1 ? '1px solid var(--glass-border)' : 'none' }}>
                                    <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{
                                        width: '100%', background: 'none', border: 'none', padding: '14px 0',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        color: 'var(--text-main)', fontSize: '15px', fontWeight: '500', cursor: 'pointer', textAlign: 'left'
                                    }}>
                                        {f.q}
                                        <span style={{ transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
                                    </button>
                                    {openFaq === i && <p style={{ padding: '0 0 14px', color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '14px' }}>{f.a}</p>}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Requirements */}
                    {gig.requirements.length > 0 && (
                        <div className="glass-card" style={{ padding: '25px', marginBottom: '25px' }}>
                            <h3 style={{ marginBottom: '15px', fontSize: '18px' }}>What I'll Need From You</h3>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {gig.requirements.map((r, i) => (
                                    <li key={i} style={{ display: 'flex', gap: '10px', alignItems: 'start', color: 'var(--text-muted)', fontSize: '14px' }}>
                                        <span style={{ color: 'var(--aurora-primary)', fontWeight: '700' }}>•</span> {r}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Reviews */}
                    <div className="glass-card" style={{ padding: '25px' }}>
                        <h3 style={{ marginBottom: '20px', fontSize: '18px' }}>Reviews ({gig.reviews?.length || 0})</h3>
                        {(!gig.reviews || gig.reviews.length === 0) ? (
                            <p style={{ color: 'var(--text-dim)' }}>No reviews yet.</p>
                        ) : gig.reviews.map(r => (
                            <div key={r.id} style={{ padding: '18px 0', borderBottom: '1px solid var(--glass-border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--glass-highlight)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700' }}>{r.userName?.[0]}</div>
                                        <span style={{ fontWeight: '600', fontSize: '14px' }}>{r.userName}</span>
                                    </div>
                                    <div style={{ fontSize: '13px', color: 'var(--text-dim)' }}>{'⭐'.repeat(r.rating)}</div>
                                </div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>{r.comment}</p>
                                {r.sellerResponse && (
                                    <div style={{ marginTop: '10px', padding: '12px', borderRadius: '10px', background: 'rgba(99,102,241,0.05)', borderLeft: '3px solid var(--aurora-primary)' }}>
                                        <div style={{ fontSize: '12px', color: 'var(--aurora-primary)', marginBottom: '4px', fontWeight: '600' }}>Seller Response</div>
                                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{r.sellerResponse}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column - Pricing */}
                <div style={{ position: 'sticky', top: '100px', alignSelf: 'start' }}>
                    <div className="glass-card" style={{ overflow: 'hidden' }}>
                        {/* Tier Tabs */}
                        <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)' }}>
                            {gig.tiers.map((t, i) => (
                                <button key={i} onClick={() => setActiveTier(i)} style={{
                                    flex: 1, padding: '16px', background: tierStyles[i]?.bg || 'transparent',
                                    border: 'none', borderBottom: activeTier === i ? `2px solid ${tierStyles[i]?.color || 'var(--aurora-primary)'}` : '2px solid transparent',
                                    color: activeTier === i ? 'var(--text-main)' : 'var(--text-dim)',
                                    fontWeight: '700', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s'
                                }}>{t.name}</button>
                            ))}
                        </div>

                        {tier && (
                            <div style={{ padding: '25px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                    <h3 style={{ fontSize: '18px' }}>{tier.title || tier.name}</h3>
                                    <span style={{ fontSize: '28px', fontWeight: '800' }}>${tier.price}</span>
                                </div>
                                {tier.description && <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '15px', lineHeight: '1.5' }}>{tier.description}</p>}

                                <div style={{ display: 'flex', gap: '20px', marginBottom: '18px', fontSize: '13px', color: 'var(--text-dim)' }}>
                                    <span>🕐 {tier.delivery} day delivery</span>
                                    <span>🔄 {tier.revisions === -1 ? 'Unlimited' : tier.revisions} revision{tier.revisions !== 1 ? 's' : ''}</span>
                                </div>

                                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                                    {(typeof tier.features === 'string' ? JSON.parse(tier.features) : tier.features).map((f: string, i: number) => (
                                        <li key={i} style={{ display: 'flex', gap: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>
                                            <span style={{ color: '#10b981' }}>✓</span> {f}
                                        </li>
                                    ))}
                                </ul>

                                <button onClick={handleOrder} disabled={ordering} className="btn-premium" style={{ width: '100%', padding: '14px', fontSize: '16px', opacity: ordering ? 0.7 : 1 }}>
                                    {ordering ? 'Processing...' : `Continue ($${tier.price})`}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Contact Seller */}
                    <a href={`/messages?to=${gig.sellerId}`} className="btn-glass" style={{
                        display: 'block', textAlign: 'center', marginTop: '15px', padding: '14px',
                        textDecoration: 'none', borderRadius: '14px', fontSize: '15px'
                    }}>
                        💬 Contact Seller
                    </a>
                </div>
            </div>
        </div>
    );
}
