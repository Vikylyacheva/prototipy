const requestForm = document.querySelector('#request-form');
const draft = document.querySelector('#draft');
const draftText = document.querySelector('#draft-text');
const copyButton = document.querySelector('#copy');
const status = document.querySelector('#status');

requestForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(requestForm);
  const details = formData.get('details').trim();
  draftText.textContent = `Здравствуйте! Меня зовут ${formData.get('name')}. Хочу обсудить: ${formData.get('topic').toLowerCase()}.${details ? ` Задача: ${details}.` : ''} Связаться со мной можно: ${formData.get('contact')}.`;
  draft.hidden = false;
  draft.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(draftText.textContent);
    status.textContent = 'Текст скопирован';
  } catch {
    status.textContent = 'Скопируйте текст обращения вручную';
  }
});
