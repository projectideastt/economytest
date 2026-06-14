async function loadSearch(){
  const res = await fetch('data/srch.json');
  return await res.json();
}
function score(item, q){
  const hay = (item.title+' '+item.report+' '+item.text).toLowerCase();
  let s = 0;
  for(const term of q){ if(hay.includes(term)) s += term.length; }
  return s;
}
function snippet(text, terms){
  const lower = text.toLowerCase();
  let pos = -1;
  for(const t of terms){ pos = lower.indexOf(t); if(pos>=0) break; }
  if(pos < 0) pos = 0;
  const start = Math.max(0, pos-90), end = Math.min(text.length, pos+220);
  let out = text.slice(start,end);
  for(const t of terms){ out = out.replace(new RegExp('('+t.replace(/[.*+?^${}()|[\]\]/g,'\$&')+')','ig'), '<mark>$1</mark>'); }
  return (start>0?'…':'') + out + (end<text.length?'…':'');
}
loadSearch().then(items=>{
  const input = document.getElementById('q');
  const results = document.getElementById('results');
  const count = document.getElementById('count');
  function run(){
    const raw = input.value.trim().toLowerCase();
    const terms = raw.split(/\s+/).filter(Boolean);
    if(!terms.length){ results.innerHTML='<p class="empty">Type to search extracted report text.</p>'; count.textContent=''; return; }
    const hits = items.map(x=>({...x,_score:score(x,terms)})).filter(x=>x._score>0).sort((a,b)=>b._score-a._score).slice(0,50);
    count.textContent = hits.length + ' result' + (hits.length===1?'':'s');
    results.innerHTML = hits.map(h=>`<div class="result"><h3><a href="${h.url}">${h.title}</a></h3><div class="meta">${h.report} · ${h.page}</div><p>${snippet(h.text,terms)}</p></div>`).join('') || '<p class="empty">No matching text found.</p>';
  }
  input.addEventListener('input', run);
  run();
});