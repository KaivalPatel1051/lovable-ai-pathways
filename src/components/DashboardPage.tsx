import React from 'react';
import { motion } from 'framer-motion';
import DashboardHeader from '../components/DashboardHeader';
import MoodCheckIn from '../components/MoodCheckIn';
import MotivationalCard from '../components/MotivationalCard';
import QuickStats from '../components/QuickStats';
import RecentAchievements from '../components/RecentAchievements';
import PanicButton from '../components/PanicButton';

const DashboardPage: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <motion.main 
        className="container mx-auto px-6 py-8 pb-24 space-y-8 max-w-7xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Quick Stats Section */}
        <motion.div variants={itemVariants} className="cursor-target">
          <QuickStats />
        </motion.div>

        {/* Primary Actions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={itemVariants} className="cursor-target">
            <MoodCheckIn />
          </motion.div>
          
          <motion.div variants={itemVariants} className="cursor-target">
            <MotivationalCard />
          </motion.div>
        </div>

        {/* Recent Achievements */}
        <motion.div variants={itemVariants} className="cursor-target">
          <RecentAchievements />
        </motion.div>

        {/* Emergency Support - Always Visible */}
        <motion.div 
          variants={itemVariants} 
          className="sticky bottom-20 z-10 cursor-target"
        >
          <PanicButton />
        </motion.div>
      </motion.main>
    </div>
  );
};

export default DashboardPage;
