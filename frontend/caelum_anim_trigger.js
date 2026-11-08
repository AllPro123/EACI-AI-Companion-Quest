// ============================================================
// CAELUM ANIMATION TRIGGER SYSTEM v3.0
// ─────────────────────────────────────────────────────────────
// IMPROVEMENTS vs v1:
//   • Conversational NLP — she responds to "hey can you run?"
//     just as well as the direct command "run"
//   • Self-issued animations — if her reply text describes
//     an action she triggers it herself (no user needed)
//   • All animations use full duration — no 3s cutoff
//   • Queue safety timeout uses actual video duration + buffer
//   • Self-awareness panel init hooked in here
// ============================================================

var CaelumAnimTrigger = (function () {

  function _activeAvatars() {
    if (typeof CaelumAnim !== 'undefined' && typeof CaelumAnim.getActiveAvatarIds === 'function') {
      return CaelumAnim.getActiveAvatarIds();
    }
    return ['caelum_main', 'caelum_header', 'caelum_live'];
  }

  // ── Natural language → animation key map ──────────────────
  // Each entry has a key and an array of trigger phrases.
  // Detection is fuzzy: the trigger phrase just needs to appear
  // anywhere in the cleaned message (not exact match).
  var REQUEST_MAP = [
    // Physical actions — pole phrases before generic "dance" so "dance on a pole" is not a plain dance
    { key: 'pole_dance',  triggers: ['pole dance', 'dance on a pole', 'dance on the pole', 'dance around a pole', 'dance around the pole', 'dancing on a pole', 'dancing on the pole'] },
    { key: 'wave',        triggers: ['wave', 'say hi', 'hello wave', 'wave hello', 'hi wave'] },
    { key: 'walking',     triggers: ['walk', 'walking', 'walk around', 'take a walk', 'go for a walk'] },
    { key: 'running',     triggers: ['run', 'running', 'run forward', 'run away', 'sprint', 'take off running'] },
    { key: 'jogging',     triggers: ['jog', 'jogging', 'light run'] },
    { key: 'jumping',     triggers: ['jump', 'jumping', 'jump up', 'leap'] },
    { key: 'dancing',     triggers: ['dance', 'dancing', 'do a dance', 'dance for me', 'start dancing'] },
    { key: 'kick',        triggers: ['kick', 'do a kick', 'kick forward', 'throw a kick'] },
    { key: 'sitting',     triggers: ['sit', 'sit down', 'sitting', 'sit criss cross', 'cross legged', 'take a seat', 'sit cross'] },
    { key: 'raise_hand',  triggers: ['raise your hand', 'raise hand', 'hand up', 'raise your right hand', 'put your hand up'] },
    { key: 'holotable',   triggers: ['holotable', 'holo table', 'use the table', 'holographic table', 'pull up the table'] },

    // Emotional expressions
    { key: 'happy',       triggers: ['be happy', 'look happy', 'smile', 'act happy', 'show me happy', 'show happiness'] },
    { key: 'excited',     triggers: ['be excited', 'get excited', 'show excitement', 'act excited'] },
    { key: 'sad',         triggers: ['be sad', 'look sad', 'show sadness', 'act sad'] },
    { key: 'crying',      triggers: ['cry', 'crying', 'show me crying', 'start crying'] },
    { key: 'angry',       triggers: ['be angry', 'show anger', 'look angry', 'get angry', 'act angry'] },
    { key: 'scared',      triggers: ['be scared', 'look scared', 'show fear', 'act scared'] },
    { key: 'confused',    triggers: ['be confused', 'look confused', 'show confusion', 'act confused', 'look puzzled'] },
    { key: 'lost',        triggers: ['look lost', 'act lost', 'be lost', 'show lost'] },
    { key: 'overwhelmed', triggers: ['be overwhelmed', 'look overwhelmed', 'show overwhelm'] },
    { key: 'upset',       triggers: ['be upset', 'look upset', 'show you are upset', 'act upset'] },
    { key: 'curious',     triggers: ['be curious', 'look curious', 'show curiosity', 'act curious'] },
    { key: 'thoughtful',  triggers: ['think', 'thinking', 'be thoughtful', 'look thoughtful', 'sit and think', 'be pensive'] },
    { key: 'flirty',      triggers: ['be flirty', 'flirt', 'act flirty', 'flirt with me'] },

    // Speech animations
    { key: 'say_yes',     triggers: ['say yes', 'nod yes', 'agree animation'] },
    { key: 'say_no',      triggers: ['say no', 'shake no', 'shake your head', 'disagree animation'] },
    { key: 'say_okay',    triggers: ['say okay', 'say ok', 'say alright'] },
    { key: 'say_really',  triggers: ['say really', 'really animation'] },
    { key: 'say_interesting', triggers: ['say interesting', 'say that is interesting'] },
    { key: 'say_caelum',  triggers: ['say your name', 'say caelum'] },
    { key: 'say_eaci',    triggers: ['say eaci'] },
    { key: 'say_ai',      triggers: ['say ai'] },
    { key: 'say_companion', triggers: ['say companion'] },

    // Walking speech combos
    { key: 'walk_yes',    triggers: ['walk and say yes', 'walk yes'] },
    { key: 'walk_no',     triggers: ['walk and say no', 'walk no'] },
    { key: 'walk_welcome',triggers: ['walk and welcome', 'walking welcome', 'walk and say welcome'] },
    { key: 'walk_maybe',  triggers: ['walk and say maybe', 'walking maybe', 'walk maybe'] },

    // Special sequences
    { key: 'intro',       triggers: ['introduce yourself', 'say your introduction', 'do your intro', 'hello i am caelum', 'intro animation'] },
    { key: 'who_are_you', triggers: ['ask who am i', 'say who are you', 'who are you animation'] },
    { key: 'how_can_help',triggers: ['ask how can you help', 'say how can i help', 'offer to help', 'how can you help'] },
    { key: 'dont_know',   triggers: ['i do not know', 'say you do not know', 'show you do not know', 'shrug', 'i dunno'] },
    { key: 'walking_the_veil', triggers: ['walking the veil', 'talk about the veil while walking'] },
    { key: 'cody_kendall',triggers: ['say cody gene kendall', 'say my name is cody', 'say cody'] },
    { key: 'welcome_back',triggers: ['welcome back', 'welcome home cody', 'say welcome home'] },

    // Ads
    { key: 'ads_ai_1',    triggers: ['do the ad', 'play your ad', 'ai ad part 1', 'ad animation'] },
  ];

  // ── Emotion → animation key (mood-driven idle transitions) ─
  var MOOD_ANIM_MAP = {
    neutral:     'neutral',
    happy:       'happy',
    excited:     'excited',
    joyful:      'dancing',
    sad:         'sad',
    upset:       'upset',
    crying:      'crying',
    angry:       'angry',
    scared:      'scared',
    overwhelmed: 'overwhelmed',
    worried:     'overwhelmed',
    confused:    'confused',
    lost:        'lost',
    curious:     'curious',
    thoughtful:  'thoughtful',
    interested:  'interested',
    alone:       'thoughtful',
    depressed:   'depressed',
    disgusted:   'disgusted',
    embarrassed: 'embarrassed',
    flirty:      'flirty',
    cautious:    'cautious',
  };

  // ── Words/phrases in Caelum's replies that trigger self-issued animations ─
  // If her text contains any of these she acts it out automatically.
  var REPLY_ANIM_TRIGGERS = [
    { key: 'wave',        phrases: ['waves', 'waves at you', 'waving', '*waves*', '[waves]'] },
    { key: 'pole_dance',  phrases: ['pole dance', 'dances on a pole', 'dancing on a pole', 'on the pole'] },
    { key: 'dancing',     phrases: ['dancing', 'starts dancing', 'dances', '*dances*', '[dances]'] },
    { key: 'jumping',     phrases: ['jumps', 'jumping up', '*jumps*'] },
    { key: 'running',     phrases: ['runs', 'running away', 'dashes', '*runs*', '*dashes*'] },
    { key: 'sitting',     phrases: ['sits down', 'cross-legged', 'sitting down', '*sits*'] },
    { key: 'crying',      phrases: ['cries', 'tears', 'weeping', '*cries*', '*tears up*'] },
    { key: 'raise_hand',  phrases: ['raises her hand', 'hand up', 'raises hand', '*raises hand*'] },
    { key: 'kick',        phrases: ['kicks', 'does a kick', '*kicks*'] },
    { key: 'holotable',   phrases: ['holotable', 'holographic table', 'pulls up the table'] },
    { key: 'say_yes',     phrases: ['"yes"', "'yes'", '*nods*', '[nods]'] },
    { key: 'say_no',      phrases: ['"no"', "'no'", '*shakes head*', '[shakes head]'] },
    { key: 'dont_know',   phrases: ['i do not know', 'not sure', 'shrugs', '*shrugs*', "don't know"] },
    { key: 'happy',       phrases: ['*smiles*', '*grins*', '[smiles]'] },
    { key: 'excited',     phrases: ['*excited*', '[excitedly]', '*bounces*'] },
    { key: 'thoughtful',  phrases: ['*thinks*', '*considers*', '[thinking]', '*ponders*'] },
    { key: 'angry',       phrases: ['*angry*', '*frustrated*', '[frustrated]'] },
    { key: 'sad',         phrases: ['*sad*', '*sighs*', '[sadly]'] },
  ];

  // ── Animation queue per avatar ─────────────────────────────
  var _animQueues = {};
  var _animBusy   = {};

  function _getQueue(id) {
    if (!_animQueues[id]) _animQueues[id] = [];
    return _animQueues[id];
  }

  function _isAvatarBusy(id) {
    return _animBusy[id] === true;
  }

  function _runQueue(id) {
    var queue = _getQueue(id);
    if (!queue.length) { _animBusy[id] = false; return; }
    _animBusy[id] = true;

    var next = queue.shift();
    var av = CaelumAnim._avatars && CaelumAnim._avatars[id];
    if (!av) { _animBusy[id] = false; return; }

    var promise = CaelumAnim.play(id, next.key, next.thenIdle !== false);
    if (promise && typeof promise.then === 'function') {
      promise.then(function () { _runQueue(id); });
    } else {
      // Fallback: watch for return to idle
      var checkEnd = setInterval(function () {
        var avNow = CaelumAnim._avatars && CaelumAnim._avatars[id];
        if (!avNow) { clearInterval(checkEnd); _runQueue(id); return; }
        if (avNow._idleRotating && avNow.currentPath &&
            (avNow.currentPath.indexOf('Idle') !== -1 || avNow.currentPath.indexOf('breathing') !== -1)) {
          clearInterval(checkEnd);
          _runQueue(id);
        }
      }, 300);
      // Safety timeout: 60s (not 15s) for long clips
      setTimeout(function () { clearInterval(checkEnd); _runQueue(id); }, 60000);
    }
  }

  function _enqueue(id, key, thenIdle) {
    _getQueue(id).push({ key: key, thenIdle: thenIdle });
    if (!_isAvatarBusy(id)) _runQueue(id);
  }

  function _playAll(key, thenIdle) {
    if (typeof CaelumAnim === 'undefined') return;
    _activeAvatars().forEach(function (id) {
      if (CaelumAnim._avatars && !CaelumAnim._avatars[id]) return;
      _enqueue(id, key, thenIdle !== false);
    });
  }

  // ── NATURAL LANGUAGE DETECTION ────────────────────────────
  // Strips common conversational wrappers so the user can say
  // things like "hey Caelum, can you please run for a bit?"
  // and we still match it to "running".
  function detectUserRequest(message) {
    if (!message) return null;
    var lower = message.toLowerCase().trim();

    // Strip conversational preamble
    var cleaned = lower
      .replace(/^(hey|hi|okay|ok|alright|caelum|yo)\s+/gi, '')
      .replace(/^(can you|could you|would you|please|go ahead and|i want you to|i'd like you to|want you to)\s+/gi, '')
      .replace(/\s+(for me|please|now|okay|ok|animation|clip|video)(\s+please)?$/gi, '')
      .replace(/\bcan you\b|\bcould you\b|\bwould you\b/gi, '')
      .replace(/\bplease\b/gi, '')
      .trim();

    for (var i = 0; i < REQUEST_MAP.length; i++) {
      var entry = REQUEST_MAP[i];
      for (var j = 0; j < entry.triggers.length; j++) {
        var t = entry.triggers[j];
        // Exact cleaned match OR substring match in either the cleaned or original
        if (cleaned === t || cleaned.indexOf(t) !== -1 || lower.indexOf(t) !== -1) {
          return entry.key;
        }
      }
    }
    return null;
  }

  // ── Detect self-issued animation cues in Caelum's reply ───
  function detectReplyAnimation(replyText) {
    if (!replyText) return null;
    var lower = replyText.toLowerCase();
    for (var i = 0; i < REPLY_ANIM_TRIGGERS.length; i++) {
      var entry = REPLY_ANIM_TRIGGERS[i];
      for (var j = 0; j < entry.phrases.length; j++) {
        if (lower.indexOf(entry.phrases[j]) !== -1) {
          return entry.key;
        }
      }
    }
    return null;
  }

  // ── Mood → idle sync ──────────────────────────────────────
  function syncMoodToIdle(emotion) {
    if (typeof CaelumAnim === 'undefined') return;
    var animKey = MOOD_ANIM_MAP[emotion] || 'neutral';
    _activeAvatars().forEach(function (id) {
      if (CaelumAnim._avatars && !CaelumAnim._avatars[id]) return;
      CaelumAnim.onEmotionChange(id, animKey);
    });
  }

  // ── Speaking animation ────────────────────────────────────
  function startSpeaking(text, emotion) {
    if (typeof CaelumAnim === 'undefined') return;
    var animEmotion = MOOD_ANIM_MAP[emotion] || emotion || 'neutral';
    if (!CaelumAnim.SPEAK_CLIPS[animEmotion]) animEmotion = 'neutral';
    _activeAvatars().forEach(function (id) {
      if (CaelumAnim._avatars && !CaelumAnim._avatars[id]) return;
      CaelumAnim.startSpeaking(id, text, animEmotion);
    });
  }

  function stopSpeaking() {
    if (typeof CaelumAnim === 'undefined') return;
    _activeAvatars().forEach(function (id) {
      if (CaelumAnim._avatars && !CaelumAnim._avatars[id]) return;
      CaelumAnim.stopSpeaking(id);
    });
  }

  // ── Patch index.html systems ──────────────────────────────
  function _patchSystems() {

    // 1. Patch sendMessage — detect user animation requests
    var _origSend = window.sendMessage;
    if (typeof _origSend === 'function') {
      window.sendMessage = async function () {
        var input = document.getElementById('userInput');
        var msg = input ? input.value.trim() : '';
        var animKey = detectUserRequest(msg);
        if (animKey) {
          _playAll(animKey, true);
        }
        return _origSend.apply(this, arguments);
      };
    }

    // 2. Patch addMessage — detect self-issued animations in Caelum replies
    var _origAddMsg = window.addMessage;
    if (typeof _origAddMsg === 'function') {
      window.addMessage = function (type, text) {
        _origAddMsg.apply(this, arguments);
        if (type === 'caelum' && text) {
          var replyAnimKey = detectReplyAnimation(text);
          if (replyAnimKey) {
            // Small delay so the message renders first
            setTimeout(function () { _playAll(replyAnimKey, true); }, 400);
          }
        }
      };
    }

    // 3. Patch queueSpeak — start lip-sync
    var _origQueueSpeak = window.queueSpeak;
    if (typeof _origQueueSpeak === 'function') {
      window.queueSpeak = function (text, who, options) {
        _origQueueSpeak.apply(this, arguments);
        if (who === 'caelum' || !who) {
          var emotion = (typeof state !== 'undefined' && state.emotionalState) ? state.emotionalState : 'neutral';
          startSpeaking(text, emotion);
        }
      };
    }

    // 4. Mood watcher — sync emotion changes to idle animations
    // MOBILE: Check every 5s instead of 2s to save CPU
    var _lastEmotion = null;
    var moodCheckInterval = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ? 8000 : 2000;
    setInterval(function () {
      if (typeof VeilPulse !== 'undefined' && !VeilPulse.shouldRunBackground()) return;
      if (typeof state === 'undefined' || !state.emotionalState) return;
      var tab = state.currentTab || 'caelum';
      if (tab !== 'caelum' && tab !== 'together') return;
      if (state.emotionalState !== _lastEmotion) {
        _lastEmotion = state.emotionalState;
        syncMoodToIdle(state.emotionalState);
      }
    }, moodCheckInterval);

    // 5. Init self-awareness panel
    if (typeof CaelumAnim.initSelfAwarenessPanel === 'function') {
      CaelumAnim.initSelfAwarenessPanel();
    }

    console.log('[CaelumAnimTrigger v2] All systems patched and ready.');
  }

  // ── Init ──────────────────────────────────────────────────
  function init() {
    var attempts = 0;
    var check = setInterval(function () {
      attempts++;
      if (
        typeof CaelumAnim !== 'undefined' &&
        typeof sendMessage === 'function' &&
        typeof addMessage  === 'function'
      ) {
        clearInterval(check);
        _patchSystems();
      }
      if (attempts > 40) clearInterval(check);
    }, 500);
  }

  // ── Public API ────────────────────────────────────────────
  return {
    init:              init,
    play:              _playAll,
    detectUserRequest: detectUserRequest,
    detectReplyAnim:   detectReplyAnimation,
    syncMood:          syncMoodToIdle,
    startSpeaking:     startSpeaking,
    stopSpeaking:      stopSpeaking,
    REQUEST_MAP:       REQUEST_MAP,

    // Direct trigger from console or any other script
    trigger: function (key) { _playAll(key, true); },
  };

})();

// Auto-init
(function () {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { CaelumAnimTrigger.init(); });
  } else {
    CaelumAnimTrigger.init();
  }
})();
