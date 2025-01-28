import { WeatherConditions } from '../WeatherConditions';
import { ShotParameters } from '../ShotParameters';
import { WeatherConditions as WeatherType, ShotParameters as ShotParamsType } from '@/types';

interface SidebarProps {
  onWeatherChange: (weather: WeatherType) => void;
  onShotCalculate: (params: ShotParamsType) => void;
}

export function Sidebar({ onWeatherChange, onShotCalculate }: SidebarProps) {
  return (
    <aside className="w-[380px] border-r bg-[#F5F5F5] p-4 flex flex-col gap-4">
      <WeatherConditions onWeatherChange={onWeatherChange} />
      <ShotParameters onCalculate={onShotCalculate} />
    </aside>
  );
}
