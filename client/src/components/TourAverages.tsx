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

interface ClubData {
  clubSpeed: number;
  ballSpeed: number;
  launchAngle: number;
  spinRate: number;
  carry: number;
}

interface TourData {
  pga: ClubData;
  lpga: ClubData;
}

type ClubType = 'DR' | '3W' | '5W' | '3H' | '3I' | '4I' | '5I' | '6I' | '7I' | '8I' | '9I' | 'PW';

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
  '3H': {
    pga: {
      clubSpeed: 103,
      ballSpeed: 149,
      launchAngle: 13.2,
      spinRate: 3600,
      carry: 220,
    },
    lpga: {
      clubSpeed: 86,
      ballSpeed: 124,
      launchAngle: 15.0,
      spinRate: 3800,
      carry: 180,
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
  '4I': {
    pga: {
      clubSpeed: 100,
      ballSpeed: 145,
      launchAngle: 14.2,
      spinRate: 4000,
      carry: 205,
    },
    lpga: {
      clubSpeed: 83,
      ballSpeed: 120,
      launchAngle: 15.8,
      spinRate: 4200,
      carry: 167,
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
  '6I': {
    pga: {
      clubSpeed: 96,
      ballSpeed: 138,
      launchAngle: 15.5,
      spinRate: 4600,
      carry: 185,
    },
    lpga: {
      clubSpeed: 80,
      ballSpeed: 115,
      launchAngle: 17.2,
      spinRate: 4800,
      carry: 152,
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
  '8I': {
    pga: {
      clubSpeed: 92,
      ballSpeed: 131,
      launchAngle: 18.5,
      spinRate: 5800,
      carry: 165,
    },
    lpga: {
      clubSpeed: 76,
      ballSpeed: 108,
      launchAngle: 20.2,
      spinRate: 6000,
      carry: 135,
    }
  },
  '9I': {
    pga: {
      clubSpeed: 90,
      ballSpeed: 128,
      launchAngle: 21.0,
      spinRate: 6500,
      carry: 155,
    },
    lpga: {
      clubSpeed: 74,
      ballSpeed: 105,
      launchAngle: 23.0,
      spinRate: 6800,
      carry: 125,
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
  isExpanded?: boolean;
}

export function TourAverages({ isExpanded = false }: TourAveragesProps) {
  const [expanded, setExpanded] = useState(isExpanded);
  const [selectedClub, setSelectedClub] = useState<ClubType | null>(null);

  const clubs: ClubType[] = ['DR', '3W', '5W', '3H', '3I', '4I', '5I', '6I', '7I', '8I', '9I', 'PW'];

  return (
    <div className="mt-8 bg-black rounded-lg shadow-lg overflow-hidden">
      <Button
        variant="ghost"
        className="w-full flex items-center justify-between p-6 hover:bg-red-600/90 text-white hover:text-white"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          <span className="text-xl font-condensed font-bold">TOUR AVERAGES</span>
        </div>
      </Button>

      <div className={cn(
        "transition-all duration-300 ease-in-out",
        expanded ? "h-auto opacity-100" : "h-0 opacity-0 overflow-hidden"
      )}>
        <div className="p-6 pt-0 space-y-6">
          <div className="flex justify-center gap-3 flex-wrap">
            {clubs.map((club) => (
              <Button
                key={club}
                variant="outline"
                className={cn(
                  "w-14 h-14 rounded-full p-0 font-bold transition-all duration-200",
                  "border-2 hover:scale-105",
                  selectedClub === club
                    ? "bg-red-600 text-white border-red-600 hover:bg-red-700 hover:border-red-700"
                    : "bg-white text-black border-gray-300 hover:border-red-600"
                )}
                onClick={() => setSelectedClub(club)}
              >
                {club}
              </Button>
            ))}
          </div>

          {selectedClub && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-300">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[140px] text-white">Tour</TableHead>
                    <TableHead className="text-white">Club Speed</TableHead>
                    <TableHead className="text-white">Ball Speed</TableHead>
                    <TableHead className="text-white">Launch Angle</TableHead>
                    <TableHead className="text-white">Spin Rate</TableHead>
                    <TableHead className="text-white">Carry</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="hover:bg-black/60">
                    <TableCell className="font-semibold text-white">PGA TOUR</TableCell>
                    <TableCell className="text-white">{CLUB_DATA[selectedClub].pga.clubSpeed} mph</TableCell>
                    <TableCell className="text-white">{CLUB_DATA[selectedClub].pga.ballSpeed} mph</TableCell>
                    <TableCell className="text-white">{CLUB_DATA[selectedClub].pga.launchAngle}°</TableCell>
                    <TableCell className="text-white">{CLUB_DATA[selectedClub].pga.spinRate}</TableCell>
                    <TableCell className="text-white">{CLUB_DATA[selectedClub].pga.carry} yds</TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-black/60">
                    <TableCell className="font-semibold text-white">LPGA TOUR</TableCell>
                    <TableCell className="text-white">{CLUB_DATA[selectedClub].lpga.clubSpeed} mph</TableCell>
                    <TableCell className="text-white">{CLUB_DATA[selectedClub].lpga.ballSpeed} mph</TableCell>
                    <TableCell className="text-white">{CLUB_DATA[selectedClub].lpga.launchAngle}°</TableCell>
                    <TableCell className="text-white">{CLUB_DATA[selectedClub].lpga.spinRate}</TableCell>
                    <TableCell className="text-white">{CLUB_DATA[selectedClub].lpga.carry} yds</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}