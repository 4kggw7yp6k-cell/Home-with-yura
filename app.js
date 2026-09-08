
const KEY="homeWithYuraV001";
const defaultState={budget:0,spent:0,savings:0,savingsGoal:100000,memo:"",strict:false,tasks:[]};
let state=load();

const $=id=>document.getElementById(id);

function load(){
  try{return {...defaultState,...JSON.parse(localStorage.getItem(KEY)||"{}")}}
  catch{return {...defaultState}}
}
function save(){localStorage.setItem(KEY,JSON.stringify(state));render()}
function esc(s){return String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;")}

function render(){
  $("budget").value=state.budget||"";
  $("spent").value=state.spent||"";
  $("savings").value=state.savings||"";
  $("savingsGoal").value=state.savingsGoal||"";
  $("memo").value=state.memo||"";
  const remain=(+state.budget||0)-(+state.spent||0);
  $("remaining").textContent=remain.toLocaleString();
  const pct=Math.max(0,Math.min(100,((+state.savings||0)/(+state.savingsGoal||1))*100));
  $("saveBar").style.width=pct+"%";
  $("saveText").textContent=`${pct.toFixed(0)}% / 目標まで ${Math.max(0,(+state.savingsGoal||0)-(+state.savings||0)).toLocaleString()}円`;
  document.body.classList.toggle("strict",state.strict);
  $("modeBtn").textContent=state.strict?"久世モード":"通常モード";
  $("yuraTop").textContent=state.strict
    ? (remain<0?'久世「……説明してもらおうか。」':'久世「使う前に数字を見ろ。以上だ。」')
    : (remain<0?'ユラ「今月ちょっと使いすぎじゃぞ……？」':'ユラ「今日も帰ってきたのう。」');
  renderTasks();
}
function renderTasks(){
  const box=$("taskList");
  if(!state.tasks.length){box.innerHTML='<p class="muted">まだ予定はありません。</p>';return}
  box.innerHTML=state.tasks.map((t,i)=>`
    <div class="task ${t.done?'done':''}">
      <input type="checkbox" ${t.done?'checked':''} data-check="${i}">
      <span>${esc(t.text)}</span>
      <button class="delete" data-del="${i}">×</button>
    </div>`).join("");
  box.querySelectorAll("[data-check]").forEach(el=>el.onchange=()=>{state.tasks[+el.dataset.check].done=el.checked;save()});
  box.querySelectorAll("[data-del]").forEach(el=>el.onclick=()=>{state.tasks.splice(+el.dataset.del,1);save()});
}

["budget","spent","savings","savingsGoal"].forEach(id=>{
  $(id).addEventListener("input",e=>{state[id]=Number(e.target.value)||0;save()})
});
$("memo").addEventListener("input",e=>{state.memo=e.target.value;localStorage.setItem(KEY,JSON.stringify(state))});
$("modeBtn").onclick=()=>{state.strict=!state.strict;save()};
$("addTask").onclick=()=>{
  const text=prompt("やることを入力");
  if(text&&text.trim()){state.tasks.push({text:text.trim(),done:false});save()}
};

function reply(msg){
  const remain=(+state.budget||0)-(+state.spent||0);
  const pending=state.tasks.filter(t=>!t.done);
  if(msg.includes("使いすぎ")||msg.includes("お金")||msg.includes("家計")){
    if(state.strict) return remain<0?"久世「予算オーバーだ。追加支出は止めろ。」":`久世「残り${remain.toLocaleString()}円。数字を見てから使え。」`;
    return remain<0?"ユラ「今月は赤字じゃ……いったん追加支出を止めようぞ。」":`ユラ「今月はあと${remain.toLocaleString()}円使えるぞい。」`;
  }
  if(msg.includes("今日")||msg.includes("何した")){
    return pending.length?`ユラ「残ってるのは ${pending.slice(0,3).map(t=>t.text).join("、")} じゃな。ひとつずつ片付けようぞ。」`:"ユラ「今日の予定は空っぽじゃ。休むのも予定じゃぞ。」";
  }
  if(msg.includes("貯金")){
    const left=Math.max(0,(+state.savingsGoal||0)-(+state.savings||0));
    return `ユラ「目標まであと${left.toLocaleString()}円じゃ。」`;
  }
  return state.strict?"久世「要点を言え。数字なら見てやる。」":"ユラ「うむ、聞いておるぞ。家計か予定のことなら今のデータを見ながら答えられるぞい。」";
}
function sendChat(){
  const inp=$("chatInput"),msg=inp.value.trim();if(!msg)return;
  $("chatBox").insertAdjacentHTML("beforeend",`<div class="bubble user">${esc(msg)}</div>`);
  $("chatBox").insertAdjacentHTML("beforeend",`<div class="bubble yura">${esc(reply(msg))}</div>`);
  inp.value="";$("chatBox").scrollTop=$("chatBox").scrollHeight;
}
$("sendBtn").onclick=sendChat;
$("chatInput").addEventListener("keydown",e=>{if(e.key==="Enter")sendChat()});

$("exportBtn").onclick=()=>{
  const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="HOME_with_YURA_backup.json";a.click();URL.revokeObjectURL(a.href);
};
$("importInput").onchange=async e=>{
  const f=e.target.files[0];if(!f)return;
  try{state={...defaultState,...JSON.parse(await f.text())};save();alert("バックアップを読み込みました")}
  catch{alert("読み込みに失敗しました")}
};

const now=new Date();
$("todayText").textContent=new Intl.DateTimeFormat("ja-JP",{year:"numeric",month:"long",day:"numeric",weekday:"long"}).format(now);
const h=now.getHours();
$("greeting").textContent=h<5?"まだ夜じゃぞ。":h<11?"おはよう。":h<18?"おかえり。":"今日もおつかれさま。";

if("serviceWorker" in navigator) addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
render();
