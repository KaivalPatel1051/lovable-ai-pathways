import React from 'react';
import DashboardHeader from '../components/DashboardHeader';
import MoodCheckIn from '../components/MoodCheckIn';
import MotivationalCard from '../components/MotivationalCard';
import QuickStats from '../components/QuickStats';
import RecentAchievements from '../components/RecentAchievements';
import PanicButton from '../components/PanicButton';
import Navigation from '../components/Navigation';

const DashboardPage: React.FC = () => {
  return (
    <div>
      <DashboardHeader />

      <main style={{ padding: '1rem' }}>
        <QuickStats />
        <MoodCheckIn />
        <MotivationalCard />
        <RecentAchievements />
        <PanicButton />
      </main>

      <Navigation />
    </div>
  );
};

export default DashboardPage;
