import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, PerspectiveCamera } from '@react-three/drei';
import { TrajectoryPoint } from '@/types';
import { useMemo } from 'react';
import * as THREE from 'three';

interface TrajectoryView3DProps {
  data: TrajectoryPoint[];
}

function TrajectoryPath({ points }: { points: number[][] }) {
  const lineGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array(points.flat());
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    return geometry;
  }, [points]);

  return (
    <mesh>
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial color="#D92429" linewidth={3} />
      </lineSegments>
    </mesh>
  );
}

function BallMarker({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color="#D92429" />
    </mesh>
  );
}

export function TrajectoryView3D({ data }: TrajectoryView3DProps) {
  const points = useMemo(() => {
    return data.map(point => [point.x, point.y, point.z]);
  }, [data]);

  // Convert distances to yards for display
  const metersToYards = (meters: number) => meters * 1.09361;
  const maxDistance = data.length > 0 ? metersToYards(Math.max(...data.map(p => p.carry))) : 0;
  const gridSize = Math.ceil(maxDistance / 10) * 10; // Round to nearest 10 yards

  return (
    <div className="w-full h-[600px] bg-white rounded-lg shadow-sm">
      <Canvas>
        <PerspectiveCamera
          makeDefault
          position={[20, 20, 20]}
          fov={60}
        />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />

        {/* Ground grid (in yards) */}
        <Grid
          args={[gridSize * 2, gridSize * 2]}
          cellSize={10}
          cellThickness={0.5}
          cellColor="#a0a0a0"
          sectionSize={50}
          sectionThickness={1}
          sectionColor="#808080"
          fadeDistance={gridSize * 2}
          fadeStrength={1}
          position={[gridSize / 2, 0, 0]}
        />

        {/* Trajectory path */}
        {points.length > 0 && (
          <>
            <TrajectoryPath points={points} />
            <BallMarker position={[0, 0, 0]} /> {/* Starting position */}
            <BallMarker position={[points[points.length - 1][0], 0, points[points.length - 1][2]]} /> {/* Landing position */}
          </>
        )}

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          target={[gridSize / 4, 0, 0]}
          maxDistance={gridSize * 2}
        />
      </Canvas>
    </div>
  );
}