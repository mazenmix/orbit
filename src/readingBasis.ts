import type {Point} from './math.ts';

/** Displaying approximate noon positions does not authorize a personal
 * interpretation of a natal Moon, angles or houses when birth time is unknown. */
export function interpretableNatalPoints(points:readonly Point[],knownTime=true):Point[]{
 return points.filter(p=>Number.isFinite(p.longitude)&&p.longitude>=0&&p.longitude<360&&Number.isFinite(p.speed))
  .filter(p=>knownTime||!['Moon','Ascendant','MC'].includes(p.id));
}
