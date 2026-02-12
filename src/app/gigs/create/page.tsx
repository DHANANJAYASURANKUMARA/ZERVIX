'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateGigPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        category: '',
        subcategory: '',
        tags: [] as string[],
        tiers: [
            { name: 'Basic', title: '', description: '', price: 10, delivery: 3, revisions: 1, features: [] as string[] },
            { name: 'Standard', title: '', description: '', price: 30, delivery: 2, revisions: 3, features: [] as string[] },
            { name: 'Premium', title: '', description: '', price: 60, delivery: 1, revisions: -1, features: [] as string[] }, // -1 = Unlimited
        ],
        description: '',
        faq: [] as { q: string; a: string }[],
        requirements: [] as string[],
        gallery: [] as string[],
        image: '' // Main image
    });

    useEffect(() => {
        const stored = localStorage.getItem('zervix_user');
        if (!stored) {
            router.push('/auth/login');
            return;
        }
        setUserId(JSON.parse(stored).id);
    }, [router]);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleTierChange = (index: number, field: string, value: any) => {
        const newTiers = [...formData.tiers];
        newTiers[index] = { ...newTiers[index], [field]: value };
        handleChange('tiers', newTiers);
    };

    const handleNext = () => {
        // Basic Validation
        if (step === 1) {
            if (!formData.title || !formData.category) return alert('Please fill in required fields');
        }
        setStep(prev => prev + 1);
    };

    const handleBack = () => setStep(prev => prev - 1);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/gigs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    price: formData.tiers[0].price, // Base price
                    image: formData.gallery[0] || '', // Use first gallery image as main
                    sellerId: userId
                })
            });
            const data = await res.json();
            if (data.id) {
                router.push(`/gigs/${data.id}`);
            } else {
                alert(data.error || 'Failed to create gig');
            }
        } catch (error) {
            console.error(error);
            alert('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const steps = ['Overview', 'Pricing', 'Description', 'Requirements', 'Gallery', 'Publish'];

    return (
        <div style={{ padding: '40px 0', minHeight: '100vh', background: 'var(--bg-main)' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto', width: '90%' }}>

                {/* Stepper */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '15px', left: 0, right: 0, height: '2px', background: 'var(--glass-border)', zIndex: 0 }} />
                    {steps.map((label, i) => (
                        <div key={i} style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '50%', background: step > i + 1 ? '#10b981' : step === i + 1 ? 'var(--aurora-primary)' : 'var(--glass-bg)',
                                border: `2px solid ${step >= i + 1 ? 'transparent' : 'var(--glass-border)'}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px',
                                color: step >= i + 1 ? 'white' : 'var(--text-dim)', fontWeight: 'bold', fontSize: '14px'
                            }}>
                                {step > i + 1 ? '✓' : i + 1}
                            </div>
                            <div style={{ fontSize: '12px', color: step === i + 1 ? 'var(--text-main)' : 'var(--text-dim)', fontWeight: step === i + 1 ? '600' : '400' }}>{label}</div>
                        </div>
                    ))}
                </div>

                <div className="glass-card" style={{ padding: '40px' }}>

                    {/* Step 1: Overview */}
                    {step === 1 && (
                        <div>
                            <h2 style={{ fontSize: '24px', marginBottom: '30px' }}>Gig Overview</h2>
                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Gig Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={e => handleChange('title', e.target.value)}
                                    placeholder="I will do something amazing..."
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={e => handleChange('category', e.target.value)}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white' }}
                                    >
                                        <option value="">Select Category</option>
                                        <option value="Graphics & Design">Graphics & Design</option>
                                        <option value="Programming & Tech">Programming & Tech</option>
                                        <option value="Digital Marketing">Digital Marketing</option>
                                        <option value="Video & Animation">Video & Animation</option>
                                        <option value="Writing & Translation">Writing & Translation</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Subcategory</label>
                                    <input
                                        type="text"
                                        value={formData.subcategory}
                                        onChange={e => handleChange('subcategory', e.target.value)}
                                        placeholder="e.g. Logo Design"
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Search Tags</label>
                                <input
                                    type="text"
                                    placeholder="Add tags separated by comma (e.g. logo, minimal, branding)"
                                    onChange={e => handleChange('tags', e.target.value.split(',').map(t => t.trim()))}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Pricing */}
                    {step === 2 && (
                        <div>
                            <h2 style={{ fontSize: '24px', marginBottom: '30px' }}>Pricing Packages</h2>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ textAlign: 'left', padding: '15px' }}></th>
                                            {formData.tiers.map((t, i) => (
                                                <th key={i} style={{ padding: '15px', background: 'rgba(255,255,255,0.05)', borderLeft: '1px solid var(--glass-border)' }}>{t.name}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td style={{ padding: '15px', fontWeight: '600' }}>Title</td>
                                            {formData.tiers.map((t, i) => (
                                                <td key={i} style={{ padding: '10px', borderLeft: '1px solid var(--glass-border)' }}>
                                                    <input type="text" value={t.title} onChange={e => handleTierChange(i, 'title', e.target.value)} placeholder="e.g. Basic Package" style={{ width: '100%', background: 'transparent', border: '1px solid var(--glass-border)', padding: '8px', color: 'white', borderRadius: '4px' }} />
                                                </td>
                                            ))}
                                        </tr>
                                        <tr>
                                            <td style={{ padding: '15px', fontWeight: '600' }}>Description</td>
                                            {formData.tiers.map((t, i) => (
                                                <td key={i} style={{ padding: '10px', borderLeft: '1px solid var(--glass-border)' }}>
                                                    <textarea value={t.description} onChange={e => handleTierChange(i, 'description', e.target.value)} placeholder="Package details" style={{ width: '100%', background: 'transparent', border: '1px solid var(--glass-border)', padding: '8px', color: 'white', borderRadius: '4px', minHeight: '80px' }} />
                                                </td>
                                            ))}
                                        </tr>
                                        <tr>
                                            <td style={{ padding: '15px', fontWeight: '600' }}>Delivery Time</td>
                                            {formData.tiers.map((t, i) => (
                                                <td key={i} style={{ padding: '10px', borderLeft: '1px solid var(--glass-border)' }}>
                                                    <select value={t.delivery} onChange={e => handleTierChange(i, 'delivery', Number(e.target.value))} style={{ width: '100%', background: 'var(--bg-main)', border: '1px solid var(--glass-border)', padding: '8px', color: 'white', borderRadius: '4px' }}>
                                                        {[1, 2, 3, 4, 5, 7, 10, 14, 30].map(d => <option key={d} value={d}>{d} Days</option>)}
                                                    </select>
                                                </td>
                                            ))}
                                        </tr>
                                        <tr>
                                            <td style={{ padding: '15px', fontWeight: '600' }}>Revisions</td>
                                            {formData.tiers.map((t, i) => (
                                                <td key={i} style={{ padding: '10px', borderLeft: '1px solid var(--glass-border)' }}>
                                                    <select value={t.revisions} onChange={e => handleTierChange(i, 'revisions', Number(e.target.value))} style={{ width: '100%', background: 'var(--bg-main)', border: '1px solid var(--glass-border)', padding: '8px', color: 'white', borderRadius: '4px' }}>
                                                        <option value={0}>0</option>
                                                        <option value={1}>1</option>
                                                        <option value={2}>2</option>
                                                        <option value={3}>3</option>
                                                        <option value={5}>5</option>
                                                        <option value={-1}>Unlimited</option>
                                                    </select>
                                                </td>
                                            ))}
                                        </tr>
                                        <tr>
                                            <td style={{ padding: '15px', fontWeight: '600' }}>Price ($)</td>
                                            {formData.tiers.map((t, i) => (
                                                <td key={i} style={{ padding: '10px', borderLeft: '1px solid var(--glass-border)' }}>
                                                    <input type="number" value={t.price} onChange={e => handleTierChange(i, 'price', Number(e.target.value))} style={{ width: '100%', background: 'transparent', border: '1px solid var(--glass-border)', padding: '8px', color: 'white', borderRadius: '4px' }} />
                                                </td>
                                            ))}
                                        </tr>
                                        <tr>
                                            <td style={{ padding: '15px', fontWeight: '600' }}>Features</td>
                                            {formData.tiers.map((t, i) => (
                                                <td key={i} style={{ padding: '10px', borderLeft: '1px solid var(--glass-border)' }}>
                                                    <input
                                                        type="text"
                                                        placeholder="Logo transparency, Source file..."
                                                        onChange={e => handleTierChange(i, 'features', e.target.value.split(',').map(f => f.trim()))}
                                                        style={{ width: '100%', background: 'transparent', border: '1px solid var(--glass-border)', padding: '8px', color: 'white', borderRadius: '4px' }}
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Description */}
                    {step === 3 && (
                        <div>
                            <h2 style={{ fontSize: '24px', marginBottom: '30px' }}>Description & FAQ</h2>
                            <div style={{ marginBottom: '30px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Gig Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => handleChange('description', e.target.value)}
                                    placeholder="Describe your gig in detail..."
                                    style={{ width: '100%', padding: '15px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', minHeight: '200px', lineHeight: '1.6' }}
                                />
                            </div>

                            <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>Frequently Asked Questions</h3>
                            {formData.faq.map((f, i) => (
                                <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                    <div style={{ flex: 1 }}>
                                        <input type="text" placeholder="Question" value={f.q} onChange={e => {
                                            const newFaq = [...formData.faq]; newFaq[i].q = e.target.value; handleChange('faq', newFaq);
                                        }} style={{ width: '100%', padding: '10px', marginBottom: '5px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }} />
                                        <input type="text" placeholder="Answer" value={f.a} onChange={e => {
                                            const newFaq = [...formData.faq]; newFaq[i].a = e.target.value; handleChange('faq', newFaq);
                                        }} style={{ width: '100%', padding: '10px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }} />
                                    </div>
                                    <button onClick={() => handleChange('faq', formData.faq.filter((_, idx) => idx !== i))} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                                </div>
                            ))}
                            <button onClick={() => handleChange('faq', [...formData.faq, { q: '', a: '' }])} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>+ Add FAQ</button>
                        </div>
                    )}

                    {/* Step 4: Requirements */}
                    {step === 4 && (
                        <div>
                            <h2 style={{ fontSize: '24px', marginBottom: '30px' }}>Requirements</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Tell your buyer what you need to get started.</p>

                            {formData.requirements.map((r, i) => (
                                <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                    <input
                                        type="text"
                                        value={r}
                                        onChange={e => {
                                            const newReq = [...formData.requirements]; newReq[i] = e.target.value; handleChange('requirements', newReq);
                                        }}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }}
                                    />
                                    <button onClick={() => handleChange('requirements', formData.requirements.filter((_, idx) => idx !== i))} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                                </div>
                            ))}
                            <button onClick={() => handleChange('requirements', [...formData.requirements, ''])} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>+ Add Requirement</button>
                        </div>
                    )}

                    {/* Step 5: Gallery */}
                    {step === 5 && (
                        <div>
                            <h2 style={{ fontSize: '24px', marginBottom: '30px' }}>Showcase Your Services</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Add images to your gig gallery. (Paste URLs for now)</p>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '20px' }}>
                                {[0, 1, 2].map(i => (
                                    <div key={i} style={{
                                        aspectRatio: '4/3', border: '2px dashed var(--glass-border)', borderRadius: '12px',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                        background: formData.gallery[i] ? `url(${formData.gallery[i]}) center/cover` : 'rgba(255,255,255,0.02)',
                                        position: 'relative'
                                    }}>
                                        {!formData.gallery[i] ? (
                                            <>
                                                <span style={{ fontSize: '24px', marginBottom: '10px' }}>📷</span>
                                                <input
                                                    type="text"
                                                    placeholder="Paste Image URL"
                                                    onChange={e => {
                                                        const newGallery = [...formData.gallery]; newGallery[i] = e.target.value; handleChange('gallery', newGallery);
                                                    }}
                                                    style={{ width: '90%', padding: '8px', fontSize: '12px', background: 'var(--bg-main)', border: 'none', borderRadius: '4px', color: 'white', textAlign: 'center' }}
                                                />
                                            </>
                                        ) : (
                                            <button onClick={() => {
                                                const newGallery = [...formData.gallery]; newGallery[i] = ''; handleChange('gallery', newGallery);
                                            }} style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}>✕</button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 6: Publish */}
                    {step === 6 && (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <div style={{ fontSize: '60px', marginBottom: '20px' }}>🎉</div>
                            <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>Almost There!</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '40px', fontSize: '18px' }}>
                                You're about to publish your gig. Buyers will be able to see it immediately.
                            </p>

                            <div className="glass-card" style={{ maxWidth: '400px', margin: '0 auto 40px', padding: '20px', textAlign: 'left' }}>
                                <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>{formData.title || 'Untitled Gig'}</h3>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fbbf24', fontWeight: 'bold' }}>
                                    <span>From ${formData.tiers[0].price}</span>
                                </div>
                            </div>

                            <button onClick={handleSubmit} disabled={loading} className="btn-premium" style={{ fontSize: '18px', padding: '15px 40px' }}>
                                {loading ? 'Publishing...' : 'Publish Gig Now'}
                            </button>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    {step < 6 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
                            <button onClick={handleBack} disabled={step === 1} style={{
                                padding: '12px 24px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-main)',
                                opacity: step === 1 ? 0.5 : 1, cursor: step === 1 ? 'not-allowed' : 'pointer'
                            }}>Back</button>

                            <button onClick={handleNext} className="btn-primary" style={{ padding: '12px 30px' }}>
                                {step === 5 ? 'Review & Publish' : 'Save & Continue'}
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
