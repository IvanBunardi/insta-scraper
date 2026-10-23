// Run: node tests/monthly.cjs
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const js = fs.readFileSync('index.html', 'utf8').match(/<script>([\s\S]*?)<\/script>/)[1].split('// Delegasi event:')[0];
const context = { Intl, URL, document: {} };
vm.createContext(context);
vm.runInContext(js + '\nglobalThis.api={monthlyGroups,monthlyStats,monthChange,monthlyConclusion,monthlyAdvice,dateParts,erFor,median,qualityStats,observedAge,ageMatchedRows,uniqueObservations,snapshotHAR,responseJSON,scanJSON,simpleTakeaway,simpleSteps};', context);
const a = context.api;
const post = (iso, likes, comments, views, er, type='Reels') => ({date:iso?{iso}:null,likes,comments,views,er,type});
const rows = [
  post('2026-09-01',10,2,100,1),
  post('2026-09-30',null,4,null,null),
  post('2026-10-01',20,4,200,2),
  post('2026-10-02',0,0,0,0),
  post(null,999,999,999,999),
  post('2025-09-01',5,1,100,1)
];
const groups = a.monthlyGroups(rows);
assert.deepEqual(Array.from(groups,g=>g.key),['2025-09','2026-09','2026-10']);
const [,sep,oct] = groups;
assert.equal(sep.count,2);
assert.equal(sep.totals.likes,10);
assert.equal(sep.totals.comments,6);
assert.equal(sep.mean.likes,10);
assert.equal(sep.engagement,12);
assert.equal(sep.engagementN,1);
assert.equal(oct.mean.likes,10);
assert.equal(oct.valid.likes,2);
assert.equal(oct.engagement,12);
assert.equal(a.monthlyStats([post('2026-09-01',null,null,null,null)]).totals.likes,null);
assert.equal(a.monthlyStats([]).mean.er,null);
assert.equal(a.monthChange(null,10),'Belum tersedia');
assert.equal(a.monthChange(0,10),'0 → 10 (acuan nol)');
assert.equal(a.monthChange(0,0),'Tetap 0');
assert.equal(a.monthChange(2,3,true),'+1 pp');
assert.equal(a.monthChange(20,10),'-50%');
assert.match(a.monthlyConclusion(sep,oct),/hampir sama/);
assert.match(a.monthlyConclusion(sep,{...oct,mean:{er:3}}),/Oktober 2026 memiliki/);
assert.match(a.monthlyConclusion(sep,{...oct,mean:{er:null}}),/Belum bisa/);
assert.match(a.monthlyAdvice(sep,oct).join(' '),/bukan jaminan/);
const falling={...oct,count:5,engagement:6};
assert.match(a.monthlyAdvice(sep,falling).join(' '),/Jumlah post naik tetapi interaksi rata-rata per post turun/);
assert.equal(a.dateParts(Date.parse('2026-09-30T18:00:00Z')/1000).iso,'2026-10-01');
assert.equal(a.dateParts(Date.parse('2026-09-30T16:59:00Z')/1000).iso,'2026-09-30');
assert.equal(a.erFor({likes:20,comments:4,type:'Reels',views:200},1000),2.4);
assert.equal(a.erFor({likes:20,comments:4,type:'Reels',views:200},null),12);
console.log('PASS: monthly WIB/year grouping, null vs zero, matched interactions, totals, sample sizes, changes, conclusions and advice.');
assert.equal(a.median([null,undefined,NaN,Infinity]),null);
assert.equal(a.median([1,2,1000]),2);
assert.equal(a.median([0,10]),5);
assert.equal(a.monthlyStats([post('2026-09-01',0,0,0,0)]).median.er,0);
const stamp=Date.parse('2026-09-01T00:00:00Z')/1000;
const base={...rows[0],id:'one',shortcode:'ONE',username:'agency',timestamp:stamp,caption:'Contoh',likesHidden:false};
const observe=(days,likes)=>({...base,seenAt:(stamp+days*86400)*1000,likes});
assert.equal(a.observedAge(observe(7,10)),7);
assert.equal(a.observedAge({...base,seenAt:0}),null);
assert.equal(a.observedAge(observe(-1,10)),null);
assert.equal(a.uniqueObservations([observe(7,10),observe(7,10),observe(8,20)]).length,2);
// A later, higher count must not leak into the 7-day sample.
const selected=a.ageMatchedRows([base],[observe(6,8),observe(7,10),observe(8,20),observe(40,1000)],7,1,1000);
assert.equal(selected.length,1);
assert.equal(selected[0].likes,10);
assert.equal(selected[0].er,1.2);
assert.equal(a.ageMatchedRows([base],[observe(40,1000)]).length,0);
assert.equal(a.ageMatchedRows([base],[observe(6,8),observe(8,20)])[0].likes,8);
assert.equal(a.ageMatchedRows([base],[{...observe(7,10),username:'different'}]).length,0);
const q=a.qualityStats([observe(7,10),{...base,date:null,seenAt:0},observe(-1,1)]);
assert.equal(q.count,3);assert.equal(q.dated,2);assert.equal(q.knownCapture,2);assert.equal(q.invalidAge,1);assert.equal(q.medianAge,7);
const normal=a.monthlyStats([post('2026-09-01',1,0,10,1),post('2026-09-02',2,0,10,2),post('2026-09-03',100,0,10,100)]);
const typical=a.monthlyStats([post('2026-10-01',4,0,10,4),post('2026-10-02',5,0,10,5),post('2026-10-03',6,0,10,6)]);
assert.match(a.monthlyConclusion({key:'2026-09',...normal},{key:'2026-10',...typical}),/Arah median berlawanan/);
const simpleA={key:'2026-09',...normal},simpleB={key:'2026-10',...typical};
assert.equal(a.simpleTakeaway(simpleA,simpleB).direction,'mixed');
assert.equal(a.simpleTakeaway(null,simpleB).direction,'single');
assert.equal(a.simpleTakeaway(null,{...simpleB,engagementN:0}).direction,'missing');
assert.equal(a.simpleTakeaway({...simpleA,engagementN:1},simpleB).direction,'sparse');
assert.equal(a.simpleTakeaway({...simpleA,engagementN:0},simpleB).direction,'missing');
assert.equal(a.simpleTakeaway({...simpleA,engagement:1,medianEngagement:1},simpleB).direction,'up');
assert.equal(a.simpleTakeaway({...simpleA,engagement:50,medianEngagement:50},simpleB).direction,'down');
assert.equal(a.simpleTakeaway({...simpleA,engagement:5,medianEngagement:5},simpleB).direction,'flat');
assert.equal(a.simpleSteps(simpleA,simpleB,a.simpleTakeaway(simpleA,simpleB)).length,3);
// Export uses normalized media and original observation times, never raw request secrets.
const observations=[{...observe(7,10),slides:null,duration:null},{...observe(40,1000),slides:null,duration:null}];
const har=a.snapshotHAR(observations);
const ageFixture=[];
for(const month of [8,9])for(let i=0;i<3;i++){const timestamp=Date.UTC(2026,month,1+i,0)/1000;const key=`AGE_${month}_${i}`;for(const age of [7,40])ageFixture.push({...base,id:key,shortcode:key,timestamp,date:a.dateParts(timestamp),seenAt:(timestamp+age*86400)*1000,likes:age===40?1000:month===8?[1,2,100][i]:[4,5,6][i],comments:0,slides:null,duration:null})}
fs.mkdirSync('output/playwright',{recursive:true});
fs.writeFileSync('output/playwright/age-fixture.har',JSON.stringify(a.snapshotHAR(ageFixture)));
assert.equal(har.log.entries.length,2);
assert.equal(har.log.entries[0].startedDateTime,new Date(observations[0].seenAt).toISOString());
assert.equal(har.log.entries[0].request.headers.length,0);
assert.equal(har.log.entries[0].request.cookies.length,0);
const hiddenSnapshot=a.snapshotHAR([{...observations[0],seenAt:0,likes:null,likesHidden:true}]);
assert.equal(Object.hasOwn(hiddenSnapshot.log.entries[0],'startedDateTime'),false);
const hiddenMedia=JSON.parse(hiddenSnapshot.log.entries[0].response.content.text).items[0];
assert.equal(hiddenMedia.like_and_view_counts_disabled,true);
assert.equal(Object.hasOwn(hiddenMedia,'like_count'),false);
assert.equal(a.uniqueObservations([observations[0],{...observations[0],comments:99}]).length,2);
context.setTimeout=setTimeout;
(async()=>{const restored=[],profiles=new Map(),stats={candidates:0};for(const entry of har.log.entries){for(const value of a.responseJSON(entry.response.content).values)await a.scanJSON(value,Date.parse(entry.startedDateTime)||0,restored,profiles,stats)}assert.equal(restored.length,2);assert.equal(restored[0].likes,10);assert.equal(restored[1].likes,1000);assert.equal(restored[0].seenAt,observations[0].seenAt);assert.equal(restored[0].type,'Reels');console.log('PASS: medians, missing timestamps, observed ages, matched observation selection, conflicting trends and snapshot HAR round trip.');})().catch(e=>{console.error(e);process.exitCode=1});
