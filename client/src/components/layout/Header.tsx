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
    <div>
      <header className="h-[60px] bg-black flex items-center px-6 justify-center">
        <img
          src="/rapsodo-logo.png"
          alt="Rapsodo Logo"
          className="h-8 w-auto"
          data-testid="rapsodo-logo"
        />
      </header>
      <div className="h-[40px] border-b bg-white flex items-center px-6 justify-between">
        <h2 className="text-lg font-barlow font-semibold text-gray-800">
          Trajectory Simulator
        </h2>
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
      </div>
    </div>
  );
}