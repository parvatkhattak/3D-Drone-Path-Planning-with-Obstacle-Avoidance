import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PathResult } from '@/utils/pathfinding';
import { CheckCircle2, XCircle, TrendingUp, Clock, MapPin } from 'lucide-react';

interface MetricsPanelProps {
  result: PathResult | null;
}

const MetricsPanel = ({ result }: MetricsPanelProps) => {
  if (!result) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Run a simulation to see performance metrics
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          {result.success ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-success" />
              <div>
                <p className="text-sm font-medium">Path Found</p>
                <p className="text-xs text-muted-foreground">Successfully navigated to goal</p>
              </div>
            </>
          ) : (
            <>
              <XCircle className="w-5 h-5 text-destructive" />
              <div>
                <p className="text-sm font-medium">Path Not Found</p>
                <p className="text-xs text-muted-foreground">Unable to reach goal</p>
              </div>
            </>
          )}
        </div>

        <div className="space-y-3 pt-2 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm">Path Length</span>
            </div>
            <span className="text-sm font-mono font-medium">
              {result.length.toFixed(2)} units
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm">Computation Time</span>
            </div>
            <span className="text-sm font-mono font-medium">
              {result.computationTime.toFixed(2)} ms
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm">Nodes Explored</span>
            </div>
            <span className="text-sm font-mono font-medium">
              {result.nodesExplored}
            </span>
          </div>

          {result.success && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm">Waypoints</span>
              </div>
              <span className="text-sm font-mono font-medium">
                {result.path.length}
              </span>
            </div>
          )}
        </div>

        {result.success && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Success rate: 100% • Collision-free path achieved
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricsPanel;
