const fs = require('fs');
const file = 'd:/service-marketplace/user-dashboard/src/pages/Services.jsx';
let content = fs.readFileSync(file, 'utf8').split('\n');

const replacement = `      {showLocationModal && (
        <div className="modal-overlay" style={{ backdropFilter: 'blur(4px)', background: 'rgba(15, 23, 42, 0.4)' }} onClick={() => setShowLocationModal(false)}>
          <div className="location-modal" style={{ background: '#fff', borderRadius: '24px', overflow: 'hidden', padding: 0, border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            
            <button
              onClick={() => setShowLocationModal(false)}
              style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
            >
              <span style={{ fontSize: 22, color: '#334155', lineHeight: 1, marginTop: '-2px' }}>&times;</span>
            </button>

            {location ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <iframe
                  title="Your current location"
                  src={mapUrl}
                  loading="lazy"
                  style={{ width: '100%', height: '320px', border: 'none' }}
                />
                <div style={{ padding: '24px', background: '#fff', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <div style={{ padding: '12px', background: '#eff6ff', borderRadius: '14px' }}>
                      <MapPin size={24} color="#2563eb" />
                    </div>
                    <div>
                      <h3 style={{ margin: '0 0 6px 0', fontSize: '17px', color: '#0f172a', fontWeight: '800' }}>Your Service Location</h3>
                      <p style={{ margin: 0, fontSize: '14px', color: '#64748b', lineHeight: '1.5' }}>
                        {location.placeName || locationName}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setShowLocationModal(false)}
                    style={{
                      background: '#2563eb',
                      color: 'white',
                      border: 'none',
                      padding: '16px',
                      borderRadius: '14px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      fontSize: '16px',
                      width: '100%',
                      transition: 'background 0.2s, transform 0.1s',
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                    }}
                    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    Confirm & Continue
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ width: 88, height: 88, background: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                  <MapPin size={44} color="#2563eb" />
                </div>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '22px', color: '#0f172a', fontWeight: '800' }}>Find Services Near You</h3>
                <p style={{ margin: '0 0 32px 0', fontSize: '15px', color: '#64748b', lineHeight: '1.6' }}>
                  Enable location access so we can show you the best professionals available in your specific area.
                </p>

                {locationError && (
                  <div style={{ padding: '14px 16px', background: '#fef2f2', color: '#991b1b', borderRadius: '12px', fontSize: '14px', marginBottom: '24px', width: '100%', border: '1px solid #fecaca', fontWeight: '500' }}>
                    {locationError}
                  </div>
                )}

                <button
                  onClick={() => {
                    requestLocation().catch(() => {});
                  }}
                  disabled={locationStatus === 'requesting'}
                  style={{
                    background: '#2563eb',
                    color: 'white',
                    border: 'none',
                    padding: '16px',
                    borderRadius: '14px',
                    fontWeight: '700',
                    cursor: locationStatus === 'requesting' ? 'wait' : 'pointer',
                    fontSize: '16px',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                    opacity: locationStatus === 'requesting' ? 0.7 : 1
                  }}
                  onMouseDown={(e) => { if(locationStatus !== 'requesting') e.currentTarget.style.transform = 'scale(0.98)'; }}
                  onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {locationStatus === 'requesting' ? <RefreshCw size={20} className="spin" /> : <MapPin size={20} />}
                  {locationStatus === 'requesting' ? 'Detecting Location...' : 'Enable Location Access'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}`;

content.splice(811, 80, replacement);
fs.writeFileSync(file, content.join('\n'));
