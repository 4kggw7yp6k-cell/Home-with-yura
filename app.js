
const STORAGE_KEY = "homeWithYuraWebV200a1";

const categories = {
  work:{title:"仕事",icon:"💼"}, rest:{title:"休日",icon:"☕"}, shopping:{title:"買い物",icon:"🛍️"},
  hospital:{title:"病院",icon:"🏥"}, craft:{title:"レジン・制作",icon:"🎨"}, outing:{title:"お出かけ",icon:"🚶"},
  anniversary:{title:"記念日",icon:"🎂"}, other:{title:"その他",icon:"🔖"}
};
const moods = {
  great:{emoji:"🤩",message:"今日はとてもいい顔をしているね。"},
  good:{emoji:"😊",message:"いい感じの日だね。この穏やかさを大切にしよう。"},
  normal:{emoji:"😐",message:"何でもない一日も、暮らしを作る大事な一日だよ。"},
  tired:{emoji:"😴",message:"今日は頑張ったね。休む時間も予定に入れよう。"},
  low:{emoji:"🥺",message:"今日は整える日ではなく、守る日にしよう。"}
};
const weather = {
  sunny:{label:"晴れ",icon:"☀️"}, cloudy:{label:"くもり",icon:"☁️"}, rain:{label:"雨",icon:"🌧️"},
  snow:{label:"雪",icon:"❄️"}, hot:{label:"暑い",icon:"🌡️"}
};

const defaults = {
  events:[],
  futureStock:[{id:crypto.randomUUID(),date:new Date().toISOString(),amount:20000,note:"今月の未来ストック"}],
  dailyLife:{},
  settings:{
    userName:"りゅう", monthlyIncome:270000, fixedCosts:147000, monthlyFlexibleBudget:30000,
    futureStockGoal:500000, homecomingEnabled:true, prefersDarkMode:false
  }
};
let state = load();
let activeTab = "home";
let calendarMonth = startOfMonth(new Date());
let selectedDate = startOfDay(new Date());

