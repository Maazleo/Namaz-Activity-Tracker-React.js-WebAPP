import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, TextField, Avatar, Button, Paper, Chip, Stack, Card, CardContent, LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { getPrayerData, getStreak, getAchievements } from '../utils/prayerData';

const defaultProfile = {
  name: '',
  email: '',
  avatar: '',
  goal: 15, // default: 15 Jamaat prayers per week
};

function getJamaatCount(data) {
  let count = 0;
  data.forEach(day => {
    Object.values(day.statuses || {}).forEach(status => {
      if (status === 'Jamaat') count++;
    });
  });
  return count;
}

const Profile = () => {
  const [profile, setProfile] = useState(defaultProfile);
  const [editing, setEditing] = useState(false);
  const [streak, setStreak] = useState(0);
  const [achievements, setAchievements] = useState([]);
  const [jamaatCount, setJamaatCount] = useState(0);
  const [resetDialog, setResetDialog] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('profile') || 'null');
    if (saved) setProfile({ ...defaultProfile, ...saved });
    const data = getPrayerData(7);
    setStreak(getStreak(data));
    setAchievements(getAchievements(data));
    setJamaatCount(getJamaatCount(data));
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    localStorage.setItem('profile', JSON.stringify(profile));
    setEditing(false);
  };

  const handleGoalChange = (e) => {
    setProfile({ ...profile, goal: Number(e.target.value) });
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setProfile((prev) => ({ ...prev, avatar: event.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  // Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Profile</Typography>
      <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
        <Avatar src={profile.avatar} sx={{ width: 80, height: 80, mb: 2, cursor: 'pointer' }} onClick={() => fileInputRef.current.click()} />
        <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleAvatarUpload} />
        <Typography variant="subtitle1" sx={{ mb: 1 }}>{getGreeting()}, {profile.name || 'User'}!</Typography>
        {editing ? (
          <>
            <TextField
              label="Name"
              name="name"
              value={profile.name}
              onChange={handleChange}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Jamaat Goal (per week)"
              name="goal"
              type="number"
              value={profile.goal}
              onChange={handleGoalChange}
              fullWidth
              sx={{ mb: 2 }}
              inputProps={{ min: 1, max: 35 }}
            />
            <Button variant="contained" onClick={handleSave} sx={{ mt: 1 }}>Save</Button>
          </>
        ) : (
          <>
            <Typography variant="h6">{profile.name || 'No Name'}</Typography>
            <Typography variant="body2" color="text.secondary">{profile.email || 'No Email'}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Jamaat Goal: <b>{profile.goal}</b> per week</Typography>
            <Button variant="outlined" onClick={() => setEditing(true)} sx={{ mt: 2 }}>Edit</Button>
          </>
        )}
      </Paper>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Jamaat Progress (last 7 days)</Typography>
        <LinearProgress variant="determinate" value={Math.min((jamaatCount / profile.goal) * 100, 100)} sx={{ height: 10, borderRadius: 5, mb: 1, bgcolor: '#223c28' }} color={jamaatCount >= profile.goal ? 'secondary' : 'primary'} />
        <Typography variant="body2" color="text.secondary">{jamaatCount} / {profile.goal} prayers in Jamaat</Typography>
      </Paper>
      <Stack direction="row" spacing={2} sx={{ mb: 2, justifyContent: 'center' }}>
        <Card sx={{ minWidth: 120, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
          <CardContent>
            <Typography variant="subtitle2">Current Streak</Typography>
            <Typography variant="h6">{streak} day{streak !== 1 ? 's' : ''}</Typography>
          </CardContent>
        </Card>
        {achievements.map((ach) => (
          <Chip key={ach.label} label={ach.label} color="secondary" variant="filled" sx={{ fontWeight: 600 }} />
        ))}
      </Stack>
      <Button variant="outlined" color="error" onClick={() => setResetDialog(true)} sx={{ mt: 2 }}>Reset All Data</Button>
      <Dialog open={resetDialog} onClose={() => setResetDialog(false)}>
        <DialogTitle>Reset All Data?</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to reset all your profile and prayer data? This cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialog(false)}>Cancel</Button>
          <Button color="error" onClick={handleReset}>Reset</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile; 