// Utility to fetch and process prayer data from localStorage

export function getPrayerData(range = 30) {
  // Returns an array of { date, statuses, note }
  const data = [];
  const today = new Date();
  for (let i = 0; i < range; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const entry = JSON.parse(localStorage.getItem(key) || '{}');
    data.unshift({
      date: key,
      statuses: entry.statuses || {},
      note: entry.note || '',
    });
  }
  return data;
}

export function getPrayerStats(data) {
  // Returns { total, offered } for all prayers in the data
  let total = 0;
  let offered = 0;
  data.forEach(day => {
    Object.values(day.statuses).forEach(status => {
      total++;
      if (status === 'Jamaat' || status === 'Alone') offered++;
    });
  });
  return { total, offered };
}

export function getStreak(data) {
  // Returns the current streak of consecutive days all prayers offered
  let streak = 0;
  for (let i = data.length - 1; i >= 0; i--) {
    const day = data[i];
    const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    const allOffered = prayers.every(p => ['Jamaat', 'Alone'].includes(day.statuses[p]));
    if (allOffered) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function getAchievements(data) {
  // Returns an array of achievement objects
  const stats = getPrayerStats(data);
  const streak = getStreak(data);
  const achievements = [];
  if (streak >= 7) achievements.push({ label: '7-Day Streak', desc: 'Offered all prayers for 7 days in a row!' });
  if (streak >= 30) achievements.push({ label: '30-Day Streak', desc: 'Offered all prayers for 30 days in a row!' });
  if (stats.offered >= 100) achievements.push({ label: '100 Prayers', desc: 'Offered 100 prayers!' });
  if (stats.offered >= 365) achievements.push({ label: '365 Prayers', desc: 'Offered 365 prayers!' });
  return achievements;
} 