import axios from 'axios';

// date: YYYY-MM-DD
export async function getPrayerTimes(lat, lng, date) {
  // Use AlAdhan API
  const [year, month, day] = date.split('-');
  const url = `https://api.aladhan.com/v1/timings/${day}-${month}-${year}?latitude=${lat}&longitude=${lng}&method=2`;
  const res = await axios.get(url);
  if (res.data && res.data.data && res.data.data.timings) {
    return res.data.data.timings;
  }
  throw new Error('Could not fetch prayer times');
} 