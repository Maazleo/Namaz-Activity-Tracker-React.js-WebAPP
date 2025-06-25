import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Stack, CircularProgress, List, ListItem, ListItemText } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon issue
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl, shadowUrl: iconShadow });
L.Marker.prototype.options.icon = DefaultIcon;

const MASJID_QUERY = (lat, lon, radius = 5000) => `
[out:json];
node[amenity=place_of_worship][religion=muslim](around:${radius},${lat},${lon});
out;
`;

const MasjidFinder = () => {
  const [location, setLocation] = useState(null);
  const [masajid, setMasajid] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    if (!navigator.geolocation) {
      setError('Geolocation not supported.');
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      setLocation({ lat: latitude, lon: longitude });
      // Fetch masajid from Overpass API
      try {
        const query = MASJID_QUERY(latitude, longitude);
        const res = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          body: query,
        });
        const data = await res.json();
        setMasajid(data.elements || []);
      } catch {
        setError('Could not fetch masajid.');
      }
      setLoading(false);
    }, () => {
      setError('Location access denied.');
      setLoading(false);
    });
  }, []);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Masjid Finder</Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        {loading && <Stack direction="row" alignItems="center" spacing={1}><CircularProgress size={18} /><Typography>Detecting location and searching for masajid...</Typography></Stack>}
        {error && <Typography color="error">{error}</Typography>}
        {location && masajid.length > 0 && (
          <MapContainer center={[location.lat, location.lon]} zoom={13} style={{ height: 300, width: '100%', marginBottom: 16 }} scrollWheelZoom={false}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[location.lat, location.lon]}>
              <Popup>Your Location</Popup>
            </Marker>
            {masajid.map((m, idx) => (
              <Marker key={m.id} position={[m.lat, m.lon]}>
                <Popup>
                  <b>{m.tags?.name || 'Masjid'}</b><br />
                  {m.tags?.addr_full || ''}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
        {location && masajid.length === 0 && !loading && <Typography>No masajid found nearby.</Typography>}
      </Paper>
      {masajid.length > 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Nearby Masajid</Typography>
          <List>
            {masajid.map((m, idx) => (
              <ListItem key={m.id}>
                <ListItemText
                  primary={m.tags?.name || 'Masjid'}
                  secondary={m.tags?.addr_full || `Lat: ${m.lat}, Lon: ${m.lon}`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default MasjidFinder; 