'use strict';
const config = window.WEDDING;
const $ = (id) => document.getElementById(id);
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const phone = value => String(value).replace(/\D/g, '');
const whatsapp = (number, message = '') => `https://wa.me/${phone(number)}?text=${encodeURIComponent(message)}`;
const externalLink = (url, text) => `<a class="action" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${text}</a>`;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const music = $('music'); const musicToggle = $('music-toggle');
if (config.music) { music.src = config.music; musicToggle.hidden = false; }
function updateMusic() { musicToggle.setAttribute('aria-pressed', String(!music.paused)); musicToggle.setAttribute('aria-label', music.paused ? 'Activar música' : 'Silenciar música'); }
async function startMusic() { if (!config.music) return; try { await music.play(); } catch { /* El usuario puede volver a activarla con el botón. */ } updateMusic(); }
music.addEventListener('error', () => { musicToggle.hidden = true; });
musicToggle.addEventListener('click', () => { if (music.paused) startMusic(); else { music.pause(); updateMusic(); } });

const root = document.documentElement;
const hero = $('hero'); const envBack = document.querySelector('.env-back'); const seal = $('env-seal');
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);
function openEnvelope() {
  if (root.classList.contains('env-open')) return;
  root.classList.remove('env-sealed'); root.classList.add('env-open');
  seal.setAttribute('aria-disabled', 'true'); seal.tabIndex = -1;
  $('env-note').textContent = 'Desliza hacia abajo para sacar la invitación';
  startMusic();
}
seal.addEventListener('click', openEnvelope);
// La tarjeta sube con el scroll nativo; al salir casi entera, el sobre cae con su propia animación CSS.
const intro = document.querySelector('.env-intro');
let leaveAt = Infinity;
function measureEnvelope() {
  const envStyle = getComputedStyle(envBack);
  const envHeight = parseFloat(envStyle.height);
  leaveAt = hero.offsetHeight + 12 - envHeight * .3;
}
function updateEnvelope() {
  const scrolled = window.scrollY;
  if (scrolled > 0) openEnvelope();
  intro.style.opacity = String(Math.max(0, 1 - scrolled / 180));
  const leaving = root.classList.contains('env-leaving');
  if (!leaving && scrolled > leaveAt) root.classList.add('env-leaving');
  else if (leaving && scrolled < leaveAt - 60) root.classList.remove('env-leaving');
}
let envFrame = 0;
const scheduleEnvelope = () => { if (!envFrame) envFrame = requestAnimationFrame(() => { envFrame = 0; updateEnvelope(); }); };
addEventListener('scroll', scheduleEnvelope, {passive:true});
addEventListener('resize', () => { measureEnvelope(); scheduleEnvelope(); });
measureEnvelope(); updateEnvelope();
document.fonts?.ready.then(() => { measureEnvelope(); updateEnvelope(); });

if (config.photo) { const photo = new Image(); photo.alt = 'Nayelis y Dominik'; photo.onload = () => { $('portrait').classList.add('has-photo'); $('portrait').replaceChildren(photo); }; photo.src = config.photo; }

function countdown(now = Date.now()) {
  const remaining = Math.max(0, new Date(config.ceremonyAt).getTime() - now);
  const parts = [Math.floor(remaining/86400000), Math.floor(remaining/3600000)%24, Math.floor(remaining/60000)%60, Math.floor(remaining/1000)%60];
  ['days','hours','minutes','seconds'].forEach((id,index) => { $(id).textContent = String(parts[index]).padStart(2,'0'); });
  if (!remaining) $('countdown-note').textContent = '¡Ha llegado nuestro gran día!';
}
countdown(); setInterval(countdown, 1000);

