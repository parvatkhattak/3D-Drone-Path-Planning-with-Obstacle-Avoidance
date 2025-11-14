export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface Obstacle {
  position: Point3D;
  size: Point3D;
  type: 'box' | 'sphere';
}

export interface PathResult {
  path: Point3D[];
  length: number;
  computationTime: number;
  nodesExplored: number;
  success: boolean;
  exploredNodes?: Point3D[];
  collisionAvoidanceRate?: number;
}

// NEW: Trail tracking system
export class DroneTrailTracker {
  private trail: Point3D[] = [];
  private maxTrailLength: number;
  
  constructor(maxTrailLength: number = 500) {
    this.maxTrailLength = maxTrailLength;
  }
  
  addPosition(position: Point3D): void {
    this.trail.push({ ...position });
    
    // Keep trail at max length
    if (this.trail.length > this.maxTrailLength) {
      this.trail.shift();
    }
  }
  
  getTrail(): Point3D[] {
    return [...this.trail];
  }
  
  clear(): void {
    this.trail = [];
  }
  
  // Get smoothed trail for visualization (reduces jitter)
  getSmoothedTrail(windowSize: number = 3): Point3D[] {
    if (this.trail.length < windowSize) return this.trail;
    
    const smoothed: Point3D[] = [];
    for (let i = 0; i < this.trail.length; i++) {
      const start = Math.max(0, i - Math.floor(windowSize / 2));
      const end = Math.min(this.trail.length, i + Math.ceil(windowSize / 2));
      
      let sumX = 0, sumY = 0, sumZ = 0;
      let count = 0;
      
      for (let j = start; j < end; j++) {
        sumX += this.trail[j].x;
        sumY += this.trail[j].y;
        sumZ += this.trail[j].z;
        count++;
      }
      
      smoothed.push({
        x: sumX / count,
        y: sumY / count,
        z: sumZ / count
      });
    }
    
    return smoothed;
  }
}

// NEW: Interpolate between waypoints for smooth drone movement
export function interpolatePathForMovement(
  waypoints: Point3D[],
  pointsPerSegment: number = 20
): Point3D[] {
  if (waypoints.length < 2) return waypoints;
  
  const interpolated: Point3D[] = [];
  
  for (let i = 0; i < waypoints.length - 1; i++) {
    const start = waypoints[i];
    const end = waypoints[i + 1];
    
    // Add points along this segment
    for (let j = 0; j < pointsPerSegment; j++) {
      const t = j / pointsPerSegment;
      interpolated.push({
        x: start.x + (end.x - start.x) * t,
        y: start.y + (end.y - start.y) * t,
        z: start.z + (end.z - start.z) * t
      });
    }
  }
  
  // Add final waypoint
  interpolated.push(waypoints[waypoints.length - 1]);
  
  return interpolated;
}

