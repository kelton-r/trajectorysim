import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ShotParameters as ShotParamsType } from '@/types';
import { validateShotParameters } from '@/lib/calculations';
import { Gauge, RotateCw, ArrowRight, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShotParametersProps {
  onCalculate: (params: ShotParamsType) => void;
}

const BALL_TYPES = ['RPT Ball', 'Range Ball', 'Premium Ball'];
const STORAGE_KEY = 'saved_shot_params';

const ShotParameters = ({ onCalculate }: ShotParametersProps) => {
  const { toast } = useToast();
  const [params, setParams] = useState<Partial<ShotParamsType>>({
    ballType: BALL_TYPES[0],
    spinDirection: 'right',
    launchDirectionSide: 'right',
  });
  const [savedParams, setSavedParams] = useState<Record<string, ShotParamsType>>({});

  // Load saved parameters on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setSavedParams(JSON.parse(saved));
    }
  }, []);

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
    setParams(prev => {
      if (key === 'ballType' && prev.ballType === 'RPT Ball' && value !== 'RPT Ball') {
        return {
          ...prev,
          [key]: value,
          spin: undefined,
          spinAxis: undefined,
          spinDirection: 'right'
        };
      }
      return { ...prev, [key]: value };
    });
  };

  const handleCalculate = () => {
    const requiredFields: (keyof ShotParamsType)[] = [
      'ballSpeed', 'launchAngle', 'launchDirection'
    ];

    if (params.ballType === 'RPT Ball') {
      requiredFields.push('spin', 'spinAxis');
    }

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

  const handleSave = () => {
    const requiredFields: (keyof ShotParamsType)[] = [
      'ballSpeed', 'launchAngle', 'launchDirection'
    ];

    if (params.ballType === 'RPT Ball') {
      requiredFields.push('spin', 'spinAxis');
    }

    const missingFields = requiredFields.filter(field => params[field] === undefined);

    if (missingFields.length > 0) {
      toast({
        title: "Missing Required Fields",
        description: `Please fill in all required fields: ${missingFields.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    const timestamp = new Date().toISOString();
    const newSavedParams = {
      ...savedParams,
      [timestamp]: params as ShotParamsType
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSavedParams));
    setSavedParams(newSavedParams);

    toast({
      title: "Parameters Saved",
      description: "Shot parameters have been saved for later use"
    });
  };

  const handleLoad = (timestamp: string) => {
    const loadedParams = savedParams[timestamp];
    if (loadedParams) {
      setParams(loadedParams);
      toast({
        title: "Parameters Loaded",
        description: "Shot parameters have been loaded successfully"
      });
    }
  };

  const isSpinDisabled = params.ballType !== 'RPT Ball';

  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <CardTitle className="text-2xl font-barlow font-bold">Shot Parameters</CardTitle>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            className="flex items-center gap-1 text-base h-10"
          >
            <Save className="h-5 w-5" />
            Save
          </Button>
          {Object.keys(savedParams).length > 0 && (
            <Select onValueChange={handleLoad}>
              <SelectTrigger className="w-[140px] text-base h-10">
                <SelectValue placeholder="Load..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(savedParams).map(([timestamp, _]) => (
                  <SelectItem key={timestamp} value={timestamp} className="text-base">
                    {new Date(timestamp).toLocaleTimeString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-x-5 gap-y-6">
          <div className="space-y-3">
            <Label htmlFor="ballType" className="text-lg font-barlow font-medium">Ball Type</Label>
            <Select
              value={params.ballType}
              onValueChange={handleDirectionChange('ballType')}
            >
              <SelectTrigger id="ballType" className="text-base h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BALL_TYPES.map(type => (
                  <SelectItem key={type} value={type} className="text-base">
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="ballSpeed" className="flex items-center gap-2 text-lg font-barlow font-medium">
              <Gauge className="h-5 w-5" />
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
              className="w-[120px] text-lg font-barlow font-bold h-12"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="launchAngle" className="flex items-center gap-2 text-lg font-barlow font-medium">
              <ArrowRight className="h-5 w-5 rotate-90" />
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
              className="w-[120px] text-lg font-barlow font-bold h-12"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="launchDirection" className="flex items-center gap-2 text-lg font-barlow font-medium">
              <ArrowRight className="h-5 w-5" />
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
                className="w-[100px] text-lg font-barlow font-bold h-12"
              />
              <Select
                value={params.launchDirectionSide}
                onValueChange={handleDirectionChange('launchDirectionSide')}
              >
                <SelectTrigger className="w-[120px] text-base h-12">
                  <SelectValue placeholder="Direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="right" className="text-base">Right (+)</SelectItem>
                  <SelectItem value="left" className="text-base">Left (-)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="spin" className="flex items-center gap-2 text-lg font-barlow font-medium">
              <RotateCw className="h-5 w-5" />
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
              className="w-[120px] text-lg font-barlow font-bold h-12"
              disabled={isSpinDisabled}
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="spinAxis" className="flex items-center gap-2 text-lg font-barlow font-medium">
              <RotateCw className="h-5 w-5 rotate-90" />
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
                className="w-[100px] text-lg font-barlow font-bold h-12"
                disabled={isSpinDisabled}
              />
              <Select
                value={params.spinDirection}
                onValueChange={handleDirectionChange('spinDirection')}
                disabled={isSpinDisabled}
              >
                <SelectTrigger className="w-[120px] text-base h-12">
                  <SelectValue placeholder="Direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="right" className="text-base">Right (+)</SelectItem>
                  <SelectItem value="left" className="text-base">Left (-)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-6">
        <Button
          className="w-full bg-black hover:bg-gray-800 text-white font-barlow font-bold text-lg h-14"
          onClick={handleCalculate}
          size="lg"
        >
          CALCULATE AND DISPLAY SHOT
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ShotParameters;