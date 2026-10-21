/** Colors are based on the displayed whole-number score, with no gaps at boundaries. */
export type HeatmapBand='red'|'orange'|'yellow'|'green';
export function heatmapBand(value:number):HeatmapBand{
 if(!Number.isFinite(value))throw Error('Invalid heatmap score');
 const score=Math.max(0,Math.min(100,Math.round(value)));
 return score<=25?'red':score<=45?'orange':score<=65?'yellow':'green';
}
