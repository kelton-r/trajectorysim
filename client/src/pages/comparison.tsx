import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { TrajectoryView3D } from '@/components/TrajectoryView3D';
import { TrajectoryViewBabylon } from '@/components/TrajectoryViewBabylon';
import { ShotParameters, TrajectoryPoint } from '@/types';
import { calculateTrajectory } from '@/lib/calculations';

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
                <h2 className="text-lg font-semibold">Three.js View</h2>
                <TrajectoryView3D 
                  data={trajectoryData} 
                  key={`three-${animationKey}`}
                  autoPlay={true}
                />
              </div>

              <div className="space-y-2">
                <h2 className="text-lg font-semibold">Babylon.js View</h2>
                <TrajectoryViewBabylon 
                  data={trajectoryData}
                  key={`babylon-${animationKey}`}
                  autoPlay={true}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}