import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Point3D, Obstacle } from '@/utils/pathfinding';
import { Play, RotateCcw, Plus, Trash2, GitCompare } from 'lucide-react';

interface ControlPanelProps {
  algorithm: 'astar' | 'rrt';
  onAlgorithmChange: (alg: 'astar' | 'rrt') => void;
  onRunSimulation: () => void;
  onRunComparison: () => void;
  onReset: () => void;
  start: Point3D;
  goal: Point3D;
  obstacles: Obstacle[];
  onStartChange: (p: Point3D) => void;
  onGoalChange: (p: Point3D) => void;
  onAddObstacle: () => void;
  onRemoveObstacle: (index: number) => void;
  isRunning: boolean;
}

const ControlPanel = ({
  algorithm,
  onAlgorithmChange,
  onRunSimulation,
  onRunComparison,
  onReset,
  start,
  goal,
  obstacles,
  onStartChange,
  onGoalChange,
  onAddObstacle,
  onRemoveObstacle,
  isRunning
}: ControlPanelProps) => {
  return (
    <div className="h-full overflow-y-auto space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Algorithm Selection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Pathfinding Algorithm</Label>
            <Select value={algorithm} onValueChange={(v) => onAlgorithmChange(v as 'astar' | 'rrt')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="astar">A* Algorithm</SelectItem>
                <SelectItem value="rrt">RRT Algorithm</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Button 
              onClick={onRunSimulation} 
              disabled={isRunning}
              className="w-full"
            >
              <Play className="w-4 h-4 mr-2" />
              Run {algorithm === 'astar' ? 'A*' : 'RRT'}
            </Button>
            <div className="flex gap-2">
              <Button 
                onClick={onRunComparison} 
                disabled={isRunning}
                variant="secondary"
                className="flex-1"
              >
                <GitCompare className="w-4 h-4 mr-2" />
                Compare Both
              </Button>
              <Button 
                onClick={onReset} 
                variant="outline"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Start Position</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label>X</Label>
            <Input 
              type="number" 
              value={start.x} 
              onChange={(e) => onStartChange({ ...start, x: parseFloat(e.target.value) })}
              step="0.5"
            />
          </div>
          <div className="space-y-2">
            <Label>Y</Label>
            <Input 
              type="number" 
              value={start.y} 
              onChange={(e) => onStartChange({ ...start, y: parseFloat(e.target.value) })}
              step="0.5"
            />
          </div>
          <div className="space-y-2">
            <Label>Z</Label>
            <Input 
              type="number" 
              value={start.z} 
              onChange={(e) => onStartChange({ ...start, z: parseFloat(e.target.value) })}
              step="0.5"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Goal Position</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label>X</Label>
            <Input 
              type="number" 
              value={goal.x} 
              onChange={(e) => onGoalChange({ ...goal, x: parseFloat(e.target.value) })}
              step="0.5"
            />
          </div>
          <div className="space-y-2">
            <Label>Y</Label>
            <Input 
              type="number" 
              value={goal.y} 
              onChange={(e) => onGoalChange({ ...goal, y: parseFloat(e.target.value) })}
              step="0.5"
            />
          </div>
          <div className="space-y-2">
            <Label>Z</Label>
            <Input 
              type="number" 
              value={goal.z} 
              onChange={(e) => onGoalChange({ ...goal, z: parseFloat(e.target.value) })}
              step="0.5"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg">Obstacles ({obstacles.length})</CardTitle>
          <Button onClick={onAddObstacle} size="sm" variant="outline">
            <Plus className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {obstacles.length === 0 ? (
            <p className="text-sm text-muted-foreground">No obstacles added</p>
          ) : (
            <div className="space-y-2">
              {obstacles.map((obstacle, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-secondary rounded-lg">
                  <span className="text-sm">
                    {obstacle.type === 'box' ? '📦' : '⚪'} 
                    {' '}({obstacle.position.x.toFixed(1)}, {obstacle.position.y.toFixed(1)}, {obstacle.position.z.toFixed(1)})
                  </span>
                  <Button 
                    onClick={() => onRemoveObstacle(i)} 
                    size="sm" 
                    variant="ghost"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ControlPanel;
