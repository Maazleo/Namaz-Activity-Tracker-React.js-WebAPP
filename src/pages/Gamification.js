import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Chip, Stack, Card, CardContent, LinearProgress, Avatar, Alert } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import StarIcon from '@mui/icons-material/Star';

const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const pointsPerPrayer = 10;
const levelThresholds = [0, 100, 250, 500, 1000, 2000];
const badgeList = [
  { label: 'First Step', desc: 'First prayer logged', icon: <StarIcon color="warning" /> },
  { label: 'Streak Starter', desc: '3-day streak', icon: <WhatshotIcon color="error" /> },
  { label: 'Consistent', desc: '7-day streak', icon: <EmojiEventsIcon color="secondary" /> },
  { label: 'Dedicated', desc: '30-day streak', icon: <EmojiEventsIcon color="primary" /> },
];

function getGamificationData() {
  let points = 0;
  let streak = 0;
  let maxStreak = 0;
  let badges = [];
  let lastDayAll = false;
  let currentStreak = 0;
  let firstPrayer = false;
  let days = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const entry = JSON.parse(localStorage.getItem(key) || '{}');
    if (Object.keys(entry.statuses || {}).length > 0) {
      firstPrayer = true;
      days++;
    }
    let allOffered = prayers.every(p => ['Jamaat', 'Alone'].includes((entry.statuses || {})[p]));
    let offeredCount = prayers.filter(p => ['Jamaat', 'Alone'].includes((entry.statuses || {})[p])).length;
    points += offeredCount * pointsPerPrayer;
    if (allOffered) {
      currentStreak++;
      if (currentStreak > maxStreak) maxStreak = currentStreak;
    } else {
      currentStreak = 0;
    }
  }
  streak = currentStreak;
  if (firstPrayer) badges.push(badgeList[0]);
  if (maxStreak >= 3) badges.push(badgeList[1]);
  if (maxStreak >= 7) badges.push(badgeList[2]);
  if (maxStreak >= 30) badges.push(badgeList[3]);
  let level = levelThresholds.length - 1;
  for (let i = 0; i < levelThresholds.length; i++) {
    if (points < levelThresholds[i]) {
      level = i - 1;
      break;
    }
  }
  return { points, streak, maxStreak, badges, level, nextLevel: levelThresholds[level + 1] || null };
}

const Gamification = () => {
  const [data, setData] = useState(getGamificationData());

  useEffect(() => {
    setData(getGamificationData());
  }, []);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Gamification & Motivation</Typography>
      <Paper sx={{ p: 3, mb: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
        <Avatar sx={{ bgcolor: 'secondary.main', width: 56, height: 56, fontSize: 28, mr: 2 }}>{data.level + 1}</Avatar>
        <Box>
          <Typography variant="h6">Level {data.level + 1}</Typography>
          <Typography variant="body2" color="text.secondary">Points: {data.points}</Typography>
          {data.nextLevel && (
            <LinearProgress variant="determinate" value={Math.min((data.points / data.nextLevel) * 100, 100)} sx={{ height: 8, borderRadius: 4, mt: 1, bgcolor: '#223c28' }} color="secondary" />
          )}
          {data.nextLevel && <Typography variant="caption">Next level: {data.nextLevel - data.points} points to go</Typography>}
        </Box>
      </Paper>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Badges</Typography>
        <Stack direction="row" spacing={2}>
          {data.badges.length === 0 && <Typography variant="body2">No badges yet. Start praying to earn badges!</Typography>}
          {data.badges.map(badge => (
            <Chip key={badge.label} icon={badge.icon} label={badge.label} color="secondary" />
          ))}
        </Stack>
      </Paper>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2">Current Streak</Typography>
        <Alert severity={data.streak > 0 ? 'success' : 'info'} sx={{ mt: 1 }}>
          {data.streak > 0
            ? `Keep it up! You have a ${data.streak}-day streak. Don't break it!`
            : 'Start a streak by offering all prayers today!'}
        </Alert>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Longest streak: {data.maxStreak} days</Typography>
      </Paper>
    </Box>
  );
};

export default Gamification; 