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
const guests = $('#guests');
const roomNote = $('#room-note');
const roomPreview = $('.request-room-preview');
const roomPreviewPhoto = roomPreview.querySelector('img');
const roomPreviewLink = roomPreview.querySelector('a');
const GAME_ROOM = 'Игровое';
const ROOM_HELP = 'Помогите выбрать';
const roomCatalog = [...window.rooms, { id: 'game', name: GAME_ROOM, max: 14 }];
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
const go = (target = $('#request')) => target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});
function resetDraft(){ copyStatus.textContent=''; $('#draft-actions').hidden=true; }
function updateDraft(){ const ready=Boolean(date.value)&&+$('#guests').value>=1&&form.checkValidity(); result.hidden=!ready; draft.value=ready?buildDraft():''; }
function packageFor(format) {
  return window.packages.find(pack => pack.name === format);
}

function rateDay(day) {
  const weekday = new Date(day + 'T12:00:00').getDay();
  return weekday === 0 || weekday >= 5 ? 1 : 0;
}

function holidayPricing(day) {
  return day >= '2026-12-20';
}

function syncRoomOptions(preferredRoom) {
  const pack = packageFor(service.value);
  const gameOnly = service.value.startsWith('game-');
  const possible = roomCatalog.filter(info =>
    gameOnly ? info.id === 'game' : !pack || info.id !== 'game'
  );
  const available = possible
    .map(info => ({ ...info, limit: info.id === 'game' && service.value === 'game-host' ? 10 : info.max }))
    .filter(info => Number(guests.value) <= info.limit);

  const labels = available.map(info => {
    const limit = 'до ' + info.limit + (pack ? '' : ' гостей');
    const label = info.name + ' · ' + limit;
    if (!pack || holidayPricing(date.value)) return label;
    const prices = pack.prices[window.rooms.findIndex(candidate => candidate.id === info.id)];
    return label + ' · ' + (date.value ? money(prices[rateDay(date.value)]) : 'от ' + money(Math.min(...prices)));
  });
  const current = [...room.options].slice(1);
  if (current.length !== available.length ||
      current.some((option, index) => option.value !== available[index].name || option.textContent !== labels[index])) {
    room.replaceChildren(new Option(ROOM_HELP), ...available.map((info, index) => new Option(labels[index], info.name)));
  }

  const selected = available.find(info => info.name === preferredRoom) || (gameOnly ? available[0] : undefined);
  room.value = selected?.name ?? ROOM_HELP;

  const note = !available.length
    ? 'В этом формате нет комнаты на такое количество гостей. Можно попросить администратора предложить другой вариант.'
    : available.length < possible.length ? 'В списке только комнаты, которые вмещают вашу компанию.' : '';
  roomNote.textContent = note;
  roomNote.hidden = !note;

  roomPreview.hidden = !selected;
  if (selected) {
    const source = $('#room-list .room-image[href="room-' + selected.id + '.html"]');
    const photo = source.querySelector('img');
    roomPreviewPhoto.src = photo.src;
    roomPreviewPhoto.alt = photo.alt;
    roomPreviewLink.href = source.href;
    roomPreviewLink.setAttribute('aria-label', 'Подробнее о пространстве «' + selected.name + '» (в новой вкладке)');
  }
}

function quote(){
  const d=date.value, s=service.value, hours=+$('#hours').value;
  const hourly=['rent','game-self'].includes(s);
  $('#hours-field').hidden=!hourly; $('#hours').disabled=!hourly;
  if(room.options.length===1) return {text:'Администратор подскажет подходящий формат и его стоимость.'};
  if(!d) return {text:'Выберите дату — покажем предварительную стоимость'};
  if(s==='newyear'||holidayPricing(d)) return {text:'Стоимость на праздничные даты уточним при обращении'};
  if(s==='game-host') return {amount:5000,text:'5 000 ₽ · 2 часа с ведущим · до 10 человек'};
  if(s==='game-open') return {amount:600*(+$('#guests').value||1),text:'600 ₽ с человека · 2 часа открытой игры. Дата требует подтверждения'};
  if(s==='quiz') return {amount:3000,text:'3 000 ₽ за квиз · 1 час. Аренду комнаты и индивидуальную тему уточним отдельно'};
  if(s==='game-self') return hours>=1&&hours<=24?{amount:1300*hours,text:money(1300*hours)+' · '+hours+' ч без ведущего'}:{text:'Укажите длительность от 1 до 24 часов'};
  const i=window.rooms.findIndex(r=>r.name===room.value);
  if(i<0) return {text:'Выберите комнату для расчёта'};
  const weekend=rateDay(d);
  const pack=packageFor(s);
  const amount=pack?pack.prices[i][weekend]:(hours>=1&&hours<=24?window.rooms[i].rates[weekend]*hours:null);
  return amount?{amount,text:money(amount)+' · '+room.value+' · '+(pack?'пакет '+pack.name:hours+' ч аренды')}:{text:'Укажите длительность от 1 до 24 часов'};
}
function refresh(preferredRoom = room.value) {
  syncRoomOptions(preferredRoom);
  const q = quote();
  $('#estimate').textContent = q.text + (q.amount ? ' — предварительно. Итоговую стоимость подтвердит администратор.' : '');
  updateDraft();
}

