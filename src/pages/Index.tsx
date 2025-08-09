import DashboardHeader from "@/components/DashboardHeader";
import Navigation from "@/components/Navigation";
import PanicButton from "@/components/PanicButton";
import MoodCheckIn from "@/components/MoodCheckIn";
import QuickStats from "@/components/QuickStats";
import MotivationalCard from "@/components/MotivationalCard";
import RecentAchievements from "@/components/RecentAchievements";
import TiltedCard from "@/components/TiltedCard";
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
          
          {/* Feature Showcase with TiltedCards */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white text-center mb-4">Your Recovery Journey</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TiltedCard
                imageSrc={heroImage}
                altText="Healing and Recovery"
                captionText="Start your healing journey with personalized guidance"
                containerHeight="250px"
                containerWidth="100%"
                imageHeight="200px"
                imageWidth="100%"
                scaleOnHover={1.05}
                rotateAmplitude={8}
                showTooltip={true}
                overlayContent={
                  <div className="text-center p-4">
                    <h3 className="font-bold text-lg mb-2">Healing Path</h3>
                    <p className="text-sm">Discover your strength and build lasting recovery</p>
                  </div>
                }
                displayOverlayContent={false}
              />
              <TiltedCard
                imageSrc={heroImage}
                altText="Community Support"
                captionText="Connect with others on the same journey"
                containerHeight="250px"
                containerWidth="100%"
                imageHeight="200px"
                imageWidth="100%"
                scaleOnHover={1.05}
                rotateAmplitude={8}
                showTooltip={true}
                overlayContent={
                  <div className="text-center p-4">
                    <h3 className="font-bold text-lg mb-2">Community</h3>
                    <p className="text-sm">Find support and share your victories</p>
                  </div>
                }
                displayOverlayContent={false}
              />
            </div>
          </div>
          
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
