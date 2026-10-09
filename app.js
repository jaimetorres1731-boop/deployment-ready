"use strict";
const CATEGORIES=["Uniforms & Clothing","Footwear","Hygiene","Military Gear","Electronics","Documents","Personal Items"];
const BAGS=["Unassigned","Rucksack","Duffel Bag 1","Duffel Bag 2","Tough Box","Carry-on / Personal Bag"];
const BRANCHES=["Army","Marine Corps","Navy","Air Force","Space Force","Coast Guard"];
const COMMON=[["Socks and underwear","Uniforms & Clothing"],["Weather-appropriate footwear","Footwear"],["Toothbrush and toothpaste","Hygiene"],["Soap and deodorant","Hygiene"],["Towel","Hygiene"],["Chargers and cables","Electronics"],["Military ID / CAC","Documents"],["Required travel documents","Documents"],["Personal medications (if applicable)","Personal Items"]];
const TEMPLATES={
 "Army":[["OCP uniforms","Uniforms & Clothing"],["Army PT uniform","Uniforms & Clothing"],["Combat boots","Footwear"],["Issued field equipment (per unit list)","Military Gear"]],
 "Marine Corps":[["Required service/utility uniforms","Uniforms & Clothing"],["PT gear","Uniforms & Clothing"],["Approved boots","Footwear"],["Issued equipment (per unit list)","Military Gear"]],
 "Navy":[["Required Navy uniforms","Uniforms & Clothing"],["PT gear","Uniforms & Clothing"],["Required footwear","Footwear"],["Issued gear (per command list)","Military Gear"]],
 "Air Force":[["Required Air Force uniforms","Uniforms & Clothing"],["PT gear","Uniforms & Clothing"],["Approved boots","Footwear"],["Issued equipment (per unit list)","Military Gear"]],
 "Space Force":[["Required Space Force uniforms","Uniforms & Clothing"],["PT gear","Uniforms & Clothing"],["Approved footwear","Footwear"],["Issued equipment (per unit list)","Military Gear"]],
 "Coast Guard":[["Required Coast Guard uniforms","Uniforms & Clothing"],["PT gear","Uniforms & Clothing"],["Required footwear","Footwear"],["Issued gear (per command list)","Military Gear"]]
};
const OLD_KEY="deployment-ready-v1",KEY="deployment-ready-v2",$=id=>document.getElementById(id);
const newId=()=>"item-"+Date.now()+"-"+Math.random().toString(36).slice(2);
const item=(name,category,bag="Unassigned",packed=false,id=newId())=>({id,name,category,bag,packed});
function starter(branch){return [...COMMON,...TEMPLATES[branch]].map(([n,c])=>item(n,c));}
function validItem(x){return x&&typeof x.id==="string"&&x.id.length<120&&typeof x.name==="string"&&x.name.length>0&&x.name.length<=100&&CATEGORIES.includes(x.category)&&BAGS.includes(x.bag)&&typeof x.packed==="boolean";}
function validState(x){return x&&BRANCHES.includes(x.branch)&&Array.isArray(x.items)&&x.items.length<=5000&&x.items.every(validItem);}
function migrateOld(x){if(!x||!BRANCHES.includes(x.branch)||!Array.isArray(x.items)||x.items.length>5000)return null;let items=x.items.map(v=>item(v.name,v.category,"Unassigned",v.packed,v.id));let next={branch:x.branch,items};return validState(next)?next:null;}
function read(){try{let v=localStorage.getItem(KEY);if(v){let x=JSON.parse(v);if(validState(x))return x;}let old=localStorage.getItem(OLD_KEY);if(old){let x=migrateOld(JSON.parse(old));if(x)return x;}}catch(e){}return {branch:"Army",items:starter("Army")};}
const SETTINGS_KEY="deployment-ready-v3-settings";
const TASKS_KEY="deployment-ready-v3-tasks";
const SUGGESTED_TASKS=["Review official packing instructions","Confirm required administrative appointments","Check travel document requirements","Prepare a family contact plan","Review personal finances and bills","Confirm emergency contacts"];
const THEMES={"Army":["#b7d38b","#293e2d","#1a2c20"],"Marine Corps":["#e6b875","#552b32","#2d1c21"],"Navy":["#e6c37e","#243d61","#17243b"],"Air Force":["#9ed2f2","#234d73","#172f48"],"Space Force":["#c5c8ec","#353653","#202138"],"Coast Guard":["#f3b4ad","#254c65","#172f43"]};
function readSettings(){try{const v=JSON.parse(localStorage.getItem(SETTINGS_KEY));return v&&typeof v.date==="string"?{date:v.date,durationValue:Number.isFinite(v.durationValue)?v.durationValue:"",durationUnit:["days","weeks","months"].includes(v.durationUnit)?v.durationUnit:"months"}:{date:"",durationValue:"",durationUnit:"months"};}catch(e){return {date:"",durationValue:"",durationUnit:"months"};}}
function readTasks(){try{const v=JSON.parse(localStorage.getItem(TASKS_KEY));if(Array.isArray(v)&&v.length<=1000&&v.every(t=>t&&typeof t.id==="string"&&typeof t.name==="string"&&t.name.length<=100&&typeof t.done==="boolean"))return v;}catch(e){}return SUGGESTED_TASKS.map((name,i)=>({id:"suggested-"+i,name,done:false}));}
let settings=readSettings(),tasks=readTasks();
function saveExtra(){try{localStorage.setItem(SETTINGS_KEY,JSON.stringify(settings));localStorage.setItem(TASKS_KEY,JSON.stringify(tasks));}catch(e){alert("Saving failed. Check browser storage.");}}
function theme(){let t=THEMES[state.branch]||THEMES.Army;document.documentElement.style.setProperty("--accent",t[0]);document.documentElement.style.setProperty("--hero-a",t[1]);document.documentElement.style.setProperty("--hero-b",t[2]);document.querySelector('meta[name="theme-color"]').setAttribute("content",t[2]);}
function showPage(page){if(page==="readiness"){activeReadinessCategory=null;renderReadiness();}["home","packing","readiness"].forEach(name=>{document.getElementById(name+"Page").hidden=name!==page;});document.querySelectorAll("[data-page]").forEach(b=>b.classList.toggle("nav-active",b.dataset.page===page));window.scrollTo(0,0);}
function durationDays(){let n=Number(settings.durationValue);if(!Number.isFinite(n)||n<1)return 0;let factor=settings.durationUnit==="days"?1:settings.durationUnit==="weeks"?7:30;return Math.min(3650,Math.round(n*factor));}
function quantitySuggestion(name,category){
 const days=durationDays();if(!days)return "";
 const lower=name.toLowerCase();
 const amount=(short,medium,long)=>days<=14?short:days<=45?medium:long;
 // Personal-supply estimates are starting quantities, not a deployment-long stockpile.
 if(/sock/.test(lower))return "Suggested: "+amount("7 pairs","10 pairs","14 pairs");
 if(/underwear/.test(lower))return "Suggested: "+amount("7 pairs","10 pairs","14 pairs");
 if(/toothbrush/.test(lower))return "Suggested: "+amount("1","1","2");
 if(/toothpaste/.test(lower))return "Suggested: "+amount("1 travel tube","1 tube","2 tubes to start");
 if(/deodorant|soap|shampoo|body wash/.test(lower))return "Suggested: "+amount("1 travel-size","1 standard-size","2 to start");
 if(/towel/.test(lower))return "Suggested: "+amount("1","2","2");
 if(/pt (uniform|gear)|physical training/.test(lower))return "Suggested: "+amount("2 sets","3 sets","4–5 sets")+"; follow unit guidance";
 if(/ocp|uniform|blouse|trouser/.test(lower))return "Suggested: "+amount("2 sets","3 sets","4 sets")+"; follow unit guidance";
 if(/boot/.test(lower))return "Suggested: "+amount("1 pair","1–2 pairs","2 pairs")+"; follow unit guidance";
 if(/shoe|footwear/.test(lower))return "Suggested: "+amount("1 pair","1–2 pairs","2 pairs")+"; follow unit guidance";
 if(/charger|cable|adapter/.test(lower))return "Suggested: "+amount("1","1","1 + spare if needed");
 if(/medication|prescription/.test(lower))return "Quantity: confirm prescribed supply and refill plan";
 if(/cac|military id|passport|document|orders|license/.test(lower))return "Quantity: 1 valid original, plus copies if directed";
 if(/field equipment|issued|military gear|body armor|helmet|weapon/.test(lower)||category==="Military Gear")return "Quantity: follow official unit issue/packing list";
 if(category==="Uniforms & Clothing")return "Suggested: "+amount("2 changes","3 changes","5 changes")+"; adjust for laundry";
 if(category==="Hygiene")return "Suggested: "+amount("1 travel-size","1 standard-size","1–2 to start");
 if(category==="Electronics")return "Suggested: 1; check power compatibility";
 if(category==="Documents")return "Quantity: follow official document checklist";
 if(category==="Footwear")return "Suggested: "+amount("1 pair","1 pair","1–2 pairs");
 if(category==="Personal Items")return "Quantity: choose what you need; check baggage limits";
 return "Quantity: check your unit list";
}
function renderDuration(){
 const field=$("durationValue");if(!field)return;
 field.value=settings.durationValue||"";$("durationUnit").value=settings.durationUnit||"months";
 const days=durationDays();
 $("durationStatus").textContent=days?`Saved. Suggestions use about ${days} days as a planning estimate; your official list takes priority.`:"Optional — leave blank if you prefer.";
}
const STAGES=[
 {name:"Early preparation",description:"Review orders and requirements; identify documents, appointments, and household arrangements."},
 {name:"Getting organized",description:"Confirm readiness appointments, pay details, family arrangements, and equipment needs."},
 {name:"Final preparations",description:"Review remaining paperwork, pay and household plans, and packing progress."},
 {name:"Departure week",description:"Recheck reporting instructions, required documents, transportation, and essential gear."},
 {name:"Deployment underway",description:"Keep your checklists for reference. Follow your command's current guidance."}
];
function daysToDeparture(){if(!settings.date||!/^\d{4}-\d{2}-\d{2}$/.test(settings.date))return null;const [y,m,d]=settings.date.split("-").map(Number);const target=Date.UTC(y,m-1,d);if(new Date(target).toISOString().slice(0,10)!==settings.date)return null;const now=new Date();const today=Date.UTC(now.getFullYear(),now.getMonth(),now.getDate());return Math.round((target-today)/86400000);}
function currentStage(days){return days===null?null:days<0?4:days<=7?3:days<=30?2:days<=90?1:0;}
function renderTimelineGuide(){const guide=$("timelineGuide");if(!guide)return;guide.replaceChildren();const days=daysToDeparture(),stage=currentStage(days);guide.hidden=activeReadinessCategory!=="Timeline";if(guide.hidden)return;
 if(stage===null){guide.append(el("h3","","Set your departure date"),el("p","muted","Add a target date on Home to see your current preparation stage. Your checklist still works without one."));const b=el("button","outline","Go to Home");b.type="button";b.onclick=()=>showPage("home");guide.append(b);return;}
 guide.append(el("span","muted","CURRENT PREPARATION STAGE"),el("h3","",STAGES[stage].name),el("p","",STAGES[stage].description));
 guide.append(el("p","muted",days>=0?`${days} day${days===1?"":"s"} until your saved target date`:`Your target date was ${Math.abs(days)} day${days===-1?"":"s"} ago`));
 const names=["Early preparation (91+ days)","Getting organized (31–90 days)","Final preparations (8–30 days)","Departure week (0–7 days)"];
 names.forEach((name,i)=>{const line=el("div","timeline-step"+(i===stage?" current":""));line.append(el("span","",i===stage?"●":"○"),el("span","",name));guide.append(line);});
 guide.append(el("p","hint","Timeline stages show timing only, not task completion. Follow your official orders and mark tasks Completed yourself."));
}
function renderHomePriorities(){const panel=$("homePriorities"),focus=$("homeFocus");if(!panel)return;panel.replaceChildren();const days=daysToDeparture(),stage=currentStage(days);
 focus.textContent=stage===null?"Add a target date above for time-based priorities. You can still start with these tasks.":STAGES[stage].name+" • "+(days>=0?days+" days remaining":"Target date passed");
 const order=stage===3?["Timeline","Documents","Packing","Finances","Family"]:stage===2?["Documents","Finances","Family","Packing","Timeline"]:stage===1?["Documents","Finances","Family","Timeline","Packing"]:stage===4?["Timeline","Documents","Family","Finances","Packing"]:["Documents","Family","Finances","Timeline","Packing"];
 let found=0;for(const cat of order){if(found>=3)break;if(cat==="Packing"){const remaining=state.items.filter(t=>!t.packed).length;if(!remaining)continue;const b=el("button","priority-item",`Packing • ${remaining} items left to pack →`);b.type="button";b.onclick=()=>showPage("packing");panel.append(b);found++;continue;}
 const t=readinessEntries(cat).find(x=>x.status==="todo");if(!t)continue;const b=el("button","priority-item",`${cat} • ${t.name} →`);b.type="button";b.onclick=()=>{showPage("readiness");activeReadinessCategory=cat;renderReadiness();};panel.append(b);found++;}
 if(!found)panel.append(el("p","muted","No unfinished suggested priorities. You can review your lists anytime."));
}
function renderExtras(){theme();renderReadiness();renderHomePriorities();$("homeBranch").value=state.branch;let packed=state.items.filter(x=>x.packed).length;$("homePacking").textContent=(state.items.length?Math.round(packed/state.items.length*100):0)+"%";let done=tasks.filter(x=>x.done).length;$("taskSummary").textContent=done+" of "+tasks.length+" tasks completed";
const list=$("taskList");list.replaceChildren();tasks.forEach(t=>{let row=el("div","item"+(t.done?" done":"")),check=el("input");check.type="checkbox";check.checked=t.done;check.setAttribute("aria-label","Completed: "+t.name);check.onchange=()=>{t.done=check.checked;saveExtra();renderExtras();};let name=el("span","name",t.name),remove=el("button","delete","×");remove.type="button";remove.setAttribute("aria-label","Remove "+t.name);remove.onclick=()=>{if(confirm("Remove this task?")){tasks=tasks.filter(x=>x.id!==t.id);saveExtra();renderExtras();}};row.append(check,name,remove);list.append(row);});
$("targetDate").value=settings.date;let msg="No date set — that's okay.";if(/^\d{4}-\d{2}-\d{2}$/.test(settings.date)){let today=new Date(),midnight=new Date(today.getFullYear(),today.getMonth(),today.getDate()),date=new Date(settings.date+"T00:00:00");if(!Number.isNaN(date.getTime())){let diff=Math.round((date-midnight)/86400000);msg=diff>0?diff+" days until your target date":diff===0?"Your target date is today":"Your target date has passed. You can update it anytime.";}}$("daysLeft").textContent=msg;}

