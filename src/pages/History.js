import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const PRAYER_OPTIONS = ['Jamaat', 'Alone', 'Missed'];

function getDayData(date) {
  const key = date.toISOString().slice(0, 10);
  const entry = JSON.parse(localStorage.getItem(key) || '{}');
  return {
    statuses: entry.statuses || {},
    note: entry.note || '',
  };
}

const History = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dayData, setDayData] = useState(getDayData(new Date()));

  useEffect(() => {
    setDayData(getDayData(selectedDate));
  }, [selectedDate]);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>History</Typography>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="Select a date"
          value={selectedDate}
          onChange={(date) => date && setSelectedDate(date)}
          maxDate={new Date()}
          slotProps={{ textField: { fullWidth: true, sx: { mb: 2 } } }}
        />
      </LocalizationProvider>
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>Prayer Statuses</Typography>
        {prayers.map((prayer) => (
          <Box key={prayer} sx={{ mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography sx={{ minWidth: 80 }}>{prayer}</Typography>
            <ToggleButtonGroup
              value={dayData.statuses[prayer] || ''}
              exclusive
              size="small"
              color="primary"
              disabled
            >
              {PRAYER_OPTIONS.map((option) => (
                <ToggleButton value={option} key={option}>{option}</ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
        ))}
        <Typography variant="subtitle2" sx={{ mt: 2 }}>Note:</Typography>
        <Typography variant="body2" color="text.secondary">{dayData.note || 'No note for this day.'}</Typography>
      </Paper>
    </Box>
  );
};

export default History; 