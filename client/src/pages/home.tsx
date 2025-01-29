import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { TrajectoryTable } from '@/components/TrajectoryTable';
import { TrajectoryView3D } from '@/components/TrajectoryView3D';
import { ShotParameters, TrajectoryPoint } from '@/types';
import { calculateTrajectory } from '@/lib/calculations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function HomePage() {
  const [trajectoryData, setTrajectoryData] = useState<TrajectoryPoint[]>([]);

  const handleShotCalculate = (params: ShotParameters) => {
    const data = calculateTrajectory(params);
    setTrajectoryData(data);
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
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar onShotCalculate={handleShotCalculate} />
        <main className="flex-1 p-6 bg-[#F5F5F5] overflow-auto">
          <Tabs defaultValue="data" className="space-y-6">
            <TabsList className="bg-white border-b w-full rounded-none p-0 h-12">
              <TabsTrigger 
                value="data" 
                className="flex-1 h-12 rounded-none data-[state=active]:bg-black data-[state=active]:text-white"
              >
                Data
              </TabsTrigger>
              <TabsTrigger 
                value="visualization" 
                className="flex-1 h-12 rounded-none data-[state=active]:bg-black data-[state=active]:text-white"
              >
                Shot Trajectory Visualization
              </TabsTrigger>
            </TabsList>

            <TabsContent value="data" className="mt-6 bg-white rounded-lg p-6">
              <TrajectoryTable
                data={trajectoryData}
                onExport={handleExport}
              />
            </TabsContent>

            <TabsContent value="visualization" className="mt-6">
              <TrajectoryView3D data={trajectoryData} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}