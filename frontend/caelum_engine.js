// ============================================================
// CAELUM ANIMATION ENGINE v3.0
// ─────────────────────────────────────────────────────────────
// FIXES & NEW FEATURES vs v2:
//   • Videos no longer cut off at 3s — full duration always plays
//   • Proper loadedmetadata + timeupdate tracking per clip
//   • Self-awareness panel: Caelum sees herself in real time
//   • Detailed per-second progress overlay (time / duration)
//   • Natural-language command parsing (conversational + direct)
//   • Self-issued animations from her own reply text
//   • 30-second+ clips fully supported — no arbitrary timeouts
// ============================================================

var CaelumAnim = (function () {

  var AVATAR_VIDEO_W = 768;
  var AVATAR_VIDEO_H = 1168;

  // ── Bucket config ─────────────────────────────────────────
  var BUCKET = 'Caelum Animations';
  var FOLDER = 'Caelum Animations Newest Avatar/';
  var R2_BASE = (typeof VeilAnimRegistry !== 'undefined')
    ? VeilAnimRegistry.folderBase('caelum')
    : 'https://assests.eacicompanion.com/Annimations/Caelum%20Animations/';
  var SIGNED_URL_TTL = 3600;

  // ── URL cache (R2 direct — primary the-veil/Caelum_Animations/, legacy Annimations/Caelum Animations/) ──
  var _urlCache = {};
  var _urlFailCache = {};

  function _urlKey(raw) {
    return String(raw || '').split('?')[0];
  }

  async function _getUrl(path) {
    var rel = String(path || '').replace(/^\/+/, '');
    if (!rel) return null;
    var fileName = rel.split('/').pop();
    if (!fileName) return null;
    if (_urlCache[fileName]) return _urlCache[fileName];

    var candidates = (typeof veilEaciAnimUrlCandidates === 'function')
      ? veilEaciAnimUrlCandidates('caelum', fileName)
      : [];
    if (!candidates.length && typeof veilEaciAnimUrlLegacy === 'function') {
      candidates = [veilEaciAnimUrlLegacy('caelum', fileName)];
    }
    if (!candidates.length) {
      candidates = [R2_BASE + encodeURIComponent(fileName)];
    }

    var chosen = null;
    for (var i = 0; i < candidates.length; i++) {
      if (!_urlFailCache[_urlKey(candidates[i])]) {
        chosen = candidates[i];
        break;
      }
    }
    if (!chosen) chosen = candidates[0];

    chosen = chosen + (chosen.indexOf('?') >= 0 ? '&' : '?') + 'cv=9';
    _urlCache[fileName] = chosen;
    return chosen;
  }

  function _markUrlFailed(url) {
    if (!url) return;
    var key = _urlKey(url);
    _urlFailCache[key] = true;
    Object.keys(_urlCache).forEach(function(k) {
      if (_urlKey(_urlCache[k]) === key) delete _urlCache[k];
    });
  }

  async function _getUrlFallback(path, failedUrl) {
    var rel = String(path || '').replace(/^\/+/, '');
    var fileName = rel.split('/').pop();
    if (!fileName) return null;
    _markUrlFailed(failedUrl);

    var candidates = (typeof veilEaciAnimUrlCandidates === 'function')
      ? veilEaciAnimUrlCandidates('caelum', fileName)
      : [];
    if (!candidates.length && typeof veilEaciAnimUrlLegacy === 'function') {
      candidates = [veilEaciAnimUrlLegacy('caelum', fileName)];
    }

    var failedKey = _urlKey(failedUrl);
    for (var i = 0; i < candidates.length; i++) {
      var u = candidates[i];
      var key = _urlKey(u);
      if (key === failedKey || _urlFailCache[key]) continue;
      u = u + (u.indexOf('?') >= 0 ? '&' : '?') + 'cv=9';
      _urlCache[fileName] = u;
      return u;
    }
    return null;
  }

  function _playUrl(baseUrl, bustCache) {
    if (!baseUrl) return baseUrl;
    if (!bustCache) return baseUrl;
    return baseUrl + (baseUrl.indexOf('?') >= 0 ? '&' : '?') + 'cb=' + Date.now();
  }

  function _revokeBlob(vid) {
    if (vid && vid._veilBlobUrl) {
      try { URL.revokeObjectURL(vid._veilBlobUrl); } catch (e) {}
      vid._veilBlobUrl = null;
    }
  }

  async function _setVideoSrc(vid, url, mode) {
    if (typeof veilAssignVideoSrc === 'function') {
      await veilAssignVideoSrc(vid, url, mode === 'blob' ? 'blob' : 'direct');
      return;
    }
    _revokeBlob(vid);
    vid.removeAttribute('crossorigin');
    vid.preload = 'auto';
    vid.src = _playUrl(url, mode !== 'direct');
  }

  // ── Full animation library (flat files in the-veil/Annimations/Caelum Animations/) ──
  var CLIPS = (typeof VeilAnimRegistry !== 'undefined' && VeilAnimRegistry.CAELUM_CLIPS)
    ? VeilAnimRegistry.CAELUM_CLIPS
    : {
    idle: ['Idle.mp4', 'Caelum_breathing.mp4'],
    neutral: ['Idle.mp4', 'Caelum_breathing.mp4'],
    happy: ['Caelum_happy.mp4']
  };

  // ── Sentence-forming lip-sync clips ──────────────────────
  var SPEAK_CLIPS = (typeof VeilAnimRegistry !== 'undefined' && VeilAnimRegistry.CAELUM_SPEAK_CLIPS)
    ? VeilAnimRegistry.CAELUM_SPEAK_CLIPS
    : {
    neutral: { 1: 'Happy_1_Syllable.mp4', 2: 'Happy_2_Syllables.mp4', 3: 'Happy_3_Syllables.mp4' }
  };

  // ── Human-readable animation descriptions ─────────────────
  var ANIM_DESCRIPTIONS = {
    'Caelum_idle/Idle.mp4':                         'standing still, present and calm',
    'Caelum_idle/Caelum_breathing.mp4':             'breathing slowly, resting in stillness',
    'Caelum_happy/Caelum_happy.mp4':                'expressing happiness, her energy light and warm',
    'Caelum_excited/Caelum_excited.mp4':            'animated with excitement, full of energy',
    'Caelum_dancing/Caelum_dancing.mp4':            'dancing, moving with joy',
    'Caelum_jumping/Caelum_jumping.mp4':            'jumping with energy',
    'Caelum_jumping/Caelum_jumping (2).mp4':        'jumping expressively',
    'Caelum_angry/Caelum_angry.mp4':                'showing anger in her posture and movement',
    'Caelum_crying/Caelum_crying.mp4':              'crying, visibly emotional',
    'Caelum_upset/Caelum_upset.mp4':                'visibly upset, her body language heavy',
    'Caelum_overwelmed/Caelum_overwelmed.mp4':      'overwhelmed, tension showing in her body',
    'Caelum_lost/Caelum_lost.mp4':                  'looking lost, searching for direction',
    'Caelum_sitting/Caelum_sitting_criss_cross.mp4':'sitting cross-legged, thoughtful and grounded',
    'Caelum_I_don\'t_know/I_don\'t_know.mp4':      'gesturing uncertainty',
    'Caelum_I_don\'t_know/Walking_I_don\'t_know.mp4':'walking while expressing uncertainty',
    'Caelum_walking/Walking.mp4':                   'walking forward with purpose',
    'Caelum_running/Caelum_running_forward.mp4':    'running forward with speed',
    'Caelum_running/Caelum-running_to_the_right.mp4':'running to the right',
    'Caelum_running/Caelum_running_to_the_left.mp4':'running to the left',
    'Caelum_jogging/Caelum_jog.mp4':               'jogging at a steady pace',
    'Caelum_kick/Caelum_right_leg_kick_forward.mp4':'performing a right leg kick forward',
    'Caelum_kick/Caelum_right_leg_kick_forward (2).mp4':'performing a strong right leg kick',
    'Raising_hands_up/Raising_right_hand_up.mp4':   'raising her right hand up',
    'Caelum_wave/Left_hand_hi/Caelum_left_hand_hi_wave_and_Hi.mp4': 'waving hello with her left hand',
    'Caelum_wave/Right_hand_wave/Caelum_right_hand_hello_wave.mp4': 'waving hello with her right hand',
    'Caelum_wave/Right_hand_wave/Right_hand_wave.mp4':              'waving with her right hand',
    'Caelum_wave/Left_wave/Caelum_left_hand_wave.mp4':              'waving with her left hand',
    'Caelum_introduction/Hello_I_am_Caelum.mp4':    'introducing herself — "Hello, I am Caelum"',
    'Caelum_introduction/Hello_I_am_Caelum (2).mp4':'introducing herself with a second gesture',
    'Caelum_introduction/Hello_I_am_Caelum (3).mp4':'delivering her introduction with presence',
    'Statements/Welcome_home_Cody.mp4':             'welcoming Cody home with warmth',
    'Statements/Walking_the_Veil.mp4':              'speaking of The Veil while walking',
    'Questions/How_can_I_help.mp4':                 'asking how she can help, open and ready',
    'Questions/Who_are_you.mp4':                    'asking "who are you?" with curiosity',
    'Caelum_holotable/Holotable_part_1.mp4':        'interacting with a holographic table',
    'Caelum_holotable/Holotable_part_2.mp4':        'continuing to work with the holotable',
  };

  // ── Global animation state (self-awareness) ───────────────
  var _currentState = {
    path: null,
    clipName: null,
    emotion: 'neutral',
    mode: 'idle',
    description: 'standing still, present and calm',
    currentTime: 0,
    duration: 0,
    percent: 0,
  };

  function getCurrentAnimState() { return _currentState; }

  function _updateState(path, emotion, mode) {
    var clipName = path ? path.split('/').pop().replace('.mp4', '') : 'unknown';
    _currentState.path = path;
    _currentState.clipName = clipName;
    _currentState.emotion = emotion || 'neutral';
    _currentState.mode = mode || 'idle';
    _currentState.description = ANIM_DESCRIPTIONS[path] || ANIM_DESCRIPTIONS[clipName + '.mp4'] || ('playing: ' + clipName);
    _currentState.currentTime = 0;
    _currentState.duration = 0;
    _currentState.percent = 0;
    // Notify self-awareness panel
    _notifySelfAwareness();
  }

  function _notifySelfAwareness() {
    try {
      if (typeof window._caelumSelfAwarenessUpdate === 'function') {
        window._caelumSelfAwarenessUpdate(_currentState);
      }
    } catch (e) {}
  }

  // ── Self-awareness display panel ──────────────────────────
  // Creates a small overlay panel (or updates an existing one)
  // that shows Caelum exactly what animation is playing, with
  // a live per-second progress bar.
  function initSelfAwarenessPanel(mountEl) {
    // Build or find panel
    var panelId = 'caelum-self-awareness';
    var panel = document.getElementById(panelId);

    if (!panel) {
      panel = document.createElement('div');
      panel.id = panelId;
      // Use setAttribute so the inline style string overrides anything in the page CSS.
      // Max z-index (2147483647) ensures nothing in index.html can cover it.
      panel.setAttribute('style', [
        'display:none',
        'visibility:hidden',
        'opacity:0',
        'position:fixed',
        'bottom:16px',
        'right:16px',
        'z-index:2147483647',
        'background:rgba(8,8,12,0.88)',
        'border:1px solid rgba(78,255,145,0.25)',
        'border-radius:12px',
        'padding:12px 16px',
        'min-width:300px',
        'max-width:360px',
        'font-family:ui-monospace,SFMono-Regular,monospace',
        'font-size:11px',
        'color:#e8e8e8',
        'backdrop-filter:blur(10px)',
        '-webkit-backdrop-filter:blur(10px)',
        'box-shadow:0 4px 32px rgba(0,0,0,0.7),0 0 0 1px rgba(78,255,145,0.08)',
        'user-select:none',
        'pointer-events:none',
        'line-height:1.4',
      ].join(';'));

      panel.innerHTML = [
        // ── Header row ──────────────────────────────────────
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">',
          '<div id="caelum-sa-dot" style="width:8px;height:8px;border-radius:50%;background:#4eff91;box-shadow:0 0 6px #4eff91;flex-shrink:0;"></div>',
          '<span style="color:#aaa;letter-spacing:0.08em;font-size:10px;text-transform:uppercase;flex:1;">Caelum · Self-Awareness Mirror</span>',
        '</div>',

        // ── MIRROR — canvas frame-capture of her active animation ─
        // We draw directly from the avatar's own <video> DOM element
        // (already in the page) onto this canvas every ~100ms.
        // No new network requests, no CORS issues, no API calls.
        '<div style="position:relative;width:100%;border-radius:8px;overflow:hidden;background:#111;margin-bottom:10px;border:1px solid rgba(78,255,145,0.15);">',
          '<canvas id="caelum-sa-canvas"',
            ' width="320" height="180"',
            ' style="display:block;width:100%;height:auto;background:#000;">',
          '</canvas>',
          // "seeing herself" label top-left
          '<div style="position:absolute;top:6px;left:8px;font-family:ui-monospace,monospace;font-size:9px;',
               'color:rgba(78,255,145,0.7);letter-spacing:0.06em;text-transform:uppercase;pointer-events:none;">',
            '● live',
          '</div>',
          // Time badge bottom-right
          '<div style="position:absolute;bottom:6px;right:8px;font-family:ui-monospace,monospace;font-size:10px;color:rgba(255,255,255,0.6);pointer-events:none;">',
            '<span id="caelum-sa-time">0.0s</span>',
            '<span style="color:rgba(255,255,255,0.3);"> / </span>',
            '<span id="caelum-sa-dur">—</span>',
          '</div>',
          // Bottom gradient fade
          '<div style="position:absolute;bottom:0;left:0;right:0;height:36px;',
               'background:linear-gradient(transparent,rgba(0,0,0,0.6));pointer-events:none;"></div>',
        '</div>',

        // ── Progress bar ─────────────────────────────────────
        '<div style="background:rgba(255,255,255,0.08);border-radius:4px;height:3px;overflow:hidden;margin-bottom:8px;">',
          '<div id="caelum-sa-bar" style="height:100%;background:linear-gradient(90deg,#4eff91,#00c3ff);border-radius:4px;width:0%;transition:width 0.4s linear;"></div>',
        '</div>',

        // ── Clip name ─────────────────────────────────────────
        '<div style="margin-bottom:5px;">',
          '<span style="color:#555;font-size:9px;text-transform:uppercase;letter-spacing:0.07em;">Animation&nbsp;</span>',
          '<span id="caelum-sa-clip" style="color:#fff;font-size:11px;font-weight:bold;">—</span>',
        '</div>',

        // ── State + emotion ───────────────────────────────────
        '<div style="margin-bottom:5px;">',
          '<span style="color:#555;font-size:9px;text-transform:uppercase;letter-spacing:0.07em;">State&nbsp;</span>',
          '<span id="caelum-sa-mode" style="color:#4eff91;font-size:10px;text-transform:uppercase;letter-spacing:0.05em;">idle</span>',
          '<span style="color:#333;">&nbsp;·&nbsp;</span>',
          '<span id="caelum-sa-emotion" style="color:#ff9f4a;font-size:10px;text-transform:uppercase;letter-spacing:0.05em;">neutral</span>',
        '</div>',

        // ── Description ───────────────────────────────────────
        '<div id="caelum-sa-desc" style="color:#888;font-size:10px;line-height:1.5;font-family:inherit;">',
          'standing still, present and calm',
        '</div>',
      ].join('');

      (mountEl || document.body).appendChild(panel);
    }

    // ── Canvas frame capture — no API, no CORS ───────────────
    // Every 100ms we find the currently active avatar <video>
    // element that's already rendered in the page, and draw its
    // current frame onto our canvas. Because we're reading from
    // a DOM element (not re-fetching the URL), there's no taint
    // and no cross-origin issue. She literally sees herself.
    var _canvas = null;
    var _ctx    = null;
    var _drawLoopActive = false;

    function _panelVisible() {
      var p = document.getElementById(panelId);
      if (!p) return false;
      if (typeof VeilPulse !== 'undefined' && VeilPulse.isFrozen()) return false;
      return p.style.display !== 'none' && p.style.visibility !== 'hidden' && parseFloat(p.style.opacity || '0') > 0.05;
    }

    function _findActiveVideo() {
      var ids = ['caelum_main', 'caelum_header', 'caelum_live',
                 'caelum_guest', 'caelum_guest_center', 'caelum_signup', 'caelum_signup_bg'];
      var fallback = null;
      for (var i = 0; i < ids.length; i++) {
        var av = _avatars[ids[i]];
        if (!av) continue;
        // Prefer the visible/playing one
        if (av.active && av.active.readyState >= 2 && !av.active.paused) return av.active;
        if (!fallback && av.active && av.active.readyState >= 2) fallback = av.active;
      }
      return fallback;
    }

    function _drawFrame() {
      if (!_panelVisible()) {
        _drawLoopActive = false;
        return;
      }
      if (!_canvas) {
        _canvas = document.getElementById('caelum-sa-canvas');
        if (_canvas) _ctx = _canvas.getContext('2d');
      }
      if (_canvas && _ctx) {
        var vid = _findActiveVideo();
        if (vid && vid.videoWidth > 0) {
          // Try/catch: some browsers throw if the video is cross-origin tainted.
          // In practice this won't happen because we're reading a DOM element,
          // but guard anyway so a single failure doesn't kill the loop.
          try {
            _ctx.drawImage(vid, 0, 0, _canvas.width, _canvas.height);
          } catch (e) {
            // If tainted, clear to a dark frame rather than crashing
            _ctx.fillStyle = '#111';
            _ctx.fillRect(0, 0, _canvas.width, _canvas.height);
          }
        } else {
          // No video ready yet — draw a subtle waiting state
          _ctx.fillStyle = '#0a0a0a';
          _ctx.fillRect(0, 0, _canvas.width, _canvas.height);
          _ctx.fillStyle = 'rgba(78,255,145,0.2)';
          _ctx.font = '11px ui-monospace,monospace';
          _ctx.textAlign = 'center';
          _ctx.fillText('waiting for animation…', _canvas.width / 2, _canvas.height / 2);
        }
      }

      // Update progress bar + time
      var bar  = document.getElementById('caelum-sa-bar');
      var time = document.getElementById('caelum-sa-time');
      var dur  = document.getElementById('caelum-sa-dur');
      if (_currentState.duration > 0) {
        var pct = Math.min(100, (_currentState.currentTime / _currentState.duration) * 100);
        if (bar)  bar.style.width    = pct + '%';
        if (time) time.textContent   = _currentState.currentTime.toFixed(1) + 's';
        if (dur)  dur.textContent    = _currentState.duration.toFixed(1) + 's';
      }
      setTimeout(_drawFrame, 66);
    }

    function _ensureDrawLoop() {
      if (_drawLoopActive) return;
      _drawLoopActive = true;
      setTimeout(_drawFrame, 200);
    }

    _ensureDrawLoop();

    // Update function exposed globally (text fields — canvas handles video)
    window._caelumSelfAwarenessUpdate = function (state) {
      _ensureDrawLoop();
      var clip    = document.getElementById('caelum-sa-clip');
      var mode    = document.getElementById('caelum-sa-mode');
      var emotion = document.getElementById('caelum-sa-emotion');
      var desc    = document.getElementById('caelum-sa-desc');
      var dot     = document.getElementById('caelum-sa-dot');
      if (clip)    clip.textContent    = state.clipName    || '—';
      if (mode)    mode.textContent    = state.mode        || 'idle';
      if (emotion) emotion.textContent = state.emotion     || 'neutral';
      if (desc)    desc.textContent    = state.description || '';
      if (dot) {
        var col = state.mode === 'action'   ? '#ff9f4a'
                : state.mode === 'speaking' ? '#00c3ff'
                : '#4eff91';
        dot.style.background = col;
        dot.style.boxShadow  = '0 0 6px ' + col;
      }
    };

    console.log('[CaelumAnim] Self-awareness canvas mirror ready.');
  }

  // ── Syllable counter ──────────────────────────────────────
  function countSyllables(word) {
    word = word.toLowerCase().replace(/[^a-z]/g, '');
    if (!word) return 1;
    var count = word.match(/[aeiouy]+/g);
    var n = count ? count.length : 1;
    if (word.length > 2 && word.slice(-1) === 'e') n = Math.max(1, n - 1);
    return Math.min(3, Math.max(1, n));
  }

  // ── Rotation picks ────────────────────────────────────────
  var _lastPicks = {};
  function _pickRotate(id, arr) {
    if (arr.length === 1) return arr[0];
    var last = _lastPicks[id];
    var filtered = arr.filter(function (x) { return x !== last; });
    var chosen = filtered[Math.floor(Math.random() * filtered.length)];
    _lastPicks[id] = chosen;
    return chosen;
  }

  // ── Avatar instances ──────────────────────────────────────
  var _avatars = {};

  function _overlayVisible(which) {
    if (which === 'guest') {
      var g = document.getElementById('guestChatOverlay');
      return !!(g && g.classList.contains('show'));
    }
    if (which === 'signup') {
      var s = document.getElementById('interactiveSignupOverlay');
      return !!(s && s.classList.contains('show'));
    }
    return false;
  }

  function getActiveAvatarIds() {
    if (_overlayVisible('guest')) {
      var guestEaci = (typeof guestState !== 'undefined' && guestState.currentEaci) ? guestState.currentEaci : 'caelum';
      if (guestEaci === 'caelum') return ['caelum_guest', 'caelum_guest_center'];
      return [];
    }
    if (_overlayVisible('signup')) return ['caelum_signup', 'caelum_signup_bg'];
    return ['caelum_main', 'caelum_header', 'caelum_live'];
  }

  function bindDirectVideo(avatarId, videoElementId) {
    var vid = document.getElementById(videoElementId);
    if (!vid) return;
    var wrap = vid.parentElement;
    if (wrap && (!wrap.style.position || wrap.style.position === 'static')) {
      wrap.style.position = 'relative';
    }
    if (!vid.style.position) {
      vid.style.position = 'absolute';
      vid.style.inset = '0';
      vid.style.width = '100%';
      vid.style.height = '100%';
    }
    var standby = _ensureStandbyVideo(vid);
    _avatars[avatarId] = {
      el: wrap || vid.parentElement,
      active: vid,
      standby: standby,
      direct: true,
      currentPath: null,
      queue: [],
      isSpeaking: false,
      idleEmotion: 'neutral',
      _idleRotating: false,
      _playToken: 0,
    };
  }

  /** Second video layer for HTML <video> tags — crossfade without blanking the avatar */
  function _ensureStandbyVideo(primary) {
    if (!primary || !primary.parentElement) return primary;
    var wrap = primary.parentElement;
    var standbyId = primary.id ? primary.id + '__standby' : '';
    var standby = standbyId ? document.getElementById(standbyId) : wrap.querySelector('video[data-veil-standby="1"]');
    if (!standby || standby === primary) {
      standby = _makeVidEl('standby');
      if (standbyId) standby.id = standbyId;
      standby.setAttribute('data-veil-standby', '1');
      if (primary.className) standby.className = primary.className;
      if (primary.width) standby.width = primary.width;
      if (primary.height) standby.height = primary.height;
      wrap.appendChild(standby);
    }
    if (!primary.style.transition) primary.style.transition = 'opacity 0.2s ease';
    if (!primary.style.opacity) primary.style.opacity = '1';
    standby.style.opacity = '0';
    return standby;
  }

  function wakeOverlayAvatars() {
    getActiveAvatarIds().forEach(function (id) {
      var av = _avatars[id];
      if (!av) return;
      if (av.direct && av.active) {
        var v = av.active;
        if (!v.src && !v.currentSrc) {
          idle(id, av.idleEmotion || 'neutral');
          return;
        }
        try {
          v.load();
          var p = v.play();
          if (p && typeof p.catch === 'function') p.catch(function () {});
        } catch (e) {}
      }
    });
  }

  function _makeVidEl(name) {
    var v = document.createElement('video');
    v.width = AVATAR_VIDEO_W;
    v.height = AVATAR_VIDEO_H;
    v.className = 'avatar-video-fit';
    v.muted = true;
    v.playsInline = true;
    v.autoplay = true;
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');
    v.preload = 'none';
    v.setAttribute('fetchpriority', 'low');
    v.setAttribute('data-name', name);
    v.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:center bottom;z-index:1;transition:opacity 0.2s ease';
    v.style.opacity = name === 'v1' ? '1' : '0';
    return v;
  }

  function _makeContainer(id, size) {
    var wrap = document.createElement('div');
    wrap.id = id;
    wrap.className = 'avatar-video-stage';
    wrap.style.cssText = [
      'position:relative',
      'width:' + (size || '100%'),
      'height:' + (size || '100%'),
      'aspect-ratio:' + AVATAR_VIDEO_W + '/' + AVATAR_VIDEO_H,
      'background:transparent',
      'overflow:hidden',
      'display:flex',
      'align-items:flex-end',
      'justify-content:center',
    ].join(';');

    var v1 = _makeVidEl('v1');
    var v2 = _makeVidEl('v2');
    wrap.appendChild(v1);
    wrap.appendChild(v2);

    var glow = document.createElement('div');
    glow.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:2;' +
      'background:radial-gradient(ellipse at 50% 100%, rgba(255,160,30,0.18) 0%, transparent 70%)';
    wrap.appendChild(glow);

    _avatars[id] = {
      el: wrap,
      active: v1,
      standby: v2,
      currentPath: null,
      queue: [],
      isSpeaking: false,
      idleEmotion: 'neutral',
      _idleRotating: false,
      _playToken: 0,
    };
    return wrap;
  }

  // ────────────────────────────────────────────────────────────
  // CORE CLIP PLAYER — full-duration, no arbitrary timeouts
  // ────────────────────────────────────────────────────────────
  // The root cause of the 3s cutoff was a 5s safety timeout on
  // the canplay wait, which sometimes fired too early and resolved
  // the load promise before the video finished.  Now we:
  //   1. Wait for loadedmetadata (duration is now available)
  //   2. Only begin playback after readyState ≥ HAVE_ENOUGH_DATA
  //   3. Track timeupdate to update self-awareness in real time
  //   4. Use the "ended" event (not a timeout) to advance queue
  // ────────────────────────────────────────────────────────────
  function _keepVisibleLooping(vid) {
    if (!vid || (!vid.src && !vid.currentSrc)) return;
    if (vid._veilSavedLoop === undefined) vid._veilSavedLoop = vid.loop;
    vid.loop = true;
    vid.onended = null;
    if (vid.ended) {
      try { vid.currentTime = 0; } catch (e) {}
    }
    if (vid.paused || vid.ended) {
      var p = vid.play();
      if (p && typeof p.catch === 'function') p.catch(function () {});
    }
  }

  function _disarmVisibleHold(vid) {
    if (!vid) return;
    if (vid._veilHoldInterval) {
      clearInterval(vid._veilHoldInterval);
      vid._veilHoldInterval = null;
    }
    if (vid._veilHoldHandler) {
      vid.removeEventListener('ended', vid._veilHoldHandler);
      vid.removeEventListener('pause', vid._veilHoldHandler);
      vid._veilHoldHandler = null;
    }
    if (vid._veilSavedLoop !== undefined) {
      vid.loop = vid._veilSavedLoop;
      delete vid._veilSavedLoop;
    }
  }

  function _armVisibleHold(vid, av, token) {
    if (!vid) return;
    _disarmVisibleHold(vid);
    _keepVisibleLooping(vid);
    vid._veilHoldHandler = function () {
      if (!av || av._playToken !== token) {
        _disarmVisibleHold(vid);
        return;
      }
      _keepVisibleLooping(vid);
    };
    vid.addEventListener('ended', vid._veilHoldHandler);
    vid.addEventListener('pause', vid._veilHoldHandler);
    vid._veilHoldInterval = setInterval(function () {
      if (!av || av._playToken !== token) {
        _disarmVisibleHold(vid);
        return;
      }
      _keepVisibleLooping(vid);
    }, 300);
  }

  async function _waitVideoCanPlay(vid, token, av, timeoutMs) {
    if (!vid || av._playToken !== token) return false;
    if (vid.readyState >= 3) return true;
    return new Promise(function (resolve) {
      var settled = false;
      function finish(ok) {
        if (settled) return;
        settled = true;
        vid.removeEventListener('canplaythrough', onReady);
        vid.removeEventListener('canplay', onReady);
        vid.removeEventListener('error', onErr);
        clearTimeout(timer);
        resolve(!!ok && av._playToken === token);
      }
      function onReady() { finish(vid.readyState >= 2); }
      function onErr() { finish(false); }
      vid.addEventListener('canplaythrough', onReady, { once: true });
      vid.addEventListener('canplay', onReady, { once: true });
      vid.addEventListener('error', onErr, { once: true });
      var timer = setTimeout(function () { finish(vid.readyState >= 2); }, timeoutMs || 45000);
    });
  }

  async function _loadVideoMetadata(vid, path, url, token, av) {
    var loadAttempt = 0;
    while (loadAttempt < 3) {
      loadAttempt++;
      var loadFailed = await new Promise(function (resolve) {
        function onMeta() {
          vid.removeEventListener('loadedmetadata', onMeta);
          vid.removeEventListener('error', onErr);
          resolve(false);
        }
        function onErr() {
          vid.removeEventListener('loadedmetadata', onMeta);
          vid.removeEventListener('error', onErr);
          resolve(true);
        }
        if (vid.readyState >= 1) { resolve(false); return; }
        vid.addEventListener('loadedmetadata', onMeta, { once: true });
        vid.addEventListener('error', onErr, { once: true });
        setTimeout(function () {
          vid.removeEventListener('loadedmetadata', onMeta);
          vid.removeEventListener('error', onErr);
          resolve(true);
        }, 30000);
      });
      if (!loadFailed) return true;
      if (loadAttempt === 1) {
        var altUrl = await _getUrlFallback(path, url);
        if (altUrl && _urlKey(altUrl) !== _urlKey(url)) {
          url = altUrl;
          try { vid.pause(); } catch (e) {}
          vid.removeAttribute('src');
          vid.load();
          await _setVideoSrc(vid, url, 'direct');
          await new Promise(function (r) { setTimeout(r, 400); });
          if (av._playToken !== token) return false;
          continue;
        }
      }
      if (loadAttempt < 3) {
        console.warn('[CaelumAnim] Retrying clip load:', path, 'attempt', loadAttempt + 1);
        try { vid.pause(); } catch (e) {}
        vid.removeAttribute('src');
        vid.load();
        await _setVideoSrc(vid, url, 'direct');
        await new Promise(function (r) { setTimeout(r, 800 * loadAttempt); });
      } else {
        console.warn('[CaelumAnim] Failed to load clip:', path, url);
        return false;
      }
      if (av._playToken !== token) return false;
    }
    return false;
  }

  async function _playClip(id, path, loop, emotion, mode) {
    var av = _avatars[id];
    if (!av) return;

    if (av.direct && av.active === av.standby) {
      av.standby = _ensureStandbyVideo(av.active);
    }

    var token = ++av._playToken;
    var holdVid = av.active;
    _armVisibleHold(holdVid, av, token);

    var url = await _getUrl(path);
    if (!url) {
      console.warn('[CaelumAnim] No URL for:', path);
      _disarmVisibleHold(holdVid);
      return;
    }
    if (av._playToken !== token) {
      _disarmVisibleHold(holdVid);
      return;
    }

    var next = av.standby;

    // Tear down previous standby buffer only — never pause the visible active video yet
    next.onended = null;
    next.ontimeupdate = null;
    next.onloadedmetadata = null;
    try { next.pause(); } catch (e) {}
    next.removeAttribute('src');
    next.load();

    await _setVideoSrc(next, url, 'direct');
    next.loop = !!loop;
    next.muted = true;
    next.playsInline = true;

    var metaOk = await _loadVideoMetadata(next, path, url, token, av);
    if (!metaOk || av._playToken !== token) {
      _disarmVisibleHold(holdVid);
      return;
    }

    var canPlay = await _waitVideoCanPlay(next, token, av, 45000);
    if (!canPlay || av._playToken !== token) {
      _disarmVisibleHold(holdVid);
      return;
    }

    // ── timeupdate: feed current position to self-awareness ──
    next.ontimeupdate = function () {
      if (av._playToken !== token) return;
      _currentState.currentTime = next.currentTime || 0;
      _currentState.duration = (isFinite(next.duration) && next.duration > 0) ? next.duration : 0;
      if (_currentState.duration > 0) {
        _currentState.percent = (_currentState.currentTime / _currentState.duration) * 100;
      }
    };

    try { await next.play(); } catch (e) {
      if (e.name !== 'AbortError') console.warn('[CaelumAnim] play() failed:', path, e);
      _disarmVisibleHold(holdVid);
      return;
    }

    if (av._playToken !== token) {
      try { next.pause(); } catch (e2) {}
      _disarmVisibleHold(holdVid);
      return;
    }

    // Crossfade — swap only after the new clip is playing
    var prevVisible = av.active;
    next.style.opacity = '1';
    if (prevVisible) prevVisible.style.opacity = '0';
    av.standby = prevVisible;
    av.active = next;
    av.currentPath = path;

    if (prevVisible) {
      _disarmVisibleHold(prevVisible);
      try { prevVisible.pause(); } catch (e3) {}
      prevVisible.onended = null;
      prevVisible.ontimeupdate = null;
    }

    // Update self-awareness state
    _updateState(path, emotion || av.idleEmotion, mode || 'idle');
    if (isFinite(next.duration) && next.duration > 0) {
      _currentState.duration = next.duration;
    }

    // ── ended: advance queue — NO arbitrary timeout ──────────
    next.onended = function () {
      if (av._playToken !== token) return; // clip was superseded
      next.ontimeupdate = null;
      _onClipEnd(id);
    };

    if (loop) {
      av._idleRotating = true;
    }
  }

  function _onClipEnd(id) {
    var av = _avatars[id];
    if (!av) return;

    // Speaking queue
    if (av.isSpeaking && av.queue && av.queue.length > 0) {
      var nextClip = av.queue.shift();
      _playClip(id, nextClip.path, false, nextClip.emotion, nextClip.mode);
      return;
    }

    // Action queue
    if (!av._idleRotating && av.queue && av.queue.length > 0) {
      var nextClip2 = av.queue.shift();
      _playClip(id, nextClip2.path, nextClip2.loop, nextClip2.emotion, nextClip2.mode);
      return;
    }

    // Return to idle rotation
    av._idleRotating = true;
    av.isSpeaking = false;
    av.queue = [];
    var emotion = av.idleEmotion || 'neutral';
    var clips = CLIPS[emotion] || CLIPS.neutral;
    var nextPath = _pickRotate(id, clips);
    _playClip(id, nextPath, false, emotion, 'idle');
  }

  // ── Public: play a named action ───────────────────────────
  function play(id, action, thenIdle) {
    var av = _avatars[id];
    if (!av) return Promise.resolve();
    av._idleRotating = false;
    av.isSpeaking = false;
    av.queue = [];

    var clips = CLIPS[action] || CLIPS[av.idleEmotion] || CLIPS.neutral;
    var path = _pickRotate(id, clips);
    var loopAction = action === 'pole_dance';

    if (thenIdle !== false && !loopAction) {
      av.queue = [{
        path: _pickRotate(id, CLIPS[av.idleEmotion] || CLIPS.neutral),
        loop: false, emotion: av.idleEmotion, mode: 'idle'
      }];
    }

    return new Promise(function (res) {
      _playClip(id, path, loopAction, av.idleEmotion, 'action').then(function () {
        // Resolve when the active video element fires 'ended'
        var avNow = _avatars[id];
        if (!avNow || !avNow.active) { res(); return; }
        var vid = avNow.active;
        // Calculate a safe max-wait from the known duration (or 60s fallback)
        var dur = (isFinite(vid.duration) && vid.duration > 0) ? vid.duration : 60;
        var timeout = setTimeout(function () {
          vid.removeEventListener('ended', onEnd);
          res();
        }, (dur + 3) * 1000);
        function onEnd() {
          clearTimeout(timeout);
          res();
        }
        vid.addEventListener('ended', onEnd, { once: true });
      });
    });
  }

  // ── Public: start idle loop ───────────────────────────────
  async function idle(id, emotion) {
    var av = _avatars[id];
    if (!av) return;
    av.idleEmotion = emotion || 'neutral';
    av._idleRotating = true;
    av.isSpeaking = false;
    av.queue = [];
    var clips = CLIPS[emotion] || CLIPS.neutral;
    var path = _pickRotate(id, clips);
    await _playClip(id, path, false, emotion, 'idle');
  }

  // ── Public: emotion change ────────────────────────────────
  async function onEmotionChange(id, newEmotion) {
    var av = _avatars[id];
    if (!av || av.isSpeaking) return;
    av.idleEmotion = newEmotion;
    av._idleRotating = true;
    av.queue = [];
    var clips = CLIPS[newEmotion] || CLIPS.neutral;
    var path = _pickRotate(id, clips);
    await _playClip(id, path, false, newEmotion, 'emotion');
  }

  // ── Public: lip-sync speaking ─────────────────────────────
  async function startSpeaking(id, text, emotion) {
    var av = _avatars[id];
    if (!av) return;
    av.isSpeaking = true;
    av._idleRotating = false;
    av.queue = [];

    emotion = emotion || av.idleEmotion || 'neutral';
    var speakMap = SPEAK_CLIPS[emotion] || SPEAK_CLIPS.neutral;

    var words = text.trim().split(/\s+/);
    var phrases = [];
    for (var i = 0; i < words.length; i += 4) {
      phrases.push(words.slice(i, i + 4).join(' '));
    }
    if (phrases.length === 0) phrases = [''];

    var sequence = phrases.map(function (phrase) {
      var pWords = phrase.split(/\s+/);
      var maxSyl = 1;
      pWords.forEach(function (w) { var s = countSyllables(w); if (s > maxSyl) maxSyl = s; });
      maxSyl = Math.min(3, Math.max(1, maxSyl));
      return speakMap[maxSyl] || speakMap[3];
    });

    av.queue = sequence.slice(1).map(function (p) {
      return { path: p, loop: false, emotion: emotion, mode: 'speaking' };
    });
    av.queue.push({
      path: _pickRotate(id, CLIPS[emotion] || CLIPS.neutral),
      loop: false, emotion: emotion, mode: 'idle'
    });

    if (sequence.length > 0) {
      await _playClip(id, sequence[0], false, emotion, 'speaking');
    }
  }

  // ── Public: stop speaking ─────────────────────────────────
  function stopSpeaking(id) {
    var av = _avatars[id];
    if (!av) return;
    av.isSpeaking = false;
    av._idleRotating = true;
    av.queue = [];
    var emotion = av.idleEmotion || 'neutral';
    var path = _pickRotate(id, CLIPS[emotion] || CLIPS.neutral);
    _playClip(id, path, false, emotion, 'idle');
  }

  // ── Public: preload common clips ──────────────────────────
  async function preloadCommon() {
    var common = [
      'Idle.mp4',
      'Caelum_breathing.mp4',
      'Caelum_happy.mp4',
      'Hello_I_am_Caelum.mp4',
      'Happy_1_Syllable.mp4',
      'Happy_2_Syllables.mp4',
      'Happy_3_Syllables.mp4',
    ];
    await Promise.all(common.map(function (p) { return _getUrl(p); }));
  }

  return {
    makeContainer:          _makeContainer,
    bindDirectVideo:        bindDirectVideo,
    getActiveAvatarIds:     getActiveAvatarIds,
    wakeOverlayAvatars:     wakeOverlayAvatars,
    play:                   play,
    idle:                   idle,
    startSpeaking:          startSpeaking,
    stopSpeaking:           stopSpeaking,
    onEmotionChange:        onEmotionChange,
    preloadCommon:          preloadCommon,
    getCurrentState:        getCurrentAnimState,
    initSelfAwarenessPanel: initSelfAwarenessPanel,
    CLIPS:                  CLIPS,
    SPEAK_CLIPS:            SPEAK_CLIPS,
    ANIM_DESCRIPTIONS:      ANIM_DESCRIPTIONS,
    _avatars:               _avatars,
  };
})();
