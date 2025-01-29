import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { TrajectoryTable } from '@/components/TrajectoryTable';
import { TrajectoryView } from '@/components/TrajectoryView';
import { ShotParameters, TrajectoryPoint } from '@/types';
import { calculateTrajectory } from '@/lib/calculations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function HomePage() {
  const [trajectoryData, setTrajectoryData] = useState<TrajectoryPoint[]>([]);
  const [animationKey, setAnimationKey] = useState(0);

  const handleShotCalculate = (params: ShotParameters) => {
    const data = calculateTrajectory(params);
    setTrajectoryData(data);
    setAnimationKey(prev => prev + 1);
  };

  const handleExport = () => {
    if (trajectoryData.length === 0) return;

    const finalPoint = trajectoryData[trajectoryData.length - 1];
    const maxHeight = Math.max(...trajectoryData.map(p => p.altitude));
    const maxDrag = Math.max(...trajectoryData.map(p => p.drag));
    const maxLift = Math.max(...trajectoryData.map(p => p.lift));

    const headers = [
      'Total Distance (m)',
      'Max Height (m)',
      'Final Side (m)',
      'Final Velocity (m/s)',
      'Spin Rate (rpm)',
      'Peak Drag (N)',
      'Peak Lift (N)',
      'Total Path (m)',
      'Carry Distance (m)'
    ];

    const values = [
      finalPoint.distance,
      maxHeight,
      finalPoint.side,
      finalPoint.velocity,
      finalPoint.spin,
      maxDrag,
      maxLift,
      finalPoint.total,
      finalPoint.carry
    ];

    const csvContent = [
      headers.join(','),
      values.map(v => typeof v === 'number' ? v.toFixed(2) : v).join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shot-results.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar onShotCalculate={handleShotCalculate} />
        <main className="flex-1 p-8 overflow-auto">
          <div className="w-full max-w-[1200px] mx-auto space-y-6">
            <Tabs defaultValue="visualization" className="space-y-6">
              <TabsList className="w-full rounded-lg border bg-card p-1">
                <TabsTrigger 
                  value="data" 
                  className="custom-tab flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold text-xl"
                >
                  Shot Data Analysis
                </TabsTrigger>
                <TabsTrigger 
                  value="visualization" 
                  className="custom-tab flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold text-xl"
                >
                  3D Trajectory Visualization
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