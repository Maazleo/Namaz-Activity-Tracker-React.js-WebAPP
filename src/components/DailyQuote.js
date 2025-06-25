import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, IconButton, Stack, Button, Select, MenuItem, FormControl, InputLabel, Tooltip } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShareIcon from '@mui/icons-material/Share';
import TwitterIcon from '@mui/icons-material/Twitter';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import axios from 'axios';

const API_ENDPOINTS = {
  all: 'https://zekr.vercel.app/api',
  ayah: 'https://api.alquran.cloud/v1/ayah/', // We'll append surah:ayah
  hadith: 'https://random-hadith-api.vercel.app/',
};

const QURAN_META = {
  surahCount: 114,
  ayahCounts: [7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6],
};

const getQuoteFromApi = async (category) => {
  if (category === 'ayah') {
    // Try random endpoint first
    try {
      const res = await axios.get('https://api.alquran.cloud/v1/ayah/random');
      if (res.data && res.data.data && res.data.data.text) return res.data.data.text;
    } catch {}
    // Fallback: pick a random surah/ayah
    const surah = Math.floor(Math.random() * QURAN_META.surahCount) + 1;
    const ayah = Math.floor(Math.random() * QURAN_META.ayahCounts[surah - 1]) + 1;
    try {
      const res = await axios.get(`${API_ENDPOINTS.ayah}${surah}:${ayah}`);
      if (res.data && res.data.data && res.data.data.text) return res.data.data.text;
    } catch {}
    // Static fallback
    return 'Indeed, prayer prohibits immorality and wrongdoing. (Quran 29:45)';
  } else if (category === 'hadith') {
    try {
      const res = await axios.get(API_ENDPOINTS.hadith);
      if (res.data && res.data.data && res.data.data.hadith) return res.data.data.hadith;
    } catch {}
    return 'The key to Paradise is prayer. (Hadith)';
  } else {
    try {
      const res = await axios.get(API_ENDPOINTS.all);
      if (res.data && res.data.zekr) return res.data.zekr;
    } catch {}
    return 'Remember Allah much, that you may succeed. (Quran 62:10)';
  }
};

const getFavs = () => JSON.parse(localStorage.getItem('favQuotes') || '[]');
const saveFavs = (favs) => localStorage.setItem('favQuotes', JSON.stringify(favs));

const DailyQuote = () => {
  const [quote, setQuote] = useState('');
  const [category, setCategory] = useState('all');
  const [isFav, setIsFav] = useState(false);
  const [favs, setFavs] = useState(getFavs());

  useEffect(() => {
    getQuoteFromApi(category).then(setQuote).catch(() => setQuote('Could not fetch quote.'));
  }, [category]);

  useEffect(() => {
    setIsFav(favs.includes(quote));
  }, [quote, favs]);

  const handleShare = (platform) => {
    const text = encodeURIComponent(`"${quote}"`);
    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${text}`, '_blank');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
    }
  };

  const handleFav = () => {
    let newFavs;
    if (isFav) {
      newFavs = favs.filter(f => f !== quote);
    } else {
      newFavs = [...favs, quote];
    }
    setFavs(newFavs);
    saveFavs(newFavs);
  };

  return (
    <Paper sx={{ p: 2, mb: 2, textAlign: 'center', bgcolor: 'background.paper' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <FormControl size="small">
          <InputLabel>Category</InputLabel>
          <Select value={category} label="Category" onChange={e => setCategory(e.target.value)}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="ayah">Ayah</MenuItem>
            <MenuItem value="hadith">Hadith</MenuItem>
          </Select>
        </FormControl>
        <Tooltip title={isFav ? 'Remove from favorites' : 'Save as favorite'}>
          <IconButton onClick={handleFav} color={isFav ? 'secondary' : 'default'}>
            {isFav ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
        </Tooltip>
      </Stack>
      <Typography variant="h6" sx={{ fontStyle: 'italic', mb: 1 }}>
        "{quote}"
      </Typography>
      <Stack direction="row" spacing={1} justifyContent="center">
        <Button startIcon={<WhatsAppIcon />} onClick={() => handleShare('whatsapp')} size="small" variant="outlined">Share</Button>
        <Button startIcon={<TwitterIcon />} onClick={() => handleShare('twitter')} size="small" variant="outlined">Tweet</Button>
      </Stack>
    </Paper>
  );
};

export default DailyQuote; 