// V4 category recommendations are non-authoritative planning examples.
const READINESS_KEY="deployment-ready-v4-readiness";
const READINESS_CATEGORIES={
 Documents:{icon:"▤",description:"Orders, identification, and administrative paperwork",common:["Review official deployment orders and reporting instructions","Check military identification and expiration dates","Confirm required medical and administrative paperwork","Review passport or travel document requirements if directed"],branch:{
  "Army":["Confirm Soldier Readiness Processing (SRP) instructions","Review personnel information in IPPS-A"],
  "Marine Corps":["Confirm command-directed pre-deployment administrative requirements","Review personnel information in Marine Online (MOL)"],
  "Navy":["Confirm command-directed deployment readiness requirements","Review personnel information through MyNavy Portal"],
  "Air Force":["Confirm unit deployment processing instructions","Review applicable personnel information in myFSS"],
  "Space Force":["Confirm Guardian deployment processing instructions","Review personnel information using service-designated systems"],
  "Coast Guard":["Confirm unit assignment or deployment processing requirements","Review personnel information in Direct Access"]}},
 Finances:{icon:"$",description:"Pay, bills, and money planning",common:["Review upcoming bills and automatic payments","Confirm direct deposit and pay information using official systems","Review recurring expenses and emergency savings","Check applicable allowances and dependent records"],branch:{
  "Army":["Verify relevant pay and personnel records in Army systems"],"Marine Corps":["Verify Marine Corps pay and personnel records"],"Navy":["Verify Navy pay and personnel records"],"Air Force":["Verify Air Force pay and personnel records"],"Space Force":["Verify Guardian pay and personnel records"],"Coast Guard":["Verify Coast Guard pay and personnel records"]}},
 Family:{icon:"♡",description:"Loved ones and responsibilities at home",common:["Share a general contact and communication plan with loved ones","Arrange household, pet, or property responsibilities if needed","Confirm emergency contact information is current","Review any applicable childcare or dependent care arrangements"],branch:{
  "Army":["Review Army Family Care Plan requirements if applicable"],"Marine Corps":["Review Marine Corps family care requirements if applicable"],"Navy":["Review Navy family care requirements if applicable"],"Air Force":["Review Air Force family care requirements if applicable"],"Space Force":["Review Space Force family care requirements if applicable"],"Coast Guard":["Review Coast Guard dependent care requirements if applicable"]}},
 Timeline:{icon:"▦",description:"Stay on track before departure",common:["Early preparation: review official instructions and key appointments","30 days out: review paperwork, finances, and packing","Final week: recheck reporting instructions and essential items","Departure: confirm personal travel essentials and follow command instructions"],branch:{
  "Army":["Check SRP and unit-directed deadlines"],"Marine Corps":["Check command-directed pre-deployment milestones"],"Navy":["Check command and ship or unit readiness milestones"],"Air Force":["Check unit deployment processing milestones"],"Space Force":["Check Guardian deployment readiness milestones"],"Coast Guard":["Check unit-directed deployment readiness milestones"]}}
};
function readReadiness(){try{let v=JSON.parse(localStorage.getItem(READINESS_KEY));if(v&&typeof v==="object"&&!Array.isArray(v)&&Object.keys(v).length<=6)return v;}catch(e){}return {};}
let readiness=readReadiness(),activeReadinessCategory=null;
function readinessBranch(){let b=state.branch;if(!readiness[b]||typeof readiness[b]!=="object")readiness[b]={};return readiness[b];}
function readinessEntries(cat){let cfg=READINESS_CATEGORIES[cat],branch=state.branch,defaults=[...cfg.common,...cfg.branch[branch]];let bucket=readinessBranch();if(!Array.isArray(bucket[cat]))bucket[cat]=[];let saved=bucket[cat];for(let i=0;i<defaults.length;i++){let id="preset-"+i;if(!saved.some(t=>t.id===id))saved.push({id,name:defaults[i],status:"todo",preset:true});}return saved.filter(t=>t&&!t.removed&&typeof t.name==="string"&&t.name.length<=100&&["todo","done","na"].includes(t.status));}
function saveReadiness(){try{localStorage.setItem(READINESS_KEY,JSON.stringify(readiness));}catch(e){alert("Unable to save readiness changes.");}}
function readinessStats(entries){let done=entries.filter(t=>t.status==="done").length,applicable=entries.filter(t=>t.status!=="na").length;return {done,applicable};}
function renderReadiness(){let cards=$("readinessCards");cards.replaceChildren();let all=[];Object.keys(READINESS_CATEGORIES).forEach(cat=>{let cfg=READINESS_CATEGORIES[cat],entries=readinessEntries(cat),s=readinessStats(entries);all.push(...entries);let card=el("button","readiness-card"),symbol=el("span","readiness-symbol",cfg.icon),heading=el("strong","",cat),desc=el("small","",cfg.description),count=el("span","muted",s.done+" of "+s.applicable+" completed");card.type="button";card.append(symbol,heading,desc,count);let bar=el("div","readiness-mini-bar"),fill=el("div");fill.style.width=(s.applicable?Math.round(s.done/s.applicable*100):100)+"%";bar.append(fill);card.append(bar);card.onclick=()=>{activeReadinessCategory=cat;renderReadiness();window.scrollTo(0,0);};cards.append(card);});let total=readinessStats(all);$("readinessSummary").textContent=total.done+" of "+total.applicable+" applicable tasks completed • "+state.branch;$("homeReadiness").textContent=total.done+" of "+total.applicable;
renderTimelineGuide();let detail=$("readinessDetail");detail.hidden=!activeReadinessCategory;$("readinessDashboard").hidden=!!activeReadinessCategory;
if(activeReadinessCategory){let cat=activeReadinessCategory,cfg=READINESS_CATEGORIES[cat],entries=readinessEntries(cat),s=readinessStats(entries);$("readinessTitle").textContent=cat;$("readinessDescription").textContent=cfg.description+" • "+state.branch;$("categorySummary").textContent=s.done+" of "+s.applicable+" applicable tasks completed";let list=$("readinessTaskList");list.replaceChildren();entries.forEach(t=>{let row=el("div","readiness-task"),info=el("div","readiness-task-info"),name=el("strong","",t.name),status=el("small","",t.status==="done"?"Completed":t.status==="na"?"Not Applicable":"To Do");info.append(name,status);let controls=el("div","readiness-controls"),select=el("select");select.setAttribute("aria-label","Status for "+t.name);[["todo","To Do"],["done","Completed"],["na","Not Applicable"]].forEach(([v,label])=>{let o=el("option","",label);o.value=v;select.append(o);});select.value=t.status;select.onchange=()=>{t.status=select.value;saveReadiness();renderReadiness();};controls.append(select);let del=el("button","delete","×");del.type="button";del.setAttribute("aria-label","Remove "+t.name);del.onclick=()=>{if(confirm("Remove this task?")){let bucket=readinessBranch()[cat];readinessBranch()[cat]=bucket.filter(x=>x.id!==t.id);if(t.preset){readinessBranch()[cat].push({...t,status:"todo",removed:true});}saveReadiness();renderReadiness();}};controls.append(del);row.append(info,controls);list.append(row);});}saveReadiness();}
$("restoreCategoryTasks").onclick=()=>{if(!activeReadinessCategory)return;const bucket=readinessBranch()[activeReadinessCategory]||[];let count=0;bucket.forEach(t=>{if(t.preset&&t.removed){t.removed=false;t.status="todo";count++;}});if(!count){alert("No removed suggestions to restore in this category.");return;}saveReadiness();renderReadiness();};
$("backReadiness").onclick=()=>{activeReadinessCategory=null;renderReadiness();};
$("categoryTaskForm").onsubmit=e=>{e.preventDefault();if(!activeReadinessCategory)return;let name=$("categoryTaskName").value.trim();if(!name||name.length>100)return;let list=readinessEntries(activeReadinessCategory);if(list.length>=100){alert("This category is full.");return;}readinessBranch()[activeReadinessCategory].push({id:newId(),name,status:"todo",preset:false});$("categoryTaskName").value="";saveReadiness();renderReadiness();};

