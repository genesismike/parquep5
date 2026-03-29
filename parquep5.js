// ============================================================
// PARQUEP5 — Script principal
// Ficheiro externo para evitar corrupção pelo Cloudflare
// ============================================================

var APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxlCmGf7TpSC-MWvICkYZgcNDRXI8uhKS9HV0IetLkSgoHvCm_Ps6f3ukz4thk9vXd9/exec";

var TARIFAS = {
  "Descoberto": { tabela:[0,14,20,26,32,38,44,50,56,62,68,74,80,86,92,98,104,110,116,122,128,134,140,146,152,158,164,170,176,182,188], surcharge:6 },
  "Toldo":      { tabela:[0,15,22,29,36,43,50,57,64,71,78,85,92,99,106,113,120,127,134,141,148,155,162,169,176,183,190,197,204,211,218], surcharge:7 },
  "Coberto":    { tabela:[0,16,24,32,40,48,56,64,72,80,88,96,104,112,120,128,136,144,152,160,168,176,184,192,200,208,216,224,232,240,248], surcharge:8 }
};

var currentStep = 1;

function calcularDias(e, s) {
  var d1 = new Date(e + 'T00:00:00'), d2 = new Date(s + 'T00:00:00');
  if (isNaN(d1) || isNaN(d2) || d2 <= d1) return 0;
  return Math.floor((d2 - d1) / 86400000) + 1;
}

function calcularPreco() {
  var e = document.getElementById('entrada').value;
  var s = document.getElementById('saida').value;
  var t = document.getElementById('tipo').value;
  var disp = document.getElementById('price-display');
  if (!e || !s || !t) { disp.classList.remove('visible'); return; }
  var dias = calcularDias(e, s);
  if (dias <= 0) { disp.classList.remove('visible'); return; }
  var tar = TARIFAS[t];
  var base = dias <= 30 ? tar.tabela[dias] : tar.tabela[30] + (dias - 30) * tar.surcharge;
  var ext = 0, desc = [];
  if (document.getElementById('extra-lavagem').checked) { ext += 30; desc.push('Lavagem: <strong>&#8364;30</strong>'); }
  if (document.getElementById('extra-eletrico').checked) { ext += 25; desc.push('Carregamento: <strong>&#8364;25</strong>'); }
  if (document.getElementById('extra-chave').checked)    { ext += 15; desc.push('Leve a chave: <strong>&#8364;15</strong>'); }
  document.getElementById('price-total').textContent = (base + ext).toFixed(2).replace('.', ',');
  document.getElementById('price-days').textContent = dias;
  var bkd = t + ' \u00b7 ' + dias + ' dia' + (dias > 1 ? 's' : '') + ': <strong>&#8364;' + base.toFixed(2).replace('.', ',') + '</strong>';
  if (dias > 30) bkd += ' <span style="color:rgba(255,255,255,.4)">(base &#8364;' + tar.tabela[30] + ' + ' + (dias - 30) + ' dias \u00d7 &#8364;' + tar.surcharge + ')</span>';
  if (desc.length) bkd += '<br>' + desc.join('<br>');
  document.getElementById('price-breakdown').innerHTML = bkd;
  disp.classList.add('visible');
}

window.validarExtras = function(changed) {
  var chave    = document.getElementById('extra-chave');
  var lavagem  = document.getElementById('extra-lavagem');
  var eletrico = document.getElementById('extra-eletrico');
  var aviso    = document.getElementById('extras-aviso');

  // Se marcou "Leve a Chave" → desmarcar e desabilitar os outros
  if (changed === 'chave' && chave.checked) {
    lavagem.checked  = false;
    eletrico.checked = false;
    lavagem.disabled  = true;
    eletrico.disabled = true;
    setExtraDisabled('extra-lavagem', true);
    setExtraDisabled('extra-eletrico', true);
    if (aviso) aviso.style.display = 'block';
  }
  // Se marcou lavagem ou elétrico → desmarcar e desabilitar "Leve a Chave"
  else if ((changed === 'lavagem' || changed === 'eletrico') && (lavagem.checked || eletrico.checked)) {
    chave.checked  = false;
    chave.disabled = true;
    setExtraDisabled('extra-chave', true);
    if (aviso) aviso.style.display = 'block';
  }
  // Se desmarcou tudo → reabilitar tudo
  else if (!chave.checked && !lavagem.checked && !eletrico.checked) {
    lavagem.disabled  = false;
    eletrico.disabled = false;
    chave.disabled    = false;
    setExtraDisabled('extra-lavagem', false);
    setExtraDisabled('extra-eletrico', false);
    setExtraDisabled('extra-chave', false);
    if (aviso) aviso.style.display = 'none';
  }
  calcularPreco();
};

