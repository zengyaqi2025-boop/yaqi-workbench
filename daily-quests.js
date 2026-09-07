/* Private, local-only daily planning. Deliberately excluded from legacy cloud state. */
(function () {
  'use strict';
  var KEY='yaqi_quests_v1', data={tasks:[]}, box=document.createElement('section');
  try { var saved=JSON.parse(localStorage.getItem(KEY)); if(saved&&Array.isArray(saved.tasks))data=saved; } catch(e) {}
  box.style.cssText='padding:20px;margin:0 0 24px;background:#f5f0fa;border:1px solid #d9c8ed;border-radius:18px;color:#302642';
  var main=document.querySelector('main'); if(!main)return; main.prepend(box);
  function day(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
  var selected=day();
  function el(tag,text){var n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;}
  function persist(){try{localStorage.setItem(KEY,JSON.stringify(data));return true;}catch(e){alert('本地保存失败，请先导出备份。');return false;}}
  function download(){var a=el('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));a.download='雅祺每日闯关-'+day()+'.json';a.click();setTimeout(function(){URL.revokeObjectURL(a.href);},1000);}
  function button(text,fn){var b=el('button',text);b.type='button';b.style.cssText='margin:4px;padding:8px 12px;border:1px solid #c9b4de;border-radius:10px;background:white;cursor:pointer';b.onclick=fn;return b;}
  function render(){
    box.replaceChildren();box.append(el('h2','🌱 每日闯关 · 把目标长成行动'));
    box.append(el('p','目标 → 本周成果 → 每日最多 3 个主线任务 + 1 个内容习惯。休息不扣分，未完成可重新安排。'));
    var info=el('p','🔒 此面板仅保存在当前浏览器，不上传旧的匿名云端。换设备请导出并导入；这不是自动同步。');info.style.fontSize='12px';box.append(info);
    var date=el('input');date.type='date';date.value=selected;date.setAttribute('aria-label','闯关日期');date.onchange=function(){selected=date.value||day();render();};box.append(date);
    box.append(button('导出闯关备份',download));
    var file=el('input');file.type='file';file.accept='.json';file.hidden=true;
    file.onchange=function(){if(!file.files[0])return;var r=new FileReader();r.onload=function(){try{
      var incoming=JSON.parse(r.result);if(!Array.isArray(incoming.tasks)||incoming.tasks.length>1000)throw Error('格式不正确');
      var valid=incoming.tasks.map(function(t){if(!t.id||!t.title||!/^\d{4}-\d{2}-\d{2}$/.test(t.date))throw Error('任务缺少编号、标题或日期');return {id:String(t.id),title:String(t.title),goal:String(t.goal||''),result:String(t.result||''),date:t.date,habit:!!t.habit,done:!!t.done};});
      var count=0;valid.forEach(function(t){if(!data.tasks.some(function(x){return x.id===t.id;})){data.tasks.push(t);count++;}});
      persist();render();alert('已新增 '+count+' 个任务。已有同编号任务保留原进度。');
    }catch(e){alert('未导入：'+e.message);}};r.readAsText(file.files[0]);};box.append(file);box.append(button('合并导入计划',function(){file.click();}));
    var done=data.tasks.filter(function(t){return t.done;}).length;
    box.append(el('p','✨ '+done*10+' 成长值 · 已完成 '+done+'/'+data.tasks.length+' 项（按任务计数，不重复刷分）'));
    var goals=Array.from(new Set(data.tasks.map(function(t){return t.goal||'未分类';})));
    goals.forEach(function(g){var ts=data.tasks.filter(function(t){return (t.goal||'未分类')===g;});var n=ts.filter(function(t){return t.done;}).length;box.append(el('div',g+'：行动完成 '+n+'/'+ts.length+'（不代表营收或业务成果已达标）'));});
    var todays=data.tasks.filter(function(t){return t.date===selected;});
    box.append(el('h3',selected+' · 今日关卡'));
    if(!todays.length)box.append(el('p','这天还没有安排。导入计划，或添加一个小行动。'));
    if(todays.filter(function(t){return !t.habit;}).length>3)box.append(el('p','今天主线超过 3 项，建议把低优先级任务改期。'));
    todays.forEach(function(t){var row=el('div');row.style.cssText='padding:10px 0;border-bottom:1px solid #dfd3e9';var label=el('label'),check=el('input');check.type='checkbox';check.checked=t.done;check.onchange=function(){t.done=check.checked;persist();render();};label.append(check,document.createTextNode(' '+(t.habit?'🎬 ':'🎯 ')+t.title));row.append(label);row.append(el('div','验收：'+(t.result||'由你确认完成')));var move=el('input');move.type='date';move.value=t.date;move.setAttribute('aria-label','改期：'+t.title);move.onchange=function(){if(move.value){t.date=move.value;persist();render();}};row.append(move);box.append(row);});
    var overdue=data.tasks.filter(function(t){return !t.done&&t.date<selected;});box.append(el('p','待重新安排 '+overdue.length+' 项；不会自动算作完成。'));
    overdue.forEach(function(t){box.append(button('移到所选日：'+t.title,function(){t.date=selected;persist();render();}));});
    box.append(button('+ 添加行动',function(){var title=prompt('今天可完成的具体行动？');if(!title)return;var goal=prompt('它服务哪个目标？')||'未分类';var result=prompt('做到什么才算完成？')||'';data.tasks.push({id:'quest-'+Date.now()+'-'+Math.random().toString(36).slice(2),title:title,goal:goal,result:result,date:selected,done:false});persist();render();}));
  }
  render();
})();
