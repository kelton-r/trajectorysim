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
    <Card className="bg-black h-full">
      <CardHeader className="pb-8">
        <div className="flex items-center justify-between gap-8">
          <img
            src="/mlm2pro-logo.png"
            alt="MLM2 Pro"
            className="h-18 w-auto"
          />
          <div className="h-18 w-[2px] bg-white/40"></div>
          <CardTitle className="text-4xl font-condensed font-bold text-white flex-1 text-center">ENTER METRICS</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 px-4">
        <div className="flex gap-2 justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            className="flex items-center gap-1 h-8 text-sm"
          >
            <Save className="h-4 w-4" />
            Save
          </Button>
          {Object.keys(savedParams).length > 0 && (
            <Select onValueChange={handleLoad}>
              <SelectTrigger className="w-[120px] text-sm h-8">
                <SelectValue placeholder="Load..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(savedParams).map(([timestamp, _]) => (
                  <SelectItem key={timestamp} value={timestamp} className="text-sm">
                    {new Date(timestamp).toLocaleTimeString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="space-y-3">
          <Label htmlFor="ballType" className="text-lg font-condensed uppercase text-white">BALL TYPE</Label>
          <Select
            value={params.ballType}
            onValueChange={handleDirectionChange('ballType')}
          >
            <SelectTrigger id="ballType" className="text-sm h-9">
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

        <div className="space-y-3">
          <Label htmlFor="ballSpeed" className="flex items-center gap-2 text-lg font-condensed uppercase text-white">
            <Gauge className="h-4 w-4" />
            BALL SPEED (MPH)
          </Label>
          <Input
            id="ballSpeed"
            type="number"
            value={params.ballSpeed ?? ''}
            onChange={handleNumericInput('ballSpeed')}
            min={0}
            max={200}
            step={1}
            className="text-sm h-9"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="launchAngle" className="flex items-center gap-2 text-lg font-condensed uppercase text-white">
            <ArrowRight className="h-4 w-4 rotate-90" />
            LAUNCH ANGLE (°)
          </Label>
          <Input
            id="launchAngle"
            type="number"
            value={params.launchAngle ?? ''}
            onChange={handleNumericInput('launchAngle')}
            min={0}
            max={90}
            step={0.1}
            className="text-sm h-9"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="launchDirection" className="flex items-center gap-2 text-lg font-condensed uppercase text-white">
            <ArrowRight className="h-4 w-4" />
            LAUNCH DIRECTION (°)
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
              className="flex-1 text-sm h-9"
            />
            <Select
              value={params.launchDirectionSide}
              onValueChange={handleDirectionChange('launchDirectionSide')}
            >
              <SelectTrigger className="w-[100px] text-sm h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="right" className="text-sm">Right (+)</SelectItem>
                <SelectItem value="left" className="text-sm">Left (-)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="spin" className="flex items-center gap-2 text-lg font-condensed uppercase text-white">
            <RotateCw className="h-4 w-4" />
            SPIN RATE (RPM)
          </Label>
          <Input
            id="spin"
            type="number"
            value={params.spin ?? ''}
            onChange={handleNumericInput('spin')}
            min={0}
            max={10000}
            step={100}
            className="text-sm h-9"
            disabled={isSpinDisabled}
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="spinAxis" className="flex items-center gap-2 text-lg font-condensed uppercase text-white">
            <RotateCw className="h-4 w-4 rotate-90" />
            SPIN AXIS (°)
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
              className="flex-1 text-sm h-9"
              disabled={isSpinDisabled}
            />
            <Select
              value={params.spinDirection}
              onValueChange={handleDirectionChange('spinDirection')}
              disabled={isSpinDisabled}
            >
              <SelectTrigger className="w-[100px] text-sm h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="right" className="text-sm">Right (+)</SelectItem>
                <SelectItem value="left" className="text-sm">Left (-)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-4 pb-4">
        <Button
          className="w-full bg-red-600 hover:bg-red-700 text-white font-condensed font-bold h-12 text-2xl"
          onClick={handleCalculate}
        >
          VISUALIZE
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ShotParameters;