
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ShotParameters } from '@/types';
import { validateShotParameters } from '@/lib/calculations';
import { Gauge, RotateCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OptimizationParametersProps {
  onShotCalculate: (params: ShotParameters) => void;
}

export const OptimizationParameters = ({ onShotCalculate }: OptimizationParametersProps) => {
  const { toast } = useToast();
  const [params, setParams] = useState<Partial<ShotParameters>>({
    ballType: 'RPT Ball',
    spinDirection: 'right',
    launchDirectionSide: 'right',
  });

  const handleNumericInput = (key: keyof ShotParameters) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setParams(prev => ({ ...prev, [key]: value === '' ? undefined : Number(value) }));
  };

  const handleCalculate = () => {
    if (!validateShotParameters(params as ShotParameters)) {
      toast({
        title: "Invalid Parameters",
        description: "Please check the values are within valid ranges",
        variant: "destructive"
      });
      return;
    }

    onShotCalculate(params as ShotParameters);
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
            value={params.clubSpeed ?? ''}
            onChange={handleNumericInput('clubSpeed')}
            className="h-9"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="attackAngle">Attack Angle (°)</Label>
          <Input
            id="attackAngle"
            type="number"
            value={params.attackAngle ?? ''}
            onChange={handleNumericInput('attackAngle')}
            className="h-9"
          />
        </div>

        {/* Add other optimization-specific inputs */}
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