$('ceremony-time').textContent = config.arrivalTime || config.ceremonyTime;
$('ceremony-note').hidden = !config.ceremonyProvisional;
$('arrival-label').hidden = !config.arrivalTime;
const waIcon = '<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.2a8.8 8.8 0 0 0-7.6 13.2L3.3 20.7l4.4-1.1A8.8 8.8 0 1 0 12 3.2z"/><path d="M9 8.3c.3-.6.7-.6 1-.6.3 0 .5.4.8 1 .2.5.1.8-.1 1.1l-.5.6c.6 1.2 1.6 2.2 2.8 2.8l.6-.5c.3-.2.6-.3 1.1-.1.6.3 1 .5 1 .8 0 .3 0 .7-.5.9-.8.5-1.8.5-3-.1a8 8 0 0 1-3.2-3.2c-.6-1.2-.6-2.1 0-2.7z"/></svg>';
const contacts = [['Nayelis', 'Novia', config.bridePhone], ['Dominik', 'Novio', config.groomPhone]].filter(([, , number]) => number);
$('contacts').innerHTML = contacts.length ? contacts.map(([name, role, number]) => `<a class="wa" href="${escapeHtml(whatsapp(number, `Hola ${name}, te escribo por vuestra boda.`))}" target="_blank" rel="noopener noreferrer">${waIcon}<span><strong>${name}</strong><small>${role}</small></span></a>`).join('') : '<p class="notice">Pronto compartiremos los datos de contacto.</p>';
$('reception-time').textContent = config.receptionTime;

