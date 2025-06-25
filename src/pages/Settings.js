import React, { useState, useEffect } from 'react';
import { Box, Typography, FormControlLabel, Switch, Paper, Button, TextField, MenuItem, Stack, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, RadioGroup, FormControl, FormLabel, Radio, CircularProgress } from '@mui/material';
import axios from 'axios';
import { getPrayerTimes } from '../utils/prayerTimeApi';

const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const languages = [
  { code: 'en', label: 'English' },
  { code: 'ur', label: 'Urdu' },
];
const sounds = [
  { value: 'default', label: 'Default' },
  { value: 'chime', label: 'Chime' },
  { value: 'beep', label: 'Beep' },
];
const accents = [
  { value: '#6ee7b7', label: 'Light Green' },
  { value: '#a7f3d0', label: 'Mint' },
  { value: '#facc15', label: 'Gold' },
  { value: '#38bdf8', label: 'Sky Blue' },
  { value: '#f472b6', label: 'Pink' },
];

const defaultTimes = {
  Fajr: '05:00',
  Dhuhr: '13:00',
  Asr: '16:30',
  Maghrib: '19:00',
  Isha: '20:30',
};

const Settings = ({ darkMode, onToggleDarkMode }) => {
  const [notifications, setNotifications] = useState(() => {
    return JSON.parse(localStorage.getItem('notifications') || 'false');
  });
  const [prayerTimes, setPrayerTimes] = useState(() => {
    return JSON.parse(localStorage.getItem('prayerTimes') || JSON.stringify(defaultTimes));
  });
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'en');
  const [sound, setSound] = useState(() => localStorage.getItem('sound') || 'default');
  const [accent, setAccent] = useState(() => localStorage.getItem('accent') || '#6ee7b7');
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [location, setLocation] = useState(null);
  const [city, setCity] = useState('');
  const [geoTimes, setGeoTimes] = useState(null);
  const [loadingGeo, setLoadingGeo] = useState(false);

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
    if (notifications) {
      Notification.requestPermission();
    }
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('prayerTimes', JSON.stringify(prayerTimes));
  }, [prayerTimes]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('sound', sound);
  }, [sound]);

  useEffect(() => {
    localStorage.setItem('accent', accent);
    document.documentElement.style.setProperty('--accent', accent);
  }, [accent]);

  // Notification scheduling (simple, for demo)
  useEffect(() => {
    if (!notifications || Notification.permission !== 'granted') return;
    const intervals = [];
    prayers.forEach((prayer) => {
      const [h, m] = prayerTimes[prayer].split(':');
      const now = new Date();
      const target = new Date();
      target.setHours(+h, +m, 0, 0);
      if (target < now) target.setDate(target.getDate() + 1);
      const ms = target - now;
      intervals.push(setTimeout(() => {
        new Notification(`${prayer} time!`, { body: `It's time for ${prayer} prayer.`, icon: '', silent: false });
        // Play sound (demo)
        if (sound !== 'default') {
          const audio = new Audio(`/sounds/${sound}.mp3`);
          audio.play();
        }
      }, ms));
    });
    return () => intervals.forEach(clearTimeout);
  }, [notifications, prayerTimes, sound]);

  const handleTimeChange = (prayer, value) => {
    setPrayerTimes((prev) => ({ ...prev, [prayer]: value }));
  };

  // Data export
  const handleExport = () => {
    const data = {};
    Object.keys(localStorage).forEach((key) => {
      if (!['darkMode', 'notifications', 'prayerTimes', 'language', 'profile', 'sound', 'accent'].includes(key)) {
        data[key] = localStorage.getItem(key);
      }
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'namaz_data.json';
    a.click();
    setSnackbar({ open: true, message: 'Data exported!', severity: 'success' });
  };

  // Data import
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        Object.keys(data).forEach((key) => {
          localStorage.setItem(key, data[key]);
        });
        setSnackbar({ open: true, message: 'Data imported! Please refresh.', severity: 'success' });
      } catch {
        setSnackbar({ open: true, message: 'Import failed.', severity: 'error' });
      }
    };
    reader.readAsText(file);
  };

  // Mock weekly email summary
  const handleWeeklyEmail = () => {
    setSnackbar({ open: true, message: 'You will receive a weekly summary email (mock).', severity: 'info' });
  };

  // Location-based prayer time logic
  const handleDetectLocation = async () => {
    setLoadingGeo(true);
    setGeoTimes(null);
    setCity('');
    if (!navigator.geolocation) {
      setSnackbar({ open: true, message: 'Geolocation not supported.', severity: 'error' });
      setLoadingGeo(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      setLocation({ latitude, longitude });
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
        setSnackbar({ open: true, message: 'Could not fetch prayer times.', severity: 'error' });
      }
      setLoadingGeo(false);
    }, () => {
      setSnackbar({ open: true, message: 'Location access denied.', severity: 'error' });
      setLoadingGeo(false);
    });
  };

  const handleSetGeoTimes = () => {
    if (!geoTimes) return;
    const newTimes = {};
    prayers.forEach(p => {
      const t = geoTimes[p];
      if (t) newTimes[p] = t.slice(0, 5);
    });
    setPrayerTimes(newTimes);
    setSnackbar({ open: true, message: 'Prayer times updated from location!', severity: 'success' });
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Settings</Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <FormControlLabel
          control={<Switch checked={darkMode} onChange={onToggleDarkMode} />}
          label="Dark Mode"
        />
      </Paper>
      <Paper sx={{ p: 2, mb: 2 }}>
        <FormControlLabel
          control={<Switch checked={notifications} onChange={() => setNotifications((v) => !v)} />}
          label="Prayer Reminders"
        />
        {notifications && (
          <Stack spacing={1} sx={{ mt: 2 }}>
            {prayers.map((prayer) => (
              <TextField
                key={prayer}
                label={`${prayer} Time`}
                type="time"
                value={prayerTimes[prayer]}
                onChange={(e) => handleTimeChange(prayer, e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 60 }}
                sx={{ maxWidth: 180 }}
              />
            ))}
            <FormControl sx={{ mt: 2 }}>
              <FormLabel>Notification Sound</FormLabel>
              <RadioGroup row value={sound} onChange={e => setSound(e.target.value)}>
                {sounds.map(s => (
                  <FormControlLabel key={s.value} value={s.value} control={<Radio />} label={s.label} />
                ))}
              </RadioGroup>
            </FormControl>
          </Stack>
        )}
      </Paper>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>Theme Accent</Typography>
        <RadioGroup row value={accent} onChange={e => setAccent(e.target.value)}>
          {accents.map(a => (
            <FormControlLabel key={a.value} value={a.value} control={<Radio sx={{ color: a.value, '&.Mui-checked': { color: a.value } }} />} label={<span style={{ color: a.value }}>{a.label}</span>} />
          ))}
        </RadioGroup>
      </Paper>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>Data</Typography>
        <Button variant="outlined" onClick={handleExport} sx={{ mr: 2 }}>Export Data</Button>
        <Button variant="outlined" component="label">
          Import Data
          <input type="file" accept="application/json" hidden onChange={handleImport} />
        </Button>
      </Paper>
      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          select
          label="Language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          sx={{ minWidth: 180 }}
        >
          {languages.map((lang) => (
            <MenuItem key={lang.code} value={lang.code}>{lang.label}</MenuItem>
          ))}
        </TextField>
        <Button variant="text" onClick={handleWeeklyEmail} sx={{ ml: 2 }}>Weekly Email Summary</Button>
      </Paper>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Button variant="text" onClick={() => setPrivacyOpen(true)}>
          Privacy Policy & Terms
        </Button>
      </Paper>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Button variant="outlined" onClick={handleDetectLocation} disabled={loadingGeo} sx={{ mb: 2 }}>
          {loadingGeo ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
          Detect Location & Prayer Times
        </Button>
        {city && <Typography variant="body2">City: {city}</Typography>}
        {geoTimes && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="subtitle2">Today's Prayer Times</Typography>
            <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
              {prayers.map(p => (
                <Box key={p} sx={{ textAlign: 'center' }}>
                  <Typography variant="caption">{p}</Typography>
                  <Typography variant="body2">{geoTimes[p]}</Typography>
                </Box>
              ))}
            </Stack>
            <Button variant="contained" onClick={handleSetGeoTimes} size="small">Set as My Prayer Times</Button>
          </Box>
        )}
      </Paper>
      <Dialog open={privacyOpen} onClose={() => setPrivacyOpen(false)}>
        <DialogTitle>Privacy Policy & Terms</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            This app stores your data locally in your browser. No data is sent to any server. By using this app, you agree to keep your data private and secure on your device.
          </Typography>
          <Typography variant="body2">
            For more information, contact the developer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPrivacyOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings; 