// NEW: Create smooth curve through waypoints (Catmull-Rom style)
export function createSmoothCurve(
  waypoints: Point3D[],
  segments: number = 50
): Point3D[] {
  if (waypoints.length < 2) return waypoints;
  if (waypoints.length === 2) {
    return interpolatePathForMovement(waypoints, segments);
  }
  
  const curve: Point3D[] = [];
  
  // For each segment between waypoints
  for (let i = 0; i < waypoints.length - 1; i++) {
    const p0 = waypoints[Math.max(0, i - 1)];
    const p1 = waypoints[i];
    const p2 = waypoints[i + 1];
    const p3 = waypoints[Math.min(waypoints.length - 1, i + 2)];
    
    // Create Catmull-Rom spline segment
    for (let t = 0; t < 1; t += 1 / segments) {
      const t2 = t * t;
      const t3 = t2 * t;
      
      const point: Point3D = {
        x: 0.5 * (
          (2 * p1.x) +
          (-p0.x + p2.x) * t +
          (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
          (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3
        ),
        y: 0.5 * (
          (2 * p1.y) +
          (-p0.y + p2.y) * t +
          (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
          (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3
        ),
        z: 0.5 * (
          (2 * p1.z) +
          (-p0.z + p2.z) * t +
          (2 * p0.z - 5 * p1.z + 4 * p2.z - p3.z) * t2 +
          (-p0.z + 3 * p1.z - 3 * p2.z + p3.z) * t3
        )
      };
      
      curve.push(point);
    }
  }
  
  // Add final waypoint
  curve.push(waypoints[waypoints.length - 1]);
  
  return curve;
}

// Check if two points are equal within tolerance
const pointsEqual = (p1: Point3D, p2: Point3D, tolerance = 0.1): boolean => {
  return Math.abs(p1.x - p2.x) < tolerance &&
         Math.abs(p1.y - p2.y) < tolerance &&
         Math.abs(p1.z - p2.z) < tolerance;
};

// Calculate Euclidean distance
const distance = (p1: Point3D, p2: Point3D): number => {
  return Math.sqrt(
    Math.pow(p2.x - p1.x, 2) +
    Math.pow(p2.y - p1.y, 2) +
    Math.pow(p2.z - p1.z, 2)
  );
};

// Path simplification to remove redundant waypoints
export const simplifyPath = (path: Point3D[], tolerance = 0.5): Point3D[] => {
  if (path.length <= 2) return path;
  
  const simplified: Point3D[] = [path[0]];
  
  for (let i = 1; i < path.length - 1; i++) {
    const prev = simplified[simplified.length - 1];
    const current = path[i];
    const next = path[i + 1];
    
    const v1 = { x: current.x - prev.x, y: current.y - prev.y, z: current.z - prev.z };
    const v2 = { x: next.x - current.x, y: next.y - current.y, z: next.z - current.z };
    
    const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z);
    const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z);
    
    if (mag1 < 0.001 || mag2 < 0.001) continue;
    
    const angle = Math.acos(Math.max(-1, Math.min(1, dot / (mag1 * mag2))));
    
    if (angle > tolerance) {
      simplified.push(current);
    }
  }
  
  simplified.push(path[path.length - 1]);
  return simplified;
};

// Check if there's a clear line of sight between two points
const hasLineOfSight = (
  from: Point3D,
  to: Point3D,
  obstacles: Obstacle[],
  samples = 20
): boolean => {
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const point: Point3D = {
      x: from.x + (to.x - from.x) * t,
      y: from.y + (to.y - from.y) * t,
      z: from.z + (to.z - from.z) * t
    };
    
    if (checkCollision(point, obstacles)) {
      return false;
    }
  }
  
  return true;
};

// Single pass of line-of-sight optimization
const lineOfSightPass = (path: Point3D[], obstacles: Obstacle[]): Point3D[] => {
  if (path.length < 3) return path;
  
  const result: Point3D[] = [path[0]];
  let currentIndex = 0;
  
  while (currentIndex < path.length - 1) {
    let farthestVisible = currentIndex + 1;
    
    for (let i = currentIndex + 2; i < path.length; i++) {
      if (hasLineOfSight(path[currentIndex], path[i], obstacles)) {
        farthestVisible = i;
      } else {
        break;
      }
    }
    
    currentIndex = farthestVisible;
    result.push(path[currentIndex]);
  }
  
  return result;
};

// String Pulling with Line-of-Sight optimization
export const smoothPath = (
  path: Point3D[],
  obstacles: Obstacle[] = [],
  maxIterations = 3
): Point3D[] => {
  if (path.length < 3) return path;

  let smoothed = [...path];
  
  for (let iteration = 0; iteration < maxIterations; iteration++) {
    const optimized = lineOfSightPass(smoothed, obstacles);
    if (optimized.length === smoothed.length) break;
    smoothed = optimized;
  }
  
  return smoothed;
};

// Distance from point to line segment
const pointToLineDistance = (point: Point3D, lineStart: Point3D, lineEnd: Point3D): number => {
  const A = point.x - lineStart.x;
  const B = point.y - lineStart.y;
  const C = point.z - lineStart.z;
  
  const D = lineEnd.x - lineStart.x;
  const E = lineEnd.y - lineStart.y;
  const F = lineEnd.z - lineStart.z;
  
  const dot = A * D + B * E + C * F;
  const lenSq = D * D + E * E + F * F;
  
  let param = -1;
  if (lenSq !== 0) param = dot / lenSq;
  
  let closestX, closestY, closestZ;
  
  if (param < 0) {
    closestX = lineStart.x;
    closestY = lineStart.y;
    closestZ = lineStart.z;
  } else if (param > 1) {
    closestX = lineEnd.x;
    closestY = lineEnd.y;
    closestZ = lineEnd.z;
  } else {
    closestX = lineStart.x + param * D;
    closestY = lineStart.y + param * E;
    closestZ = lineStart.z + param * F;
  }
  
  const dx = point.x - closestX;
  const dy = point.y - closestY;
  const dz = point.z - closestZ;
  
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

// Ramer-Douglas-Peucker algorithm for path simplification
export const ramerDouglasPeucker = (
  path: Point3D[],
  epsilon = 0.3
): Point3D[] => {
  if (path.length < 3) return path;
  
  let maxDist = 0;
  let maxIndex = 0;
  
  for (let i = 1; i < path.length - 1; i++) {
    const dist = pointToLineDistance(path[i], path[0], path[path.length - 1]);
    if (dist > maxDist) {
      maxDist = dist;
      maxIndex = i;
    }
  }
  
  if (maxDist > epsilon) {
    const left = ramerDouglasPeucker(path.slice(0, maxIndex + 1), epsilon);
    const right = ramerDouglasPeucker(path.slice(maxIndex), epsilon);
    
    return [...left.slice(0, -1), ...right];
  } else {
    return [path[0], path[path.length - 1]];
  }
};

// Check collision with obstacles
export const checkCollision = (point: Point3D, obstacles: Obstacle[], droneRadius = 0.5): boolean => {
  for (const obstacle of obstacles) {
    if (obstacle.type === 'box') {
      const halfSize = {
        x: obstacle.size.x / 2,
        y: obstacle.size.y / 2,
        z: obstacle.size.z / 2
      };
      
      if (
        point.x >= obstacle.position.x - halfSize.x - droneRadius &&
        point.x <= obstacle.position.x + halfSize.x + droneRadius &&
        point.y >= obstacle.position.y - halfSize.y - droneRadius &&
        point.y <= obstacle.position.y + halfSize.y + droneRadius &&
        point.z >= obstacle.position.z - halfSize.z - droneRadius &&
        point.z <= obstacle.position.z + halfSize.z + droneRadius
      ) {
        return true;
      }
    } else if (obstacle.type === 'sphere') {
      const dist = distance(point, obstacle.position);
      if (dist < obstacle.size.x / 2 + droneRadius) {
        return true;
      }
    }
  }
  return false;
};

// A* Algorithm
export const aStarPathfinding = (
  start: Point3D,
  goal: Point3D,
  obstacles: Obstacle[],
  bounds = { min: -10, max: 10 },
  stepSize = 1,
  autoSmooth = true
): PathResult => {
  const startTime = performance.now();
  
  interface Node {
    point: Point3D;
    g: number;
    h: number;
    f: number;
    parent: Node | null;
  }
  
  const openSet: Node[] = [];
  const closedSet: Set<string> = new Set();
  let nodesExplored = 0;
  
  const pointToKey = (p: Point3D): string => {
    return `${Math.round(p.x * 10)},${Math.round(p.y * 10)},${Math.round(p.z * 10)}`;
  };
  
  const startNode: Node = {
    point: start,
    g: 0,
    h: distance(start, goal),
    f: distance(start, goal),
    parent: null
  };
  
  openSet.push(startNode);
  
  const directions = [
    { x: 1, y: 0, z: 0 }, { x: -1, y: 0, z: 0 },
    { x: 0, y: 1, z: 0 }, { x: 0, y: -1, z: 0 },
    { x: 0, y: 0, z: 1 }, { x: 0, y: 0, z: -1 },
    { x: 1, y: 1, z: 0 }, { x: 1, y: -1, z: 0 },
    { x: -1, y: 1, z: 0 }, { x: -1, y: -1, z: 0 },
    { x: 1, y: 0, z: 1 }, { x: 1, y: 0, z: -1 },
    { x: -1, y: 0, z: 1 }, { x: -1, y: 0, z: -1 },
    { x: 0, y: 1, z: 1 }, { x: 0, y: 1, z: -1 },
    { x: 0, y: -1, z: 1 }, { x: 0, y: -1, z: -1 },
  ];
  
  while (openSet.length > 0 && nodesExplored < 10000) {
    let currentIndex = 0;
    for (let i = 1; i < openSet.length; i++) {
      if (openSet[i].f < openSet[currentIndex].f) {
        currentIndex = i;
      }
    }
    
    const current = openSet[currentIndex];
    nodesExplored++;
    
    if (pointsEqual(current.point, goal, stepSize)) {
      const rawPath: Point3D[] = [];
      let node: Node | null = current;
      while (node) {
        rawPath.unshift(node.point);
        node = node.parent;
      }
      
      let finalPath = rawPath;
      if (autoSmooth) {
        const simplified = ramerDouglasPeucker(rawPath, 0.5);
        finalPath = smoothPath(simplified, obstacles, 3);
      }
      
      const pathLength = finalPath.reduce((sum, point, i) => {
        if (i === 0) return 0;
        return sum + distance(finalPath[i - 1], point);
      }, 0);
      
      return {
        path: finalPath,
        length: pathLength,
        computationTime: performance.now() - startTime,
        nodesExplored,
        success: true,
        collisionAvoidanceRate: 100
      };
    }
    
    openSet.splice(currentIndex, 1);
    closedSet.add(pointToKey(current.point));
    
    for (const dir of directions) {
      const neighbor: Point3D = {
        x: current.point.x + dir.x * stepSize,
        y: current.point.y + dir.y * stepSize,
        z: current.point.z + dir.z * stepSize
      };
      
      if (neighbor.x < bounds.min || neighbor.x > bounds.max ||
          neighbor.y < bounds.min || neighbor.y > bounds.max ||
          neighbor.z < bounds.min || neighbor.z > bounds.max) {
        continue;
      }
      
      const neighborKey = pointToKey(neighbor);
      if (closedSet.has(neighborKey)) continue;
      if (checkCollision(neighbor, obstacles)) continue;
      
      const g = current.g + distance(current.point, neighbor);
      const h = distance(neighbor, goal);
      const f = g + h;
      
      const existingNode = openSet.find(n => pointToKey(n.point) === neighborKey);
      if (existingNode) {
        if (g < existingNode.g) {
          existingNode.g = g;
          existingNode.f = f;
          existingNode.parent = current;
        }
      } else {
        openSet.push({ point: neighbor, g, h, f, parent: current });
      }
    }
  }
  
  return {
    path: [],
    length: 0,
    computationTime: performance.now() - startTime,
    nodesExplored,
    success: false,
    collisionAvoidanceRate: 0
  };
};

// RRT Algorithm
export const rrtPathfinding = (
  start: Point3D,
  goal: Point3D,
  obstacles: Obstacle[],
  bounds = { min: -10, max: 10 },
  maxIterations = 2000,
  stepSize = 0.8,
  autoSmooth = true
): PathResult => {
  const startTime = performance.now();
  
  interface TreeNode {
    point: Point3D;
    parent: TreeNode | null;
  }
  
  const tree: TreeNode[] = [{ point: start, parent: null }];
  let nodesExplored = 0;
  
  const randomPoint = (): Point3D => {
    if (Math.random() < 0.1) return goal;
    return {
      x: bounds.min + Math.random() * (bounds.max - bounds.min),
      y: bounds.min + Math.random() * (bounds.max - bounds.min),
      z: bounds.min + Math.random() * (bounds.max - bounds.min)
    };
  };
  
  const nearest = (point: Point3D): TreeNode => {
    let nearestNode = tree[0];
    let minDist = distance(point, tree[0].point);
    
    for (const node of tree) {
      const dist = distance(point, node.point);
      if (dist < minDist) {
        minDist = dist;
        nearestNode = node;
      }
    }
    
    return nearestNode;
  };
  
  const steer = (from: Point3D, to: Point3D): Point3D => {
    const dist = distance(from, to);
    if (dist < stepSize) return to;
    
    const ratio = stepSize / dist;
    return {
      x: from.x + (to.x - from.x) * ratio,
      y: from.y + (to.y - from.y) * ratio,
      z: from.z + (to.z - from.z) * ratio
    };
  };
  
  for (let i = 0; i < maxIterations; i++) {
    nodesExplored++;
    
    const randomPt = randomPoint();
    const nearestNode = nearest(randomPt);
    const newPoint = steer(nearestNode.point, randomPt);
    
    if (checkCollision(newPoint, obstacles)) continue;
    
    const newNode: TreeNode = { point: newPoint, parent: nearestNode };
    tree.push(newNode);
    
    if (distance(newPoint, goal) < stepSize * 2) {
      const rawPath: Point3D[] = [];
      let node: TreeNode | null = newNode;
      while (node) {
        rawPath.unshift(node.point);
        node = node.parent;
      }
      rawPath.push(goal);
      
      let finalPath = rawPath;
      if (autoSmooth) {
        const simplified = ramerDouglasPeucker(rawPath, 0.5);
        finalPath = smoothPath(simplified, obstacles, 3);
      }
      
      const pathLength = finalPath.reduce((sum, point, i) => {
        if (i === 0) return 0;
        return sum + distance(finalPath[i - 1], point);
      }, 0);
      
      return {
        path: finalPath,
        length: pathLength,
        computationTime: performance.now() - startTime,
        nodesExplored,
        success: true,
        collisionAvoidanceRate: 100
      };
    }
  }
  
  return {
    path: [],
    length: 0,
    computationTime: performance.now() - startTime,
    nodesExplored,
    success: false,
    collisionAvoidanceRate: 0
  };
}