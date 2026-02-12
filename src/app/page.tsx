'use client';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  const categories = [
    { title: "Design", icon: "🎨", desc: "Branding & UI", color: "#6366f1" },
    { title: "Development", icon: "💻", desc: "Web & Mobile", color: "#a855f7" },
    { title: "Animation", icon: "🎬", desc: "Motion Graphics", color: "#ec4899" },
    { title: "Writing", icon: "✍️", desc: "Copy & Translation", color: "#fbbf24" },
    { title: "Music", icon: "🎸", desc: "Audio & Voice", color: "#34d399" },
    { title: "AI Services", icon: "🤖", desc: "Prompts & Models", color: "#06b6d4" },
  ];

  const popularGigs = [
    { title: "Design a Premium 3D Website", price: 150, image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600", rating: 5.0 },
    { title: "Build a Next.js SaaS Platform", price: 400, image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=600", rating: 4.9 },
    { title: "Create Viral TikTok Edits", price: 50, image: "https://images.unsplash.com/photo-1574717436401-063816c25404?auto=format&fit=crop&q=80&w=600", rating: 4.8 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', overflow: 'hidden' }}>

      {/* HERO SECTION */}
      <section style={{
        minHeight: '90vh', width: '100%', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center', textAlign: 'center',
        padding: '0 20px', position: 'relative'
      }}>
        {/* Abstract Floating Shapes (Decorations) */}
        <div className="floating" style={{
          position: 'absolute', top: '20%', left: '10%', width: '300px', height: '300px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)',
          borderRadius: '50%', filter: 'blur(40px)', zIndex: -1, animationDelay: '0s'
        }} />
        <div className="floating" style={{
          position: 'absolute', bottom: '20%', right: '10%', width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)',
          borderRadius: '50%', filter: 'blur(50px)', zIndex: -1, animationDelay: '2s'
        }} />

        <div style={{
          padding: '8px 20px', borderRadius: '100px', background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)', marginBottom: '30px',
          fontSize: '14px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--aurora-cyan)'
        }}>
          ✨ The Future of Work is Here
        </div>

        <h1 style={{
          fontSize: 'clamp(3.5rem, 12vw, 6.5rem)', fontWeight: '800', lineHeight: '1.1', marginBottom: '25px', letterSpacing: '-0.03em'
        }}>
          Find the <span className="aurora-text">Extraordinary</span>
        </h1>

        <p style={{
          fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', color: 'var(--text-muted)', maxWidth: '700px', marginBottom: '50px', lineHeight: '1.6'
        }}>
          Unlock elite talent. Commission stunning projects. Experience the premium standard of digital collaboration.
        </p>

        {/* Search Bar - Glass Portal */}
        <div style={{
          display: 'flex', padding: '10px', borderRadius: '100px', width: '90%', maxWidth: '700px',
          background: 'rgba(20,20,30,0.6)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)', transform: 'translateZ(0)', gap: '10px'
        }} className="hover-lift">
          <input
            type="text"
            placeholder="What are you building today?"
            onKeyDown={(e) => e.key === 'Enter' && router.push(`/gigs?search=${e.currentTarget.value}`)}
            style={{
              flex: 1, background: 'transparent', border: 'none', padding: '15px 30px',
              color: 'white', fontSize: '18px', outline: 'none', width: '100%'
            }}
          />
          <button className="btn-premium" style={{ borderRadius: '100px', padding: '15px 40px', fontSize: '16px' }}>
            Search
          </button>
        </div>

        {/* Trust Badges */}
        <div style={{ marginTop: '80px', opacity: 0.6, fontSize: '14px', color: 'var(--text-dim)', letterSpacing: '2px', textTransform: 'uppercase' }}>
          Trusted by 10,000+ Innovators
        </div>
      </section>


      {/* CATEGORIES GRID */}
      <section style={{ width: '100%', maxWidth: '1400px', padding: '50px 20px 100px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700' }}>Explore <span className="aurora-text">Possibilities</span></h2>
          <button className="btn-secondary">View All Categories</button>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px'
        }}>
          {categories.map((cat, i) => (
            <div key={i}
              onClick={() => router.push(`/gigs?category=${cat.title}`)}
              className="glass-card"
              style={{
                padding: '30px 20px', textAlign: 'center', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px'
              }}>
              <div style={{
                width: '70px', height: '70px', borderRadius: '50%',
                background: `linear-gradient(135deg, ${cat.color}22, transparent)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px',
                border: `1px solid ${cat.color}44`, boxShadow: `0 10px 30px ${cat.color}22`
              }}>
                {cat.icon}
              </div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '18px', marginBottom: '5px' }}>{cat.title}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{cat.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* POPULAR GIGS MARQUEE / SHOWCASE */}
      <section style={{ width: '100%', padding: '80px 0', background: 'linear-gradient(to bottom, transparent, rgba(99,102,241,0.05), transparent)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '40px', textAlign: 'center' }}>Trending <span style={{ color: 'var(--aurora-secondary)' }}>Services</span></h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
            {popularGigs.map((gig, i) => (
              <div key={i} className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{
                  height: '220px', width: '100%',
                  background: `url(${gig.image}) center/cover`,
                  position: 'relative'
                }}>
                  <div style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(0,0,0,0.6)', padding: '5px 12px', borderRadius: '100px', backdropFilter: 'blur(10px)', fontSize: '12px', fontWeight: 'bold' }}>
                    ★ {gig.rating.toFixed(1)}
                  </div>
                </div>
                <div style={{ padding: '25px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px' }}>{gig.title}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                    <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Starting at</div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--aurora-primary)' }}>${gig.price}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section style={{ padding: '100px 20px', textAlign: 'center', position: 'relative', width: '100%' }}>
        <div style={{
          maxWidth: '900px', margin: '0 auto', padding: '60px',
          borderRadius: '40px', background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1))',
          border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)'
        }}>
          <h2 style={{ fontSize: '40px', fontWeight: '800', marginBottom: '20px' }}>Ready to Scale?</h2>
          <p style={{ fontSize: '18px', color: 'var(--text-muted)', marginBottom: '40px' }}>Join thousands of creators and businesses building the future on Zervix.</p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => router.push('/auth/signup')} className="btn-premium" style={{ minWidth: '200px', fontSize: '18px' }}>Get Started</button>
            <button onClick={() => router.push('/gigs/create')} className="glass" style={{ minWidth: '200px', fontSize: '18px', padding: '14px 32px', borderRadius: '100px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Become a Seller</button>
          </div>
        </div>
      </section>

    </div>
  );
}
