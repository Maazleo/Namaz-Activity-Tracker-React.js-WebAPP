import React, { useState } from 'react';
import { Box, Typography, Paper, Button, MenuItem, TextField, Stack, Snackbar, Alert } from '@mui/material';
import { getPrayerStats } from '../utils/prayerData';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const quotes = [
  'Indeed, prayer prohibits immorality and wrongdoing. (Quran 29:45)',
  'The key to Paradise is prayer. (Hadith)',
  'Verily, the prayer keeps one from the great sins and evil deeds. (Quran 29:45)',
];

function getWeekStart(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

function getMonthStart(date) {
  const d = new Date(date);
  d.setDate(1);
  return d;
}

function getRangeData(start, days) {
  const data = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const entry = JSON.parse(localStorage.getItem(key) || '{}');
    data.push({
      date: key,
      statuses: entry.statuses || {},
      note: entry.note || '',
    });
  }
  return data;
}

const Report = () => {
  const [mode, setMode] = useState('week');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleDownload = () => {
    let start, days, label;
    if (mode === 'week') {
      start = getWeekStart(new Date(date));
      days = 7;
      label = 'Week';
    } else {
      start = getMonthStart(new Date(date));
      days = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
      label = 'Month';
    }
    const data = getRangeData(start, days);
    const stats = getPrayerStats(data);
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Namaz Activity Report (${label})`, 14, 18);
    doc.setFontSize(12);
    doc.text(`From: ${data[0].date}  To: ${data[data.length - 1].date}`, 14, 28);
    doc.text(`Total Prayers Offered: ${stats.offered} / ${stats.total}`, 14, 36);
    doc.autoTable({
      startY: 44,
      head: [[
        'Date',
        ...prayers,
        'Note',
      ]],
      body: data.map(day => [
        day.date,
        ...prayers.map(p => day.statuses[p] || '-'),
        day.note || '-',
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [22, 101, 52] },
    });
    // Optional quote and signature
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    doc.text(`Quote: ${quote}`, 14, doc.lastAutoTable.finalY + 12);
    doc.text('Signature: ______________________', 14, doc.lastAutoTable.finalY + 24);
    doc.save(`namaz_report_${label.toLowerCase()}_${data[0].date}.pdf`);
    setSnackbar({ open: true, message: 'PDF downloaded!', severity: 'success' });
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Printable Namaz Report</Typography>
      <Paper sx={{ p: 3, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            select
            label="Report Type"
            value={mode}
            onChange={e => setMode(e.target.value)}
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="week">Weekly</MenuItem>
            <MenuItem value="month">Monthly</MenuItem>
          </TextField>
          <TextField
            label={mode === 'week' ? 'Any day in week' : 'Any day in month'}
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            sx={{ minWidth: 180 }}
          />
          <Button variant="contained" onClick={handleDownload}>Download PDF</Button>
        </Stack>
      </Paper>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Report; 