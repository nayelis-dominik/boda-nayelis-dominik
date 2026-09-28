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
if (config.arrivalTime) { $('start-time').textContent = config.ceremonyTime; $('arrival-label').hidden = false; $('ceremony-start').hidden = false; }
const waIcon = '<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.2a8.8 8.8 0 0 0-7.6 13.2L3.3 20.7l4.4-1.1A8.8 8.8 0 1 0 12 3.2z"/><path d="M9 8.3c.3-.6.7-.6 1-.6.3 0 .5.4.8 1 .2.5.1.8-.1 1.1l-.5.6c.6 1.2 1.6 2.2 2.8 2.8l.6-.5c.3-.2.6-.3 1.1-.1.6.3 1 .5 1 .8 0 .3 0 .7-.5.9-.8.5-1.8.5-3-.1a8 8 0 0 1-3.2-3.2c-.6-1.2-.6-2.1 0-2.7z"/></svg>';
const contacts = [['Nayelis', 'Novia', config.bridePhone], ['Dominik', 'Novio', config.groomPhone]].filter(([, , number]) => number);
$('contacts').innerHTML = contacts.length ? contacts.map(([name, role, number]) => `<a class="wa" href="${escapeHtml(whatsapp(number, `Hola ${name}, te escribo por vuestra boda.`))}" target="_blank" rel="noopener noreferrer">${waIcon}<span><strong>${name}</strong><small>${role}</small></span></a>`).join('') : '<p class="notice">Pronto compartiremos los datos de contacto.</p>';
$('reception-time').textContent = config.receptionTime;

