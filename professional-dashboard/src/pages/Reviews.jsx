import { useEffect, useState } from "react";
import { Star, ChevronLeft, RefreshCw, MessageSquareOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.DEV
  ? 'http://localhost:5000'
  : 'https://service-marketplace-af7p.onrender.com';

function Reviews() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Calculate stats from the loaded reviews
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 
    ? (reviews.reduce((acc, cur) => acc + cur.rating, 0) / totalReviews).toFixed(1)
    : 0;

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`${API}/api/professionals/reviews`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("professionalToken")}` }
        });
        if (!res.ok) throw new Error("Failed to load reviews");
        const data = await res.json();
        setReviews(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="section-container" style={{ padding: '0', minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* ── HEADER ── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(12px)', padding: '20px 24px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'var(--bg-surface-hover)', border: 'none', padding: '10px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ChevronLeft size={20} color="var(--text-primary)" />
        </button>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>My Reviews</h2>
      </div>

      <div style={{ padding: '24px' }}>
        {/* ── SUMMARY STATS ── */}
        <div style={{ background: 'linear-gradient(135deg, #FEF9C3, #FEF08A)', borderRadius: '20px', padding: '24px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 20px rgba(234, 179, 8, 0.15)' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#A16207', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overall Rating</div>
            <div style={{ fontSize: '48px', fontWeight: 900, color: '#713F12', lineHeight: 1, marginTop: '4px' }}>
              {avgRating > 0 ? avgRating : '-'}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
              {[1,2,3,4,5].map(star => (
                <Star key={star} size={24} fill={star <= Math.round(avgRating) ? '#EAB308' : '#FEF9C3'} color={star <= Math.round(avgRating) ? '#EAB308' : '#FDE047'} />
              ))}
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#854D0E' }}>
              Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* ── REVIEWS LIST ── */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><RefreshCw className="spin" size={32} color="var(--text-muted)" /></div>
        ) : error ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--error)' }}>{error}</div>
        ) : reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', background: '#fff', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
            <MessageSquareOff size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', margin: '0 0 8px', color: 'var(--text-primary)' }}>No reviews yet</h3>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>Complete more jobs to start receiving customer ratings!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {reviews.map(review => (
              <div key={review.id} style={{ background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '15px', color: 'var(--text-primary)', fontWeight: 700 }}>{review.customer_name}</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>{review.service_title}</p>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                    {formatDate(review.created_at)}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '2px', marginBottom: '12px' }}>
                  {[1,2,3,4,5].map(star => (
                    <Star key={star} size={14} fill={star <= review.rating ? '#F59E0B' : 'transparent'} color={star <= review.rating ? '#F59E0B' : '#E2E8F0'} />
                  ))}
                </div>

                {review.comment && (
                  <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    "{review.comment}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Reviews;
