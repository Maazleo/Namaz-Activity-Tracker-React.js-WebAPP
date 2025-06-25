import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, ToggleButtonGroup, ToggleButton, TextField, Card, CardContent, Stack, Fade, Button, CircularProgress, Snackbar, Alert, FormControlLabel, Switch } from '@mui/material';
import WbTwilightIcon from '@mui/icons-material/WbTwilight';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import FilterDramaIcon from '@mui/icons-material/FilterDrama';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import Brightness3Icon from '@mui/icons-material/Brightness3';
import axios from 'axios';
import { getPrayerTimes } from '../utils/prayerTimeApi';
import { getPrayerData, getStreak } from '../utils/prayerData';
import DailyQuote from '../components/DailyQuote';

const prayers = [
  { name: 'Fajr', icon: <WbTwilightIcon color="primary" /> },
  { name: 'Dhuhr', icon: <WbSunnyIcon color="warning" /> },
  { name: 'Asr', icon: <FilterDramaIcon color="success" /> },
  { name: 'Maghrib', icon: <NightsStayIcon color="info" /> },
  { name: 'Isha', icon: <Brightness3Icon color="secondary" /> },
];

const PRAYER_OPTIONS = [
  { value: 'Jamaat', color: 'primary' },
  { value: 'Alone', color: 'success' },
  { value: 'Missed', color: 'error' },
];

const getTodayKey = () => {
  const today = new Date();
  return today.toISOString().slice(0, 10);
};

function getNextPrayerTimes(geoTimes) {
  // Returns [{prayer, time, minutesUntil}] for prayers still upcoming today
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  return prayers.map(p => {
    const t = geoTimes ? geoTimes[p.name] : null;
    if (!t) return null;
    // t is in HH:mm (24h)
    const [h, m] = t.split(':');
    const dt = new Date(todayStr + 'T' + h.padStart(2, '0') + ':' + m.padStart(2, '0'));
    const diff = (dt - now) / 60000; // minutes
    return { prayer: p.name, time: t, minutesUntil: diff };
  }).filter(x => x && x.minutesUntil > 0);
}

function getSmartSuggestions() {
  const data = getPrayerData(14); // last 14 days
  let missedFajr = 0;
  let ishaStreak = 0;
  let lastIsha = false;
  for (let i = data.length - 1; i >= 0; i--) {
    const day = data[i];
    if ((day.statuses?.Fajr || '') === 'Missed') missedFajr++;
    if ((day.statuses?.Isha || '') === 'Jamaat' || (day.statuses?.Isha || '') === 'Alone') {
      if (lastIsha || ishaStreak === 0) ishaStreak++;
      lastIsha = true;
    } else {
      lastIsha = false;
      if (ishaStreak > 0) break;
    }
  }
  const suggestions = [];
  if (missedFajr >= 3) suggestions.push('You often miss Fajr — try sleeping by 11 PM.');
  if (ishaStreak >= 7) suggestions.push('Isha offered 7 days in a row! Keep it up!');
  if (suggestions.length === 0) suggestions.push('Keep tracking your prayers for more tips!');
  return suggestions;
}

