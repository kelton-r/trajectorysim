import { FC, useEffect, useRef, useState } from 'react';
import { Engine, Scene } from 'react-babylonjs';
import { Vector3, Color3, LinesMesh } from '@babylonjs/core';
import { TrajectoryPoint } from '@/types';
import { Button } from '@/components/ui/button';
import { Eye, Loader2 } from 'lucide-react';

interface TrajectoryViewBabylonProps {
  data: TrajectoryPoint[];
  autoPlay?: boolean;
}

const GolfGround: FC<{ size: number }> = ({ size }) => {
  return (
    <ground
      name="ground"
      width={size * 2}
      height={size * 2}
      subdivisions={1}
    >
      <standardMaterial
        name="groundMaterial"
        diffuseColor={new Color3(0.23, 0.37, 0.04)}
      />
    </ground>
  );
};

const TrajectoryPath: FC<{ points: Vector3[] }> = ({ points }) => {
  return (
    <lines name="trajectory" points={points}>
      <linesMaterial name="trajectoryMaterial">
        <standardMaterial
          name="lineMaterial"
          diffuseColor={new Color3(1, 0.37, 0.12)}
          backFaceCulling={false}
        />
      </linesMaterial>
    </lines>
  );
};

function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export const TrajectoryViewBabylon: FC<TrajectoryViewBabylonProps> = ({ data, autoPlay = false }) => {
  const [viewMode, setViewMode] = useState<'default' | 'side'>('default');
  const [hasError, setHasError] = useState(false);

  const points = data.map(point => new Vector3(point.x, point.y, point.z));
  const maxDistance = data.length > 0 ? 
    Math.max(...data.map(p => Math.sqrt(p.x * p.x + p.z * p.z))) : 0;
  const gridSize = Math.ceil(maxDistance / 10) * 10;

  if (hasError) {
    return (
      <div className="relative w-full h-[600px] bg-white rounded-lg shadow-sm overflow-hidden flex items-center justify-center">
        <p className="text-red-500">Failed to initialize 3D view. Please refresh the page.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[600px] bg-white rounded-lg shadow-sm overflow-hidden">
      <Engine 
        antialias 
        adaptToDeviceRatio 
        canvasId="babylonJS"
        engineOptions={{
          preserveDrawingBuffer: true,
          stencil: true,
          failIfMajorPerformanceCaveat: true
        }}
        onError={() => setHasError(true)}
      >
        <Scene>
          <arcRotateCamera
            name="camera"
            target={Vector3.Zero()}
            alpha={viewMode === 'default' ? Math.PI : Math.PI * 1.5}
            beta={Math.PI * 0.4}
            radius={10}
          />

          <hemisphericLight
            name="light1"
            intensity={0.7}
            direction={new Vector3(0, 1, 0)}
          />

          <GolfGround size={gridSize} />
          {points.length > 0 && (
            <TrajectoryPath points={points} />
          )}
        </Scene>
      </Engine>

      <Button
        variant="outline"
        size="icon"
        onClick={() => setViewMode(prev => prev === 'default' ? 'side' : 'default')}
        className="absolute bottom-4 right-4 bg-white hover:bg-gray-100"
      >
        <Eye className="h-4 w-4" />
      </Button>

      <div className="absolute top-4 right-4 bg-black/80 text-white px-3 py-1 rounded-full text-sm">
        {viewMode === 'default' ? 'Behind Ball View' : 'Side View'}
      </div>
    </div>
  );
};