let state=read(),categoryFilter="All",bagFilter="All",editingId=null;
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){alert("Saving failed. Check available browser storage.");}}
function el(tag,cls,text){let e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;}
function options(select,values){values.forEach(v=>{let o=el("option","",v);o.value=v;select.append(o);});}
options($("newCategory"),CATEGORIES);options($("editCategory"),CATEGORIES);options($("newBag"),BAGS);options($("editBag"),BAGS);options($("bagFilter"),["All",...BAGS]);
function render(){
 renderExtras();
 $("branch").value=state.branch;$("bagFilter").value=bagFilter;
 let total=state.items.length,packed=state.items.filter(x=>x.packed).length,pct=total?Math.round(packed/total*100):0;
 $("percent").textContent=pct+"%";$("total").textContent=total;$("packed").textContent=packed;$("remaining").textContent=total-packed;$("progressBar").style.width=pct+"%";
 let bars=$("bagProgress");bars.replaceChildren();
 BAGS.forEach(b=>{let items=state.items.filter(x=>x.bag===b);if(!items.length)return;let n=items.filter(x=>x.packed).length,p=Math.round(n/items.length*100),line=el("div","bag-line");line.append(el("span","",b));let bar=el("div","mini-bar"),fill=el("div");fill.style.width=p+"%";bar.append(fill);line.append(bar,el("span","",p+"%"));bars.append(line);});
 if(!bars.childElementCount)bars.append(el("span","muted","Assign items to bags to see their progress."));
 let filters=$("filters");filters.replaceChildren();["All",...CATEGORIES].forEach(c=>{let b=el("button",c===categoryFilter?"active":"",c);b.type="button";b.onclick=()=>{categoryFilter=c;render();};filters.append(b);});
 let list=$("itemList");list.replaceChildren();let visible=state.items.filter(x=>(categoryFilter==="All"||x.category===categoryFilter)&&(bagFilter==="All"||x.bag===bagFilter));$("empty").hidden=visible.length>0;$("visibleCount").textContent=`Showing ${visible.length} of ${total} packing items`;
 visible.forEach(x=>{let row=el("div","item"+(x.packed?" done":"")),check=el("input");check.type="checkbox";check.checked=x.packed;check.setAttribute("aria-label","Packed: "+x.name);check.onchange=()=>{x.packed=check.checked;save();render();};let info=el("div","item-info"),name=el("div","name",x.name);info.append(name,el("small","details",x.category+" • "+x.bag));let suggestion=quantitySuggestion(x.name,x.category);if(suggestion)info.append(el("small","quantity-hint",suggestion));let actions=el("div","item-actions"),edit=el("button","edit","Edit");edit.type="button";edit.setAttribute("aria-label","Edit "+x.name);edit.onclick=()=>openEdit(x.id);let del=el("button","delete","×");del.type="button";del.setAttribute("aria-label","Remove "+x.name);del.onclick=()=>{if(confirm("Remove "+x.name+"?")){state.items=state.items.filter(i=>i.id!==x.id);save();render();}};actions.append(edit,del);row.append(check,info,actions);list.append(row);});
}
function openEdit(id){let x=state.items.find(i=>i.id===id);if(!x)return;editingId=id;$("editName").value=x.name;$("editCategory").value=x.category;$("editBag").value=x.bag;$("editDialog").showModal();}
$("editForm").onsubmit=e=>{e.preventDefault();let x=state.items.find(i=>i.id===editingId),name=$("editName").value.trim();if(!x||!name||name.length>100)return;x.name=name;x.category=$("editCategory").value;x.bag=$("editBag").value;save();$("editDialog").close();render();};
$("cancelEdit").onclick=()=>$("editDialog").close();
$("branch").onchange=e=>{state.branch=e.target.value;save();render();};
$("bagFilter").onchange=e=>{bagFilter=e.target.value;render();};
$("loadTemplate").onclick=()=>{let existing=new Set(state.items.map(x=>x.name.toLocaleLowerCase()));let missing=starter(state.branch).filter(x=>!existing.has(x.name.toLocaleLowerCase()));if(!missing.length){alert("All suggested items for this branch are already on your list.");return;}if(state.items.length+missing.length>5000){alert("List is full.");return;}if(confirm("Add "+missing.length+" suggested items for "+state.branch+"? Existing items will be kept.")){state.items.push(...missing);save();render();}};
$("addForm").onsubmit=e=>{e.preventDefault();let name=$("newName").value.trim();if(!name||name.length>100)return;if(state.items.length>=5000){alert("List is full.");return;}state.items.push(item(name,$("newCategory").value,$("newBag").value));$("newName").value="";save();render();};
$("reset").onclick=()=>{if(confirm("Replace your entire list with the starter list for "+state.branch+"? This deletes custom items and packed statuses. Export a backup first if needed.")){state.items=starter(state.branch);categoryFilter="All";bagFilter="All";save();render();}};
$("clearPacked").onclick=()=>{if(confirm("Mark every item as unpacked?")){state.items.forEach(x=>x.packed=false);save();render();}};
$("export").onclick=()=>{let blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="deployment-ready-v3-packing-backup.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
$("import").onchange=async e=>{let f=e.target.files[0];if(!f)return;try{let raw=JSON.parse(await f.text()),x=validState(raw)?raw:migrateOld(raw);if(!x)throw Error("invalid");if(confirm("Replace your current packing list with this backup?")){state=x;categoryFilter="All";bagFilter="All";save();render();}}catch(err){alert("This is not a valid Deployment Ready backup.");}e.target.value="";};
save();render();if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));

