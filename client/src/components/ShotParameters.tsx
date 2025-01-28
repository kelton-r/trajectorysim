import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ShotParameters as ShotParamsType } from '@/types';
import { validateShotParameters } from '@/lib/calculations';
import { Gauge, RotateCw, ArrowRight, WindIcon } from 'lucide-react';

interface ShotParametersProps {
  onCalculate: (params: ShotParamsType) => void;
}

const BALL_TYPES = ['Pro V1', 'Pro V1x', 'TP5', 'Chrome Soft'];
const WIND_DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

export function ShotParameters({ onCalculate }: ShotParametersProps) {
  const [params, setParams] = useState<ShotParamsType>({
    launchVelocity: 50,
    launchAngle: 15,
    spin: 2500,
    ballType: BALL_TYPES[0],
    windDirection: WIND_DIRECTIONS[0]
  });

  const handleChange = (key: keyof ShotParamsType) => (
    e: React.ChangeEvent<HTMLInputElement> | { value: string }
  ) => {
    const value = 'target' in e ? Number(e.target.value) : e.value;
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const handleCalculate = () => {
    if (validateShotParameters(params)) {
      onCalculate(params);
    }
  };

  return (
    <Card className="bg-white mt-4">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Shot Parameters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="launchVelocity" className="flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              Launch Velocity (m/s)
            </Label>
            <Input
              id="launchVelocity"
              type="number"
              value={params.launchVelocity}
              onChange={handleChange('launchVelocity')}
              min={0}
              max={100}
              step={0.1}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="launchAngle" className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4" />
              Launch Angle (°)
            </Label>
            <Input
              id="launchAngle"
              type="number"
              value={params.launchAngle}
              onChange={handleChange('launchAngle')}
              min={0}
              max={90}
              step={0.1}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="spin" className="flex items-center gap-2">
              <RotateCw className="h-4 w-4" />
              Spin Rate (rpm)
            </Label>
            <Input
              id="spin"
              type="number"
              value={params.spin}
              onChange={handleChange('spin')}
              min={0}
              max={10000}
              step={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="windDirection" className="flex items-center gap-2">
              <WindIcon className="h-4 w-4" />
              Wind Direction
            </Label>
            <Select
              value={params.windDirection}
              onValueChange={value => handleChange('windDirection')({ value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WIND_DIRECTIONS.map(dir => (
                  <SelectItem key={dir} value={dir}>
                    {dir}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ballType">Ball Type</Label>
            <Select
              value={params.ballType}
              onValueChange={value => handleChange('ballType')({ value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BALL_TYPES.map(type => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          className="w-full mt-6 bg-[#D92429] hover:bg-[#B91C21]"
          onClick={handleCalculate}
        >
          DISPLAY SHOT
        </Button>
      </CardContent>
    </Card>
  );
}
