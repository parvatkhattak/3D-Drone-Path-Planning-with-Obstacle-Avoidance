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
  exploredNodes?: Point3D[];
  exploredNodes2?: Point3D[];
  onStartChange: (point: Point3D) => void;
  onGoalChange: (point: Point3D) => void;
  isAnimating?: boolean;
  showComparison?: boolean;
  showExploration?: boolean;
  animateDrone?: boolean;
  droneProgress?: number;
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

const PathVisualization = ({ path, color = "#06b6d4", opacity = 0.8 }: { path: Point3D[], color?: string, opacity?: number }) => {
  if (path.length < 2) return null;

  return (
    <>
      {path.map((point, i) => {
        if (i === 0) return null;
        const prevPoint = path[i - 1];
        const direction = new THREE.Vector3(
          point.x - prevPoint.x,
          point.y - prevPoint.y,
          point.z - prevPoint.z
        );
        const length = direction.length();
        const midpoint = new THREE.Vector3(
          (prevPoint.x + point.x) / 2,
          (prevPoint.y + point.y) / 2,
          (prevPoint.z + point.z) / 2
        );

        return (
          <group key={`segment-${i}`}>
            <mesh position={midpoint} rotation={[0, Math.atan2(direction.x, direction.z), Math.asin(direction.y / length)]}>
              <cylinderGeometry args={[0.08, 0.08, length, 8]} />
              <meshStandardMaterial 
                color={color}
                emissive={color}
                emissiveIntensity={0.5}
                transparent
                opacity={opacity}
              />
            </mesh>
          </group>
        );
      })}
      
      {path.map((point, i) => (
        <mesh key={i} position={[point.x, point.y, point.z]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial 
            color={color}
            emissive={color}
            emissiveIntensity={1}
          />
        </mesh>
      ))}
    </>
  );
};

const ExploredNodesVisualization = ({ nodes, color = "#fbbf24" }: { nodes: Point3D[], color?: string }) => {
  if (!nodes || nodes.length === 0) return null;

  const displayNodes = nodes.length > 500 ? nodes.filter((_, i) => i % Math.ceil(nodes.length / 500) === 0) : nodes;

  return (
    <>
      {displayNodes.map((node, i) => (
        <mesh key={`explored-${i}`} position={[node.x, node.y, node.z]}>
          <sphereGeometry args={[0.05, 4, 4]} />
          <meshBasicMaterial 
            color={color}
            transparent
            opacity={0.3}
          />
        </mesh>
      ))}
    </>
  );
};

const AnimatedDroneOnPath = ({ path, progress }: { path: Point3D[], progress: number }) => {
  if (path.length < 2) return null;

  const totalLength = path.reduce((sum, point, i) => {
    if (i === 0) return 0;
    const prev = path[i - 1];
    return sum + Math.sqrt(
      Math.pow(point.x - prev.x, 2) +
      Math.pow(point.y - prev.y, 2) +
      Math.pow(point.z - prev.z, 2)
    );
  }, 0);

  const targetDistance = progress * totalLength;
  let currentDistance = 0;
  let position = path[0];

  for (let i = 1; i < path.length; i++) {
    const prev = path[i - 1];
    const curr = path[i];
    const segmentLength = Math.sqrt(
      Math.pow(curr.x - prev.x, 2) +
      Math.pow(curr.y - prev.y, 2) +
      Math.pow(curr.z - prev.z, 2)
    );

    if (currentDistance + segmentLength >= targetDistance) {
      const t = (targetDistance - currentDistance) / segmentLength;
      position = {
        x: prev.x + (curr.x - prev.x) * t,
        y: prev.y + (curr.y - prev.y) * t,
        z: prev.z + (curr.z - prev.z) * t
      };
      break;
    }
    currentDistance += segmentLength;
  }

  return <AnimatedDrone position={position} color="#06b6d4" isAnimating={true} />;
};

const Scene3D = ({ 
  start, 
  goal, 
  obstacles, 
  path, 
  path2, 
  exploredNodes,
  exploredNodes2,
  onStartChange, 
  onGoalChange, 
  isAnimating = false, 
  showComparison = false,
  showExploration = false,
  animateDrone = false,
  droneProgress = 0
}: Scene3DProps) => {
  return (
    <div className="w-full h-full">
      <Canvas>
        <PerspectiveCamera makeDefault position={[20, 20, 20]} fov={60} />
        <OrbitControls 
          enableDamping 
          dampingFactor={0.05}
          minDistance={10}
          maxDistance={60}
          target={[0, 0, 0]}
        />
        
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.2} castShadow />
        <pointLight position={[-10, 10, -5]} intensity={0.6} color="#06b6d4" />
        <pointLight position={[10, -10, 5]} intensity={0.4} color="#ef4444" />
        <hemisphereLight intensity={0.3} color="#ffffff" groundColor="#444444" />
        
        <Grid 
          args={[20, 20]} 
          cellSize={1} 
          cellThickness={0.5}
          cellColor="#334155"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#475569"
          fadeDistance={40}
          fadeStrength={1}
          position={[0, -10, 0]}
        />
        
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(20, 20, 20)]} />
          <lineBasicMaterial color="#475569" opacity={0.5} transparent />
        </lineSegments>
        
        {!animateDrone && <AnimatedDrone position={start} color="#06b6d4" isAnimating={false} />}
        <AnimatedDrone position={goal} color="#22c55e" isAnimating={false} />
        
        {obstacles.map((obstacle, i) => (
          <ObstacleObject key={i} obstacle={obstacle} />
        ))}
        
        {showExploration && exploredNodes && (
          <ExploredNodesVisualization nodes={exploredNodes} color="#fbbf24" />
        )}
        {showExploration && showComparison && exploredNodes2 && (
          <ExploredNodesVisualization nodes={exploredNodes2} color="#c084fc" />
        )}
        
        <PathVisualization path={path} color="#06b6d4" opacity={0.8} />
        
        {showComparison && path2 && path2.length > 0 && (
          <PathVisualization path={path2} color="#a855f7" opacity={0.7} />
        )}
        
        {animateDrone && path.length > 0 && (
          <AnimatedDroneOnPath path={path} progress={droneProgress} />
        )}
      </Canvas>
    </div>
  );
};

export default Scene3D;
