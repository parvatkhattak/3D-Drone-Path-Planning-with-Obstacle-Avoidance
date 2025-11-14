import { useState } from 'react';
import Scene3D from '@/components/Scene3D';
import ControlPanel from '@/components/ControlPanel';
import MetricsPanel from '@/components/MetricsPanel';
import ComparisonMetrics from '@/components/ComparisonMetrics';
import { Point3D, Obstacle, PathResult, aStarPathfinding, rrtPathfinding } from '@/utils/pathfinding';
import { toast } from 'sonner';

const Index = () => {
  const [algorithm, setAlgorithm] = useState<'astar' | 'rrt'>('astar');
  const [start, setStart] = useState<Point3D>({ x: -8, y: -8, z: -8 });
  const [goal, setGoal] = useState<Point3D>({ x: 8, y: 8, z: 8 });
  const [obstacles, setObstacles] = useState<Obstacle[]>([
    { position: { x: 0, y: 0, z: 0 }, size: { x: 3, y: 3, z: 3 }, type: 'box' },
    { position: { x: 4, y: 4, z: 4 }, size: { x: 4, y: 4, z: 4 }, type: 'sphere' },
    { position: { x: -4, y: 2, z: 2 }, size: { x: 2, y: 4, z: 2 }, type: 'box' },
    { position: { x: 6, y: -3, z: 0 }, size: { x: 2.5, y: 2.5, z: 2.5 }, type: 'box' },
    { position: { x: -6, y: 5, z: -3 }, size: { x: 3, y: 3, z: 3 }, type: 'sphere' },
    { position: { x: 2, y: -5, z: 5 }, size: { x: 2, y: 5, z: 2 }, type: 'box' },
    { position: { x: -3, y: -2, z: 6 }, size: { x: 3.5, y: 3.5, z: 3.5 }, type: 'sphere' },
    { position: { x: 5, y: 6, z: -5 }, size: { x: 2, y: 2, z: 4 }, type: 'box' },
    { position: { x: -7, y: -6, z: 3 }, size: { x: 2, y: 3, z: 2 }, type: 'box' },
    { position: { x: 1, y: 7, z: 1 }, size: { x: 3, y: 3, z: 3 }, type: 'sphere' },
  ]);
  const [path, setPath] = useState<Point3D[]>([]);
  const [path2, setPath2] = useState<Point3D[]>([]);
  const [result, setResult] = useState<PathResult | null>(null);
  const [result2, setResult2] = useState<PathResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isComparison, setIsComparison] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showExploration, setShowExploration] = useState(false);
  const [animateDrone, setAnimateDrone] = useState(false);
  const [droneProgress, setDroneProgress] = useState(0);
  const [exploredNodes, setExploredNodes] = useState<Point3D[]>([]);
  const [exploredNodes2, setExploredNodes2] = useState<Point3D[]>([]);

  const handleRunSimulation = () => {
    setIsRunning(true);
    setIsAnimating(true);
    setIsComparison(false);
    setPath([]);
    setPath2([]);
    setResult(null);
    setResult2(null);
    setExploredNodes([]);
    setExploredNodes2([]);
    setAnimateDrone(false);
    setDroneProgress(0);
    setShowExploration(true);
    
    toast.info(`Running ${algorithm === 'astar' ? 'A*' : 'RRT'} algorithm...`);
    
    setTimeout(() => {
      let pathResult: PathResult;
      
      if (algorithm === 'astar') {
        pathResult = aStarPathfinding(start, goal, obstacles);
      } else {
        pathResult = rrtPathfinding(start, goal, obstacles);
      }
      
      setPath(pathResult.path);
      setResult(pathResult);
      setExploredNodes(pathResult.exploredNodes || []);
      setIsRunning(false);
      setIsAnimating(false);
      
      if (pathResult.success) {
        toast.success('Path found successfully!', {
          description: `Length: ${pathResult.length.toFixed(2)} units, Time: ${pathResult.computationTime.toFixed(2)}ms`
        });
        
        // Start drone animation after a short delay
        setTimeout(() => {
          setAnimateDrone(true);
          animateDroneAlongPath();
        }, 500);
      } else {
        toast.error('Failed to find a path', {
          description: 'Try adjusting obstacles or using a different algorithm'
        });
      }
    }, 100);
  };

  const animateDroneAlongPath = () => {
    const duration = 5000; // 5 seconds
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      setDroneProgress(progress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        toast.success('Drone reached destination!');
      }
    };
    
    animate();
  };

  const handleRunComparison = () => {
    setIsRunning(true);
    setIsAnimating(true);
    setIsComparison(true);
    setPath([]);
    setPath2([]);
    setResult(null);
    setResult2(null);
    setExploredNodes([]);
    setExploredNodes2([]);
    setAnimateDrone(false);
    setDroneProgress(0);
    setShowExploration(true);
    
    toast.info('Running both A* and RRT algorithms...');
    
    setTimeout(() => {
      const astarResult = aStarPathfinding(start, goal, obstacles);
      const rrtResult = rrtPathfinding(start, goal, obstacles);
      
      setPath(astarResult.path);
      setPath2(rrtResult.path);
      setResult(astarResult);
      setResult2(rrtResult);
      setExploredNodes(astarResult.exploredNodes || []);
      setExploredNodes2(rrtResult.exploredNodes || []);
      setIsRunning(false);
      setIsAnimating(false);
      
      if (astarResult.success && rrtResult.success) {
        toast.success('Both algorithms completed!', {
          description: 'Check comparison metrics for details'
        });
      } else if (astarResult.success || rrtResult.success) {
        toast.warning('One algorithm succeeded', {
          description: `${astarResult.success ? 'A*' : 'RRT'} found a path`
        });
      } else {
        toast.error('Both algorithms failed', {
          description: 'Try adjusting the obstacle configuration'
        });
      }
    }, 100);
  };

  const handleReset = () => {
    setPath([]);
    setPath2([]);
    setResult(null);
    setResult2(null);
    setIsComparison(false);
    setIsAnimating(false);
    setAnimateDrone(false);
    setDroneProgress(0);
    setExploredNodes([]);
    setExploredNodes2([]);
    setShowExploration(false);
    setStart({ x: -8, y: -8, z: -8 });
    setGoal({ x: 8, y: 8, z: 8 });
    setObstacles([
      { position: { x: 0, y: 0, z: 0 }, size: { x: 3, y: 3, z: 3 }, type: 'box' },
      { position: { x: 4, y: 4, z: 4 }, size: { x: 4, y: 4, z: 4 }, type: 'sphere' },
      { position: { x: -4, y: 2, z: 2 }, size: { x: 2, y: 4, z: 2 }, type: 'box' },
      { position: { x: 6, y: -3, z: 0 }, size: { x: 2.5, y: 2.5, z: 2.5 }, type: 'box' },
      { position: { x: -6, y: 5, z: -3 }, size: { x: 3, y: 3, z: 3 }, type: 'sphere' },
      { position: { x: 2, y: -5, z: 5 }, size: { x: 2, y: 5, z: 2 }, type: 'box' },
      { position: { x: -3, y: -2, z: 6 }, size: { x: 3.5, y: 3.5, z: 3.5 }, type: 'sphere' },
      { position: { x: 5, y: 6, z: -5 }, size: { x: 2, y: 2, z: 4 }, type: 'box' },
      { position: { x: -7, y: -6, z: 3 }, size: { x: 2, y: 3, z: 2 }, type: 'box' },
      { position: { x: 1, y: 7, z: 1 }, size: { x: 3, y: 3, z: 3 }, type: 'sphere' },
    ]);
    toast.info('Scene reset to default');
  };

  const handleAddObstacle = () => {
    const newObstacle: Obstacle = {
      position: {
        x: Math.random() * 10 - 5,
        y: Math.random() * 10 - 5,
        z: Math.random() * 10 - 5
      },
      size: {
        x: 1 + Math.random() * 2,
        y: 1 + Math.random() * 2,
        z: 1 + Math.random() * 2
      },
      type: Math.random() > 0.5 ? 'box' : 'sphere'
    };
    setObstacles([...obstacles, newObstacle]);
    toast.success('Obstacle added');
  };

  const handleRemoveObstacle = (index: number) => {
    setObstacles(obstacles.filter((_, i) => i !== index));
    toast.info('Obstacle removed');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
                3D Drone Path Planning Simulator
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                Advanced obstacle avoidance with A* and RRT algorithms
              </p>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <p>Parvat Khattak • 122201043</p>
              <p>Himanshu Kumar • 122201041</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-12 gap-4">
          {/* Control Panel */}
          <div className="col-span-12 lg:col-span-3">
            <div className="sticky top-20">
              <ControlPanel
                algorithm={algorithm}
                onAlgorithmChange={setAlgorithm}
                onRunSimulation={handleRunSimulation}
                onRunComparison={handleRunComparison}
                onReset={handleReset}
                start={start}
                goal={goal}
                obstacles={obstacles}
                onStartChange={setStart}
                onGoalChange={setGoal}
                onAddObstacle={handleAddObstacle}
                onRemoveObstacle={handleRemoveObstacle}
                isRunning={isRunning}
              />
            </div>
          </div>

          {/* 3D Scene */}
          <div className="col-span-12 lg:col-span-6">
            <div className="w-full h-[600px] bg-card rounded-lg border border-border overflow-hidden">
              <Scene3D
                start={start}
                goal={goal}
                obstacles={obstacles}
                path={path}
                path2={path2}
                exploredNodes={exploredNodes}
                exploredNodes2={exploredNodes2}
                onStartChange={setStart}
                onGoalChange={setGoal}
                isAnimating={isAnimating}
                showComparison={isComparison}
                showExploration={showExploration}
                animateDrone={animateDrone}
                droneProgress={droneProgress}
              />
            </div>
            
            {/* Visualization Controls */}
            <div className="mt-3 flex gap-2 items-center justify-center">
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={showExploration}
                  onChange={(e) => setShowExploration(e.target.checked)}
                  className="w-4 h-4"
                />
                Show Exploration Nodes
              </label>
            </div>
          </div>

          {/* Metrics Panel */}
          <div className="col-span-12 lg:col-span-3">
            <div className="sticky top-20">
              {isComparison && result && result2 ? (
                <ComparisonMetrics result1={result} result2={result2} />
              ) : (
                <MetricsPanel result={result} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
