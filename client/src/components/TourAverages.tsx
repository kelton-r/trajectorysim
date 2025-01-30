import { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface TourAverageData {
  clubSpeed: number;
  ballSpeed: number;
  launchAngle: number;
  spinRate: number;
  carry: number;
}

interface TourAveragesProps {
  isExpanded?: boolean;
}

const TOUR_DATA: Record<string, TourAverageData[]> = {
  "PGA Tour": [
    {
      clubSpeed: 113,
      ballSpeed: 167,
      launchAngle: 10.9,
      spinRate: 2686,
      carry: 275,
    },
    {
      clubSpeed: 108,
      ballSpeed: 160,
      launchAngle: 11.2,
      spinRate: 2789,
      carry: 260,
    }
  ],
  "LPGA Tour": [
    {
      clubSpeed: 94,
      ballSpeed: 138,
      launchAngle: 13.1,
      spinRate: 2850,
      carry: 218,
    },
    {
      clubSpeed: 90,
      ballSpeed: 132,
      launchAngle: 13.4,
      spinRate: 2900,
      carry: 210,
    }
  ]
};

export function TourAverages({ isExpanded = false }: TourAveragesProps) {
  const [expanded, setExpanded] = useState(isExpanded);

  return (
    <div className="mt-8 bg-white rounded-lg shadow-sm">
      <Button
        variant="ghost"
        className="w-full flex items-center justify-between p-6 hover:bg-gray-50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          <span className="text-xl font-condensed font-bold">TOUR AVERAGES</span>
        </div>
        {expanded ? (
          <ChevronUp className="h-5 w-5" />
        ) : (
          <ChevronDown className="h-5 w-5" />
        )}
      </Button>

      {expanded && (
        <div className="p-6 pt-0">
          <Accordion type="single" collapsible className="space-y-4">
            {Object.entries(TOUR_DATA).map(([tour, data]) => (
              <AccordionItem key={tour} value={tour} className="border rounded-lg">
                <AccordionTrigger className="px-4 hover:bg-gray-50 rounded-t-lg">
                  <span className="text-lg font-condensed">{tour}</span>
                </AccordionTrigger>
                <AccordionContent className="px-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Club Speed (mph)</TableHead>
                        <TableHead>Ball Speed (mph)</TableHead>
                        <TableHead>Launch Angle (°)</TableHead>
                        <TableHead>Spin Rate (rpm)</TableHead>
                        <TableHead>Carry (yards)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>{row.clubSpeed}</TableCell>
                          <TableCell>{row.ballSpeed}</TableCell>
                          <TableCell>{row.launchAngle}</TableCell>
                          <TableCell>{row.spinRate}</TableCell>
                          <TableCell>{row.carry}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}
    </div>
  );
}