function choose(values, target) {
  const preferredRoom = values.room || room.value;
  if(values.service) service.value=values.service;
  selectedPackage=values.package||'';selectedActivity=values.activity||'';
  if(values.event)$('#event').value=values.event;
  $('#selection-note').textContent=selectedActivity?'Вы выбрали: '+selectedActivity:selectedPackage?'Новогодний пакет «'+selectedPackage+'» · 20–30 декабря 2026':'';
  resetDraft();
  refresh(preferredRoom);
  go(target);
}

document.querySelectorAll('[data-room]').forEach(b=>b.addEventListener('click',()=>choose({room:b.dataset.room,service:'rent'})));
document.querySelectorAll('[data-game]').forEach(b=>b.addEventListener('click',()=>choose({room:GAME_ROOM,service:'game-'+b.dataset.game,event:'Игровой вечер'})));
document.querySelectorAll('[data-package]').forEach(b=>b.addEventListener('click',()=>choose({service:'newyear',package:b.dataset.package,event:'Корпоратив'})));
document.querySelectorAll('[data-standard-package]').forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  choose({ service: link.dataset.standardPackage }, form);
  form.focus({ preventScroll: true });
}));
document.querySelectorAll('[data-quiz]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();choose({service:'quiz',activity:'Квиз'});}));

for (const pack of window.packages) {
  const price = document.querySelector('[data-price="' + pack.name + '"]');
  price.textContent = 'от ' + money(Math.min(...pack.prices.flat()));
}

function refreshForm(preferredRoom = room.value) {
  date.setCustomValidity('');
  resetDraft();
  refresh(preferredRoom);
}

function formChanged(event) {
  if (event.target !== service && event.target !== room) refreshForm();
}
form.addEventListener('input', formChanged);
form.addEventListener('change', formChanged);
service.addEventListener('change', () => {
  selectedPackage = '';
  const isHostedGame = ['game-host', 'game-open'].includes(service.value);
  if (!isHostedGame || !['Мафия', 'Бункер'].includes(selectedActivity)) selectedActivity = '';
  $('#selection-note').textContent = selectedActivity ? 'Вы выбрали: ' + selectedActivity : '';
  refreshForm(service.value.startsWith('game-') ? GAME_ROOM : room.value);
});
room.addEventListener('change', () => {
  if (room.value === GAME_ROOM && service.value === 'rent') service.value = 'game-self';
  refreshForm();
});
function buildDraft(){
  const n=Number(guests.value),q=quote();
  const question = room.options.length === 1
    ? 'Подскажите, есть ли подходящий вариант на такое количество гостей?'
    : 'Подскажите, свободно ли это время и как подтвердить бронь?';
  const activity=selectedActivity?' · '+selectedActivity:'';
  const label=service.options[service.selectedIndex].textContent;
  return 'Здравствуйте! Хочу забронировать праздник.\nПовод: '+$('#event').value+'.\nДата: '+date.value.split('-').reverse().join('.')+'.\nГостей: '+n+'.\nПространство: '+room.value+'.\nФормат: '+label+activity+(selectedPackage?' «'+selectedPackage+'»':'')+'.'+(['rent','game-self'].includes(service.value)?'\nДлительность: '+$('#hours').value+' ч.':'')+(q.amount?'\nПредварительно по тарифу: '+money(q.amount)+', без дополнительных услуг.':'\nСтоимость прошу уточнить.')+'\n'+question;
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

if([...service.options].some(o=>o.value===requestedService))service.value=requestedService;
if(['Мафия','Бункер','Квиз'].includes(params.get('activity')))selectedActivity=params.get('activity');
if(selectedActivity){$('#selection-note').textContent='Вы выбрали: '+selectedActivity;$('#event').value='Игровой вечер';}
refresh(requestedRoom || room.value);
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

