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

      <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-black hover:bg-black">
              <TableHead className="py-8 text-lg font-bold text-white">Carry (yd)</TableHead>
              <TableHead className="py-8 text-lg font-bold text-white">Total Carry (yd)</TableHead>
              <TableHead className="py-8 text-lg font-bold text-white">Ball Speed (mph)</TableHead>
              <TableHead className="py-8 text-lg font-bold text-white">Spin Rate (rpm)</TableHead>
              <TableHead className="py-8 text-lg font-bold text-white">Spin Axis (°)</TableHead>
              <TableHead className="py-8 text-lg font-bold text-white">Side Carry (yd)</TableHead>
              <TableHead className="py-8 text-lg font-bold text-white">Launch Angle (°)</TableHead>
              <TableHead className="py-8 text-lg font-bold text-white">Launch Direction (°)</TableHead>
              <TableHead className="py-8 text-lg font-bold text-white">Apex (ft)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!finalPoint ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-14 text-gray-500 text-xl">
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              <TableRow className="hover:bg-gray-50">
                <TableCell className="py-8 text-xl font-barlow font-semibold">{metersToYards(finalPoint.carry).toFixed(1)}</TableCell>
                <TableCell className="py-8 text-xl font-barlow font-semibold">{metersToYards(finalPoint.total).toFixed(1)}</TableCell>
                <TableCell className="py-8 text-xl font-barlow font-semibold">{finalPoint.ballSpeed.toFixed(1)}</TableCell>
                <TableCell className="py-8 text-xl font-barlow font-semibold">{finalPoint.spin}</TableCell>
                <TableCell className="py-8 text-xl font-barlow font-semibold">{finalPoint.spinAxis}</TableCell>
                <TableCell className="py-8 text-xl font-barlow font-semibold">{metersToYards(finalPoint.side).toFixed(1)}</TableCell>
                <TableCell className="py-8 text-xl font-barlow font-semibold">{finalPoint.launchAngle.toFixed(1)}</TableCell>
                <TableCell className="py-8 text-xl font-barlow font-semibold">{finalPoint.launchDirection.toFixed(1)}</TableCell>
                <TableCell className="py-8 text-xl font-barlow font-semibold">{metersToFeet(finalPoint.altitude).toFixed(1)}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}