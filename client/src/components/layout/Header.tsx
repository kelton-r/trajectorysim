
import { GiGolfFlag } from 'react-icons/gi';
import { Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="h-[60px] border-b bg-white flex items-center px-6 justify-between">
      <div className="flex items-center gap-4">
        <GiGolfFlag className="h-8 w-8 text-[#D92429]" data-testid="golf-logo" />
        <h1 className="text-xl font-semibold">Golf Shot Trajectory Optimizer</h1>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            Units: Imperial
          </DropdownMenuItem>
          <DropdownMenuItem>
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem>
            Help
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
