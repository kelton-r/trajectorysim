// Tour Averages Component Reference Implementation
// This file serves as a documented reference for the Tour Averages UI

import { useState } from 'react';
import { Info } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Type definitions for club data structure
interface ClubData {
  clubSpeed: number;  // Club head speed in mph
  ballSpeed: number;  // Ball speed in mph
  launchAngle: number;  // Launch angle in degrees
  spinRate: number;    // Spin rate in rpm
  carry: number;       // Carry distance in yards
}

interface TourData {
  pga: ClubData;      // PGA Tour averages
  lpga: ClubData;     // LPGA Tour averages
}

// Available club types
type ClubType = 'DR' | '3W' | '5W' | '3I' | '5I' | '7I' | 'PW';

// Tour average data by club type
const CLUB_DATA: Record<ClubType, TourData> = {
  'DR': {
    pga: {
      clubSpeed: 113,
      ballSpeed: 167,
      launchAngle: 10.9,
      spinRate: 2686,
      carry: 275,
    },
    lpga: {
      clubSpeed: 94,
      ballSpeed: 138,
      launchAngle: 13.1,
      spinRate: 2850,
      carry: 218,
    }
  },
  '3W': {
    pga: {
      clubSpeed: 107,
      ballSpeed: 158,
      launchAngle: 11.5,
      spinRate: 3100,
      carry: 243,
    },
    lpga: {
      clubSpeed: 90,
      ballSpeed: 132,
      launchAngle: 13.8,
      spinRate: 3300,
      carry: 195,
    }
  },
  '5W': {
    pga: {
      clubSpeed: 104,
      ballSpeed: 152,
      launchAngle: 12.8,
      spinRate: 3400,
      carry: 230,
    },
    lpga: {
      clubSpeed: 87,
      ballSpeed: 127,
      launchAngle: 14.5,
      spinRate: 3600,
      carry: 185,
    }
  },
  '3I': {
    pga: {
      clubSpeed: 102,
      ballSpeed: 148,
      launchAngle: 13.5,
      spinRate: 3800,
      carry: 215,
    },
    lpga: {
      clubSpeed: 85,
      ballSpeed: 123,
      launchAngle: 15.2,
      spinRate: 4000,
      carry: 175,
    }
  },
  '5I': {
    pga: {
      clubSpeed: 98,
      ballSpeed: 142,
      launchAngle: 14.8,
      spinRate: 4200,
      carry: 195,
    },
    lpga: {
      clubSpeed: 82,
      ballSpeed: 118,
      launchAngle: 16.5,
      spinRate: 4400,
      carry: 160,
    }
  },
  '7I': {
    pga: {
      clubSpeed: 94,
      ballSpeed: 135,
      launchAngle: 16.5,
      spinRate: 5000,
      carry: 175,
    },
    lpga: {
      clubSpeed: 78,
      ballSpeed: 112,
      launchAngle: 18.2,
      spinRate: 5200,
      carry: 145,
    }
  },
  'PW': {
    pga: {
      clubSpeed: 88,
      ballSpeed: 125,
      launchAngle: 24.0,
      spinRate: 7500,
      carry: 140,
    },
    lpga: {
      clubSpeed: 73,
      ballSpeed: 103,
      launchAngle: 26.0,
      spinRate: 7700,
      carry: 115,
    }
  }
};

interface TourAveragesProps {
  isExpanded?: boolean;  // Controls initial expand/collapse state
}

export function TourAverages({ isExpanded = false }: TourAveragesProps) {
  const [expanded, setExpanded] = useState(isExpanded);
  const [selectedClub, setSelectedClub] = useState<ClubType | null>(null);

  const clubs: ClubType[] = ['DR', '3W', '5W', '3I', '5I', '7I', 'PW'];

  return (
    <div className="mt-8 bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Expandable header section */}
      <Button
        variant="ghost"
        className="w-full flex items-center justify-between p-6 hover:bg-gray-50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          <span className="text-xl font-condensed font-bold">TOUR AVERAGES</span>
        </div>
      </Button>

      {expanded && (
        <div className="p-6 pt-0 space-y-6">
          {/* Club selection circles */}
          <div className="flex justify-center gap-4">
            {clubs.map((club) => (
              <Button
                key={club}
                variant="outline"
                className={cn(
                  "w-12 h-12 rounded-full p-0 font-bold",
                  selectedClub === club && "bg-black text-white hover:bg-black/90"
                )}
                onClick={() => setSelectedClub(club)}
              >
                {club}
              </Button>
            ))}
          </div>

          {/* Data table showing PGA and LPGA averages */}
          {selectedClub && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-300">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">Tour</TableHead>
                    <TableHead>Club Speed (mph)</TableHead>
                    <TableHead>Ball Speed (mph)</TableHead>
                    <TableHead>Launch Angle (°)</TableHead>
                    <TableHead>Spin Rate (rpm)</TableHead>
                    <TableHead>Carry (yards)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* PGA Tour data row */}
                  <TableRow>
                    <TableCell className="font-semibold">PGA TOUR</TableCell>
                    <TableCell>{CLUB_DATA[selectedClub].pga.clubSpeed}</TableCell>
                    <TableCell>{CLUB_DATA[selectedClub].pga.ballSpeed}</TableCell>
                    <TableCell>{CLUB_DATA[selectedClub].pga.launchAngle}</TableCell>
                    <TableCell>{CLUB_DATA[selectedClub].pga.spinRate}</TableCell>
                    <TableCell>{CLUB_DATA[selectedClub].pga.carry}</TableCell>
                  </TableRow>
                  {/* LPGA Tour data row */}
                  <TableRow>
                    <TableCell className="font-semibold">LPGA TOUR</TableCell>
                    <TableCell>{CLUB_DATA[selectedClub].lpga.clubSpeed}</TableCell>
                    <TableCell>{CLUB_DATA[selectedClub].lpga.ballSpeed}</TableCell>
                    <TableCell>{CLUB_DATA[selectedClub].lpga.launchAngle}</TableCell>
                    <TableCell>{CLUB_DATA[selectedClub].lpga.spinRate}</TableCell>
                    <TableCell>{CLUB_DATA[selectedClub].lpga.carry}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}