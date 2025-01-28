import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { TrajectoryTable } from '@/components/TrajectoryTable';
import { WeatherConditions, ShotParameters, TrajectoryPoint } from '@/types';
import { calculateTrajectory } from '@/lib/calculations';

export function HomePage() {
  const [weather, setWeather] = useState<WeatherConditions>({
    windSpeed: 10,
    airPressure: 1013,
    humidity: 60,
    temperature: 20
  });

  const [trajectoryData, setTrajectoryData] = useState<TrajectoryPoint[]>([]);

  const handleWeatherChange = (newWeather: WeatherConditions) => {
    setWeather(newWeather);
  };

  const handleShotCalculate = (params: ShotParameters) => {
    const data = calculateTrajectory(params, weather);
    setTrajectoryData(data);
  };

  const handleExport = () => {
    const headers = ['Time', 'Distance', 'Height', 'Side', 'Velocity', 'Spin', 'Drag', 'Lift', 'Total', 'Carry'];
    const csvContent = [
      headers.join(','),
      ...trajectoryData.map(point => [
        point.time,
        point.distance,
        point.altitude,
        point.side,
        point.velocity,
        point.spin,
        point.drag,
        point.lift,
        point.total,
        point.carry
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trajectory-data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          onWeatherChange={handleWeatherChange}
          onShotCalculate={handleShotCalculate}
        />
        <main className="flex-1 p-6 bg-white overflow-auto">
          <TrajectoryTable
            data={trajectoryData}
            onExport={handleExport}
          />
        </main>
      </div>
    </div>
  );
}
