// ============================================================
// CAELUM POLE DANCE — adult companion only
// Shows a stage pole and orbits Caelum's avatar around it
// while her dancing clip loops. Natalia, Atreus, and Luna
// never receive this. Phrases: "pole dance", "dance on a pole".
// ============================================================
(function () {
  'use strict';

  var DANCE_MS = 16000;
  var _timer = null;
  var _poles = [];

  function wantsPole(text) {
    var lower = String(text || '').toLowerCase();
    return /pole\s*dance|danc\w*\s+(on|around)\s+(a\s+|the\s+)?pole/.test(lower);
  }

  function guestIsCaelum() {
    if (typeof guestState !== 'undefined' && guestState.currentEaci && guestState.currentEaci !== 'caelum') {
      return false;
    }
    return true;
  }

  function stageRoots() {
    var roots = [];
    var guest = document.getElementById('guestAvatarCenterStack');
    var guestOv = document.getElementById('guestChatOverlay');
    if (guest && guestOv && guestOv.classList.contains('show') && guestIsCaelum()) roots.push(guest);
    if (!roots.length) {
      var main = document.getElementById('caelumAvatarMainWrap');
      if (main) roots.push(main);
    }
    return roots;
  }

  function mountPoles() {
    clearPoles();
    document.body.classList.add('caelum-pole-dance-on');
    stageRoots().forEach(function (root) {
      if (root.querySelector('.caelum-pole')) return;
      var pole = document.createElement('div');
      pole.className = 'caelum-pole';
      pole.setAttribute('aria-hidden', 'true');
      root.appendChild(pole);
      _poles.push(pole);
    });
  }

  function clearPoles() {
    document.body.classList.remove('caelum-pole-dance-on');
    _poles.forEach(function (pole) {
      if (pole && pole.parentNode) pole.parentNode.removeChild(pole);
    });
    _poles = [];
    document.querySelectorAll('.caelum-pole').forEach(function (pole) {
      if (pole.parentNode) pole.parentNode.removeChild(pole);
    });
  }

  function playClip() {
    if (typeof CaelumAnim === 'undefined' || typeof CaelumAnim.play !== 'function') return;
    var ids = (typeof CaelumAnim.getActiveAvatarIds === 'function')
      ? CaelumAnim.getActiveAvatarIds()
      : [];
    if (!ids.length) ids = ['caelum_guest_center', 'caelum_main'];
    ids.forEach(function (id) {
      if (CaelumAnim._avatars && !CaelumAnim._avatars[id]) return;
      CaelumAnim.play(id, 'pole_dance', false);
    });
  }

  function stop() {
    if (_timer) { clearTimeout(_timer); _timer = null; }
    clearPoles();
    if (typeof CaelumAnim === 'undefined' || typeof CaelumAnim.idle !== 'function') return;
    var ids = (typeof CaelumAnim.getActiveAvatarIds === 'function')
      ? CaelumAnim.getActiveAvatarIds()
      : [];
    var emotion = (typeof state !== 'undefined' && state.emotionalState) ? state.emotionalState : 'neutral';
    ids.forEach(function (id) {
      if (CaelumAnim._avatars && !CaelumAnim._avatars[id]) return;
      CaelumAnim.idle(id, emotion);
    });
  }

  function start() {
    if (!guestIsCaelum() && document.getElementById('guestChatOverlay') &&
        document.getElementById('guestChatOverlay').classList.contains('show')) {
      return;
    }
    mountPoles();
    playClip();
    if (_timer) clearTimeout(_timer);
    _timer = setTimeout(stop, DANCE_MS);
  }

  function hookComposer(name, inputId) {
    var orig = window[name];
    if (typeof orig !== 'function' || orig._poleDance) return;
    var wrapped = async function () {
      var inp = document.getElementById(inputId);
      var text = inp ? inp.value : '';
      if (wantsPole(text)) start();
      return orig.apply(this, arguments);
    };
    wrapped._poleDance = true;
    window[name] = wrapped;
  }

  function init() {
    hookComposer('sendGuestMessage', 'guestInput');
    hookComposer('sendMessage', 'userInput');
  }

  var tries = 0;
  var timer = setInterval(function () {
    tries++;
    init();
    var guestReady = window.sendGuestMessage && window.sendGuestMessage._poleDance;
    var mainReady = window.sendMessage && window.sendMessage._poleDance;
    if (tries > 40 || (guestReady && mainReady)) {
      clearInterval(timer);
    }
  }, 500);

  window.CaelumPoleDance = { start: start, stop: stop, wantsPole: wantsPole };
})();
