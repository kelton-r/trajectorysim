import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { TrajectoryPoint } from '@/types';
import { Download } from 'lucide-react';

interface TrajectoryTableProps {
  data: TrajectoryPoint[];
  onExport: () => void;
}

export function TrajectoryTable({ data, onExport }: TrajectoryTableProps) {
  const finalPoint = data.length > 0 ? data[data.length - 1] : null;

  // Unit conversion functions
  const metersToYards = (meters: number) => meters * 1.09361;
  const metersToFeet = (meters: number) => meters * 3.28084;

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-barlow font-bold">Shot Results</h2>
        <Button 
          onClick={onExport}
          className="bg-[#D92429] hover:bg-[#B91C21] text-white h-12 px-8 text-lg"
        >
          <Download className="mr-2 h-5 w-5" />
          Export to CSV
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-black transform -skew-x-12"></div>
          <div className="relative p-6 text-white">
            <div className="text-4xl font-bold">{metersToYards(finalPoint?.carry || 0).toFixed(1)}</div>
            <div className="text-lg">Carry Distance (yd)</div>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-black transform -skew-x-12"></div>
          <div className="relative p-6 text-white">
            <div className="text-4xl font-bold">{finalPoint?.ballSpeed.toFixed(1) || 0}</div>
            <div className="text-lg">Ball Speed (mph)</div>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-black transform -skew-x-12"></div>
          <div className="relative p-6 text-white">
            <div className="text-4xl font-bold">{finalPoint?.spin || 0}</div>
            <div className="text-lg">Spin Rate (rpm)</div>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-black transform -skew-x-12"></div>
          <div className="relative p-6 text-white">
            <div className="text-4xl font-bold">{metersToYards(finalPoint?.total || 0).toFixed(1)}</div>
            <div className="text-lg">Total Distance (yd)</div>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-black transform -skew-x-12"></div>
          <div className="relative p-6 text-white">
            <div className="text-4xl font-bold">{finalPoint?.launchAngle.toFixed(1) || 0}</div>
            <div className="text-lg">Launch Angle (°)</div>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-black transform -skew-x-12"></div>
          <div className="relative p-6 text-white">
            <div className="text-4xl font-bold">{metersToFeet(finalPoint?.altitude || 0).toFixed(1)}</div>
            <div className="text-lg">Apex (ft)</div>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-black transform -skew-x-12"></div>
          <div className="relative p-6 text-white">
            <div className="text-4xl font-bold">{metersToYards(finalPoint?.side || 0).toFixed(1)}</div>
            <div className="text-lg">Side Carry (yd)</div>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-black transform -skew-x-12"></div>
          <div className="relative p-6 text-white">
            <div className="text-4xl font-bold">{finalPoint?.spinAxis || 0}</div>
            <div className="text-lg">Spin Axis (°)</div>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-black transform -skew-x-12"></div>
          <div className="relative p-6 text-white">
            <div className="text-4xl font-bold">{finalPoint?.launchDirection.toFixed(1) || 0}</div>
            <div className="text-lg">Launch Direction (°)</div>
          </div>
        </div>
      </div>
    </div>
  );
}