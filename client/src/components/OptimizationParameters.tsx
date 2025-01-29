
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ShotParameters } from '@/types';
import { Gauge } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getOptimalParameters } from '@/lib/optimizationData';

interface OptimizationParametersProps {
  onShotCalculate: (params: ShotParameters) => void;
}

export const OptimizationParameters = ({ onShotCalculate }: OptimizationParametersProps) => {
  const { toast } = useToast();
  const [clubSpeed, setClubSpeed] = useState<number>();
  const [optimizedParams, setOptimizedParams] = useState<any>(null);

  const handleCalculate = () => {
    if (!clubSpeed || clubSpeed < 60 || clubSpeed > 130) {
      toast({
        title: "Invalid Club Speed",
        description: "Please enter a club speed between 60 and 130 mph",
        variant: "destructive"
      });
      return;
    }

    const optimal = getOptimalParameters(clubSpeed);
    setOptimizedParams(optimal);

    const params: ShotParameters = {
      ballSpeed: optimal.ballSpeed,
      launchAngle: optimal.launchAngle,
      launchDirection: 0,
      launchDirectionSide: 'right',
      spin: optimal.spinRate,
      spinAxis: 0,
      spinDirection: 'right',
      ballType: 'RPT Ball'
    };

    onShotCalculate(params);
  };

  return (
    <Card className="w-96 bg-white h-full">
      <CardHeader>
        <CardTitle className="text-xl font-barlow font-bold">Shot Optimization</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Label htmlFor="clubSpeed" className="flex items-center gap-2">
            <Gauge className="h-4 w-4" />
            Club Speed (mph)
          </Label>
          <Input
            id="clubSpeed"
            type="number"
            value={clubSpeed ?? ''}
            onChange={(e) => setClubSpeed(Number(e.target.value))}
            className="h-9"
            min={60}
            max={130}
          />
        </div>

        {optimizedParams && (
          <div className="mt-4 space-y-2 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium">Optimal Parameters:</p>
            <p className="text-sm">Launch Angle: {optimizedParams.launchAngle.toFixed(1)}°</p>
            <p className="text-sm">Ball Speed: {optimizedParams.ballSpeed.toFixed(1)} mph</p>
            <p className="text-sm">Spin Rate: {optimizedParams.spinRate.toFixed(0)} rpm</p>
            <p className="text-sm">Expected Carry: {optimizedParams.expectedCarry.toFixed(0)} yards</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full bg-black hover:bg-gray-800 text-white font-barlow font-bold"
          onClick={handleCalculate}
        >
          OPTIMIZE
        </Button>
      </CardFooter>
    </Card>
  );
};
