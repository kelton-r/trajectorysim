
import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { TrajectoryView } from '@/components/TrajectoryView';
import { TrajectoryTable } from '@/components/TrajectoryTable';
import { ShotParameters, TrajectoryPoint } from '@/types';
import { calculateTrajectory } from '@/lib/calculations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OptimizationParameters } from '@/components/OptimizationParameters';

export function OptimizationPage() {
  const [trajectoryData, setTrajectoryData] = useState<TrajectoryPoint[]>([]);
  const [animationKey, setAnimationKey] = useState(0);

  const handleShotCalculate = (params: ShotParameters) => {
    const data = calculateTrajectory(params);
    setTrajectoryData(data);
    setAnimationKey(prev => prev + 1);
  };

  const handleExport = () => {
    if (trajectoryData.length === 0) return;
    // Export implementation
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <OptimizationParameters onShotCalculate={handleShotCalculate} />
        <main className="flex-1 p-8 overflow-auto">
          <div className="w-full max-w-[1200px] mx-auto space-y-6">
            <Tabs defaultValue="visualization" className="space-y-6">
              <TabsList className="w-full rounded-lg border bg-card p-1">
                <TabsTrigger value="data" className="custom-tab flex-1">
                  Shot Optimization Analysis
                </TabsTrigger>
                <TabsTrigger value="visualization" className="custom-tab flex-1">
                  3D Visualization
                </TabsTrigger>
              </TabsList>

              <TabsContent value="data" className="space-y-6">
                <div className="content-card">
                  <TrajectoryTable
                    data={trajectoryData}
                    onExport={handleExport}
                  />
                </div>
              </TabsContent>

              <TabsContent value="visualization" className="space-y-6">
                <div className="content-card">
                  <TrajectoryView
                    data={trajectoryData}
                    key={animationKey}
                    autoPlay={true}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
