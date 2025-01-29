import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ShotParameters as ShotParamsType } from '@/types';
import { validateShotParameters } from '@/lib/calculations';
import { Gauge, RotateCw, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShotParametersProps {
  onCalculate: (params: ShotParamsType) => void;
}

const BALL_TYPES = ['Pro V1', 'Pro V1x', 'TP5', 'Chrome Soft'];

export function ShotParameters({ onCalculate }: ShotParametersProps) {
  const { toast } = useToast();
  const [params, setParams] = useState<Partial<ShotParamsType>>({
    ballType: BALL_TYPES[0],
    spinDirection: 'right',
    launchDirectionSide: 'right',
  });

  const handleNumericInput = (key: keyof ShotParamsType) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    if (value === '') {
      setParams(prev => ({ ...prev, [key]: undefined }));
      return;
    }
    setParams(prev => ({ ...prev, [key]: Number(value) }));
  };

  const handleDirectionChange = (key: 'launchDirectionSide' | 'spinDirection' | 'ballType') => (
    value: string
  ) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const handleCalculate = () => {
    const requiredFields: (keyof ShotParamsType)[] = [
      'ballSpeed', 'launchAngle', 'launchDirection', 'spin', 'spinAxis'
    ];

    const missingFields = requiredFields.filter(field => params[field] === undefined);

    if (missingFields.length > 0) {
      toast({
        title: "Missing Required Fields",
        description: `Please fill in all required fields: ${missingFields.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    const fullParams = params as ShotParamsType;

    if (!validateShotParameters(fullParams)) {
      toast({
        title: "Invalid Parameters",
        description: "Please check the values are within valid ranges",
        variant: "destructive"
      });
      return;
    }

    onCalculate(fullParams);
    toast({
      title: "Calculating Trajectory",
      description: "Your shot trajectory is being calculated"
    });
  };

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Shot Parameters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="launchDirection" className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4" />
              Launch Direction (°)
            </Label>
            <div className="flex gap-2">
              <Input
                id="launchDirection"
                type="number"
                value={params.launchDirection ?? ''}
                onChange={handleNumericInput('launchDirection')}
                min={-90}
                max={90}
                step={0.1}
                className="w-[60px]"
              />
              <Select
                value={params.launchDirectionSide}
                onValueChange={handleDirectionChange('launchDirectionSide')}
              >
                <SelectTrigger className="w-[200px] text-sm px-1">
                  <SelectValue placeholder="Direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="right" className="text-sm py-1 px-1">Right (+)</SelectItem>
                  <SelectItem value="left" className="text-sm py-1 px-1">Left (-)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="launchAngle" className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 rotate-90" />
              Launch Angle (°)
            </Label>
            <Input
              id="launchAngle"
              type="number"
              value={params.launchAngle ?? ''}
              onChange={handleNumericInput('launchAngle')}
              min={0}
              max={90}
              step={0.1}
              className="w-[100px]"
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
              value={params.spin ?? ''}
              onChange={handleNumericInput('spin')}
              min={0}
              max={10000}
              step={100}
              className="w-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="spinAxis" className="flex items-center gap-2">
              <RotateCw className="h-4 w-4 rotate-90" />
              Spin Axis (°)
            </Label>
            <div className="flex gap-2">
              <Input
                id="spinAxis"
                type="number"
                value={params.spinAxis ?? ''}
                onChange={handleNumericInput('spinAxis')}
                min={-90}
                max={90}
                step={1}
                className="w-[60px]"
              />
              <Select
                value={params.spinDirection}
                onValueChange={handleDirectionChange('spinDirection')}
              >
                <SelectTrigger className="w-[200px] text-sm px-1">
                  <SelectValue placeholder="Direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="right" className="text-sm py-1 px-1">Right (+)</SelectItem>
                  <SelectItem value="left" className="text-sm py-1 px-1">Left (-)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ballType">Ball Type</Label>
            <Select
              value={params.ballType}
              onValueChange={handleDirectionChange('ballType')}
            >
              <SelectTrigger id="ballType" className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BALL_TYPES.map(type => (
                  <SelectItem key={type} value={type} className="text-sm">
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ballSpeed" className="flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              Ball Speed (mph)
            </Label>
            <Input
              id="ballSpeed"
              type="number"
              value={params.ballSpeed ?? ''}
              onChange={handleNumericInput('ballSpeed')}
              min={0}
              max={200}
              step={1}
              className="w-[100px]"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full bg-[#D92429] hover:bg-[#B91C21] text-white font-bold"
          onClick={handleCalculate}
          size="lg"
        >
          CALCULATE AND DISPLAY SHOT
        </Button>
      </CardFooter>
    </Card>
  );
}