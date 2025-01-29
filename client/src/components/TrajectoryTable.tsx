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
    <div className="space-y-4 w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-barlow font-bold">Shot Results</h2>
        <Button 
          onClick={onExport}
          className="bg-[#D92429] hover:bg-[#B91C21] text-white h-10 px-6"
        >
          <Download className="mr-2 h-4 w-4" />
          Export to CSV
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="py-4 text-xs font-semibold text-gray-600 whitespace-nowrap">Carry (yd)</TableHead>
              <TableHead className="py-4 text-xs font-semibold text-gray-600 whitespace-nowrap">Total Carry (yd)</TableHead>
              <TableHead className="py-4 text-xs font-semibold text-gray-600 whitespace-nowrap">Ball Speed (mph)</TableHead>
              <TableHead className="py-4 text-xs font-semibold text-gray-600 whitespace-nowrap">Spin Rate (rpm)</TableHead>
              <TableHead className="py-4 text-xs font-semibold text-gray-600 whitespace-nowrap">Spin Axis (°)</TableHead>
              <TableHead className="py-4 text-xs font-semibold text-gray-600 whitespace-nowrap">Side Carry (yd)</TableHead>
              <TableHead className="py-4 text-xs font-semibold text-gray-600 whitespace-nowrap">Launch Angle (°)</TableHead>
              <TableHead className="py-4 text-xs font-semibold text-gray-600 whitespace-nowrap">Launch Direction (°)</TableHead>
              <TableHead className="py-4 text-xs font-semibold text-gray-600 whitespace-nowrap">Apex (ft)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!finalPoint ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              <TableRow className="hover:bg-gray-50">
                <TableCell className="py-4 text-sm font-barlow font-semibold whitespace-nowrap">{metersToYards(finalPoint.carry).toFixed(1)}</TableCell>
                <TableCell className="py-4 text-sm font-barlow font-semibold whitespace-nowrap">{metersToYards(finalPoint.total).toFixed(1)}</TableCell>
                <TableCell className="py-4 text-sm font-barlow font-semibold whitespace-nowrap">{finalPoint.ballSpeed.toFixed(1)}</TableCell>
                <TableCell className="py-4 text-sm font-barlow font-semibold whitespace-nowrap">{finalPoint.spin}</TableCell>
                <TableCell className="py-4 text-sm font-barlow font-semibold whitespace-nowrap">{finalPoint.spinAxis}</TableCell>
                <TableCell className="py-4 text-sm font-barlow font-semibold whitespace-nowrap">{metersToYards(finalPoint.side).toFixed(1)}</TableCell>
                <TableCell className="py-4 text-sm font-barlow font-semibold whitespace-nowrap">{finalPoint.launchAngle.toFixed(1)}</TableCell>
                <TableCell className="py-4 text-sm font-barlow font-semibold whitespace-nowrap">{finalPoint.launchDirection.toFixed(1)}</TableCell>
                <TableCell className="py-4 text-sm font-barlow font-semibold whitespace-nowrap">{metersToFeet(finalPoint.altitude).toFixed(1)}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}