function setExtraDisabled(id, disabled) {
  var label = document.querySelector('label[for="' + id + '"]');
  if (disabled) {
    label.style.opacity = '0.35';
    label.style.cursor  = 'not-allowed';
    label.style.pointerEvents = 'none';
  } else {
    label.style.opacity = '';
    label.style.cursor  = '';
    label.style.pointerEvents = '';
  }
}

function scrollToForm() {
  document.getElementById('form-card').scrollIntoView({ behavior: 'smooth' });
}

function showErr(step, msg) {
  var el = document.getElementById('err-' + step);
  if (!el) return;
  el.textContent = '\u26a0 ' + msg;
  el.classList.add('visible');
}

function clearErr(step) {
  var el = document.getElementById('err-' + step);
  if (el) { el.textContent = ''; el.classList.remove('visible'); }
}

function validate(step) {
  if (step === 1) {
    var n = document.getElementById('nome').value.trim();
    var t = document.getElementById('telefone').value.trim();
    var e = document.getElementById('email').value.trim();
    if (!n) { showErr(1, 'Por favor preencha o nome.'); return false; }
    if (!t) { showErr(1, 'Por favor preencha o telefone.'); return false; }
    if (!e || e.indexOf('@') < 1) { showErr(1, 'Por favor preencha um email v\u00e1lido.'); return false; }
  }
  if (step === 2) {
    var ent = document.getElementById('entrada').value;
    var sai = document.getElementById('saida').value;
    var tip = document.getElementById('tipo').value;
    if (!ent) { showErr(2, 'Por favor indique a data de entrada.'); return false; }
    if (!sai) { showErr(2, 'Por favor indique a data de sa\u00edda.'); return false; }
    if (!tip) { showErr(2, 'Por favor selecione o tipo de estacionamento.'); return false; }
    if (calcularDias(ent, sai) <= 0) { showErr(2, 'A data de sa\u00edda deve ser posterior \u00e0 de entrada.'); return false; }
  }
  return true;
}

function goToStep(step) {
  clearErr(currentStep);
  if (step > currentStep && !validate(currentStep)) return;
  for (var i = 1; i <= 3; i++) {
    var d = document.getElementById('dot-' + i);
    d.className = 'step-dot';
    if (i < step) d.classList.add('done');
    else if (i === step) d.classList.add('active');
  }
  document.getElementById('step-' + currentStep).classList.remove('active');
  document.getElementById('step-' + step).classList.add('active');
  currentStep = step;
  if (step === 3) buildSummary();
  document.getElementById('form-card').scrollIntoView({ behavior: 'smooth' });
}

function fmtDate(v) {
  if (!v) return '\u2014';
  var p = v.split('-');
  return p[2] + '/' + p[1] + '/' + p[0];
}

function getExtras() {
  var ex = [];
  if (document.getElementById('extra-lavagem').checked) ex.push('Lavagem completa (\u20ac30)');
  if (document.getElementById('extra-eletrico').checked) ex.push('Carregamento el\u00e9trico (\u20ac25)');
  if (document.getElementById('extra-chave').checked) ex.push('Leve a chave (\u20ac15)');
  return ex.join(', ') || 'Nenhum';
}

