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
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Trajectory Data</h2>
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
              <TableHead>Time (s)</TableHead>
              <TableHead>Distance (m)</TableHead>
              <TableHead>Height (m)</TableHead>
              <TableHead>Side (m)</TableHead>
              <TableHead>Velocity (m/s)</TableHead>
              <TableHead>Spin (rpm)</TableHead>
              <TableHead>Drag (N)</TableHead>
              <TableHead>Lift (N)</TableHead>
              <TableHead>Total (m)</TableHead>
              <TableHead>Carry (m)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-4">
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              data.map((point, index) => (
                <TableRow key={index}>
                  <TableCell>{point.time.toFixed(2)}</TableCell>
                  <TableCell>{point.distance.toFixed(2)}</TableCell>
                  <TableCell>{point.altitude.toFixed(2)}</TableCell>
                  <TableCell>{point.side.toFixed(2)}</TableCell>
                  <TableCell>{point.velocity.toFixed(2)}</TableCell>
                  <TableCell>{point.spin}</TableCell>
                  <TableCell>{point.drag.toFixed(2)}</TableCell>
                  <TableCell>{point.lift.toFixed(2)}</TableCell>
                  <TableCell>{point.total.toFixed(2)}</TableCell>
                  <TableCell>{point.carry.toFixed(2)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