const rsvpFormMarkup = `<form id="rsvp-form"><label>Nombre y apellidos<input name="name" autocomplete="name" maxlength="120" placeholder="Tu nombre completo" required></label><fieldset class="q"><legend>¿Nos acompañarás en nuestro gran día?</legend><label class="opt"><input type="radio" name="attendance" value="Sí" required><span>¡Sí, no me lo perdería! ❤️</span></label><label class="opt"><input type="radio" name="attendance" value="No"><span>Lo siento, no podré asistir</span></label></fieldset><div id="guest-details" hidden><fieldset class="q"><legend>¿Vendrás con tu pareja?</legend><p class="hint">Los acompañantes se limitan a parejas.</p><label class="opt"><input type="radio" name="partner" value="Sí" required><span>Sí</span></label><label class="opt"><input type="radio" name="partner" value="No"><span>No</span></label><label class="follow" data-show="partner=Sí" hidden>Nombre de tu pareja<input name="partnerName" maxlength="120" required></label></fieldset><fieldset class="q"><legend>¿Tienes alguna alergia o intolerancia alimentaria?</legend><label class="opt"><input type="radio" name="allergy" value="No" required><span>No</span></label><label class="opt"><input type="radio" name="allergy" value="Sí"><span>Sí, indicar cuál</span></label><label class="follow" data-show="allergy=Sí" hidden>¿Cuál?<input name="allergyDetail" maxlength="300" required></label></fieldset><fieldset class="q"><legend>¿Necesitas un menú especial?</legend><label class="opt"><input type="radio" name="menu" value="No" required><span>No</span></label><label class="opt"><input type="radio" name="menu" value="Vegetariano"><span>Vegetariano</span></label><label class="opt"><input type="radio" name="menu" value="Vegano"><span>Vegano</span></label><label class="opt"><input type="radio" name="menu" value="Otro"><span>Otro</span></label><label class="follow" data-show="menu=Otro" hidden>¿Cuál?<input name="menuOther" maxlength="300" required></label></fieldset><fieldset class="q"><legend>¿Vendrás con niños?</legend><label class="opt"><input type="radio" name="kids" value="Sí" required><span>Sí</span></label><label class="opt"><input type="radio" name="kids" value="No"><span>No</span></label><label class="follow" data-show="kids=Sí" hidden>¿Cuántos?<input name="kidsCount" type="number" min="1" max="10" value="1" required></label></fieldset><fieldset class="q"><legend>¿Necesitarás transporte hasta el lugar del banquete?</legend><label class="opt"><input type="radio" name="bus" value="Sí" required><span>Sí</span></label><label class="opt"><input type="radio" name="bus" value="No"><span>No</span></label></fieldset><label>¿Qué canción no puede faltar en nuestra boda? 🎶<input name="song" maxlength="150" placeholder="Tu canción favorita"></label></div><label>¿Quieres dejarnos algún mensaje? 💌<textarea name="message" maxlength="600" placeholder="Un deseo, unas palabras bonitas..."></textarea></label><label>¿A quién quieres enviárselo?<select name="recipient"><option value="bride">Nayelis</option><option value="groom">Dominik</option></select></label><p class="notice">Al pulsar el botón se preparará un mensaje con tus respuestas. Deberás enviarlo en WhatsApp para confirmar tu asistencia. No se guardan datos en esta web.</p><button class="action" type="submit">Preparar mi confirmación</button><div id="form-status" role="status"></div></form>`;
$('rsvp-content').innerHTML = config.formUrl && /^https:\/\//i.test(config.formUrl) ? externalLink(config.formUrl,'Abrir formulario de asistencia') : !config.bridePhone || !config.groomPhone ? '<p class="notice">La confirmación de asistencia estará disponible próximamente.</p>' : rsvpFormMarkup;
$('gift-content').innerHTML = config.iban ? `<p class="iban">${escapeHtml(config.iban)}</p><button class="action" id="copy-iban">Copiar número de cuenta</button><p role="status" id="copy-status" class="small"></p>` : '<p class="notice">Pronto compartiremos el número de cuenta. Si lo necesitas, puedes contactar con nosotros.</p>';
if ($('copy-iban')) $('copy-iban').addEventListener('click', async () => { try { await navigator.clipboard.writeText(config.iban); $('copy-status').textContent='Número de cuenta copiado.'; } catch { $('copy-status').textContent='No se pudo copiar. Selecciona el número de cuenta y cópialo manualmente.'; } });
if ($('rsvp-form')) {
  const form = $('rsvp-form'); const status = $('form-status');
  const toggle = (el, on) => { el.hidden = !on; el.querySelectorAll('input,textarea,select').forEach(input => { input.disabled = !on; }); };
  // Las preguntas de invitado solo aparecen si viene, y cada "¿Cuál?" solo con la respuesta que lo pide.
  const sync = () => {
    const coming = form.elements.attendance.value === 'Sí';
    toggle($('guest-details'), coming);
    form.querySelectorAll('[data-show]').forEach(el => { const [field, value] = el.dataset.show.split('='); toggle(el, coming && form.elements[field].value === value); });
  };
  sync();
  form.addEventListener('change', sync);
  form.addEventListener('input', () => { status.replaceChildren(); });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form); const get = field => String(data.get(field) ?? '').trim();
    const name = get('name');
    if (!name) { form.elements.name.setCustomValidity('Escribe tu nombre y apellidos.'); form.elements.name.reportValidity(); form.elements.name.addEventListener('input', () => form.elements.name.setCustomValidity(''), {once:true}); return; }
    const coming = get('attendance') === 'Sí';
    const lines = ['Confirmación boda Nayelis & Dominik', `Nombre: ${name}`, `Asistencia: ${coming ? 'Sí' : 'No podré asistir'}`];
    if (coming) lines.push(
      `Pareja: ${get('partner') === 'Sí' ? `Sí (${get('partnerName')})` : 'No'}`,
      `Alergias o intolerancias: ${get('allergy') === 'Sí' ? get('allergyDetail') : 'No'}`,
      `Menú especial: ${get('menu') === 'Otro' ? `Otro: ${get('menuOther')}` : get('menu')}`,
      `Niños: ${get('kids') === 'Sí' ? `Sí (${get('kidsCount')})` : 'No'}`,
      `Transporte al banquete: ${get('bus')}`);
    if (coming && get('song')) lines.push(`Canción: ${get('song')}`);
    if (get('message')) lines.push(`Mensaje: ${get('message')}`);
    const target = get('recipient') === 'groom' ? config.groomPhone : config.bridePhone;
    status.innerHTML = '<p>Tu mensaje está preparado. Ábrelo y envíalo en WhatsApp para completar la confirmación.</p>' + externalLink(whatsapp(target, lines.join('\n')), 'Abrir WhatsApp y enviar');
  });
}

const revealItems = document.querySelectorAll('.reveal');
if (!reducedMotion && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('in'); observer.unobserve(entry.target); } }), {threshold:.12, rootMargin:'0px 0px -30px 0px'});
  revealItems.forEach(item => observer.observe(item));
} else revealItems.forEach(item => item.classList.add('in'));