function buildSummary() {
  var ent = document.getElementById('entrada').value;
  var sai = document.getElementById('saida').value;
  var tip = document.getElementById('tipo').value;
  var dias = calcularDias(ent, sai);
  var tar = TARIFAS[tip] || { tabela: [0], surcharge: 0 };
  var base = dias <= 30 ? (tar.tabela[dias] || 0) : tar.tabela[30] + (dias - 30) * tar.surcharge;
  var ext = 0;
  if (document.getElementById('extra-lavagem').checked) ext += 30;
  if (document.getElementById('extra-eletrico').checked) ext += 25;
  if (document.getElementById('extra-chave').checked) ext += 15;
  var he = document.getElementById('hora-entrada').value;
  var hs = document.getElementById('hora-saida').value;
  var vp = document.getElementById('voo-partida').value.trim();
  var vr = document.getElementById('voo-regresso').value.trim();
  var nm = document.getElementById('nome').value.trim();
  var tl = document.getElementById('telefone').value.trim();
  var em = document.getElementById('email').value.trim();
  var mt = document.getElementById('matricula').value.trim();
  document.getElementById('summary').innerHTML =
    '<strong style="font-size:14px;color:var(--black)">Resumo da reserva</strong><br><br>' +
    '\ud83d\udc64 <strong>' + nm + '</strong> \u00b7 \ud83d\udcde ' + tl + '<br>' +
    '\ud83d\udce7 ' + em + (mt ? ' \u00b7 \ud83d\ude97 ' + mt : '') + '<br><br>' +
    '\ud83d\udcc5 <strong>Entrada:</strong> ' + fmtDate(ent) + (he ? ' \u00e0s ' + he : '') + (vp ? ' \u00b7 \u2708\ufe0f ' + vp : '') + '<br>' +
    '\ud83d\udcc5 <strong>Sa\u00edda:</strong> ' + fmtDate(sai) + (hs ? ' \u00e0s ' + hs : '') + ' <em style="color:var(--gray)">(' + dias + ' dia' + (dias > 1 ? 's' : '') + ')</em>' + (vr ? ' \u00b7 \u2708\ufe0f ' + vr : '') + '<br>' +
    '\ud83c\udd7f\ufe0f <strong>Tipo:</strong> ' + tip + '<br>' +
    '\u2795 <strong>Extras:</strong> ' + getExtras() + '<br><br>' +
    '<span style="font-size:15px;font-family:\'Barlow Condensed\',sans-serif;font-weight:900;color:var(--red)">ESTIMATIVA TOTAL: \u20ac' + (base + ext).toFixed(2).replace('.', ',') + '</span>' +
    '<span style="font-size:11px;color:var(--gray);display:block;margin-top:2px">* Valor estimado, sujeito a confirma\u00e7\u00e3o</span>';
}

function showThankYou(d) {
  document.body.classList.add('ty-active');
  ['section.hero', 'div.stats-strip', 'section.features', 'section.pricing', 'section.cta-strip', 'footer'].forEach(function(sel) {
    var el = document.querySelector(sel);
    if (el) el.style.display = 'none';
  });
  document.getElementById('ty-page').style.display = 'block';
  window.scrollTo(0, 0);

  document.getElementById('ty-nome').textContent = (d.nome || '').split(' ')[0] || 'Cliente';
  document.getElementById('ty-ref').textContent = 'P5-' + Date.now().toString(36).slice(-4).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
  document.getElementById('ty-d-nome').textContent = d.nome || '\u2014';
  document.getElementById('ty-d-tel').textContent = d.telefone || '\u2014';
  document.getElementById('ty-d-email').textContent = d.email || '\u2014';
  if (d.matricula) { document.getElementById('ty-d-mat').textContent = d.matricula; }
  else { document.getElementById('ty-row-mat').style.display = 'none'; }
  document.getElementById('ty-d-tipo').textContent = d.tipo || '\u2014';
  document.getElementById('ty-d-dias').textContent = d.dias + ' dia' + (d.dias > 1 ? 's' : '') + ' de calend\u00e1rio';
  document.getElementById('ty-d-extras').textContent = d.extras || 'Nenhum';
  if (d.notas) { document.getElementById('ty-d-notas').textContent = d.notas; document.getElementById('ty-row-notas').style.display = 'block'; }
  document.getElementById('ty-entrada').textContent = d.entrada || '\u2014';
  document.getElementById('ty-saida').textContent = d.saida || '\u2014';
  document.getElementById('ty-voo-p').textContent = (d.voo_partida && d.voo_partida !== '-') ? '\u2708 ' + d.voo_partida : '';
  document.getElementById('ty-voo-r').textContent = (d.voo_regresso && d.voo_regresso !== '-') ? '\u2708 ' + d.voo_regresso : '';

  var num = parseFloat((d.estimativa || '0').replace('\u20ac', '').replace(',', '.')) || 0;
  document.getElementById('ty-total-num').textContent = num.toFixed(2).replace('.', ',');
  var extN = 0, brows = '';
  if (d.extras && d.extras !== 'Nenhum') {
    if (d.extras.indexOf('Lavagem') >= 0)    { extN += 30; brows += '<div class="ty-brow"><strong>Lavagem completa</strong><span>\u20ac30,00</span></div>'; }
    if (d.extras.indexOf('Carregamento') >= 0){ extN += 25; brows += '<div class="ty-brow"><strong>Carregamento el\u00e9trico</strong><span>\u20ac25,00</span></div>'; }
    if (d.extras.indexOf('Leve a chave') >= 0){ extN += 15; brows += '<div class="ty-brow"><strong>Leve a chave</strong><span>\u20ac15,00</span></div>'; }
  }
  brows = '<div class="ty-brow"><strong>' + d.tipo + ' \u00b7 ' + d.dias + ' dia' + (d.dias > 1 ? 's' : '') + '</strong><span>\u20ac' + (num - extN).toFixed(2).replace('.', ',') + '</span></div>' + brows;
  document.getElementById('ty-breakdown').innerHTML = brows;
}

