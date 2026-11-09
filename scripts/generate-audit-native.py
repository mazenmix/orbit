import swisseph as swe
import datetime as dt
import json, pathlib, hashlib
# Requires the optional audit-only package pyswisseph==2.10.3.2.
# Run after pnpm install. Extract exactly the pinned WASM ephemeris files, then
# calculate expected results in the separately compiled native Swiss library.
import re, tempfile
repo=pathlib.Path(__file__).resolve().parents[1]
base=repo/'node_modules/swisseph-wasm/wasm'
loader=(base/'swisseph.js').read_text()
metadata=re.search(r'loadPackage\((\{files:.*?remote_package_size:\d+\})\)',loader).group(1)
metadata=json.loads(re.sub(r'(\w+):',r'"\1":',metadata))
raw=(base/'swisseph.data').read_bytes()
ephe=tempfile.TemporaryDirectory()
for item in metadata['files']:
 (pathlib.Path(ephe.name)/pathlib.Path(item['filename']).name).write_bytes(raw[item['start']:item['end']])
swe.set_ephe_path(ephe.name)
UTC=dt.timezone.utc
dates=['1800-01-06T12:00:00Z','1850-06-15T06:00:00Z','1950-03-21T00:00:00Z','2026-11-09T09:00:00Z','2030-12-31T23:30:00Z','2100-07-01T18:00:00Z','2399-12-20T12:00:00Z']
ids=[0,1,2,3,4,5,6,7,8,9,15,17,18,19,20,16]
jd=lambda iso:dt.datetime.fromisoformat(iso.replace('Z','+00:00')).timestamp()/86400+2440587.5
iso=lambda day:dt.datetime.fromtimestamp((day-2440587.5)*86400,UTC).isoformat().replace('+00:00','Z')
rows=[]
for at in dates:
 points=[]
 for body in ids:
  try:
   v,flags=swe.calc_ut(jd(at),body,swe.FLG_SWIEPH|swe.FLG_SPEED)
   if not flags&swe.FLG_SWIEPH:raise RuntimeError('unintended fallback')
   points.append({'id':body,'longitude':v[0],'speed':v[3]})
  except swe.Error:continue
 houses=[]
 for lat,lon in [(33.3152,44.3661),(14.5995,120.9842),(-33.8688,151.2093)]:
  cusps,angles=swe.houses(jd(at),lat,lon,b'P')
  houses.append({'lat':lat,'lon':lon,'cusps':cusps,'asc':angles[0],'mc':angles[1]})
 rows.append({'at':at,'points':points,'houses':houses})
def root(fn,start,end):
 a,b=jd(start),jd(end);fa=fn(a)
 assert fa*fn(b)<0
 for i in range(50):
  mid=(a+b)/2;fm=fn(mid)
  if fa*fm<=0:b=mid
  else:a=mid;fa=fm
 return iso((a+b)/2)
lon=lambda t,p:swe.calc_ut(t,p,swe.FLG_SWIEPH|swe.FLG_SPEED)[0][0]
error=lambda t,a,b,angle:((lon(t,a)-lon(t,b)-angle+180)%360)-180
roots={
 'newMoon':root(lambda t:error(t,1,0,0),'2026-11-09T04:00:00Z','2026-11-09T10:00:00Z'),
 'moonMarsSquare':root(lambda t:error(t,1,4,90),'2026-11-09T15:00:00Z','2026-11-09T22:00:00Z'),
 'moonJupiterSquare':root(lambda t:error(t,1,5,90),'2026-11-09T21:00:00Z','2026-11-10T01:00:00Z'),
 'moonSagittariusIngress':root(lambda t:(lon(t,1)-240+180)%360-180,'2026-11-10T06:00:00Z','2026-11-10T11:00:00Z'),
 'mansion19Ingress':root(lambda t:(lon(t,1)-18*360/28+180)%360-180,'2026-11-09T13:00:00Z','2026-11-09T18:00:00Z')
}
result={'provenance':{'native':'PySwissEph '+swe.version,'wrapper':'2.10.3.2','ephemerisSha256':hashlib.sha256(raw).hexdigest(),'method':'Separate native C build; supplied Swiss data; bisection of longitude error in UTC. No application root functions used.'},'samples':rows,'roots':roots}
(repo/'tests/fixtures/audit-native-20261109.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(roots,indent=2))
