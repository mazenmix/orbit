/** Share of the CURRENT tropical zodiac sign remaining in the body's direction
 * of travel. This is angular progress, not a prediction of hours/days until ingress.
 * Retrograde moves toward the sign's 0° boundary; direct toward its 30° boundary.
 */
export function remainingAsteroidSignGauge(longitude:number,speed:number):
 {percent:number;tone:'green'|'orange'}|null{
 if(!Number.isFinite(longitude)||!Number.isFinite(speed))return null;
 const inSign=((longitude%30)+30)%30;
 const remainingDegrees=speed<0?inSign:30-inSign;
 const percent=Math.max(0,Math.min(100,Math.round(remainingDegrees/30*100)));
 const tone=percent>=95?'orange':'green';
 return {percent,tone};
}
