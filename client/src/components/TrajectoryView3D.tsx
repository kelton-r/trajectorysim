import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { TrajectoryPoint } from '@/types';
import { useMemo } from 'react';

interface TrajectoryView3DProps {
  data: TrajectoryPoint[];
}

function TrajectoryPath({ points }: { points: [number, number, number][] }) {
  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flat())}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#D92429" linewidth={2} />
    </line>
  );
}

export function TrajectoryView3D({ data }: TrajectoryView3DProps) {
  const points = useMemo(() => {
    return data.map(point => [point.x, point.y, point.z] as [number, number, number]);
  }, [data]);

  return (
    <div className="w-full h-[500px] bg-white rounded-lg shadow-sm">
      <Canvas camera={{ position: [10, 10, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        {/* Ground grid */}
        <Grid
          args={[20, 20]}
          cellSize={1}
          cellThickness={1}
          cellColor="#6b7280"
          sectionSize={5}
        />

        {/* Trajectory path */}
        {points.length > 0 && <TrajectoryPath points={points} />}

        {/* Camera controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          target={[5, 0, 0]}
        />
      </Canvas>
    </div>
  );
}
