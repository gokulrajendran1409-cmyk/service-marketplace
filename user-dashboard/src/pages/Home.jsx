import { Wrench, ClipboardList, Star, Zap } from 'lucide-react';

const features = [
  { icon: <Wrench size={24} />, title: 'Verified Professionals', desc: 'Every pro on our platform is background-checked and verified by our admin team.' },
  { icon: <Zap size={24} />, title: 'Fast Response', desc: 'Get quotes from multiple professionals within minutes of posting your request.' },
  { icon: <ClipboardList size={24} />, title: 'Track Everything', desc: 'Monitor your service requests from submission to completion in real time.' },
  { icon: <Star size={24} />, title: 'Rated & Reviewed', desc: 'Choose professionals based on genuine reviews from previous customers.' },
];

function Home({ navigate }) {
  return (
    <div>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
        padding: '80px 24px',
        textAlign: 'center',
        color: 'white',
      }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🛠️</div>
          <h1 style={{ fontSize: 42, fontWeight: 800, marginBottom: 16, color: 'white', lineHeight: 1.2 }}>
            Book Trusted Professionals Instantly
          </h1>
          <p style={{ fontSize: 18, opacity: 0.9, marginBottom: 36, lineHeight: 1.6 }}>
            From plumbing to photography — find verified experts for every home service need.
          </p>
          <button
            className="btn-hire"
            style={{ width: 'auto', padding: '16px 40px', fontSize: 16, background: 'white', color: '#6366f1' }}
            onClick={() => navigate('services')}
          >
            Browse Services →
          </button>
        </div>
      </section>

      {/* Features */}
      <div className="page-container">
        <h2 style={{ fontSize: 26, fontWeight: 700, textAlign: 'center', marginBottom: 32 }}>Why ServiceHub?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
          {features.map(f => (
            <div key={f.title} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: 16, padding: 28, boxShadow: 'var(--shadow-card)' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(99,102,241,0.1)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
