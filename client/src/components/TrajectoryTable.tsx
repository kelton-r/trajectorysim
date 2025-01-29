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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-barlow font-bold">Shot Results</h2>
        <Button 
          onClick={onExport}
          className="bg-[#D92429] hover:bg-[#B91C21] text-white text-base h-12"
        >
          <Download className="mr-2 h-5 w-5" />
          EXPORT TO CSV
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-base font-medium">Carry (yd)</TableHead>
              <TableHead className="text-base font-medium">Total Carry (yd)</TableHead>
              <TableHead className="text-base font-medium">Ball Speed (mph)</TableHead>
              <TableHead className="text-base font-medium">Spin Rate (rpm)</TableHead>
              <TableHead className="text-base font-medium">Spin Axis (°)</TableHead>
              <TableHead className="text-base font-medium">Side Carry (yd)</TableHead>
              <TableHead className="text-base font-medium">Launch Angle (°)</TableHead>
              <TableHead className="text-base font-medium">Launch Direction (°)</TableHead>
              <TableHead className="text-base font-medium">Apex (ft)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!finalPoint ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-6 text-base">
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              <TableRow>
                <TableCell className="text-lg font-barlow font-bold">{metersToYards(finalPoint.carry).toFixed(1)}</TableCell>
                <TableCell className="text-lg font-barlow font-bold">{metersToYards(finalPoint.total).toFixed(1)}</TableCell>
                <TableCell className="text-lg font-barlow font-bold">{finalPoint.ballSpeed.toFixed(1)}</TableCell>
                <TableCell className="text-lg font-barlow font-bold">{finalPoint.spin}</TableCell>
                <TableCell className="text-lg font-barlow font-bold">{finalPoint.spinAxis}</TableCell>
                <TableCell className="text-lg font-barlow font-bold">{metersToYards(finalPoint.side).toFixed(1)}</TableCell>
                <TableCell className="text-lg font-barlow font-bold">{finalPoint.launchAngle.toFixed(1)}</TableCell>
                <TableCell className="text-lg font-barlow font-bold">{finalPoint.launchDirection.toFixed(1)}</TableCell>
                <TableCell className="text-lg font-barlow font-bold">{metersToFeet(finalPoint.altitude).toFixed(1)}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}