// Las respuestas van a la hoja de Google de los novios (apps-script/INSTRUCCIONES.md).
const sheetUrl = /^https:\/\/script\.google\.com\//.test(config.sheetUrl || '') ? config.sheetUrl : '';
const formFooter = '<label class="trap" aria-hidden="true">Web<input name="website" tabindex="-1" autocomplete="off"></label><button class="action" type="submit" id="rsvp-submit">Enviar confirmación</button>';
const rsvpFormMarkup = `<form id="rsvp-form"><label>Nombre y apellidos<input name="name" autocomplete="name" maxlength="120" placeholder="Tu nombre completo" required></label><fieldset class="q"><legend>¿Nos acompañarás en nuestro gran día?</legend><label class="opt"><input type="radio" name="attendance" value="Sí" required><span>¡Sí, no me lo perdería! ❤️</span></label><label class="opt"><input type="radio" name="attendance" value="No"><span>Lo siento, no podré asistir</span></label></fieldset><div id="guest-details"><fieldset class="q"><legend>¿Vendrás con tu pareja?</legend><p class="hint">Los acompañantes se limitan a parejas.</p><label class="opt"><input type="radio" name="partner" value="Sí" required><span>Sí</span></label><label class="opt"><input type="radio" name="partner" value="No"><span>No</span></label><label class="follow" data-show="partner=Sí" hidden>Nombre de tu pareja<input name="partnerName" maxlength="120" required></label></fieldset><fieldset class="q"><legend>¿Tienes alguna alergia o intolerancia alimentaria?</legend><label class="opt"><input type="radio" name="allergy" value="No" required><span>No</span></label><label class="opt"><input type="radio" name="allergy" value="Sí"><span>Sí, indicar cuál</span></label><label class="follow" data-show="allergy=Sí" hidden>¿Cuál?<input name="allergyDetail" maxlength="300" required></label></fieldset><fieldset class="q"><legend>¿Vendrás con niños?</legend><label class="opt"><input type="radio" name="kids" value="Sí" required><span>Sí</span></label><label class="opt"><input type="radio" name="kids" value="No"><span>No</span></label><label class="follow" data-show="kids=Sí" hidden>¿Cuántos?<input name="kidsCount" type="number" min="1" max="10" value="1" required></label></fieldset><fieldset class="q"><legend>¿Necesitarás transporte hasta el lugar del banquete?</legend><label class="opt"><input type="radio" name="bus" value="Sí" required><span>Sí</span></label><label class="opt"><input type="radio" name="bus" value="No"><span>No</span></label></fieldset><label>¿Qué canción no puede faltar en nuestra boda? 🎶<input name="song" maxlength="150" placeholder="Tu canción favorita"></label></div>${formFooter}<div id="form-status" role="status"></div></form>`;
const rsvpDialog = $('rsvp-dialog');
if (config.formUrl && /^https:\/\//i.test(config.formUrl)) $('rsvp-content').innerHTML = externalLink(config.formUrl, 'Abrir formulario de asistencia');
else if (!sheetUrl) $('rsvp-content').innerHTML = '<p class="notice">La confirmación de asistencia estará disponible próximamente.</p>';
else {
  $('rsvp-content').innerHTML = '<button type="button" class="action" id="rsvp-open">Confirmar asistencia</button>';
  $('rsvp-dialog-content').innerHTML = rsvpFormMarkup;
  $('rsvp-open').addEventListener('click', () => { rsvpDialog.showModal(); root.classList.add('sheet-open'); rsvpDialog.scrollTop = 0; });
  $('rsvp-close').addEventListener('click', () => rsvpDialog.close());
  rsvpDialog.addEventListener('click', event => { if (event.target === rsvpDialog) rsvpDialog.close(); });
  rsvpDialog.addEventListener('close', () => { root.classList.remove('sheet-open'); $('rsvp-open').focus(); });
}
$('gift-content').innerHTML = config.iban ? `<p class="iban">${escapeHtml(config.iban)}</p><button class="action" id="copy-iban">Copiar número de cuenta</button><p role="status" id="copy-status" class="small"></p>` : '<p class="notice">Pronto compartiremos el número de cuenta. Si lo necesitas, puedes contactar con nosotros.</p>';
if ($('copy-iban')) $('copy-iban').addEventListener('click', async () => { try { await navigator.clipboard.writeText(config.iban); $('copy-status').textContent='Número de cuenta copiado.'; } catch { $('copy-status').textContent='No se pudo copiar. Selecciona el número de cuenta y cópialo manualmente.'; } });
if ($('rsvp-form')) {
  const form = $('rsvp-form'); const status = $('form-status');
  const toggle = (el, on) => { el.hidden = !on; el.querySelectorAll('input,textarea,select').forEach(input => { input.disabled = !on; }); };
  // Las preguntas de invitado se ocultan solo si no viene, y cada "¿Cuál?" solo aparece con la respuesta que lo pide.
  const sync = () => {
    const coming = form.elements.attendance.value !== 'No';
    toggle($('guest-details'), coming);
    form.querySelectorAll('[data-show]').forEach(el => { const [field, value] = el.dataset.show.split('='); toggle(el, coming && form.elements[field].value === value); });
  };
  sync();
  form.addEventListener('change', sync);
  form.addEventListener('input', () => { status.replaceChildren(); });
  const button = $('rsvp-submit');
  async function sendToSheet(data) {
    button.disabled = true; button.textContent = 'Enviando…';
    try {
      const response = await fetch(sheetUrl, { method: 'POST', body: new URLSearchParams(data) });
      const result = await response.json();
      if (!result.ok) throw new Error(result.error);
      form.replaceWith(Object.assign(document.createElement('div'), { className: 'rsvp-done', innerHTML: `<p class="script-line">¡Gracias${data.get('attendance') === 'Sí' ? ', nos vemos pronto' : ''}!</p><p>Hemos recibido tu confirmación.</p>` }));
    } catch {
      button.disabled = false; button.textContent = 'Enviar confirmación';
      status.innerHTML = '<p class="notice">No se ha podido enviar. Revisa tu conexión e inténtalo de nuevo; si sigue fallando, escríbenos por WhatsApp.</p>';
    }
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form); const get = field => String(data.get(field) ?? '').trim();
    const name = get('name');
    if (!name) { form.elements.name.setCustomValidity('Escribe tu nombre y apellidos.'); form.elements.name.reportValidity(); form.elements.name.addEventListener('input', () => form.elements.name.setCustomValidity(''), {once:true}); return; }
    sendToSheet(data);
  });
}

const revealItems = document.querySelectorAll('.reveal');
if (!reducedMotion && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('in'); observer.unobserve(entry.target); } }), {threshold:.12, rootMargin:'0px 0px -30px 0px'});
  revealItems.forEach(item => observer.observe(item));
} else revealItems.forEach(item => item.classList.add('in'));
