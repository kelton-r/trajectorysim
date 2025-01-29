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
  // Get only the final point of trajectory
  const finalPoint = data.length > 0 ? data[data.length - 1] : null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Shot Results</h2>
        <Button 
          onClick={onExport}
          className="bg-[#4CD964] hover:bg-[#3CB371] text-white"
        >
          <Download className="mr-2 h-4 w-4" />
          EXPORT TO CSV
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Carry (yd)</TableHead>
              <TableHead>Total Carry (yd)</TableHead>
              <TableHead>Ball Speed (mph)</TableHead>
              <TableHead>Spin Rate (rpm)</TableHead>
              <TableHead>Spin Axis (°)</TableHead>
              <TableHead>Side Carry (yd)</TableHead>
              <TableHead>Launch Angle (°)</TableHead>
              <TableHead>Launch Direction (°)</TableHead>
              <TableHead>Apex (ft)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!finalPoint ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-4">
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              <TableRow>
                <TableCell>{finalPoint.carry.toFixed(1)}</TableCell>
                <TableCell>{finalPoint.total.toFixed(1)}</TableCell>
                <TableCell>{finalPoint.velocity.toFixed(1)}</TableCell>
                <TableCell>{finalPoint.spin}</TableCell>
                <TableCell>{finalPoint.spinAxis || 'N/A'}</TableCell>
                <TableCell>{finalPoint.side.toFixed(1)}</TableCell>
                <TableCell>{finalPoint.launchAngle?.toFixed(1) || 'N/A'}</TableCell>
                <TableCell>{finalPoint.launchDirection?.toFixed(1) || 'N/A'}</TableCell>
                <TableCell>{Math.max(...data.map(p => p.altitude)).toFixed(1)}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}