import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, PerspectiveCamera } from '@react-three/drei';
import { TrajectoryPoint } from '@/types';
import { useMemo, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';

interface TrajectoryView3DProps {
  data: TrajectoryPoint[];
}

function TrajectoryPath({ points, progress = 1 }: { points: number[][], progress?: number }) {
  const lineGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    // Only show up to the current progress point
    const visiblePoints = points.slice(0, Math.floor(points.length * progress));
    const vertices = new Float32Array(visiblePoints.flat());
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    return geometry;
  }, [points, progress]);

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={Math.floor(points.length * progress)}
          array={new Float32Array(points.slice(0, Math.floor(points.length * progress)).flat())}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#D92429" linewidth={2} />
    </line>
  );
}

export function TrajectoryView3D({ data }: TrajectoryView3DProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(1);

  const points = useMemo(() => {
    return data.map(point => [point.x, point.y, point.z]);
  }, [data]);

  // Convert distances to yards for display
  const metersToYards = (meters: number) => meters * 1.09361;
  const maxDistance = data.length > 0 ? metersToYards(Math.max(...data.map(p => p.carry))) : 0;
  const gridSize = Math.ceil(maxDistance / 10) * 10; // Round to nearest 10 yards

  // Animation handling
  const animate = useCallback(() => {
    if (!isPlaying) return;

    setProgress(prev => {
      if (prev >= 1) {
        setIsPlaying(false);
        return 1;
      }
      return prev + 0.02;
    });

    requestAnimationFrame(animate);
  }, [isPlaying]);

  const handlePlayPause = () => {
    if (!isPlaying) {
      setProgress(0);
      setIsPlaying(true);
      requestAnimationFrame(animate);
    } else {
      setIsPlaying(false);
    }
  };

  // Calculate optimal camera position based on trajectory
  const cameraPosition = useMemo(() => {
    if (data.length === 0) return [20, 20, 20];

    const maxX = Math.max(...data.map(p => p.x));
    const maxY = Math.max(...data.map(p => p.y));
    const maxZ = Math.max(...data.map(p => Math.abs(p.z)));

    return [maxX * 0.7, maxY * 1.5, maxZ * 2];
  }, [data]);

  return (
    <div className="relative w-full h-[600px] bg-white rounded-lg shadow-sm">
      <Canvas>
        <PerspectiveCamera
          makeDefault
          position={cameraPosition}
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
        {points.length > 0 && <TrajectoryPath points={points} progress={progress} />}

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          target={[gridSize / 4, 0, 0]}
          maxDistance={gridSize * 2}
          minPolarAngle={Math.PI / 6} // Restrict viewing angle from below
          maxPolarAngle={Math.PI / 2} // Restrict viewing angle from above
        />
      </Canvas>

      {/* Play/Pause button */}
      <div className="absolute bottom-4 right-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePlayPause}
          className="bg-white hover:bg-gray-100"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}