import React, { useState, useMemo, useEffect } from 'react';
import { Box, CssBaseline, Container, Slide } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Navbar from './components/Navbar';
import Today from './pages/Today';
import History from './pages/History';
import Progress from './pages/Progress';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Report from './pages/Report';
import Gamification from './pages/Gamification';
import MasjidFinder from './pages/MasjidFinder';

const NAV_SECTIONS = [
  {
    label: 'Tracker',
    items: [
      { label: 'Today' },
      { label: 'History' },
      { label: 'Progress' },
    ],
  },
  {
    label: 'Reports & Motivation',
    items: [
      { label: 'Report' },
      { label: 'Gamification' },
    ],
  },
  {
    label: 'Masjid Tools',
    items: [
      { label: 'Masjid Finder' },
    ],
  },
  {
    label: 'Settings',
    items: [
      { label: 'Settings' },
    ],
  },
];

const PAGES = [
  { component: Today },
  { component: History },
  { component: Progress },
  { component: Report },
  { component: Gamification },
  { component: MasjidFinder },
  { component: Settings },
];

function App() {
  const [tab, setTab] = useState(0);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : true;
  });
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const theme = useMemo(() => createTheme({
    palette: {
      mode: 'dark',
      primary: { main: '#166534' }, // Deep green
      secondary: { main: '#6ee7b7' }, // Light green
      background: {
        default: '#101f14',
        paper: '#1e3a24',
      },
      text: {
        primary: '#f0fdf4',
        secondary: '#a7f3d0',
      },
    },
    shape: { borderRadius: 14 },
    typography: {
      fontFamily: 'Inter, Roboto, Arial, sans-serif',
      h5: { fontWeight: 700 },
    },
    transitions: {
      duration: { enteringScreen: 400, leavingScreen: 300 },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '1rem',
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            fontSize: '1rem',
          },
        },
      },
    },
  }), [darkMode]);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
    setShowProfile(false);
  };

  const handleToggleDarkMode = () => setDarkMode((prev) => !prev);
  const handleProfileClick = () => setShowProfile(true);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
        <CssBaseline />
        <Navbar tab={tab} onTabChange={handleTabChange} onProfileClick={handleProfileClick} sections={NAV_SECTIONS} />
        <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
          <Slide direction="up" in={!showProfile} mountOnEnter unmountOnExit>
            <Box>{!showProfile && React.createElement(PAGES[tab].component, tab === PAGES.length - 1 ? { darkMode, onToggleDarkMode: handleToggleDarkMode } : {})}</Box>
          </Slide>
          <Slide direction="left" in={showProfile} mountOnEnter unmountOnExit>
            <Box>{showProfile && <Profile />}</Box>
          </Slide>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
