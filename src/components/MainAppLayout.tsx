import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle, Video, BarChart3, BookOpen, Trophy, Users } from 'lucide-react';
import Dock, { DockItemData } from '@/components/Dock';
import Particles from '@/components/Particles';
import FloatingAIButton from '@/components/FloatingAIButton';

// Dock wrapper component to use navigation hooks
const DockWrapper: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const dockItems: DockItemData[] = [
    { icon: <MessageCircle />, label: "Chat", onClick: () => navigate('/chat'), className: location.pathname === '/chat' ? 'active' : '' },
    { icon: <Video />, label: "Reels", onClick: () => navigate('/reels'), className: location.pathname === '/reels' ? 'active' : '' },
    { icon: <BarChart3 />, label: "Tracker", onClick: () => navigate('/tracker'), className: location.pathname === '/tracker' ? 'active' : '' },
    { icon: <BookOpen />, label: "Guidance", onClick: () => navigate('/guidance'), className: location.pathname === '/guidance' ? 'active' : '' },
    { icon: <Trophy />, label: "Achievements", onClick: () => navigate('/achievements'), className: location.pathname === '/achievements' ? 'active' : '' },
    { icon: <Users />, label: "Community", onClick: () => navigate('/community'), className: location.pathname === '/community' ? 'active' : '' },
  ];

  return <Dock items={dockItems} />;
};

const MainAppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="App min-h-screen bg-background relative pb-24 sm:pb-0">
    <Particles
      particleColors={['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b']}
      particleCount={100}
      particleSpread={8}
      speed={0.3}
      particleBaseSize={3}
      moveParticlesOnHover={true}
      alphaParticles={true}
      disableRotation={false}
    />
    <main>{children}</main>
    <FloatingAIButton />
    <DockWrapper />
  </div>
);

export default MainAppLayout;
