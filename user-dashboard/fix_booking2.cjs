const fs = require('fs');
let lines = fs.readFileSync('src/components/BookingModal.jsx', 'utf8').split('\n');

const replacement = `    try {
      const perms = await Geolocation.requestPermissions();
      if (perms.location !== 'granted' && perms.coarseLocation !== 'granted') {
        setLocationFeedback({
          type: 'error',
          text: 'Location permission was denied. Please allow location access or choose a saved address.'
        });
        setDetectingLocation(false);
        return;
      }

      const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      setDetectedCoords({ latitude: lat, longitude: lon });

      try {
        const res = await fetch(
          \`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=\${lat}&lon=\${lon}&zoom=18&addressdetails=1\`
        );
        if (!res.ok) throw new Error('Geocoding lookup failed');
        const data = await res.json();
        const a = data.address || {};

        const street = a.building || a.house_number || a.road || a.pedestrian || a.suburb || '';
        const locality = a.neighbourhood || a.suburb || a.residential || '';
        const city = a.city || a.town || a.village || a.county || 'Thiruvananthapuram';
        const state = a.state || 'Kerala';
        const pincode = a.postcode ? \` - \${a.postcode}\` : '';

        const parts = [street, locality, city, state].filter(Boolean);
        const formatted = parts.length > 1
          ? \`\${parts.join(', ')}\${pincode}\`
          : data.display_name || \`Location (\${lat.toFixed(4)}, \${lon.toFixed(4)}), Thiruvananthapuram, Kerala\`;

        setAddressLine(formatted);
        const detectedDist = detectDistrictFromTextOrCoords(formatted, { latitude: lat, longitude: lon });
        setCustomerCurrentDistrict(detectedDist);
        setDestinationDistrict(detectedDist);
        if (locality || street) {
          setLandmark(\`Near \${locality || street}\`);
        }
        setLocationFeedback({
          type: 'success',
          text: \`Detected location in \${detectedDist} (\${DEFAULT_DISTRICT_TIERS[detectedDist]?.tier || 'Standard Pricing'})\`
        });
      } catch {
        const fallback = \`Current Location (\${lat.toFixed(4)}, \${lon.toFixed(4)}), Thiruvananthapuram, Kerala\`;
        setAddressLine(fallback);
        const fallbackDist = detectDistrictFromTextOrCoords(fallback, { latitude: lat, longitude: lon });
        setCustomerCurrentDistrict(fallbackDist);
        setDestinationDistrict(fallbackDist);
        setLocationFeedback({
          type: 'success',
          text: 'GPS coordinates detected successfully!'
        });
      } finally {
        setDetectingLocation(false);
      }
    } catch(err) {
      setDetectingLocation(false);
      setLocationFeedback({
        type: 'error',
        text: 'Unable to detect GPS position. Please check your location settings.'
      });
    }`;

// 518 is index 517, up to 595 is 594 inclusive (78 elements)
lines.splice(517, 78, replacement);
fs.writeFileSync('src/components/BookingModal.jsx', lines.join('\n'));
