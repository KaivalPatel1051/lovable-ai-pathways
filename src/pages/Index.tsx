import DashboardHeader from "@/components/DashboardHeader";
import Navigation from "@/components/Navigation";
import PanicButton from "@/components/PanicButton";
import MoodCheckIn from "@/components/MoodCheckIn";
import QuickStats from "@/components/QuickStats";
import MotivationalCard from "@/components/MotivationalCard";
import RecentAchievements from "@/components/RecentAchievements";
import heroImage from "@/assets/hero-healing.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-5"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      {/* Main Content */}
      <div className="relative z-10 pb-20">
        <div className="max-w-md mx-auto p-4 space-y-6">
          <DashboardHeader />
          
          {/* Quick Actions */}
          <div className="space-y-4">
            <MoodCheckIn />
            <QuickStats />
          </div>
          
          {/* Motivational Section */}
          <MotivationalCard />
          
          {/* Recent Activity */}
          <RecentAchievements />
        </div>
      </div>
      
      {/* Fixed UI Elements */}
      <Navigation />
      <PanicButton />
    </div>
  );
};

export default Index;
