import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  Heart,
  IndianRupee,
  MapPin,
  Share2,
  ShieldCheck,
  Star,
  Users,
} from 'lucide-react';
import { API } from '../constants';

const SERVER_BASE = import.meta.env.DEV
  ? 'http://localhost:5000'
  : 'https://service-marketplace-af7p.onrender.com';

const resolvePhotoUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  if (path.startsWith('/')) return `${SERVER_BASE}${path}`;
  return `${SERVER_BASE}/uploads/${path}`;
};

const CATEGORY_DESCRIPTIONS = {
  Plumbing: 'Fix leaks, unclog drains, install pipes, and more. Expert plumbers for all your water-related issues at home or office.',
  Electrical: 'Safe wiring, switch repairs, fan installation, and complete electrical solutions by certified electricians.',
  'AC & Appliance Repair': 'AC servicing, gas refill, and home appliance repairs to keep your equipment running smoothly.',
  Carpentry: 'Furniture assembly, door repairs, custom woodwork, and skilled carpentry for every home need.',
  Painting: 'Interior and exterior painting, waterproofing, and professional finish for walls and surfaces.',
  Cleaning: 'Deep cleaning, routine housekeeping, and sanitization services for a spotless home.',
  'Home Repair & Maintenance': 'General handyman services, mounting, tile work, and all-round home maintenance.',
  'CCTV & Security': 'CCTV installation, smart locks, and security system setup for your peace of mind.',
  'Gardening & Landscaping': 'Lawn care, garden maintenance, landscaping, and outdoor beautification services.',
  'Computer & Mobile Repair': 'Laptop, phone, and network repairs with quick turnaround and reliable support.',
  'Photography & Videography': 'Professional photography and videography for events, portraits, and commercial shoots.',
  'Vehicle Services': 'Car and bike servicing, detailing, breakdown assistance, and vehicle care at your doorstep.',
  'Personal Care': 'Salon, grooming, wellness, and personal care services delivered by verified professionals.',
};

const parseStartingPrice = (subcategories) => {
  const prices = subcategories
    .map(s => s.price_estimate)
    .filter(Boolean)
    .map(text => {
      const match = String(text).match(/[\d,.]+/);
      return match ? Number(match[0].replace(/,/g, '')) : null;
    })
    .filter(Number.isFinite);
  if (prices.length === 0) return null;
  return Math.min(...prices);
};

const formatTimeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? 's' : ''} ago`;
};

function ServiceDetail({
  category,
  categoryIcon,
  heroImage,
  subcategories = [],
  professionals = [],
  loadingPros = false,
  location,
  onBack,
  onBookService,
  onBookProfessional,
  onViewProfile,
  onSeeAllProfessionals,
  onSubcategoryClick,
}) {
  const [heroIndex, setHeroIndex] = useState(0);
  const [reviewsData, setReviewsData] = useState(null);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [showAllSubcats, setShowAllSubcats] = useState(false);
  const [showAllPros, setShowAllPros] = useState(false);

  const heroImages = useMemo(() => {
    const imgs = [heroImage, ...subcategories.map(s => s.image_url).filter(Boolean)];
    return [...new Set(imgs.filter(Boolean))];
  }, [heroImage, subcategories]);

  const sortedPros = useMemo(() => [...professionals].sort((a, b) => {
    const ratingDiff = (Number(b.avg_rating) || 0) - (Number(a.avg_rating) || 0);
    if (ratingDiff !== 0) return ratingDiff;
    return (Number(b.experience_years) || 0) - (Number(a.experience_years) || 0);
  }), [professionals]);

  const displayedPros = showAllPros ? sortedPros : sortedPros.slice(0, 3);
  const displayedSubcats = showAllSubcats ? subcategories : subcategories.slice(0, 5);

  const startingPrice = parseStartingPrice(subcategories);
  const avgRating = reviewsData?.avg_rating
    || (sortedPros.length
      ? (sortedPros.reduce((sum, p) => sum + (Number(p.avg_rating) || 0), 0) / sortedPros.filter(p => p.avg_rating).length).toFixed(1)
      : null);
  const totalReviews = reviewsData?.total_reviews
    || sortedPros.reduce((sum, p) => sum + (Number(p.review_count) || 0), 0);

  const description = category?.description || CATEGORY_DESCRIPTIONS[category?.name] || `Professional ${category?.name} services delivered by verified experts near you.`;

  useEffect(() => {
    if (!category?.name) return;
    setLoadingReviews(true);
    fetch(`${API}/reviews?category=${encodeURIComponent(category.name)}`)
      .then(r => r.json())
      .then(data => setReviewsData(data))
      .catch(() => setReviewsData(null))
      .finally(() => setLoadingReviews(false));
  }, [category?.name]);

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const timer = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const getProPrice = (pro) => {
    if (pro.sub_category) {
      const match = subcategories.find(s => s.name === pro.sub_category);
      if (match?.price_estimate) return match.price_estimate.replace(/^From\s*/i, '');
    }
    if (startingPrice) return `₹${startingPrice} / hr`;
    return subcategories[0]?.price_estimate?.replace(/^From\s*/i, '') || 'On request';
  };

  return (
    <div className="service-detail-page">
      {/* Hero */}
      <div className="sd-hero">
        {heroImages.length > 0 ? (
          <img src={heroImages[heroIndex]} alt={category?.name} className="sd-hero-img" />
        ) : (
          <div className="sd-hero-placeholder" />
        )}
        <div className="sd-hero-overlay" />
        <div className="sd-hero-top">
          <button type="button" className="sd-hero-btn" onClick={onBack} aria-label="Go back">
            <ArrowLeft size={20} />
          </button>
          <div className="sd-hero-top-right">
            <button type="button" className="sd-hero-btn" aria-label="Save"><Heart size={18} /></button>
            <button type="button" className="sd-hero-btn" aria-label="Share"><Share2 size={18} /></button>
          </div>
        </div>
        <div className="sd-hero-bottom">
          <span className="sd-verified-badge"><CheckCircle2 size={13} /> Verified Service</span>
          {heroImages.length > 1 && (
            <span className="sd-hero-counter">{heroIndex + 1}/{heroImages.length}</span>
          )}
        </div>
      </div>

      {/* Service Info */}
      <div className="sd-info-section">
        <div className="sd-info-header">
          {categoryIcon && (
            <div className="sd-category-icon">
              <img src={categoryIcon} alt={category?.name} />
            </div>
          )}
          <div>
            <h1 className="sd-title">{category?.name}</h1>
            <p className="sd-description">{description}</p>
          </div>
        </div>

        <div className="sd-features-row">
          <div className="sd-feature"><Clock size={16} /><span>Quick Booking</span></div>
          <div className="sd-feature"><ShieldCheck size={16} /><span>Verified Pros</span></div>
          <div className="sd-feature"><Star size={16} /><span>Transparent Pricing</span></div>
        </div>

        <div className="sd-stats-bar">
          <div className="sd-stat">
            <IndianRupee size={18} className="sd-stat-icon" />
            <div>
              <strong>{startingPrice ? `₹${startingPrice} / hr` : 'Flexible'}</strong>
              <span>Starting Price</span>
            </div>
          </div>
          <div className="sd-stat">
            <Star size={18} className="sd-stat-icon" />
            <div>
              <strong>{avgRating || '—'} {totalReviews > 0 && `(${totalReviews} reviews)`}</strong>
              <span>Rating</span>
            </div>
          </div>
          <div className="sd-stat">
            <Users size={18} className="sd-stat-icon" />
            <div>
              <strong>{professionals.length}</strong>
              <span>Verified Professionals</span>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Sub Services */}
      {subcategories.length > 0 && (
        <section className="sd-section">
          <div className="sd-section-head">
            <h2>Popular Sub Services</h2>
            {subcategories.length > 5 && (
              <button type="button" className="sd-see-all" onClick={() => setShowAllSubcats(v => !v)}>
                {showAllSubcats ? 'Show less' : 'See All'} <ChevronRight size={15} />
              </button>
            )}
          </div>
          <div className="sd-subcats-scroll">
            {displayedSubcats.map(sub => (
              <button
                key={sub.id || sub.name}
                type="button"
                className="sd-subcat-card"
                onClick={() => onSubcategoryClick?.(sub)}
              >
                <div className="sd-subcat-icon-wrap">
                  <img src={sub.image_url} alt={sub.name} onError={(e) => { e.target.style.display = 'none'; }} />
                </div>
                <span className="sd-subcat-label">{sub.name}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Top Rated Professionals */}
      <section className="sd-section">
        <div className="sd-section-head">
          <h2>Top Rated Professionals</h2>
          {sortedPros.length > 3 && (
            <button
              type="button"
              className="sd-see-all"
              onClick={() => (onSeeAllProfessionals ? onSeeAllProfessionals() : setShowAllPros(v => !v))}
            >
              {showAllPros ? 'Show less' : 'See All'} <ChevronRight size={15} />
            </button>
          )}
        </div>

        {loadingPros ? (
          <div className="sd-loading">Loading professionals...</div>
        ) : sortedPros.length === 0 ? (
          <div className="sd-empty">No verified professionals in this category yet. You can still book a service request.</div>
        ) : (
          <div className="sd-pros-list">
            {displayedPros.map(pro => (
              <div key={pro.id} className="sd-pro-card">
                <div className="sd-pro-avatar">
                  {resolvePhotoUrl(pro.profile_photo) ? (
                    <img src={resolvePhotoUrl(pro.profile_photo)} alt={pro.full_name} />
                  ) : (
                    <span>{pro.full_name?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="sd-pro-body">
                  <div className="sd-pro-top">
                    <div>
                      <div className="sd-pro-verified"><CheckCircle2 size={11} /> Verified</div>
                      <h3 className="sd-pro-name">{pro.full_name}</h3>
                      <div className="sd-pro-rating-line">
                        {pro.avg_rating && Number(pro.review_count) > 0 ? (
                          <>
                            <Star size={12} className="sd-star" />
                            <strong>{Number(pro.avg_rating).toFixed(1)}</strong>
                            <span>({pro.review_count} reviews)</span>
                          </>
                        ) : (
                          <span className="sd-pro-new">New professional</span>
                        )}
                        <span className="sd-dot">•</span>
                        <span>{pro.experience_years || 0}+ yrs exp</span>
                      </div>
                      <div className="sd-pro-location">
                        <MapPin size={11} />
                        {pro.distance_from_user != null
                          ? `${pro.distance_from_user.toFixed(1)} km away`
                          : [pro.city, pro.state].filter(Boolean).join(', ') || 'Kerala'}
                        <span className="sd-dot">•</span>
                        Available today
                      </div>
                      <div className="sd-pro-tags">
                        {pro.sub_category && <span className="sd-pro-tag">{pro.sub_category}</span>}
                        <span className="sd-pro-tag">{pro.category}</span>
                      </div>
                    </div>
                    <div className="sd-pro-right">
                      <div className="sd-pro-price">{getProPrice(pro)}</div>
                      <button
                        type="button"
                        className="sd-pro-book-btn"
                        onClick={() => onBookProfessional(pro)}
                      >
                        Book Now <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                  <button type="button" className="sd-pro-profile-link" onClick={() => onViewProfile(pro)}>
                    View profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Customer Reviews */}
      <section className="sd-section sd-reviews-section">
        <div className="sd-section-head">
          <h2>Customer Reviews</h2>
        </div>

        {loadingReviews ? (
          <div className="sd-loading">Loading reviews...</div>
        ) : !reviewsData?.reviews?.length ? (
          <div className="sd-empty">No reviews yet for this service category.</div>
        ) : (
          <div className="sd-reviews-wrap">
            <div className="sd-reviews-summary">
              <div className="sd-reviews-score">
                <Star size={22} className="sd-star" />
                <strong>{reviewsData.avg_rating || avgRating}</strong>
              </div>
              <span className="sd-reviews-count">{reviewsData.total_reviews} reviews</span>
              <div className="sd-rating-bars">
                {[5, 4, 3, 2, 1].map(star => (
                  <div key={star} className="sd-rating-bar-row">
                    <span>{star}</span>
                    <Star size={10} className="sd-star" />
                    <div className="sd-rating-bar-track">
                      <div
                        className="sd-rating-bar-fill"
                        style={{ width: `${reviewsData.percentages?.[star] || 0}%` }}
                      />
                    </div>
                    <span className="sd-rating-pct">{reviewsData.percentages?.[star] || 0}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="sd-reviews-list">
              {reviewsData.reviews.slice(0, 3).map((review, idx) => (
                <div key={idx} className="sd-review-card">
                  <div className="sd-review-header">
                    <div className="sd-review-avatar">{review.customer_name?.charAt(0).toUpperCase()}</div>
                    <div>
                      <strong>{review.customer_name}</strong>
                      <span>{formatTimeAgo(review.created_at)}</span>
                    </div>
                    <div className="sd-review-stars">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={12} className={i < review.rating ? 'sd-star filled' : 'sd-star'} />
                      ))}
                    </div>
                  </div>
                  {review.comment && <p className="sd-review-text">{review.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

    </div>
  );
}

export default ServiceDetail;
