
import { create } from 'zustand';
import { Unit } from '@/types';

interface UnitStore {
  unit: Unit;
  setUnit: (unit: Unit) => void;
}

export const useUnitStore = create<UnitStore>((set) => ({
  unit: 'imperial',
  setUnit: (unit) => set({ unit }),
}));
