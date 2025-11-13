import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PathResult } from '@/utils/pathfinding';
import { TrendingUp, Clock, MapPin, Award } from 'lucide-react';

interface ComparisonMetricsProps {
  astarResult: PathResult | null;
  rrtResult: PathResult | null;
}

const ComparisonMetrics = ({ astarResult, rrtResult }: ComparisonMetricsProps) => {
  if (!astarResult || !rrtResult) {
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

  const pathLengthWinner = astarResult.success && rrtResult.success 
    ? getBetterMetric(astarResult.length, rrtResult.length, true)
    : astarResult.success ? 'astar' : rrtResult.success ? 'rrt' : 'none';

  const timeWinner = getBetterMetric(astarResult.computationTime, rrtResult.computationTime, true);
  
  const nodesWinner = getBetterMetric(astarResult.nodesExplored, rrtResult.nodesExplored, true);

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
            <p className={`text-sm font-semibold ${astarResult.success ? 'text-success' : 'text-destructive'}`}>
              {astarResult.success ? '✓ Success' : '✗ Failed'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">RRT Algorithm</p>
            <p className={`text-sm font-semibold ${rrtResult.success ? 'text-success' : 'text-destructive'}`}>
              {rrtResult.success ? '✓ Success' : '✗ Failed'}
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
                {astarResult.success ? astarResult.length.toFixed(2) : 'N/A'}
              </p>
              {pathLengthWinner === 'astar' && astarResult.success && rrtResult.success && (
                <p className="text-xs text-success">
                  {((1 - astarResult.length / rrtResult.length) * 100).toFixed(1)}% shorter
                </p>
              )}
            </div>
            <div className={`p-2 rounded-lg ${pathLengthWinner === 'rrt' ? 'bg-success/20 border border-success' : 'bg-secondary'}`}>
              <p className="text-xs text-muted-foreground">RRT</p>
              <p className="text-lg font-mono font-bold">
                {rrtResult.success ? rrtResult.length.toFixed(2) : 'N/A'}
              </p>
              {pathLengthWinner === 'rrt' && astarResult.success && rrtResult.success && (
                <p className="text-xs text-success">
                  {((1 - rrtResult.length / astarResult.length) * 100).toFixed(1)}% shorter
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
                {astarResult.computationTime.toFixed(2)}
              </p>
              {timeWinner === 'astar' && (
                <p className="text-xs text-success">
                  {((1 - astarResult.computationTime / rrtResult.computationTime) * 100).toFixed(1)}% faster
                </p>
              )}
            </div>
            <div className={`p-2 rounded-lg ${timeWinner === 'rrt' ? 'bg-success/20 border border-success' : 'bg-secondary'}`}>
              <p className="text-xs text-muted-foreground">RRT</p>
              <p className="text-lg font-mono font-bold">
                {rrtResult.computationTime.toFixed(2)}
              </p>
              {timeWinner === 'rrt' && (
                <p className="text-xs text-success">
                  {((1 - rrtResult.computationTime / astarResult.computationTime) * 100).toFixed(1)}% faster
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
                {astarResult.nodesExplored}
              </p>
            </div>
            <div className={`p-2 rounded-lg ${nodesWinner === 'rrt' ? 'bg-success/20 border border-success' : 'bg-secondary'}`}>
              <p className="text-xs text-muted-foreground">RRT</p>
              <p className="text-lg font-mono font-bold">
                {rrtResult.nodesExplored}
              </p>
            </div>
          </div>
        </div>

        {/* Winner Summary */}
        <div className="pt-3 border-t border-border">
          <p className="text-xs font-medium mb-2">Performance Summary:</p>
          <div className="space-y-1">
            {astarResult.success && rrtResult.success ? (
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
                {!astarResult.success && !rrtResult.success ? 'Both algorithms failed to find path' :
                 !astarResult.success ? 'Only RRT found a valid path' : 'Only A* found a valid path'}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComparisonMetrics;
