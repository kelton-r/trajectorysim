import ShotParameters from '../ShotParameters';
import { ShotParameters as ShotParamsType } from '@/types';

interface SidebarProps {
  onShotCalculate: (params: ShotParamsType) => void;
}

export function Sidebar({ onShotCalculate }: SidebarProps) {
  return (
    <aside className="w-[440px] border-r bg-[#F5F5F5] h-full overflow-y-auto">
      <div className="p-6">
        <ShotParameters onCalculate={onShotCalculate} />
      </div>
    </aside>
  );
}