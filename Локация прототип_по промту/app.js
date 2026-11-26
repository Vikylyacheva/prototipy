'use strict';

const rooms = [
  {id:'eco',name:'Эко',comfort:8,max:10,area:17,rates:[1500,1900],description:'Для камерного дня рождения, девичника и встречи с друзьями',features:['Караоке · 2 микрофона','PlayStation 4','Аудиосистема 5.1','Диско-шар и свет']},
  {id:'art',name:'Арт',comfort:12,max:14,area:17,rates:[1800,2200],description:'Для караоке-вечера, танцев и праздника своей компанией',features:['Караоке · 2 микрофона','PlayStation 5','Проектор Full HD','Аудиосистема 5.1']},
  {id:'multi',name:'Мульти',comfort:15,max:20,area:35,rates:[2100,2600],description:'Самая большая комната — для корпоратива и большой компании',features:['Караоке · 4 микрофона','PlayStation 5 Slim','Проектор 4K','Аудиосистема и сабвуфер']},
  {id:'game',name:'Игровое пространство',rates:[1300,1300],description:'Для настольных игр, Мафии и Бункера своей компанией',features:['Настольные игры','Отдельная комната','Ведущий по запросу']}
];
const packages = [
  {id:'light',name:'Лайт',hours:4,host:1,description:'Немного программы, много своего времени',prices:[[6700,8800],[8000,10100],[10100,12600]]},
  {id:'drive',name:'Драйв',hours:5,host:2,description:'Больше времени для общей программы',prices:[[9500,12500],[11500,14500],[14500,18000]]},
  {id:'max',name:'Максимум',hours:6,host:3,description:'Долгий вечер с насыщенной программой',prices:[[12300,16200],[15000,18900],[18900,23400]]}
];
const games = [
  {id:'mafia',name:'Мафия',description:'Обсуждайте версии и ищите мафию. Ведущий объяснит правила и проведёт игру',price:5000,hours:2,details:'За компанию до 10 человек · комната и ведущий включены'},
  {id:'bunker',name:'Бункер',description:'Примеряйте роли и убеждайте других участников, почему в бункере нужны именно вы',price:5000,hours:2,details:'За компанию до 10 человек · комната и ведущий включены'},
  {id:'quiz',name:'Квиз',description:'Тематические раунды на экране. Формат проведения и тему согласуем заранее',price:3000,hours:1,details:'За игру · аренду комнаты уточняем отдельно'}
];
const state = {room:'',format:'rent',pack:'light',game:'mafia',date:'',unknown:false,guests:'',hours:'3',contactType:'phone',contact:'',note:'',day:0,packRoom:'eco'};
const money = value => new Intl.NumberFormat('ru-RU').format(value) + '\u00a0₽';
const roomById = id => rooms.find(room => room.id === id);
const packById = id => packages.find(pack => pack.id === id);
const gameById = id => games.find(game => game.id === id);
const hourWord = n => n === 1 ? 'час' : n < 5 ? 'часа' : 'часов';
const formats = {rent:'Аренда комнаты',host:'Пакет с ведущим',private:'Игра своей компанией',open:'Открытая игра'};
const today = () => {const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
const photo = (room, isButton = true) => `<${isButton?'button':'div'} class="photo-placeholder room-photo ${room.id}" ${isButton?`type="button" data-room-details="${room.id}" aria-label="Посмотреть комнату ${room.name}"`:''}><svg aria-hidden="true"><use href="#photo-icon"/></svg><strong>Фото ${room.id==='game'?'Игрового пространства':`комнаты «${room.name}»`}</strong><span>Общий план и рассадка гостей</span><small>Фото-заглушка</small></${isButton?'button':'div'}>`;

function renderRooms(){
  document.getElementById('room-list').innerHTML = rooms.map(room => `<article class="room-card" id="room-${room.id}">${photo(room)}<div class="room-meta"><h3>${room.name}</h3>${room.area?`<span class="room-area">${room.area} м²</span>`:''}</div><p class="room-description">${room.description}</p><p class="capacity">${room.comfort?`Комфортно <strong>${room.comfort} гостей</strong> <span>· максимум ${room.max}</span>`:'Вместимость уточняем под формат игры'}</p><ul class="room-features">${room.features.slice(0,3).map(f=>`<li>${f}</li>`).join('')}</ul><div class="room-bottom"><div class="room-price"><strong>${money(room.rates[state.day])}</strong><span>за комнату в час</span></div><div class="room-actions"><button type="button" class="text-button" data-room-details="${room.id}">Что внутри</button><button type="button" class="button" data-book data-room="${room.id}">Выбрать ${room.id==='game'?'комнату':room.name}</button></div></div></article>`).join('');
}
function renderPackages(){
  const roomIndex = rooms.findIndex(r=>r.id===state.packRoom);
  document.getElementById('package-list').innerHTML = packages.map(pack=>`<article class="package-card"><h3>${pack.name}</h3><p>${pack.description}</p><div class="duration">${pack.hours} <span>${hourWord(pack.hours)} всего</span></div><div class="timeline" aria-hidden="true"><span style="width:${pack.host/pack.hours*100}%"></span></div><div class="time-labels"><p><strong>${pack.host} ${hourWord(pack.host)}</strong> с ведущим</p><p><strong>3 часа</strong> самостоятельного отдыха</p></div><div class="package-price">${money(pack.prices[roomIndex][state.day])}<small>${roomById(state.packRoom).name} · ${state.day?'Пт–Вс':'Пн–Чт'} · за компанию</small></div><button type="button" class="button button-outline" data-pack="${pack.id}">Выбрать ${pack.name}</button></article>`).join('');
}
function renderGames(){
  document.getElementById('private-games').innerHTML = games.map(game=>`<article class="private-game"><h4>${game.name}</h4><p>${game.description}</p><p class="game-cost">${money(game.price)} / ${game.hours} ${hourWord(game.hours)}<span>${game.details}</span></p><button type="button" class="text-button" data-private-game="${game.id}">Выбрать ${game.name==='Мафия'?'Мафию':game.name}</button></article>`).join('');
}
function formMarkup(prefix){
  return `${prefix==='inline'?'<h3 class="form-title">Узнать доступность</h3><p class="form-intro">Выбор можно изменить. Все детали согласуем до предоплаты</p>':''}<form class="booking-form" data-form="${prefix}" novalidate>
  <div class="form-row"><label class="field" for="${prefix}-format">Формат<select id="${prefix}-format" data-field="format">${Object.entries(formats).map(([key,value])=>`<option value="${key}">${value}</option>`).join('')}</select></label><label class="field" for="${prefix}-room" data-wrap="room">Комната<select id="${prefix}-room" data-field="room"><option value="">Помогите выбрать</option>${rooms.map(r=>`<option value="${r.id}">${r.name}</option>`).join('')}</select></label><label class="field" for="${prefix}-game" data-wrap="game" hidden>Игра<select id="${prefix}-game" data-field="game">${games.map(g=>`<option value="${g.id}">${g.name}</option>`).join('')}</select></label></div>
  <label class="field" for="${prefix}-pack" data-wrap="pack" hidden>Пакет<select id="${prefix}-pack" data-field="pack">${packages.map(p=>`<option value="${p.id}">${p.name} · ${p.hours} часов</option>`).join('')}</select></label>
  <div class="form-row"><label class="field" for="${prefix}-date"><span data-date-label>Желаемая дата</span><input id="${prefix}-date" type="date" data-field="date" min="${today()}"></label><label class="field" for="${prefix}-guests"><span data-guests-label>Количество гостей</span><input id="${prefix}-guests" data-field="guests" type="number" inputmode="numeric" min="1" max="100" step="1" placeholder="Например, 8" required></label></div>
  <label class="check-field"><input type="checkbox" data-field="unknown">Пока не определились с датой</label>
  <label class="field" for="${prefix}-hours" data-wrap="hours">Длительность<input id="${prefix}-hours" data-field="hours" type="number" inputmode="numeric" min="1" max="24" step="1" aria-label="Длительность аренды в часах"><span class="form-disclosure">Часов аренды · минимальное время уточняем</span></label>
  <div class="form-row"><label class="field" for="${prefix}-contact-type">Как связаться<select id="${prefix}-contact-type" data-field="contactType"><option value="phone">По телефону</option><option value="vk">ВКонтакте</option><option value="telegram">В Telegram</option></select></label><label class="field" for="${prefix}-contact"><span data-contact-label>Номер телефона</span><input id="${prefix}-contact" type="tel" data-field="contact" autocomplete="tel" placeholder="+7 900 000-00-00" required></label></div>
  <details class="form-extra"><summary>Добавить повод или пожелания</summary><label class="field" for="${prefix}-note">Что ещё учесть<textarea id="${prefix}-note" data-field="note" maxlength="1000" placeholder="Например, день рождения, хотим караоке"></textarea></label></details>
  <div class="form-summary" aria-live="polite" aria-atomic="true"><strong data-summary-title></strong><span data-summary-details></span><span class="estimate" data-estimate></span><span data-estimate-note></span></div>
  <p class="form-error" role="alert" data-error></p><button class="button" type="submit">Подготовить заявку</button><p class="form-disclosure">Демонстрационная форма. Ничего не отправляет и не сохраняет на сервере. После заполнения покажем текст заявки</p></form>`;
}
function calculate(){
  const room = roomById(state.room);
  if(state.format==='open') return {price:Number(state.guests)>0?Number(state.guests)*600:null,description:'600 ₽ за участника по карточке услуги. Дату, наличие мест и стоимость конкретной встречи подтверждает администратор'};
  if(!state.date || state.unknown) return {price:null,description:'Выберите дату для предварительного расчёта. Если дата пока неизвестна — уточним стоимость при общении'};
  if(state.date>='2026-12-20') return {price:null,description:'На эту дату стоимость нужно уточнить. Обычный тариф не применяется автоматически к праздничным датам'};
  const weekday = new Date(state.date+'T12:00:00').getDay();
  const day = weekday===0 || weekday>=5?1:0;
  if(state.format==='private'){
    const game=gameById(state.game);
    return {price:game.price,description:game.id==='quiz'?'Стоимость квиза. Аренду выбранной комнаты рассчитываем отдельно':'За компанию до 10 человек. Игровое пространство и ведущий включены'};
  }
  if(!room) return {price:null,description:'Поможем выбрать комнату и рассчитаем ваш вариант'};
  if(state.format==='host'){
    const index=rooms.findIndex(r=>r.id===room.id);
    if(index>2) return {price:null,description:'Для пакета выберите Эко, Арт или Мульти'};
    return {price:packById(state.pack).prices[index][day],description:'За всю компанию. Время ведущего входит в общую длительность. Состав программы и цену подтвердит администратор'};
  }
  const hours=Number(state.hours);
  return {price:hours>0&&hours<=24?room.rates[day]*hours:null,description:'Предварительная стоимость аренды. Минимальное время и дополнительные услуги уточнит администратор'};
}
function syncForms(){
  const isOpen=state.format==='open', isPrivate=state.format==='private', isHost=state.format==='host';
  const game=gameById(state.game), room=roomById(state.room), pack=packById(state.pack);
  for(const form of document.querySelectorAll('.booking-form')){
    for(const element of form.querySelectorAll('[data-field]')){
      const key=element.dataset.field;
      if(element.type==='checkbox') element.checked=Boolean(state[key]);
      else if(document.activeElement!==element) element.value=state[key];
    }
    form.querySelector('[data-wrap="game"]').hidden=!(isOpen||isPrivate);
    form.querySelector('[data-wrap="room"]').hidden=isOpen||(isPrivate&&state.game!=='quiz');
    form.querySelector('[data-wrap="pack"]').hidden=!isHost;
    form.querySelector('[data-wrap="hours"]').hidden=state.format!=='rent';
    form.querySelector('[data-field="date"]').disabled=state.unknown;
    form.querySelector('[data-date-label]').textContent=isOpen?'Желаемая дата, если есть':'Желаемая дата';
    form.querySelector('[data-guests-label]').textContent=isOpen?'Количество участников':'Количество гостей';
    form.querySelector('option[value="quiz"]').disabled=isOpen;
    form.querySelector('[data-field="room"] option[value="game"]').disabled=isHost;
    const contact = form.querySelector('[data-field="contact"]');
    const contactLabel=form.querySelector('[data-contact-label]');
    if(state.contactType==='phone'){contact.type='tel';contact.placeholder='+7 900 000-00-00';contact.autocomplete='tel';contactLabel.textContent='Номер телефона';}
    else{contact.type='text';contact.placeholder=state.contactType==='vk'?'Ссылка на страницу ВК':'@username';contact.autocomplete='off';contactLabel.textContent=state.contactType==='vk'?'Ваша страница ВК':'Имя в Telegram';}
    let title = room?room.name:'Поможем выбрать комнату';
    let details = formats[state.format];
    if(isOpen){title=`Открытая игра · ${game.name}`;details='Участие в общей встрече';}
    else if(isPrivate){title=game.name;details=game.id==='quiz'?`Квиз · ${room?room.name:'комнату подберём отдельно'}`:'Своя компания · Игровое пространство';}
    else if(isHost) details=`Пакет ${pack.name} · ${pack.hours} часов всего · ${pack.host} ${hourWord(pack.host)} с ведущим`;
    else details+=` · ${state.hours||'—'} ${hourWord(Number(state.hours))}`;
    if(state.guests) details+=` · ${isOpen?'участников':'гостей'}: ${state.guests}`;
    form.querySelector('[data-summary-title]').textContent=title;
    form.querySelector('[data-summary-details]').textContent=details;
    const calc=calculate();
    form.querySelector('[data-estimate]').textContent=calc.price!==null?money(calc.price):'Стоимость уточним';
    form.querySelector('[data-estimate-note]').textContent=calc.description;
  }
}
function normalizeState(changed){
  if(changed==='format'){
    if(state.format==='host'&&state.room==='game')state.room=state.packRoom;
    if(state.format==='private'&&state.game!=='quiz')state.room='game';
    if(state.format==='open'&&state.game==='quiz')state.game='mafia';
  }
  if(changed==='game'&&state.format==='private'){
    state.room=state.game==='quiz'?(state.room==='game'?'':state.room):'game';
  }
  if(changed==='room'&&['eco','art','multi'].includes(state.room)){
    state.packRoom=state.room;
    document.getElementById('package-room').value=state.packRoom;
    renderPackages();
  }
}
function openDialog(id){
  const dialog=document.getElementById(id);
  if(!dialog.open)dialog.showModal();
  document.body.classList.add('dialog-open');
}
function closeDialog(id){document.getElementById(id).close();}
function openBooking(options={}){
  if(options.room){state.room=options.room;state.format='rent';normalizeState('room');}
  if(options.pack){state.pack=options.pack;state.room=state.packRoom;state.format='host';}
  if(options.privateGame){state.game=options.privateGame;state.format='private';state.room=options.privateGame==='quiz'?'': 'game';}
  if(options.event){state.game=options.event;state.format='open';state.room='';}
  if(document.getElementById('room-dialog').open) closeDialog('room-dialog');
  document.querySelectorAll('[data-error]').forEach(e=>e.textContent='');
  syncForms();openDialog('booking-dialog');
}
function showRoom(id){
  const room=roomById(id);
  document.getElementById('room-dialog-title').textContent=room.name;
  document.getElementById('room-dialog-content').innerHTML=`${photo(room,false)}<p class="room-description">${room.description}</p><p class="capacity">${room.comfort?`Комфортно ${room.comfort} гостей · максимум ${room.max} · ${room.area} м²`:'Вместимость уточняем под выбранный формат'}</p><ul class="room-features">${room.features.map(f=>`<li>${f}</li>`).join('')}</ul><div class="room-bottom"><div class="room-price"><strong>${money(room.rates[state.day])}</strong><span>за комнату в час · ${state.day?'Пт–Вс':'Пн–Чт'}</span></div><button type="button" class="button" data-book data-room="${id}">Выбрать комнату</button></div><p class="section-footnote">На месте фото-заглушки будут общий план и фотографии оснащения. Тариф аренды для дат до 20 декабря 2026</p>`;
  openDialog('room-dialog');
}
function validate(){
  if(!state.unknown && !state.date && state.format!=='open') return ['date','Выберите дату или отметьте «Пока не определились с датой»'];
  if(state.date&&!state.unknown&&state.date<today()) return ['date','Эта дата уже прошла. Выберите другую'];
  const guests=Number(state.guests);
  if(!Number.isInteger(guests)||guests<1||guests>100)return ['guests','Укажите количество гостей от 1 до 100'];
  if(state.format==='rent'){
    const hours=Number(state.hours);
    if(!Number.isInteger(hours)||hours<1||hours>24) return ['hours','Укажите длительность от 1 до 24 часов'];
  }
  const room=roomById(state.room);
  if(['rent','host'].includes(state.format)&&room?.max&&guests>room.max)return ['guests',`В комнате «${room.name}» максимум ${room.max} гостей. Выберите другую комнату или «Помогите выбрать»`];
  if(state.format==='private'&&state.game!=='quiz'&&guests>10)return ['guests','Этот формат рассчитан на компанию до 10 человек. Уточните другой вариант у администратора'];
  if(state.contact.trim().length<3)return ['contact','Укажите контакт, по которому с вами можно связаться'];
  if(state.contactType==='phone'){
    const digits=state.contact.replace(/\D/g,'');
    if(digits.length<10||digits.length>15)return ['contact','Проверьте номер телефона: нужно от 10 до 15 цифр'];
  }
  return null;
}
function makeRequest(){
  const room=roomById(state.room),pack=packById(state.pack),game=gameById(state.game),calc=calculate();
  const date=state.date&&!state.unknown?new Date(state.date+'T12:00:00').toLocaleDateString('ru-RU'):'Пока не определились';
  const lines=['Здравствуйте! Хочу обсудить бронирование в Локации.',`Формат: ${formats[state.format]}`];
  if(state.format==='open')lines.push(`Игра: ${game.name}`,`Участников: ${state.guests}`);
  else{
    lines.push(`Комната: ${room?room.name:'Помогите выбрать'}`,`Гостей: ${state.guests}`);
    if(state.format==='host')lines.push(`Пакет: ${pack.name}, ${pack.hours} часов всего, из них ${pack.host} ${hourWord(pack.host)} с ведущим`);
    else if(state.format==='private')lines.push(`Игра: ${game.name}, ${game.hours} ${hourWord(game.hours)}`);
    else lines.push(`Длительность: ${state.hours} ${hourWord(Number(state.hours))}`);
  }
  lines.push(`Желаемая дата: ${date}`,`Контакт (${state.contactType==='phone'?'телефон':state.contactType==='vk'?'ВК':'Telegram'}): ${state.contact.trim()}`);
  if(calc.price!==null)lines.push(`Предварительная стоимость: ${money(calc.price)}. Просьба подтвердить итоговую сумму`);
  else lines.push('Просьба уточнить стоимость');
  if(state.note.trim())lines.push(`Пожелания: ${state.note.trim()}`);
  lines.push('Подскажите свободное время, условия предоплаты и переноса.');
  return lines.join('\n');
}

renderRooms();renderPackages();renderGames();
document.getElementById('inline-form-slot').innerHTML=formMarkup('inline');
document.getElementById('modal-form-slot').innerHTML=formMarkup('modal');
syncForms();

document.addEventListener('click',event=>{
  const trigger=event.target.closest('button,a');
  if(!trigger)return;
  if(trigger.hasAttribute('data-close'))closeDialog(trigger.dataset.close);
  else if(trigger.hasAttribute('data-room-details'))showRoom(trigger.dataset.roomDetails);
  else if(trigger.hasAttribute('data-book'))openBooking({room:trigger.dataset.room});
  else if(trigger.hasAttribute('data-pack'))openBooking({pack:trigger.dataset.pack});
  else if(trigger.hasAttribute('data-private-game'))openBooking({privateGame:trigger.dataset.privateGame});
  else if(trigger.hasAttribute('data-event'))openBooking({event:trigger.dataset.event});
  else if(trigger.hasAttribute('data-day')){
    state.day=Number(trigger.dataset.day);
    document.querySelectorAll('[data-day]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.day)===state.day)));
    renderRooms();renderPackages();
  }
  else if(trigger.hasAttribute('data-format')){state.format=trigger.dataset.format;normalizeState('format');syncForms();}
  else if(trigger.hasAttribute('data-review-scroll')){
    const track=document.getElementById('reviews-track');
    track.scrollBy({left:Number(trigger.dataset.reviewScroll)*(track.firstElementChild.offsetWidth+20),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  }
  if(trigger.closest('.navigation')||trigger.classList.contains('brand')){
    document.getElementById('navigation').classList.remove('open');
    document.getElementById('menu-toggle').setAttribute('aria-expanded','false');
  }
});
document.getElementById('package-room').addEventListener('change',event=>{state.packRoom=event.target.value;renderPackages();});
document.getElementById('menu-toggle').addEventListener('click',()=>{
  const open=document.getElementById('navigation').classList.toggle('open');
  document.getElementById('menu-toggle').setAttribute('aria-expanded',String(open));
  document.getElementById('menu-toggle').setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');
});
document.querySelectorAll('.booking-form').forEach(form=>{
  form.addEventListener('input',event=>{
    const field=event.target.dataset.field;if(!field)return;
    state[field]=event.target.type==='checkbox'?event.target.checked:event.target.value;
    normalizeState(field);form.querySelector('[data-error]').textContent='';syncForms();
  });
  form.addEventListener('change',event=>{
    const field=event.target.dataset.field;if(!field)return;
    state[field]=event.target.type==='checkbox'?event.target.checked:event.target.value;
    normalizeState(field);syncForms();
  });
  form.addEventListener('submit',event=>{
    event.preventDefault();
    const error=validate();
    if(error){form.querySelector('[data-error]').textContent=error[1];form.querySelector(`[data-field="${error[0]}"]`).focus();return;}
    document.getElementById('request-text').value=makeRequest();
    document.getElementById('copy-status').textContent='';
    document.getElementById('copy-request').textContent='Скопировать текст';
    if(document.getElementById('booking-dialog').open)closeDialog('booking-dialog');
    openDialog('result-dialog');
  });
});
document.querySelectorAll('dialog').forEach(dialog=>{
  dialog.addEventListener('close',()=>{if(!document.querySelector('dialog[open]'))document.body.classList.remove('dialog-open');});
  dialog.addEventListener('click',event=>{
    if(event.target!==dialog)return;
    const bounds=dialog.getBoundingClientRect();
    if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)dialog.close();
  });
});
document.getElementById('copy-request').addEventListener('click',async()=>{
  const area=document.getElementById('request-text'), status=document.getElementById('copy-status');
  try{
    if(navigator.clipboard&&window.isSecureContext)await navigator.clipboard.writeText(area.value);
    else{area.focus();area.select();if(!document.execCommand('copy'))throw new Error('copy unavailable');}
    status.textContent='Текст скопирован. Откройте ВК и вставьте его в сообщение';
    document.getElementById('copy-request').textContent='Скопировано';
  }catch{area.focus();area.select();status.textContent='Выделили текст заявки. Скопируйте его сочетанием Ctrl+C или через меню телефона';}
});
