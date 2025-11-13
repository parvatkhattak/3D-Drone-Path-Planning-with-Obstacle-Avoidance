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
  stepSize = 1
): PathResult => {
  const startTime = performance.now();
  
  interface Node {
    point: Point3D;
    g: number; // cost from start
    h: number; // heuristic to goal
    f: number; // total cost
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
    // Find node with lowest f score
    let currentIndex = 0;
    for (let i = 1; i < openSet.length; i++) {
      if (openSet[i].f < openSet[currentIndex].f) {
        currentIndex = i;
      }
    }
    
    const current = openSet[currentIndex];
    nodesExplored++;
    
    // Check if we reached the goal
    if (pointsEqual(current.point, goal, stepSize)) {
      const path: Point3D[] = [];
      let node: Node | null = current;
      while (node) {
        path.unshift(node.point);
        node = node.parent;
      }
      
      const pathLength = path.reduce((sum, point, i) => {
        if (i === 0) return 0;
        return sum + distance(path[i - 1], point);
      }, 0);
      
      return {
        path,
        length: pathLength,
        computationTime: performance.now() - startTime,
        nodesExplored,
        success: true
      };
    }
    
    openSet.splice(currentIndex, 1);
    closedSet.add(pointToKey(current.point));
    
    // Explore neighbors
    for (const dir of directions) {
      const neighbor: Point3D = {
        x: current.point.x + dir.x * stepSize,
        y: current.point.y + dir.y * stepSize,
        z: current.point.z + dir.z * stepSize
      };
      
      // Check bounds
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
        openSet.push({
          point: neighbor,
          g,
          h,
          f,
          parent: current
        });
      }
    }
  }
  
  return {
    path: [],
    length: 0,
    computationTime: performance.now() - startTime,
    nodesExplored,
    success: false
  };
};

// RRT Algorithm
export const rrtPathfinding = (
  start: Point3D,
  goal: Point3D,
  obstacles: Obstacle[],
  bounds = { min: -10, max: 10 },
  maxIterations = 2000,
  stepSize = 0.8
): PathResult => {
  const startTime = performance.now();
  
  interface TreeNode {
    point: Point3D;
    parent: TreeNode | null;
  }
  
  const tree: TreeNode[] = [{ point: start, parent: null }];
  let nodesExplored = 0;
  
  const randomPoint = (): Point3D => {
    // Bias towards goal 10% of the time
    if (Math.random() < 0.1) {
      return goal;
    }
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
    
    const newNode: TreeNode = {
      point: newPoint,
      parent: nearestNode
    };
    
    tree.push(newNode);
    
    if (distance(newPoint, goal) < stepSize * 2) {
      const path: Point3D[] = [];
      let node: TreeNode | null = newNode;
      while (node) {
        path.unshift(node.point);
        node = node.parent;
      }
      path.push(goal);
      
      const pathLength = path.reduce((sum, point, i) => {
        if (i === 0) return 0;
        return sum + distance(path[i - 1], point);
      }, 0);
      
      return {
        path,
        length: pathLength,
        computationTime: performance.now() - startTime,
        nodesExplored,
        success: true
      };
    }
  }
  
  return {
    path: [],
    length: 0,
    computationTime: performance.now() - startTime,
    nodesExplored,
    success: false
  };
};
