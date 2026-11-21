'use strict';
const heroPhoto = document.querySelector('.hero-backdrop');
if (heroPhoto) {
  const start = () => heroPhoto.classList.add('is-ready');
  if (heroPhoto.complete && heroPhoto.naturalWidth) start();
  else heroPhoto.addEventListener('load', start, { once: true });
}

for (const button of document.querySelectorAll('.why-card-toggle')) {
  const card = button.closest('article');
  const front = card.querySelector('.why-card-front');
  const back = document.getElementById(button.getAttribute('aria-controls'));
  const title = front.querySelector('h3').textContent;
  button.addEventListener('click', () => {
    const turned = button.getAttribute('aria-expanded') === 'false';
    button.setAttribute('aria-expanded', String(turned));
    front.setAttribute('aria-hidden', String(turned));
    back.setAttribute('aria-hidden', String(!turned));
    button.textContent = turned ? 'Назад' : 'Подробнее';
    button.setAttribute('aria-label', (turned ? 'Назад: ' : 'Подробнее: ') + title);
  });
  button.hidden = false;
}

const $ = s => document.querySelector(s);
const form = $('#request-form');
const date = $('#date');
const service = $('#service');
const room = $('#room');
const result = $('#draft-result');
const draft = $('#draft');
const copyStatus = $('#copy-status');
const VK_CHAT = 'https://vk.me/location35';
let selectedPackage = '';
let selectedActivity = '';
const money = n => n.toLocaleString('ru-RU') + ' ₽';
const today = new Date();
const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0,10);
date.min = localToday;
const go = () => $('#request').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});
function resetDraft(){ copyStatus.textContent=''; $('#draft-actions').hidden=true; }
function updateDraft(){ const ready=Boolean(date.value)&&+$('#guests').value>=1&&form.checkValidity(); result.hidden=!ready; draft.value=ready?buildDraft():''; }
function quote(){
  const d=date.value, s=service.value, hours=+$('#hours').value;
  const hourly=['rent','game-self'].includes(s);
  $('#hours-field').hidden=!hourly; $('#hours').disabled=!hourly;
  if(!d) return {text:'Выберите дату — покажем предварительную стоимость'};
  if(s==='newyear'||d>='2026-12-20') return {text:'Стоимость на праздничные даты уточним при обращении'};
  if(s==='game-host') return +$('#guests').value>10?{text:'Игра с ведущим рассчитана на компанию до 10 человек. Для большей компании уточним формат.'}:{amount:5000,text:'5 000 ₽ · 2 часа с ведущим · до 10 человек'};
  if(s==='game-open') return {amount:600*(+$('#guests').value||1),text:'600 ₽ с человека · 2 часа открытой игры. Дата требует подтверждения'};
  if(s==='quiz') return {amount:3000,text:'3 000 ₽ за квиз · 1 час. Аренду комнаты и индивидуальную тему уточним отдельно'};
  if(s==='game-self') return hours>=1&&hours<=24?{amount:1300*hours,text:money(1300*hours)+' · '+hours+' ч без ведущего'}:{text:'Укажите длительность от 1 до 24 часов'};
  const i=window.rooms.findIndex(r=>r.name===room.value);
  if(i<0) return {text:'Выберите Эко, Арт или Мульти для расчёта'};
  const day=new Date(d+'T12:00:00').getDay(), weekend=day===0||day>=5?1:0;
  const pack=window.packages.find(p=>p.name===s);
  const amount=pack?pack.prices[i][weekend]:(hours>=1&&hours<=24?window.rooms[i].rates[weekend]*hours:null);
  return amount?{amount,text:money(amount)+' · '+room.value+' · '+(pack?'пакет '+pack.name:hours+' ч аренды')}:{text:'Укажите длительность от 1 до 24 часов'};
}
function refresh(){const q=quote();$('#estimate').textContent=q.text+(q.amount?' — предварительно. Итоговую стоимость подтвердит администратор.':'');updateDraft();}
function choose(values){
  if(values.room)room.value=values.room;
  if(values.service)service.value=values.service;
  selectedPackage=values.package||'';selectedActivity=values.activity||'';
  if(values.event)$('#event').value=values.event;
  $('#selection-note').textContent=selectedActivity?'Вы выбрали: '+selectedActivity:selectedPackage?'Новогодний пакет «'+selectedPackage+'» · 20–30 декабря 2026':'';
  resetDraft();refresh();go();
}
document.querySelectorAll('[data-room]').forEach(b=>b.addEventListener('click',()=>choose({room:b.dataset.room,service:'rent'})));
document.querySelectorAll('[data-game]').forEach(b=>b.addEventListener('click',()=>choose({room:'Игровое',service:'game-'+b.dataset.game,event:'Игровой вечер'})));
document.querySelectorAll('[data-package]').forEach(b=>b.addEventListener('click',()=>choose({service:'newyear',package:b.dataset.package,event:'Корпоратив'})));
document.querySelectorAll('[data-standard-package]').forEach(b=>b.addEventListener('click',()=>choose({service:b.dataset.standardPackage,room:window.rooms[+$('#package-room').value].name})));
document.querySelectorAll('[data-quiz]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();choose({service:'quiz',activity:'Квиз'});}));
function updatePackages(){const i=+$('#package-room').value,d=+$('#package-day').value;window.packages.forEach(p=>{const el=document.querySelector('[data-price="'+p.name+'"]');el.textContent=money(p.prices[i][d]);el.nextElementSibling.textContent='За всю компанию · '+window.rooms[i].name+' · '+(d?'Пт–Вс':'Пн–Чт');});}
$('#package-room').addEventListener('change',updatePackages);$('#package-day').addEventListener('change',updatePackages);
form.addEventListener('input',()=>{date.setCustomValidity('');resetDraft();refresh();});
form.addEventListener('change',()=>{resetDraft();refresh();});
service.addEventListener('change', () => {
  selectedPackage = '';
  const isHostedGame = ['game-host', 'game-open'].includes(service.value);
  if (!isHostedGame || !['Мафия', 'Бункер'].includes(selectedActivity)) selectedActivity = '';
  $('#selection-note').textContent = selectedActivity ? 'Вы выбрали: ' + selectedActivity : '';
  if (service.value.startsWith('game-')) room.value = 'Игровое';
  refresh();
});
room.addEventListener('change',()=>{if(service.value.startsWith('game-')&&room.value!=='Игровое'){service.value='rent';selectedActivity='';$('#selection-note').textContent='';}if(room.value==='Игровое'&&!['newyear','quiz','game-host','game-open'].includes(service.value))service.value='game-self';refresh();});
function buildDraft(){
  const n=+$('#guests').value,r=window.rooms.find(r=>r.name===room.value),q=quote();
  const capacity=r?.max ?? (room.value==='Игровое'?14:null);
  const caution=capacity&&n>capacity?' По описанию комната меньше нашей компании — предложите подходящий вариант.':'';
  const activity=selectedActivity?' · '+selectedActivity:'';
  const label=service.options[service.selectedIndex].textContent;
  return 'Здравствуйте! Хочу забронировать праздник.\nПовод: '+$('#event').value+'.\nДата: '+date.value.split('-').reverse().join('.')+'.\nГостей: '+n+'.\nПространство: '+room.value+'.\nФормат: '+label+activity+(selectedPackage?' «'+selectedPackage+'»':'')+'.'+(['rent','game-self'].includes(service.value)?'\nДлительность: '+$('#hours').value+' ч.':'')+(q.amount?'\nПредварительно по тарифу: '+money(q.amount)+', без дополнительных услуг.':'\nСтоимость прошу уточнить.')+caution+'\nПодскажите, свободно ли это время и как подтвердить бронь?';
}
async function copyText(text){
  try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text);return true;}}catch{}
  draft.focus();draft.select();
  try{return document.execCommand('copy');}catch{return false;}
}
form.addEventListener('submit',async e=>{
  e.preventDefault();
  if(date.value<localToday){date.setCustomValidity('Выберите сегодняшнюю или будущую дату');date.reportValidity();return;}
  if(service.value==='newyear'&&(date.value<'2026-12-20'||date.value>'2026-12-30')){date.setCustomValidity('Новогодние пакеты действуют 20–30 декабря 2026');date.reportValidity();return;}
  if(!form.reportValidity())return;
  draft.value=buildDraft();result.hidden=false;$('#draft-actions').hidden=false;copyStatus.textContent='Готовим сообщение…';
  const popup=window.open('about:blank','_blank');if(popup)popup.opener=null;
  const copied=await copyText(draft.value);
  if(copied){
    copyStatus.textContent=popup?'Текст скопирован. В открывшемся ВК вставьте его в диалог и отправьте.':'Текст скопирован. Откройте сообщения ВК по ссылке ниже, вставьте текст и отправьте.';
    if(popup)popup.location.replace(VK_CHAT);
  }else{
    if(popup)popup.close();copyStatus.textContent='Браузер не разрешил скопировать автоматически. Текст выделен: скопируйте его вручную, затем откройте сообщения ВК.';draft.focus();draft.select();
  }
});
$('#copy').addEventListener('click',async()=>{const copied=await copyText(draft.value);copyStatus.textContent=copied?'Текст скопирован. Вставьте его в сообщения «Локации» и отправьте.':'Текст выделен. Нажмите Ctrl+C или выберите «Копировать», затем откройте ВК.';});
const params=new URLSearchParams(location.search);const requestedRoom=params.get('room');const requestedService=params.get('service');
if([...room.options].some(o=>o.value===requestedRoom))room.value=requestedRoom;
if([...service.options].some(o=>o.value===requestedService))service.value=requestedService;
if(['Мафия','Бункер','Квиз'].includes(params.get('activity')))selectedActivity=params.get('activity');
if(selectedActivity){$('#selection-note').textContent='Вы выбрали: '+selectedActivity;$('#event').value='Игровой вечер';}
refresh();updatePackages();
for (const track of document.querySelectorAll('#guest-track, #review-track')) {
  const controls = document.querySelectorAll(`[data-carousel="${track.id}"]`);
  const items = [...track.children];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const sync = () => {
    for (const button of controls) {
      button.disabled = Number(button.dataset.direction) < 0
        ? track.scrollLeft <= 2
        : track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    }
  };

  for (const button of controls) {
    button.addEventListener('click', () => {
      const current = track.scrollLeft;
      const starts = items.map(item => item.offsetLeft - items[0].offsetLeft);
      const left = Number(button.dataset.direction) > 0
        ? (starts.find(start => start > current + 2) ?? track.scrollWidth)
        : (starts.findLast(start => start < current - 2) ?? 0);
      track.scrollTo({ left, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    });
  }

  track.addEventListener('scroll', sync, { passive: true });
  window.addEventListener('resize', sync);
  sync();
}

function updatePackagePhoto() {
  const { id } = window.rooms[Number($('#package-room').value)];
  const photo = $('#room-list .room-image.' + id + ' img');
  const cover = $('#package-cover');
  cover.src = photo.src;
  cover.alt = photo.alt;
}
$('#package-room').addEventListener('change', updatePackagePhoto);
updatePackagePhoto();
