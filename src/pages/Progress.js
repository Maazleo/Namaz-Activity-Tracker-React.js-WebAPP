import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Chip, Stack, Card, CardContent } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getPrayerData, getPrayerStats, getStreak, getAchievements } from '../utils/prayerData';

const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

const getChartData = () => {
  const data = getPrayerData(7); // last 7 days
  return data.map(day => ({
    date: day.date.slice(5), // MM-DD
    offered: prayers.filter(p => ['Jamaat', 'Alone'].includes(day.statuses[p])).length,
    total: prayers.length,
  }));
};

const Progress = () => {
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState({ total: 0, offered: 0 });
  const [streak, setStreak] = useState(0);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    const data = getPrayerData(30);
    setStats(getPrayerStats(data));
    setChartData(getChartData());
    setStreak(getStreak(data));
    setAchievements(getAchievements(data));
  }, []);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Progress</Typography>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Card sx={{ minWidth: 120, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
          <CardContent>
            <Typography variant="subtitle2">Current Streak</Typography>
            <Typography variant="h6">{streak} day{streak !== 1 ? 's' : ''}</Typography>
          </CardContent>
        </Card>
        {achievements.map((ach, idx) => (
          <Chip key={ach.label} label={ach.label} color="secondary" variant="filled" sx={{ fontWeight: 600 }} />
        ))}
      </Stack>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1">Last 30 Days</Typography>
        <Typography variant="body1">
          Prayers offered: <b>{stats.offered}</b> / {stats.total}
        </Typography>
      </Paper>
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>Last 7 Days (Prayers Offered)</Typography>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} domain={[0, 5]} />
            <Tooltip />
            <Bar dataKey="offered" fill="#1976d2" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
};

export default Progress; 