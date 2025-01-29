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
              <TableHead>Total Distance (m)</TableHead>
              <TableHead>Max Height (m)</TableHead>
              <TableHead>Final Side (m)</TableHead>
              <TableHead>Final Velocity (m/s)</TableHead>
              <TableHead>Spin Rate (rpm)</TableHead>
              <TableHead>Peak Drag (N)</TableHead>
              <TableHead>Peak Lift (N)</TableHead>
              <TableHead>Total Path (m)</TableHead>
              <TableHead>Carry Distance (m)</TableHead>
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
                <TableCell>{finalPoint.distance.toFixed(2)}</TableCell>
                <TableCell>{Math.max(...data.map(p => p.altitude)).toFixed(2)}</TableCell>
                <TableCell>{finalPoint.side.toFixed(2)}</TableCell>
                <TableCell>{finalPoint.velocity.toFixed(2)}</TableCell>
                <TableCell>{finalPoint.spin}</TableCell>
                <TableCell>{Math.max(...data.map(p => p.drag)).toFixed(2)}</TableCell>
                <TableCell>{Math.max(...data.map(p => p.lift)).toFixed(2)}</TableCell>
                <TableCell>{finalPoint.total.toFixed(2)}</TableCell>
                <TableCell>{finalPoint.carry.toFixed(2)}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}