import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, PerspectiveCamera } from '@react-three/drei';
import { Point3D, Obstacle } from '@/utils/pathfinding';
import AnimatedDrone from './AnimatedDrone';
import * as THREE from 'three';

interface Scene3DProps {
  start: Point3D;
  goal: Point3D;
  obstacles: Obstacle[];
  path: Point3D[];
  path2?: Point3D[];
  onStartChange: (point: Point3D) => void;
  onGoalChange: (point: Point3D) => void;
  isAnimating?: boolean;
  showComparison?: boolean;
}

const ObstacleObject = ({ obstacle }: { obstacle: Obstacle }) => {
  if (obstacle.type === 'box') {
    return (
      <mesh position={[obstacle.position.x, obstacle.position.y, obstacle.position.z]}>
        <boxGeometry args={[obstacle.size.x, obstacle.size.y, obstacle.size.z]} />
        <meshStandardMaterial 
          color="#ef4444" 
          transparent 
          opacity={0.7}
          emissive="#ef4444"
          emissiveIntensity={0.2}
        />
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(obstacle.size.x, obstacle.size.y, obstacle.size.z)]} />
          <lineBasicMaterial color="#dc2626" />
        </lineSegments>
      </mesh>
    );
  } else {
    return (
      <mesh position={[obstacle.position.x, obstacle.position.y, obstacle.position.z]}>
        <sphereGeometry args={[obstacle.size.x / 2, 32, 32]} />
        <meshStandardMaterial 
          color="#ef4444" 
          transparent 
          opacity={0.7}
          emissive="#ef4444"
          emissiveIntensity={0.2}
        />
      </mesh>
    );
  }
};

const PathVisualization = ({ path }: { path: Point3D[] }) => {
  if (path.length < 2) return null;

  const points = path.map(p => new THREE.Vector3(p.x, p.y, p.z));
  const curve = new THREE.CatmullRomCurve3(points);
  const tubeGeometry = new THREE.TubeGeometry(curve, path.length * 4, 0.1, 8, false);

  return (
    <>
      <mesh geometry={tubeGeometry}>
        <meshStandardMaterial 
          color="#06b6d4" 
          emissive="#06b6d4" 
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
        />
      </mesh>
      {/* Path nodes */}
      {path.map((point, i) => (
        <mesh key={i} position={[point.x, point.y, point.z]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial 
            color="#06b6d4" 
            emissive="#06b6d4" 
            emissiveIntensity={1}
          />
        </mesh>
      ))}
    </>
  );
};

const Scene3D = ({ start, goal, obstacles, path, path2, onStartChange, onGoalChange, isAnimating = false, showComparison = false }: Scene3DProps) => {
  return (
    <div className="w-full h-full" style={{ position: "relative" }}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[15, 15, 15]} />
        <OrbitControls 
          enableDamping 
          dampingFactor={0.05}
          minDistance={5}
          maxDistance={50}
        />
        
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <pointLight position={[-10, 10, -5]} intensity={0.5} color="#06b6d4" />
        <pointLight position={[10, -10, 5]} intensity={0.3} color="#ef4444" />
        
        {/* Grid */}
        <Grid 
          args={[20, 20]} 
          cellSize={1} 
          cellThickness={0.5}
          cellColor="#334155"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#475569"
          fadeDistance={30}
          fadeStrength={1}
          position={[0, -10, 0]}
        />
        
        {/* Bounding box */}
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(20, 20, 20)]} />
          <lineBasicMaterial color="#475569" opacity={0.3} transparent />
        </lineSegments>
        
        {/* Start and Goal markers */}
        <AnimatedDrone position={start} color="#06b6d4" isAnimating={isAnimating} />
        <AnimatedDrone position={goal} color="#22c55e" isAnimating={false} />
        
        {/* Obstacles */}
        {obstacles.map((obstacle, i) => (
          <ObstacleObject key={i} obstacle={obstacle} />
        ))}
        
        {/* Path */}
        <PathVisualization path={path} />
        
        {/* Second path for comparison */}
        {showComparison && path2 && path2.length > 0 && (
          <>
            {path2.map((point, i) => (
              <mesh key={`path2-${i}`} position={[point.x, point.y, point.z]}>
                <sphereGeometry args={[0.12, 8, 8]} />
                <meshStandardMaterial 
                  color="#a855f7" 
                  emissive="#a855f7" 
                  emissiveIntensity={1}
                />
              </mesh>
            ))}
            {(() => {
              if (path2.length < 2) return null;
              const points = path2.map(p => new THREE.Vector3(p.x, p.y, p.z));
              const curve = new THREE.CatmullRomCurve3(points);
              const tubeGeometry = new THREE.TubeGeometry(curve, path2.length * 4, 0.08, 8, false);
              return (
                <mesh geometry={tubeGeometry}>
                  <meshStandardMaterial 
                    color="#a855f7" 
                    emissive="#a855f7" 
                    emissiveIntensity={0.5}
                    transparent
                    opacity={0.7}
                  />
                </mesh>
              );
            })()}
          </>
        )}
      </Canvas>
    </div>
  );
};

export default Scene3D;
