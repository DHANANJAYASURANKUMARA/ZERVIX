'use client';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  const categories = [
    { title: "Design", icon: "🎨", desc: "Branding & UI", color: "var(--aurora-primary)" },
    { title: "Development", icon: "💻", desc: "Web & Mobile", color: "var(--aurora-deep)" },
    { title: "Animation", icon: "🎬", desc: "Motion Graphics", color: "var(--aurora-secondary)" },
    { title: "Writing", icon: "✍️", desc: "Copy & Translation", color: "var(--aurora-tertiary)" },
    { title: "Music", icon: "🎸", desc: "Audio & Voice", color: "var(--aurora-cyan)" },
    { title: "AI Services", icon: "🤖", desc: "Prompts & Models", color: "var(--aurora-primary)" },
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
          background: 'radial-gradient(circle, var(--aurora-glow) 0%, transparent 70%)',
          borderRadius: '50%', filter: 'blur(40px)', zIndex: -1, animationDelay: '0s'
        }} />
        <div className="floating" style={{
          position: 'absolute', bottom: '20%', right: '10%', width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(1, 203, 174, 0.15) 0%, transparent 70%)',
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
      </section>

      {/* TRUSTED BY TICKER */}
      <section style={{ width: '100%', padding: '40px 0', borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.01)' }}>
        <p style={{ textAlign: 'center', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-dim)', marginBottom: '20px' }}>Trusted by industry leaders</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '60px', opacity: 0.5, flexWrap: 'wrap', padding: '0 20px' }}>
          {['Acme Corp', 'GlobalTech', 'Nebula', 'Velocity', 'Trio', 'FoxRun'].map(name => (
            <div key={name} style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-muted)' }}>{name}</div>
          ))}
        </div>
      </section>

      {/* CATEGORIES GRID */}
      <section style={{ width: '100%', maxWidth: '1400px', padding: '100px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '40px' }}>
          <div>
            <h2 style={{ fontSize: '36px', fontWeight: '800', lineHeight: '1.2' }}>Explore <span className="aurora-text">Possibilities</span></h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>Find the perfect talent for any project.</p>
          </div>
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
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px'
              }}>
              <div style={{
                width: '60px', height: '60px', borderRadius: '16px',
                background: 'rgba(37, 99, 235, 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px',
                color: 'var(--aurora-primary)'
              }}>
                {cat.icon}
              </div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '5px' }}>{cat.title}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{cat.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES / WHY CHOOSE US */}
      <section style={{ width: '100%', padding: '100px 20px', background: 'var(--bg-accent)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '60px' }}>Why <span className="aurora-text">Zervix?</span></h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
            {[
              { title: 'Vetted Talent', desc: 'Access the top 1% of global freelancers, verified for quality and reliability.', icon: '💎' },
              { title: 'Secure Payments', desc: 'Your money is held safely in escrow until you approve the final delivery.', icon: '🔒' },
              { title: '24/7 Support', desc: 'Our dedicated team is here to help you solve any issues, anytime.', icon: '🎧' },
            ].map((feat, i) => (
              <div key={i} style={{ textAlign: 'left', padding: '30px', background: 'var(--bg-deep)', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
                <div style={{ fontSize: '40px', marginBottom: '20px' }}>{feat.icon}</div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '10px' }}>{feat.title}</h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POPULAR GIGS MARQUEE / SHOWCASE */}
      <section style={{ width: '100%', padding: '100px 0' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '800' }}>Trending <span className="aurora-text">Services</span></h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>Hand-picked projects that are making waves.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
            {popularGigs.map((gig, i) => (
              <div key={i} className="glass-card" style={{ padding: '0', overflow: 'hidden', border: 'none' }}>
                <div style={{
                  height: '240px', width: '100%',
                  background: `url(${gig.image}) center/cover`,
                  position: 'relative'
                }}>
                  <div style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(0,0,0,0.6)', padding: '5px 12px', borderRadius: '100px', backdropFilter: 'blur(10px)', fontSize: '12px', fontWeight: 'bold' }}>
                    ★ {gig.rating.toFixed(1)}
                  </div>
                </div>
                <div style={{ padding: '25px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px', height: '54px', overflow: 'hidden' }}>{gig.title}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--glass-border)' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Starting at</div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-main)' }}>${gig.price}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ width: '100%', padding: '100px 20px', background: 'var(--bg-accent)', borderTop: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '60px' }}>What People Say</h2>
          <div className="glass-card" style={{ padding: '60px', textAlign: 'center', position: 'relative' }}>
            <div style={{ fontSize: '60px', color: 'var(--aurora-primary)', lineHeight: '0.5', marginBottom: '30px', opacity: 0.3 }}>"</div>
            <p style={{ fontSize: '24px', fontWeight: '500', lineHeight: '1.6', marginBottom: '30px', fontStyle: 'italic' }}>
              Zervix has transformed how we hire. The quality of talent is unmatched, and the platform makes collaboration effortless. A game changer.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#333' }} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: '700' }}>Sarah Jenkins</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>CTO, TechFlow</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ width: '100%', padding: '100px 20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '40px', textAlign: 'center' }}>Frequently Asked Questions</h2>
          {[
            { q: 'How does payment work?', a: 'We hold your payment securely in escrow efficiently until the work is approved.' },
            { q: 'Can I get a refund?', a: 'Yes, if the work does not meet the agreed requirements you are entitled to a refund.' },
            { q: 'Is there a service fee?', a: 'We charge a small 5% fee on all completed transactions to maintain the platform.' }
          ].map((item, i) => (
            <div key={i} style={{ marginBottom: '20px', padding: '25px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}>
              <div style={{ fontWeight: '700', fontSize: '18px', marginBottom: '10px' }}>{item.q}</div>
              <div style={{ color: 'var(--text-muted)', lineHeight: '1.5' }}>{item.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section style={{ padding: '100px 20px', textAlign: 'center', position: 'relative', width: '100%' }}>
        <div style={{
          maxWidth: '900px', margin: '0 auto', padding: '60px',
          borderRadius: '40px', background: 'linear-gradient(135deg, rgba(82, 64, 148, 0.2), rgba(32, 130, 166, 0.2))',
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
