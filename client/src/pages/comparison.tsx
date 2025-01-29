import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { TrajectoryView3D } from '@/components/TrajectoryView3D';
import { TrajectoryViewBabylon } from '@/components/TrajectoryViewBabylon';
import { ShotParameters, TrajectoryPoint } from '@/types';
import { calculateTrajectory } from '@/lib/calculations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ComparisonPage() {
  const [trajectoryData, setTrajectoryData] = useState<TrajectoryPoint[]>([]);
  const [animationKey, setAnimationKey] = useState(0);

  const handleShotCalculate = (params: ShotParameters) => {
    const data = calculateTrajectory(params);
    setTrajectoryData(data);
    setAnimationKey(prev => prev + 1);
  };

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar onShotCalculate={handleShotCalculate} />
        <main className="flex-1 p-6 bg-[#F5F5F5] overflow-auto">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">Three.js Implementation</h2>
                <TrajectoryView3D 
                  data={trajectoryData} 
                  key={`three-${animationKey}`}
                  autoPlay={true}
                />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">Babylon.js Implementation</h2>
                <TrajectoryViewBabylon 
                  data={trajectoryData}
                  key={`babylon-${animationKey}`}
                  autoPlay={true}
                />
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 space-y-2">
              <h3 className="font-semibold">Key Differences:</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Babylon.js provides superior lighting and shadow effects</li>
                <li>Particle system for ball trail in Babylon.js creates a more dynamic effect</li>
                <li>Ground texturing and materials are more realistic in Babylon.js</li>
                <li>Camera controls are smoother in Babylon.js</li>
                <li>Performance metrics are shown in the bottom-right corner (Babylon.js feature)</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