// V3: simple navigation and optional preparation features.
document.querySelectorAll("[data-page]").forEach(b=>b.onclick=()=>showPage(b.dataset.page));
document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>showPage(b.dataset.go));
$("homeBranch").onchange=e=>{state.branch=e.target.value;save();render();};
$("taskForm").onsubmit=e=>{e.preventDefault();let name=$("taskName").value.trim();if(!name)return;if(tasks.length>=1000){alert("Task list is full.");return;}tasks.push({id:newId(),name,done:false});$("taskName").value="";saveExtra();renderExtras();};
$("restoreTasks").onclick=()=>{let existing=new Set(tasks.map(x=>x.name.toLowerCase()));let missing=SUGGESTED_TASKS.filter(x=>!existing.has(x.toLowerCase()));if(!missing.length){alert("All suggested tasks are already on your list.");return;}missing.forEach(name=>tasks.push({id:newId(),name,done:false}));saveExtra();renderExtras();};
$("targetDate").onchange=e=>{settings.date=e.target.value;saveExtra();renderExtras();};
$("clearDate").onclick=()=>{settings.date="";saveExtra();renderExtras();};
$("saveDuration").onclick=()=>{let raw=$("durationValue").value.trim(),n=Number(raw);if(raw&&(!Number.isInteger(n)||n<1||n>120)){alert("Enter a whole number from 1 to 120, or leave it blank.");return;}settings.durationValue=raw? n:"";settings.durationUnit=$("durationUnit").value;saveExtra();renderDuration();render();};
renderDuration();
showPage("home");saveExtra();renderExtras();


