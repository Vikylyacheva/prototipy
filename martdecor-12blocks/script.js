const form = document.querySelector('#contact-form');
const draft = document.querySelector('#draft');
const draftText = document.querySelector('#draft-text');
const copyButton = document.querySelector('#copy-button');
const copyStatus = document.querySelector('#copy-status');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const values = new FormData(form);
  const details = values.get('details').trim();
  draftText.textContent = `Здравствуйте! Хочу подобрать материалы: ${values.get('room')}.${details ? ` Моя задача: ${details}.` : ''} Подскажите, пожалуйста, как получить бесплатную консультацию.`;
  draft.hidden = false;
  draft.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(draftText.textContent);
    copyStatus.textContent = 'Текст скопирован';
  } catch {
    copyStatus.textContent = 'Выделите текст обращения и скопируйте его вручную';
  }
});
