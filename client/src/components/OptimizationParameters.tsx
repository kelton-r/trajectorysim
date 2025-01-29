
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
    <Card className="w-[800px] bg-white h-full">
      <CardHeader className="p-8">
        <CardTitle className="text-3xl font-barlow font-bold">Shot Optimization</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8 px-8">
        <div className="space-y-4">
          <Label htmlFor="clubSpeed" className="flex items-center gap-4 text-xl">
            <Gauge className="h-6 w-6" />
            Club Speed (mph)
          </Label>
          <Input
            id="clubSpeed"
            type="number"
            value={clubSpeed ?? ''}
            onChange={(e) => setClubSpeed(Number(e.target.value))}
            className="h-14 text-xl px-4"
            min={60}
            max={130}
          />
        </div>

        {optimizedParams && (
          <div className="mt-8 space-y-4 p-8 bg-gray-50 rounded-lg">
            <p className="text-xl font-medium">Optimal Parameters:</p>
            <p className="text-xl">Launch Angle: {optimizedParams.launchAngle.toFixed(1)}°</p>
            <p className="text-xl">Ball Speed: {optimizedParams.ballSpeed.toFixed(1)} mph</p>
            <p className="text-xl">Spin Rate: {optimizedParams.spinRate.toFixed(0)} rpm</p>
            <p className="text-xl">Expected Carry: {optimizedParams.expectedCarry.toFixed(0)} yards</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="px-8 pb-8">
        <Button 
          className="w-full bg-black hover:bg-gray-800 text-white font-barlow font-bold text-xl h-14"
          onClick={handleCalculate}
        >
          OPTIMIZE
        </Button>
      </CardFooter>
    </Card>
  );
};