function submitForm() {
  // Validar checkboxes obrigatórios
  var termos = document.getElementById('aceito-termos');
  var priv   = document.getElementById('aceito-privacidade');
  var err3   = document.getElementById('err-3');
  if (!termos || !termos.checked || !priv || !priv.checked) {
    if (err3) {
      err3.textContent = '\u26a0 Por favor aceite os Termos e Condi\u00e7\u00f5es e a Pol\u00edtica de Privacidade para continuar.';
      err3.style.display = 'block';
    }
    return;
  }
  if (err3) err3.style.display = 'none';

  var btn = document.getElementById('btn-submit');
  btn.textContent = 'A enviar...';
  btn.disabled = true;
  var ent = document.getElementById('entrada').value;
  var sai = document.getElementById('saida').value;
  var tip = document.getElementById('tipo').value;
  var dias = calcularDias(ent, sai);
  var tar = TARIFAS[tip] || { tabela: [0], surcharge: 0 };
  var base = dias <= 30 ? (tar.tabela[dias] || 0) : tar.tabela[30] + (dias - 30) * tar.surcharge;
  var ext = 0;
  if (document.getElementById('extra-lavagem').checked) ext += 30;
  if (document.getElementById('extra-eletrico').checked) ext += 25;
  if (document.getElementById('extra-chave').checked) ext += 15;
  var data = {
    nome:      document.getElementById('nome').value.trim(),
    telefone:  document.getElementById('telefone').value.trim(),
    email:     document.getElementById('email').value.trim(),
    matricula: document.getElementById('matricula').value.trim(),
    entrada:   fmtDate(ent) + (document.getElementById('hora-entrada').value ? ' \u00e0s ' + document.getElementById('hora-entrada').value : ''),
    voo_partida:  document.getElementById('voo-partida').value.trim() || '-',
    saida:     fmtDate(sai) + (document.getElementById('hora-saida').value ? ' \u00e0s ' + document.getElementById('hora-saida').value : ''),
    voo_regresso: document.getElementById('voo-regresso').value.trim() || '-',
    dias:      dias,
    tipo:      tip,
    extras:    getExtras(),
    estimativa: '\u20ac' + (base + ext).toFixed(2).replace('.', ','),
    notas:     document.getElementById('notas').value.trim()
  };
  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL === "COLA_AQUI_O_URL_DO_APPS_SCRIPT") {
    showThankYou(data);
    return;
  }
  fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(function() {
    showThankYou(data);
  }).catch(function() {
    showThankYou(data);
  });
}