// V5 Stage 1: explicit phase selection and versioned, local full backups.
const PHASE_KEY="deployment-ready-v5-phase";
const PHASES=["preparing","deployed","returning"];
function loadPhase(){try{const p=localStorage.getItem(PHASE_KEY);return PHASES.includes(p)?p:"preparing";}catch(e){return "preparing";}}
let deploymentPhase=loadPhase();
function updatePhaseUI(){
 document.querySelectorAll("[data-phase]").forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.phase===deploymentPhase)));
 let msg="You are viewing the "+({preparing:"Preparing",deployed:"Deployed",returning:"Returning"}[deploymentPhase])+" phase. All your existing checklists remain available.";
 if(settings.date&&/^\d{4}-\d{2}-\d{2}$/.test(settings.date)){
  const d=new Date(settings.date+"T00:00:00");
  if(!Number.isNaN(d.getTime())&&d<new Date()&&deploymentPhase==="preparing")msg+=" Your target date has passed; switch phases when you're ready.";
 }
 $("phaseStatus").textContent=msg;
}
document.querySelectorAll("[data-phase]").forEach(button=>button.onclick=()=>{
 const phase=button.dataset.phase;if(!PHASES.includes(phase))return;
 try{localStorage.setItem(PHASE_KEY,phase);deploymentPhase=phase;updatePhaseUI();}catch(e){alert("Could not save your deployment phase. Check device storage.");}
});
$("targetDate").addEventListener("change",updatePhaseUI);
$("clearDate").addEventListener("click",updatePhaseUI);
updatePhaseUI();
const BACKUP_KEYS=[KEY,SETTINGS_KEY,TASKS_KEY,READINESS_KEY,PHASE_KEY];
function getBackupData(){
 // Capture the actual stored JSON values without rewriting or migrating users' data.
 const data={};for(const key of BACKUP_KEYS){const value=localStorage.getItem(key);data[key]=value===null?null:(key===PHASE_KEY?value:JSON.parse(value));}
 return {format:"deployment-ready-full-backup",version:1,exportedAt:new Date().toISOString(),data};
}
function downloadFullBackup(){
 try{
  const json=JSON.stringify(getBackupData(),null,2),blob=new Blob([json],{type:"application/json"});
  const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="deployment-ready-full-backup-"+new Date().toISOString().slice(0,10)+".json";
  document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
  $("backupStatus").textContent="Backup download requested. Check your Downloads or Files app.";
 }catch(e){$("backupStatus").textContent="Backup could not be created. No data was changed.";}
}
$("exportAll").onclick=downloadFullBackup;
function validSettingsBackup(v){return v&&typeof v==="object"&&!Array.isArray(v)&&typeof v.date==="string"&&v.date.length<=10&&(v.durationValue===""||(Number.isInteger(v.durationValue)&&v.durationValue>=1&&v.durationValue<=120))&&["days","weeks","months"].includes(v.durationUnit);}
function validTasksBackup(v){return Array.isArray(v)&&v.length<=1000&&v.every(t=>t&&typeof t.id==="string"&&t.id.length<=120&&typeof t.name==="string"&&t.name.length<=100&&typeof t.done==="boolean");}
function validReadinessBackup(v){
 if(!v||typeof v!=="object"||Array.isArray(v)||Object.keys(v).some(k=>!BRANCHES.includes(k)))return false;
 return Object.values(v).every(branch=>branch&&typeof branch==="object"&&!Array.isArray(branch)&&Object.entries(branch).every(([category,entries])=>Object.hasOwn(READINESS_CATEGORIES,category)&&Array.isArray(entries)&&entries.length<=500&&entries.every(t=>t&&typeof t.id==="string"&&t.id.length<=120&&typeof t.name==="string"&&t.name.length<=100&&["todo","done","na"].includes(t.status)&&typeof t.preset==="boolean"&&(t.removed===undefined||typeof t.removed==="boolean"))));
}
function validateFullBackup(b){
 if(!b||b.format!=="deployment-ready-full-backup"||b.version!==1||!b.data||typeof b.data!=="object"||Array.isArray(b.data))return false;
 if(Object.keys(b.data).length!==BACKUP_KEYS.length||BACKUP_KEYS.some(k=>!Object.hasOwn(b.data,k)))return false;
 const d=b.data;
 return validState(d[KEY])&&(d[SETTINGS_KEY]===null||validSettingsBackup(d[SETTINGS_KEY]))&&(d[TASKS_KEY]===null||validTasksBackup(d[TASKS_KEY]))&&(d[READINESS_KEY]===null||validReadinessBackup(d[READINESS_KEY]))&&(d[PHASE_KEY]===null||PHASES.includes(d[PHASE_KEY]));
}
let pendingRestore=null;
function clearRestore(){pendingRestore=null;$("restorePreview").hidden=true;$("importAll").value="";}
$("importAll").onchange=async e=>{
 const file=e.target.files[0];clearRestore();if(!file)return;
 try{
  if(file.size>3000000)throw Error("too large");
  const parsed=JSON.parse(await file.text());if(!validateFullBackup(parsed))throw Error("invalid");
  pendingRestore=parsed;
  const d=parsed.data;
  $("restoreDetails").textContent="Created: "+(typeof parsed.exportedAt==="string"?parsed.exportedAt.slice(0,10):"Unknown")+"\nBranch: "+d[KEY].branch+"\nPacking items: "+d[KEY].items.length+"\nLegacy reminders: "+(d[TASKS_KEY]?.length||0)+"\nReadiness: "+(d[READINESS_KEY]?"Included":"Not included")+"\nPhase: "+(d[PHASE_KEY]||"Preparing (default)");
  $("restorePreview").hidden=false;$("backupStatus").textContent="Valid backup loaded. Nothing has been replaced yet.";
 }catch(err){$("backupStatus").textContent="Invalid or unsupported full backup. Your current data is unchanged.";}
};
$("backupBeforeRestore").onclick=downloadFullBackup;
$("cancelRestore").onclick=()=>{clearRestore();$("backupStatus").textContent="Restore canceled. Your data is unchanged.";};
$("confirmRestore").onclick=()=>{
 if(!pendingRestore||!validateFullBackup(pendingRestore))return;
 if(!confirm("Replace your current Deployment Ready data with this backup? This cannot be undone unless you saved a separate backup."))return;
 const previous={};
 try{
  for(const k of BACKUP_KEYS)previous[k]=localStorage.getItem(k);
  for(const k of BACKUP_KEYS){const value=pendingRestore.data[k];if(value===null)localStorage.removeItem(k);else localStorage.setItem(k,k===PHASE_KEY?value:JSON.stringify(value));}
  clearRestore();alert("Backup restored successfully. The app will reload now.");location.reload();
 }catch(err){
  try{for(const k of BACKUP_KEYS){if(previous[k]===null)localStorage.removeItem(k);else if(previous[k]!==undefined)localStorage.setItem(k,previous[k]);}}catch(rollbackError){}
  $("backupStatus").textContent="Restore failed. We attempted to preserve the previous data. Please check your information.";
 }
};