const $ = id => document.getElementById(id);
const yen = n => new Intl.NumberFormat("ja-JP",{style:"currency",currency:"JPY",maximumFractionDigits:0}).format(Number(n)||0);
const isoDay = d => {
  const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,"0")}-${String(x.getDate()).padStart(2,"0")}`;
};
const formatDate = d => new Intl.DateTimeFormat("ja-JP",{month:"long",day:"numeric",weekday:"long"}).format(d);
const formatMonth = d => new Intl.DateTimeFormat("ja-JP",{year:"numeric",month:"long"}).format(d);
const escapeHTML = s => String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));

function deepMerge(base, incoming){
  const o = structuredClone(base);
  if(!incoming || typeof incoming!=="object") return o;
  Object.keys(incoming).forEach(k=>{
    if(o[k] && typeof o[k]==="object" && !Array.isArray(o[k]) && typeof incoming[k]==="object" && !Array.isArray(incoming[k]))
      o[k]=deepMerge(o[k],incoming[k]);
    else o[k]=incoming[k];
  });
  return o;
}
function load(){
  try{return deepMerge(defaults,JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}"))}
  catch{return structuredClone(defaults)}
}
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));renderAll()}
function lifeFor(date=new Date()){
  const key=isoDay(date);
  if(!state.dailyLife[key]) state.dailyLife[key]={date:key,mood:null,weather:"sunny"};
  return state.dailyLife[key];
}
function startOfDay(d){const x=new Date(d);x.setHours(0,0,0,0);return x}
function startOfMonth(d){const x=startOfDay(d);x.setDate(1);return x}
function addMonths(d,n){const x=new Date(d);x.setMonth(x.getMonth()+n);return startOfMonth(x)}
function addDays(d,n){const x=new Date(d);x.setDate(x.getDate()+n);return x}
function sameDay(a,b){return isoDay(a)===isoDay(b)}
function eventsOn(date){
  return state.events.filter(e=>e.date===isoDay(date)).sort((a,b)=>(a.startTime||"99:99").localeCompare(b.startTime||"99:99"));
}
function totalFuture(){return state.futureStock.reduce((s,x)=>s+(Number(x.amount)||0),0)}
function timeProfile(date=new Date()){
  const h=date.getHours();
  if(h>=5 && h<11) return {key:"morning",label:"MORNING",image:"assets/yura_morning.png"};
  if(h>=11 && h<18) return {key:"day",label:"DAY",image:"assets/yura_day.png"};
  return {key:"night",label:"NIGHT",image:"assets/yura_night.png"};
}
function greeting(){
  const h=new Date().getHours(), name=state.settings.userName||"りゅう", mood=lifeFor().mood;
  if(h<10 && h>=5) return `おはよう、${name}。`;
  if(mood==="tired"||mood==="low") return "おかえり。今日はゆっくりしよう。";
  return h<18 && h>=10 ? `おかえり、${name}。` : "おかえり。今日もおつかれさま。";
}

function renderHero(){
  const p=timeProfile();
  const hero=$("hero");
  hero.className=`hero ${p.key}`;
  $("heroYura").src=p.image;
  $("heroPeriod").textContent=p.label;
  $("greeting").textContent=greeting();
  $("timeChip").textContent=p.key==="morning"?"朝のユラ":p.key==="day"?"昼のユラ":"夜のユラ";
  document.querySelector('meta[name="theme-color"]').content = state.settings.prefersDarkMode ? "#11151c" : "#edf2fb";
}

function renderHome(){
  const now=new Date(), life=lifeFor(now);
  $("todayLabel").textContent=formatDate(now);
  $("weatherButton").textContent=`${weather[life.weather]?.icon||"☀️"} ${weather[life.weather]?.label||"晴れ"}`;
  const ev=eventsOn(now);
  $("todayEvents").innerHTML=ev.length
    ? ev.slice(0,3).map(e=>`<div class="event-line"><span>${categories[e.category]?.icon||"🔖"}</span><span class="event-time">${e.isAllDay?"終日":e.startTime||"未定"}</span><span class="event-title">${escapeHTML(e.title)}</span></div>`).join("")
    : `<div class="empty-state">📅 予定を登録してみよう</div>`;
  $("moodButtons").innerHTML=Object.entries(moods).map(([k,v])=>`<button class="mood-button ${life.mood===k?"selected":""}" data-mood="${k}">${v.emoji}</button>`).join("");
  $("moodMessage").textContent = life.mood ? moods[life.mood].message : "急がなくても、続けていれば暮らしはちゃんと育っていくよ。";
  document.querySelectorAll("[data-mood]").forEach(b=>b.onclick=()=>{lifeFor().mood=b.dataset.mood;save()});

  const usable=Math.max(0,(+state.settings.monthlyIncome||0)-(+state.settings.fixedCosts||0)-(+state.settings.monthlyFlexibleBudget||0));
  $("usableMoney").textContent=yen(usable);
  const total=totalFuture(),goal=Math.max(1,+state.settings.futureStockGoal||1),pct=Math.min(100,total/goal*100);
  $("homeFutureTotal").textContent=yen(total); $("homeFutureBar").style.width=pct+"%";
}

function renderCalendar(){
  $("calendarTitle").textContent=formatMonth(calendarMonth);
  const first=new Date(calendarMonth);
  const gridStart=addDays(first,-first.getDay());
  let html="";
  for(let i=0;i<42;i++){
    const d=addDays(gridStart,i), dots=Math.min(3,eventsOn(d).length);
    html+=`<button class="day-cell ${d.getMonth()!==calendarMonth.getMonth()?"other":""} ${sameDay(d,selectedDate)?"selected":""} ${sameDay(d,new Date())?"today":""}" data-date="${isoDay(d)}">
      <span class="day-num">${d.getDate()}</span><span class="day-dots">${"<i></i>".repeat(dots)}</span>
    </button>`;
  }
  $("calendarGrid").innerHTML=html;
  document.querySelectorAll(".day-cell").forEach(b=>b.onclick=()=>{selectedDate=startOfDay(new Date(b.dataset.date+"T00:00:00"));renderCalendar()});
  $("selectedDateLabel").textContent=formatDate(selectedDate);
  const list=eventsOn(selectedDate);
  $("selectedEvents").innerHTML=list.length?list.map(e=>eventItemHTML(e)).join(""):`<div class="empty-state">この日の予定はまだありません。</div>`;
  document.querySelectorAll("[data-edit-event]").forEach(b=>b.onclick=()=>openEventEditor(b.dataset.editEvent));
}
function eventItemHTML(e){
  return `<div class="event-item">
    <span class="event-icon">${categories[e.category]?.icon||"🔖"}</span>
    <button data-edit-event="${e.id}">
      <div class="event-main"><strong>${escapeHTML(e.title)}</strong><small>${e.isAllDay?"終日":e.startTime||"時間未設定"}${e.memo?` ・ ${escapeHTML(e.memo)}`:""}</small></div>
    </button><span class="chevron">›</span>
  </div>`;
}

function renderFuture(){
  const total=totalFuture(), goal=Math.max(1,+state.settings.futureStockGoal||1), pct=Math.min(100,total/goal*100);
  $("futureTotal").textContent=yen(total); $("futureBar").style.width=pct+"%";
  $("futureGoalText").textContent=`目標まで ${yen(Math.max(0,goal-total))}`;
  const sorted=[...state.futureStock].sort((a,b)=>new Date(b.date)-new Date(a.date));
  $("futureHistory").innerHTML=sorted.length?sorted.map(x=>`
    <div class="future-item"><div class="event-main"><strong>${escapeHTML(x.note||"未来ストック")}</strong>
    <small>${new Intl.DateTimeFormat("ja-JP",{year:"numeric",month:"numeric",day:"numeric"}).format(new Date(x.date))}</small></div>
    <strong>${yen(x.amount)}</strong><button class="icon-button" data-del-future="${x.id}" aria-label="削除">×</button></div>`).join("")
    : `<div class="empty-state">まだ履歴はありません。</div>`;
  document.querySelectorAll("[data-del-future]").forEach(b=>b.onclick=()=>{
    if(confirm("この未来ストックを削除しますか？")){state.futureStock=state.futureStock.filter(x=>x.id!==b.dataset.delFuture);save()}
  });
}

function renderSettings(){
  ["userName","monthlyIncome","fixedCosts","monthlyFlexibleBudget","futureStockGoal"].forEach(id=>{
    $(id).value=state.settings[id]??"";
  });
  $("homecomingEnabled").checked=!!state.settings.homecomingEnabled;
  $("prefersDarkMode").checked=!!state.settings.prefersDarkMode;
  document.body.classList.toggle("dark",!!state.settings.prefersDarkMode);
}

function renderTabs(){
  document.querySelectorAll(".tab-page").forEach(p=>p.classList.toggle("active",p.id===`tab-${activeTab}`));
  document.querySelectorAll(".tabbar button").forEach(b=>b.classList.toggle("active",b.dataset.tab===activeTab));
}
function renderAll(){renderSettings();renderHero();renderHome();renderCalendar();renderFuture();renderTabs()}

function openEventEditor(id=null){
  const existing=id?state.events.find(x=>x.id===id):null;
  const e=existing||{id:"",title:"",category:"work",date:isoDay(selectedDate),startTime:"",endTime:"",memo:"",isAllDay:false};
  $("eventDialogTitle").textContent=existing?"予定を編集":"予定を追加";
  $("eventId").value=e.id||""; $("eventTitle").value=e.title||""; $("eventCategory").value=e.category||"work";
  $("eventDate").value=e.date||isoDay(selectedDate); $("eventAllDay").checked=!!e.isAllDay;
  $("eventStartTime").value=e.startTime||""; $("eventEndTime").value=e.endTime||""; $("eventMemo").value=e.memo||"";
  $("deleteEventBtn").classList.toggle("hidden",!existing);
  toggleTimeFields();
  $("eventDialog").showModal();
}
function toggleTimeFields(){$("timeFields").classList.toggle("hidden",$("eventAllDay").checked)}

function showHomecoming(){
  if(!state.settings.homecomingEnabled) return;
  const p=timeProfile();
  $("homecomingYura").src=p.image;
  $("homecomingTitle").textContent=greeting();
  $("homecoming").classList.remove("hidden");
  $("homecoming").setAttribute("aria-hidden","false");
}
function hideHomecoming(){
  $("homecoming").classList.add("hidden");$("homecoming").setAttribute("aria-hidden","true");
}

document.querySelectorAll(".tabbar button").forEach(b=>b.onclick=()=>{activeTab=b.dataset.tab;renderTabs();scrollTo({top:0,behavior:"smooth"})});
$("futureCardLink").onclick=()=>{activeTab="future";renderTabs();scrollTo({top:0,behavior:"smooth"})};
$("todayEventsButton").onclick=()=>{activeTab="calendar";selectedDate=startOfDay(new Date());calendarMonth=startOfMonth(new Date());renderAll();scrollTo({top:0,behavior:"smooth"})};

$("weatherButton").onclick=()=>$("weatherDialog").showModal();
$("weatherOptions").innerHTML=Object.entries(weather).map(([k,v])=>`<button type="button" data-weather="${k}">${v.icon} ${v.label}</button>`).join("");
document.querySelectorAll("[data-weather]").forEach(b=>b.onclick=()=>{lifeFor().weather=b.dataset.weather;save();$("weatherDialog").close()});

$("prevMonth").onclick=()=>{calendarMonth=addMonths(calendarMonth,-1);renderCalendar()};
$("nextMonth").onclick=()=>{calendarMonth=addMonths(calendarMonth,1);renderCalendar()};
$("todayBtn").onclick=()=>{selectedDate=startOfDay(new Date());calendarMonth=startOfMonth(new Date());renderCalendar()};
$("addEventBtn").onclick=()=>openEventEditor();
$("eventAllDay").onchange=toggleTimeFields;
$("cancelEventBtn").onclick=()=>$("eventDialog").close();
$("deleteEventBtn").onclick=()=>{
  const id=$("eventId").value;
  if(id&&confirm("この予定を削除しますか？")){state.events=state.events.filter(x=>x.id!==id);$("eventDialog").close();save()}
};
$("eventForm").onsubmit=e=>{
  e.preventDefault();
  const title=$("eventTitle").value.trim(); if(!title)return;
  const id=$("eventId").value||crypto.randomUUID();
  const item={id,title,category:$("eventCategory").value,date:$("eventDate").value,
    startTime:$("eventAllDay").checked?null:$("eventStartTime").value||null,
    endTime:$("eventAllDay").checked?null:$("eventEndTime").value||null,
    memo:$("eventMemo").value.trim(),isAllDay:$("eventAllDay").checked};
  const i=state.events.findIndex(x=>x.id===id); if(i>=0)state.events[i]=item;else state.events.push(item);
  $("eventDialog").close();save()
};

$("addFutureBtn").onclick=()=>{
  const amount=Number($("futureAmount").value),note=$("futureNote").value.trim();
  if(!(amount>0))return alert("金額を入力しておくれ。");
  state.futureStock.push({id:crypto.randomUUID(),date:new Date().toISOString(),amount,note});
  $("futureAmount").value="";$("futureNote").value="";save();
};

Object.keys(state.settings).forEach(id=>{
  if(!$(id))return;
  const event=$(id).type==="checkbox"?"change":"input";
  $(id).addEventListener(event,e=>{
    state.settings[id]=e.target.type==="checkbox"?e.target.checked:(e.target.type==="number"?Number(e.target.value)||0:e.target.value);
    localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
    renderAll();
  });
});

$("exportBtn").onclick=()=>{
  const payload={format:"HOME with YURA Web Ver.2.0",exportedAt:new Date().toISOString(),...state};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`HOME_with_YURA_backup_${isoDay(new Date())}.json`;a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
};
$("importInput").onchange=async e=>{
  const f=e.target.files[0];if(!f)return;
  try{
    const data=JSON.parse(await f.text());
    state=deepMerge(defaults,{events:data.events,futureStock:data.futureStock,dailyLife:data.dailyLife,settings:data.settings});
    save();alert("バックアップを読み込みました。");
  }catch(err){alert("バックアップを読み込めませんでした。")}
};
$("homecomingClose").onclick=hideHomecoming;

$("eventCategory").innerHTML=Object.entries(categories).map(([k,v])=>`<option value="${k}">${v.icon} ${v.title}</option>`).join("");

if("serviceWorker" in navigator) addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
renderAll();
setInterval(()=>{renderHero(); $("todayLabel").textContent=formatDate(new Date())},60*1000);
setTimeout(showHomecoming,180);
