import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PathResult } from '@/utils/pathfinding';
import { TrendingUp, Clock, MapPin, Award } from 'lucide-react';

interface ComparisonMetricsProps {
  result1: PathResult | null;
  result2: PathResult | null;
}

const ComparisonMetrics = ({ result1, result2 }: ComparisonMetricsProps) => {
  if (!result1 || !result2) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">Algorithm Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Run comparison mode to see both algorithms side by side
          </p>
        </CardContent>
      </Card>
    );
  }

  const getBetterMetric = (astar: number, rrt: number, lowerIsBetter: boolean) => {
    if (lowerIsBetter) {
      return astar < rrt ? 'astar' : 'rrt';
    }
    return astar > rrt ? 'astar' : 'rrt';
  };

  const pathLengthWinner = result1.success && result2.success 
    ? getBetterMetric(result1.length, result2.length, true)
    : result1.success ? 'astar' : result2.success ? 'rrt' : 'none';

  const timeWinner = getBetterMetric(result1.computationTime, result2.computationTime, true);
  
  const nodesWinner = getBetterMetric(result1.nodesExplored, result2.nodesExplored, true);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          Algorithm Comparison
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Success Comparison */}
        <div className="grid grid-cols-2 gap-3 pb-3 border-b border-border">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">A* Algorithm</p>
            <p className={`text-sm font-semibold ${result1.success ? 'text-success' : 'text-destructive'}`}>
              {result1.success ? '✓ Success' : '✗ Failed'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">RRT Algorithm</p>
            <p className={`text-sm font-semibold ${result2.success ? 'text-success' : 'text-destructive'}`}>
              {result2.success ? '✓ Success' : '✗ Failed'}
            </p>
          </div>
        </div>

        {/* Path Length */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Path Length (units)</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className={`p-2 rounded-lg ${pathLengthWinner === 'astar' ? 'bg-success/20 border border-success' : 'bg-secondary'}`}>
              <p className="text-xs text-muted-foreground">A*</p>
              <p className="text-lg font-mono font-bold">
                {result1.success ? result1.length.toFixed(2) : 'N/A'}
              </p>
              {pathLengthWinner === 'astar' && result1.success && result2.success && (
                <p className="text-xs text-success">
                  {((1 - result1.length / result2.length) * 100).toFixed(1)}% shorter
                </p>
              )}
            </div>
            <div className={`p-2 rounded-lg ${pathLengthWinner === 'rrt' ? 'bg-success/20 border border-success' : 'bg-secondary'}`}>
              <p className="text-xs text-muted-foreground">RRT</p>
              <p className="text-lg font-mono font-bold">
                {result2.success ? result2.length.toFixed(2) : 'N/A'}
              </p>
              {pathLengthWinner === 'rrt' && result1.success && result2.success && (
                <p className="text-xs text-success">
                  {((1 - result2.length / result1.length) * 100).toFixed(1)}% shorter
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Computation Time */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Computation Time (ms)</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className={`p-2 rounded-lg ${timeWinner === 'astar' ? 'bg-success/20 border border-success' : 'bg-secondary'}`}>
              <p className="text-xs text-muted-foreground">A*</p>
              <p className="text-lg font-mono font-bold">
                {result1.computationTime.toFixed(2)}
              </p>
              {timeWinner === 'astar' && (
                <p className="text-xs text-success">
                  {((1 - result1.computationTime / result2.computationTime) * 100).toFixed(1)}% faster
                </p>
              )}
            </div>
            <div className={`p-2 rounded-lg ${timeWinner === 'rrt' ? 'bg-success/20 border border-success' : 'bg-secondary'}`}>
              <p className="text-xs text-muted-foreground">RRT</p>
              <p className="text-lg font-mono font-bold">
                {result2.computationTime.toFixed(2)}
              </p>
              {timeWinner === 'rrt' && (
                <p className="text-xs text-success">
                  {((1 - result2.computationTime / result1.computationTime) * 100).toFixed(1)}% faster
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Nodes Explored */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Nodes Explored</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className={`p-2 rounded-lg ${nodesWinner === 'astar' ? 'bg-success/20 border border-success' : 'bg-secondary'}`}>
              <p className="text-xs text-muted-foreground">A*</p>
              <p className="text-lg font-mono font-bold">
                {result1.nodesExplored}
              </p>
            </div>
            <div className={`p-2 rounded-lg ${nodesWinner === 'rrt' ? 'bg-success/20 border border-success' : 'bg-secondary'}`}>
              <p className="text-xs text-muted-foreground">RRT</p>
              <p className="text-lg font-mono font-bold">
                {result2.nodesExplored}
              </p>
            </div>
          </div>
        </div>

        {/* Winner Summary */}
        <div className="pt-3 border-t border-border">
          <p className="text-xs font-medium mb-2">Performance Summary:</p>
          <div className="space-y-1">
            {result1.success && result2.success ? (
              <>
                <p className="text-xs text-muted-foreground">
                  • {pathLengthWinner === 'astar' ? 'A*' : 'RRT'} found shorter path
                </p>
                <p className="text-xs text-muted-foreground">
                  • {timeWinner === 'astar' ? 'A*' : 'RRT'} computed faster
                </p>
                <p className="text-xs text-muted-foreground">
                  • {nodesWinner === 'astar' ? 'A*' : 'RRT'} explored fewer nodes
                </p>
              </>
            ) : (
              <p className="text-xs text-warning">
                {!result1.success && !result2.success ? 'Both algorithms failed to find path' :
                 !result1.success ? 'Only RRT found a valid path' : 'Only A* found a valid path'}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComparisonMetrics;
