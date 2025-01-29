
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
      <header className="h-[80px] bg-black flex items-center px-12">
        <img
          src="/rapsodo-logo.png"
          alt="Rapsodo Logo"
          className="h-12 w-auto"
          data-testid="rapsodo-logo"
        />
      </header>
      <div className="h-[60px] border-b bg-black flex items-center px-12 justify-between">
        <div className="flex-1 flex items-center gap-3">
          <h2 className="text-2xl font-condensed uppercase text-white tracking-wider">
            TRAJECTORY SIMULATOR
          </h2>
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
      </div>
    </div>
  );
}
