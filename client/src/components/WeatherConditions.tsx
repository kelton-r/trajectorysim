import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WeatherConditions as WeatherType } from '@/types';
import { Wind, Thermometer, Droplets, Gauge } from 'lucide-react';

interface WeatherConditionsProps {
  onWeatherChange: (weather: WeatherType) => void;
}

export function WeatherConditions({ onWeatherChange }: WeatherConditionsProps) {
  const [weather, setWeather] = useState<WeatherType>({
    windSpeed: 10,
    airPressure: 1013,
    humidity: 60,
    temperature: 20
  });

  const handleChange = (key: keyof WeatherType) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    const newWeather = { ...weather, [key]: value };
    setWeather(newWeather);
    onWeatherChange(newWeather);
  };

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Weather Conditions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="windSpeed" className="flex items-center gap-2">
              <Wind className="h-4 w-4" />
              Wind Speed (m/s)
            </Label>
            <Input
              id="windSpeed"
              type="number"
              value={weather.windSpeed}
              onChange={handleChange('windSpeed')}
              min={0}
              max={50}
              step={0.1}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="airPressure" className="flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              Air Pressure (hPa)
            </Label>
            <Input
              id="airPressure"
              type="number"
              value={weather.airPressure}
              onChange={handleChange('airPressure')}
              min={900}
              max={1100}
              step={1}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="humidity" className="flex items-center gap-2">
              <Droplets className="h-4 w-4" />
              Humidity (%)
            </Label>
            <Input
              id="humidity"
              type="number"
              value={weather.humidity}
              onChange={handleChange('humidity')}
              min={0}
              max={100}
              step={1}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="temperature" className="flex items-center gap-2">
              <Thermometer className="h-4 w-4" />
              Temperature (°C)
            </Label>
            <Input
              id="temperature"
              type="number"
              value={weather.temperature}
              onChange={handleChange('temperature')}
              min={-20}
              max={50}
              step={0.1}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