const Today = () => {
  const [statuses, setStatuses] = useState({});
  const [note, setNote] = useState('');
  // Location-based prayer times
  const [city, setCity] = useState('');
  const [geoTimes, setGeoTimes] = useState(null);
  const [loadingGeo, setLoadingGeo] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [notifyEnabled, setNotifyEnabled] = useState(() => {
    const saved = localStorage.getItem('prayerNotify');
    return saved ? JSON.parse(saved) : true;
  });
  const notificationTimers = useRef([]);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const key = getTodayKey();
    const saved = JSON.parse(localStorage.getItem(key) || '{}');
    setStatuses(saved.statuses || {});
    setNote(saved.note || '');
    setSuggestions(getSmartSuggestions());
  }, []);

  useEffect(() => {
    const key = getTodayKey();
    localStorage.setItem(key, JSON.stringify({ statuses, note }));
  }, [statuses, note]);

  useEffect(() => {
    localStorage.setItem('prayerNotify', JSON.stringify(notifyEnabled));
  }, [notifyEnabled]);

  // Fetch location and prayer times on mount
  useEffect(() => {
    setLoadingGeo(true);
    if (!navigator.geolocation) {
      setLoadingGeo(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      // Get city name
      try {
        const geoRes = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
        setCity(geoRes.data.address.city || geoRes.data.address.town || geoRes.data.address.village || '');
      } catch {
        setCity('');
      }
      // Get prayer times
      try {
        const today = new Date().toISOString().slice(0, 10);
        const times = await getPrayerTimes(latitude, longitude, today);
        setGeoTimes(times);
      } catch {
        setGeoTimes(null);
      }
      setLoadingGeo(false);
    }, () => {
      setLoadingGeo(false);
    });
  }, []);

  // Schedule notifications 10 minutes before each prayer
  useEffect(() => {
    // Clear previous timers
    notificationTimers.current.forEach(timer => clearTimeout(timer));
    notificationTimers.current = [];
    if (!geoTimes || !('Notification' in window) || !notifyEnabled) return;
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
    const nextPrayers = getNextPrayerTimes(geoTimes);
    nextPrayers.forEach(({ prayer, time, minutesUntil }) => {
      const notifyIn = (minutesUntil - 10) * 60000;
      if (notifyIn > 0) {
        const timer = setTimeout(() => {
          if (Notification.permission === 'granted') {
            new Notification(`${prayer} will begin in 10 minutes.`, { body: `It's almost time for ${prayer} (${time})`, icon: '' });
          } else {
            setSnackbar({ open: true, message: `${prayer} will begin in 10 minutes.`, severity: 'info' });
          }
        }, notifyIn);
        notificationTimers.current.push(timer);
      }
    });
    return () => notificationTimers.current.forEach(timer => clearTimeout(timer));
  }, [geoTimes, notifyEnabled]);

  const handleStatus = (prayer, value) => {
    setStatuses((prev) => ({ ...prev, [prayer]: value }));
  };

  return (
    <Box>
      <DailyQuote />
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, letterSpacing: 1 }}>Today's Prayers</Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        {loadingGeo ? (
          <Stack direction="row" alignItems="center" spacing={1}>
            <CircularProgress size={18} />
            <Typography variant="body2">Detecting location and prayer times...</Typography>
          </Stack>
        ) : geoTimes ? (
          <>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Today's Prayer Times{city && ` (${city})`}</Typography>
            <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
              {prayers.map(p => (
                <Box key={p.name} sx={{ textAlign: 'center' }}>
                  <Typography variant="caption">{p.name}</Typography>
                  <Typography variant="body2">{geoTimes[p.name]}</Typography>
                </Box>
              ))}
            </Stack>
            <FormControlLabel
              control={<Switch checked={notifyEnabled} onChange={e => setNotifyEnabled(e.target.checked)} />}
              label="Prayer Time Notifications"
              sx={{ mt: 1 }}
            />
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">Prayer times unavailable.</Typography>
        )}
      </Paper>
      <Stack spacing={2} sx={{ mb: 2 }}>
        {prayers.map((prayer) => (
          <Fade in key={prayer.name}>
            <Card elevation={statuses[prayer.name] ? 8 : 2} sx={{ borderLeft: statuses[prayer.name] ? `6px solid` : 'none', borderColor: statuses[prayer.name] === 'Jamaat' ? 'primary.main' : statuses[prayer.name] === 'Alone' ? 'success.main' : statuses[prayer.name] === 'Missed' ? 'error.main' : 'grey.300', transition: 'border-color 0.3s' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {prayer.icon}
                  <Typography variant="h6">{prayer.name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1, minWidth: 54 }}>
                    {geoTimes ? geoTimes[prayer.name] : '-'}
                  </Typography>
                </Box>
                <ToggleButtonGroup
                  value={statuses[prayer.name] || ''}
                  exclusive
                  onChange={(_, value) => handleStatus(prayer.name, value)}
                  size="small"
                  color={statuses[prayer.name] === 'Jamaat' ? 'primary' : statuses[prayer.name] === 'Alone' ? 'success' : statuses[prayer.name] === 'Missed' ? 'error' : 'standard'}
                >
                  {PRAYER_OPTIONS.map((option) => (
                    <ToggleButton value={option.value} key={option.value} color={option.color}>
                      {option.value}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </CardContent>
            </Card>
          </Fade>
        ))}
      </Stack>
      <TextField
        label="Note for today"
        multiline
        fullWidth
        minRows={2}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        variant="outlined"
        sx={{ mt: 2 }}
      />
      <Paper sx={{ p: 2, mt: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Smart Suggestions</Typography>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {suggestions.map((s, i) => <li key={i}><Typography variant="body2">{s}</Typography></li>)}
        </ul>
      </Paper>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Today; 