import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Tabs, Tab, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, Avatar, Box, ListSubheader, Divider } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import TodayIcon from '@mui/icons-material/Today';
import HistoryIcon from '@mui/icons-material/History';
import BarChartIcon from '@mui/icons-material/BarChart';
import DescriptionIcon from '@mui/icons-material/Description';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const defaultSections = [
  {
    label: 'Tracker',
    items: [
      { label: 'Today', icon: <TodayIcon /> },
      { label: 'History', icon: <HistoryIcon /> },
      { label: 'Progress', icon: <BarChartIcon /> },
    ],
  },
  {
    label: 'Reports & Motivation',
    items: [
      { label: 'Report', icon: <DescriptionIcon /> },
      { label: 'Gamification', icon: <EmojiEventsIcon /> },
    ],
  },
  {
    label: 'Settings',
    items: [
      { label: 'Settings', icon: <SettingsIcon /> },
    ],
  },
];

const Navbar = ({ tab, onTabChange, onProfileClick, sections = defaultSections }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Flatten items for Tabs
  const flatItems = sections.flatMap(s => s.items);

  const handleDrawerToggle = () => setDrawerOpen((open) => !open);

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }} onClick={handleDrawerToggle}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Namaz Activity Tracker
          </Typography>
          <IconButton color="inherit" onClick={onProfileClick}>
            <Avatar sx={{ width: 32, height: 32 }}>
              <AccountCircleIcon />
            </Avatar>
          </IconButton>
        </Toolbar>
        <Tabs value={tab} onChange={onTabChange} centered textColor="inherit" indicatorColor="secondary" sx={{ display: { xs: 'none', md: 'flex' } }}>
          {flatItems.map((item, idx) => (
            <Tab label={item.label} key={item.label} icon={item.icon} iconPosition="start" />
          ))}
        </Tabs>
      </AppBar>
      <Drawer anchor="left" open={drawerOpen} onClose={handleDrawerToggle}>
        <Box sx={{ width: 260 }} role="presentation" onClick={handleDrawerToggle}>
          <List>
            {sections.map((section, sIdx) => (
              <React.Fragment key={section.label}>
                <ListSubheader>{section.label}</ListSubheader>
                {section.items.map((item, idx) => (
                  <ListItem button key={item.label} onClick={(e) => onTabChange(e, flatItems.findIndex(i => i.label === item.label))}>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.label} />
                  </ListItem>
                ))}
                {sIdx < sections.length - 1 && <Divider sx={{ my: 1 }} />}
              </React.Fragment>
            ))}
            <ListItem button onClick={onProfileClick}>
              <ListItemIcon><AccountCircleIcon /></ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar; 