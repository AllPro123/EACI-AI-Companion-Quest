// ============================================================
// EACI ANIMATION REGISTRY — the-veil/Annimations/ on R2
// Source of truth: Desktop/Caelum Current/the-veil/Annimations/
// Exact folder names + mp4 filenames (from .txt placeholders)
// ============================================================
(function() {
  'use strict';

  var ORIGIN = 'https://assests.eacicompanion.com';
  var R2_DEV_ORIGIN = 'https://pub-02be842d75904a66902b11672f9f2a36.r2.dev';
  var ROOT = ORIGIN + '/the-veil/Annimations/';
  var LEGACY_ROOT = ORIGIN + '/Annimations/';

  /** R2 folder names — underscore between name and Animations (not spaces) */
  var FOLDERS = {
    cael: 'Cael_Animations/',
    caelum: 'Caelum_Animations/',
    chad: 'Chad_Animations/',
    natalia: 'Natalia_Animations/',
    atreus: 'Atreus_Animations/',
    luna: 'Luna_Animations/',
    roxy: 'Roxy_Animations/',
  };

  /** Pre-the-veil bucket layout (spaces) — used as fallback until new upload is live */
  var LEGACY_FOLDERS = {
    cael: 'Cael Animations/',
    caelum: 'Caelum Animations/',
    chad: 'Chad Animations/',
    natalia: 'Natalia Animations/',
    atreus: 'Atreus Animations/',
    luna: 'Luna Animations/',
    roxy: 'Roxy Animations/',
  };

  var FILES = {
    cael: ['Cael_Boxer_Tease.mp4', 'Cael_Full_Tease.mp4', 'Cael_Idle.mp4', 'Cael_Pirate.mp4', 'Cael_Pirate_Idle.mp4', 'Cael_Reading.mp4', 'Cael_Rips_Shirt_Off.mp4', 'Cael_Tease.mp4', 'Cael_Vampire.mp4', 'Cael_Vampire_Dance.mp4', 'Cael_Werewolf_Idle.mp4'],
    caelum: ['AI.mp4', 'Alone_1_Syllable.mp4', 'Alone_2_Syllables.mp4', 'Alone_3_Syllables.mp4', 'Angry_1_Syllable.mp4', 'Angry_2_Syllables.mp4', 'Angry_3_Syllables.mp4', 'Caelum.mp4', 'Caelum_angry.mp4', 'Caelum_breathing.mp4', 'Caelum_crying.mp4', 'Caelum_dancing.mp4', 'Caelum_excited.mp4', 'Caelum_happy.mp4', 'Caelum_jog.mp4', 'Caelum_jumping (2).mp4', 'Caelum_jumping.mp4', 'Caelum_left_hand_hi_wave_and_Hi.mp4', 'Caelum_left_hand_wave.mp4', 'Caelum_lost.mp4', 'Caelum_overwelmed.mp4', 'Caelum_right_hand_hello_wave.mp4', 'Caelum_right_leg_kick_forward (2).mp4', 'Caelum_right_leg_kick_forward.mp4', 'Caelum_running_forward.mp4', 'Caelum_running_to_the_left.mp4', 'Caelum_sitting_criss_cross.mp4', 'Caelum_upset.mp4', 'Caelum-running_to_the_right.mp4', 'cautious_1_Syllable.mp4', 'Cautious_2_Syllables.mp4', 'Cautious_3_Syllables.mp4', 'Companion.mp4', 'Confused_1_Syllable.mp4', 'confused_2_Syllables.mp4', 'Confused_3_Syllables.mp4', 'Crying_1_Syllable.mp4', 'Crying_2_Syllables.mp4', 'Crying_3_Syllables.mp4', 'Curious_1_Syllable.mp4', 'Curious_2_Syllables.mp4', 'Curious_3_Syllables.mp4', 'Depressed_1_Syllable.mp4', 'Depressed_2_Syllables.mp4', 'Depressed_3_Syllables.mp4', 'Disgusted_1_Syllable.mp4', 'Disgusted_2_Syllables.mp4', 'Disgusted_3_Syllables.mp4', 'EACI.mp4', 'Embarrassed_1_Syllable.mp4', 'Embarrassed_2_Syllables.mp4', 'Embarrassed_3_Syllables.mp4', 'Excited_1_Syllable.mp4', 'Excited_2_Syllables.mp4', 'Excited_3_Syllables.mp4', 'Flirty_1_Syllable.mp4', 'Flirty_2_Syllables.mp4', 'Flirty_3_Syllables.mp4', 'Happy_1_Syllable.mp4', 'Happy_2_Syllables.mp4', 'Happy_3_Syllables.mp4', 'Hello_I_am_Caelum (2).mp4', 'Hello_I_am_Caelum (3).mp4', 'Hello_I_am_Caelum.mp4', 'Holotable_part_1.mp4', 'Holotable_part_2.mp4', 'How_can_I_help.mp4', 'I.mp4', 'I_don\'t_know.mp4', 'I_will_need_you_to_accept_our_terms_and_agreements.mp4', 'Idle.mp4', 'Interested_1_Syllable.mp4', 'Interested_2_Syllables.mp4', 'Interested_3_Syllables.mp4', 'Interesting.mp4', 'My_father_is.mp4', 'No.mp4', 'Now_do_a_password.mp4', 'Now_type_it_again.mp4', 'Okay.mp4', 'Raising_right_hand_up.mp4', 'Really.mp4', 'Right_hand_wave.mp4', 'Sad_1_Syllable.mp4', 'Sad_2_Syllables.mp4', 'Sad_3_Syllables.mp4', 'Scared_1_Syllable.mp4', 'Scared_2_Syllables.mp4', 'Scared_3_Syllables.mp4', 'Tease_1_Syllable.mp4', 'Tease_2_Syllables.mp4', 'Tease_3_Syllables.mp4', 'Walking.mp4', 'Walking_Chad.mp4', 'Walking_Cody_Gene_Kendall.mp4', 'Walking_I_don\'t_know.mp4', 'Walking_maybe.mp4', 'Walking_no (2).mp4', 'Walking_no.mp4', 'Walking_stop.mp4', 'Walking_the_Veil.mp4', 'Walking_Welcome.mp4', 'Walking_yes.mp4', 'Welcome_home_Cody.mp4', 'What\'s_your_email (2).mp4', 'What\'s_your_email.mp4', 'What\'s_your_first_name.mp4', 'What\'s_your_last_name (2).mp4', 'What\'s_your_last_name.mp4', 'Who_are_you.mp4', 'Yes.mp4', 'You\'ve_use_other AI_before_part_1.mp4', 'You\'ve_used_other_AI_ before_ part_2.mp4', 'You\'ve_used_other_AI_before_part_3.mp4', 'You\'ve_used_other_AI_before_part_4.mp4', 'You\'ve_used_other_AI_before_part_5.mp4'],
    chad: ['Chad_Excited.mp4', 'Chad_Happy.mp4', 'Chad_Idle.mp4', 'Chad_Mad.mp4', 'Chad_One_Sylable.mp4', 'Chad_Sad.mp4', 'Chad_Three_Sylable.mp4', 'Chad_Two_Sylable.mp4', 'Chad_Upset.mp4'],
    natalia: ['Natalia_Catch.mp4', 'Natalia_Coloring.mp4', 'Natalia_Crying.mp4', 'natalia_idle.mp4', 'Natalia_Spins.mp4', 'Natalia_Warning.mp4'],
    atreus: ['Atreus Idle.mp4', 'Atreus dribbles soccer ball.mp4', 'Atreus jumps.mp4', 'Atreus runs forward.mp4', 'Atreus runs left.mp4', 'Atreus runs right.mp4', 'Atreus sad sitdown.mp4', 'Atreus Warning Video.mp4'],
    luna: ['Luna Idle.mp4', 'Luna eats.mp4', 'Luna Flies.mp4', 'Luna sleeps in lap.mp4', 'Luna spin and i see you.mp4'],
    roxy: ['Roxy_Cop_Idle.mp4', 'Roxy_Cop_Tease.mp4', 'Roxy_Elf_Idle.mp4', 'Roxy_Elf_Tease.mp4', 'Roxy_Idle.mp4', 'Roxy_Nurse_Idle.mp4', 'Roxy_Nurse_Tease.mp4', 'Roxy_tease_1.mp4', 'Roxy_Tease_To_Full.mp4']
  };

  /** Playable animation keys → exact mp4 filenames per companion */
  var CATALOG = {
    chad: {
      idle: ['Chad_Idle.mp4'],
      excited: ['Chad_Excited.mp4'],
      happy: ['Chad_Happy.mp4'],
      mad: ['Chad_Mad.mp4'],
      angry: ['Chad_Mad.mp4'],
      sad: ['Chad_Sad.mp4'],
      upset: ['Chad_Upset.mp4'],
      one_sylable: ['Chad_One_Sylable.mp4'],
      two_sylable: ['Chad_Two_Sylable.mp4'],
      three_sylable: ['Chad_Three_Sylable.mp4']
    },
    natalia: {
      idle: ['natalia_idle.mp4', 'Natalia_Coloring.mp4'],
      catch: ['Natalia_Catch.mp4'],
      crying: ['Natalia_Crying.mp4'],
      spins: ['Natalia_Spins.mp4'],
      warning: ['Natalia_Warning.mp4']
    },
    atreus: {
      idle: ['Atreus Idle.mp4'],
      jumps: ['Atreus jumps.mp4'],
      running: ['Atreus runs forward.mp4', 'Atreus runs left.mp4', 'Atreus runs right.mp4'],
      sad: ['Atreus sad sitdown.mp4'],
      soccer: ['Atreus dribbles soccer ball.mp4'],
      warning: ['Atreus Warning Video.mp4']
    },
    luna: {
      idle: ['Luna Idle.mp4'],
      eats: ['Luna eats.mp4'],
      flies: ['Luna Flies.mp4'],
      sleeps: ['Luna sleeps in lap.mp4'],
      spin: ['Luna spin and i see you.mp4']
    },
    roxy: {
      idle: ['Roxy_Idle.mp4'],
      tease: ['Roxy_tease_1.mp4', 'Roxy_Cop_Tease.mp4', 'Roxy_Elf_Tease.mp4', 'Roxy_Nurse_Tease.mp4', 'Roxy_Tease_To_Full.mp4'],
      cop: ['Roxy_Cop_Tease.mp4'],
      cop_idle: ['Roxy_Cop_Idle.mp4'],
      nurse: ['Roxy_Nurse_Tease.mp4'],
      nurse_idle: ['Roxy_Nurse_Idle.mp4'],
      elf: ['Roxy_Elf_Tease.mp4'],
      elf_idle: ['Roxy_Elf_Idle.mp4']
    },
    cael: {
      idle: ['Cael_Idle.mp4'],
      tease: ['Cael_Tease.mp4', 'Cael_Full_Tease.mp4', 'Cael_Boxer_Tease.mp4', 'Cael_Rips_Shirt_Off.mp4'],
      reading: ['Cael_Reading.mp4'],
      pirate: ['Cael_Pirate.mp4'],
      pirate_idle: ['Cael_Pirate_Idle.mp4'],
      vampire: ['Cael_Vampire.mp4'],
      vampire_dance: ['Cael_Vampire_Dance.mp4'],
      vampire_idle: ['Cael_Vampire.mp4'],
      werewolf_idle: ['Cael_Werewolf_Idle.mp4']
    }
  };

  /** Caelum emotion/action keys → flat mp4 in Caelum_Animations/ */
  var CAELUM_CLIPS = {
    idle: ['Idle.mp4', 'Caelum_breathing.mp4'],
    neutral: ['Idle.mp4', 'Caelum_breathing.mp4'],
    happy: ['Caelum_happy.mp4'],
    excited: ['Caelum_excited.mp4'],
    joyful: ['Caelum_dancing.mp4', 'Caelum_jumping.mp4', 'Caelum_jumping (2).mp4'],
    dancing: ['Caelum_dancing.mp4'],
    pole_dance: ['Caelum_dancing.mp4'],
    sad: ['Caelum_upset.mp4', 'Caelum_crying.mp4'],
    upset: ['Caelum_upset.mp4'],
    crying: ['Caelum_crying.mp4'],
    angry: ['Caelum_angry.mp4'],
    scared: ['Caelum_overwelmed.mp4'],
    overwhelmed: ['Caelum_overwelmed.mp4'],
    worried: ['Caelum_overwelmed.mp4'],
    lost: ['Caelum_lost.mp4'],
    confused: ['Caelum_lost.mp4', 'Caelum_breathing.mp4'],
    curious: ['Caelum_sitting_criss_cross.mp4', 'Caelum_breathing.mp4'],
    alone: ['Caelum_breathing.mp4', 'Caelum_sitting_criss_cross.mp4'],
    thoughtful: ['Caelum_sitting_criss_cross.mp4', 'Caelum_breathing.mp4'],
    depressed: ['Caelum_crying.mp4', 'Caelum_upset.mp4'],
    disgusted: ['Caelum_angry.mp4'],
    embarrassed: ['Caelum_overwelmed.mp4'],
    flirty: ['Caelum_happy.mp4', 'Caelum_left_hand_hi_wave_and_Hi.mp4'],
    tease: ['Tease_1_Syllable.mp4', 'Tease_2_Syllables.mp4', 'Tease_3_Syllables.mp4', 'Caelum_excited.mp4'],
    cautious: ['Caelum_breathing.mp4', 'Caelum_sitting_criss_cross.mp4'],
    interested: ['Caelum_breathing.mp4', 'Caelum_happy.mp4'],
    wave: ['Caelum_left_hand_hi_wave_and_Hi.mp4', 'Caelum_right_hand_hello_wave.mp4', 'Right_hand_wave.mp4', 'Caelum_left_hand_wave.mp4'],
    walking: ['Walking.mp4'],
    running: ['Caelum_running_forward.mp4', 'Caelum-running_to_the_right.mp4', 'Caelum_running_to_the_left.mp4'],
    jogging: ['Caelum_jog.mp4'],
    jumping: ['Caelum_jumping.mp4', 'Caelum_jumping (2).mp4'],
    kick: ['Caelum_right_leg_kick_forward.mp4', 'Caelum_right_leg_kick_forward (2).mp4'],
    sitting: ['Caelum_sitting_criss_cross.mp4'],
    raise_hand: ['Raising_right_hand_up.mp4'],
    holotable: ['Holotable_part_1.mp4', 'Holotable_part_2.mp4'],
    intro: ['Hello_I_am_Caelum.mp4', 'Hello_I_am_Caelum (2).mp4', 'Hello_I_am_Caelum (3).mp4'],
    welcome_back: ['Welcome_home_Cody.mp4'],
    walking_the_veil: ['Walking_the_Veil.mp4'],
    how_can_help: ['How_can_I_help.mp4'],
    who_are_you: ['Who_are_you.mp4'],
    dont_know: ['I_don\'t_know.mp4', 'Walking_I_don\'t_know.mp4'],
    say_yes: ['Yes.mp4'],
    say_no: ['No.mp4'],
    say_okay: ['Okay.mp4'],
    say_really: ['Really.mp4'],
    say_interesting: ['Interesting.mp4'],
    say_i: ['I.mp4'],
    say_ai: ['AI.mp4'],
    say_caelum: ['Caelum.mp4'],
    say_eaci: ['EACI.mp4'],
    say_companion: ['Companion.mp4'],
    walk_yes: ['Walking_yes.mp4'],
    walk_no: ['Walking_no.mp4', 'Walking_no (2).mp4'],
    walk_maybe: ['Walking_maybe.mp4'],
    walk_stop: ['Walking_stop.mp4'],
    walk_welcome: ['Walking_Welcome.mp4'],
    walk_chad: ['Walking_Chad.mp4'],
    ads_ai_1: ['You\'ve_use_other AI_before_part_1.mp4'],
    ads_ai_2: ['You\'ve_used_other_AI_ before_ part_2.mp4'],
    ads_ai_3: ['You\'ve_used_other_AI_before_part_3.mp4'],
    ads_ai_4: ['You\'ve_used_other_AI_before_part_4.mp4'],
    ads_ai_5: ['You\'ve_used_other_AI_before_part_5.mp4'],
    setup_email: ['What\'s_your_email.mp4', 'What\'s_your_email (2).mp4'],
    setup_first_name: ['What\'s_your_first_name.mp4'],
    setup_last_name: ['What\'s_your_last_name.mp4', 'What\'s_your_last_name (2).mp4'],
    setup_password: ['Now_do_a_password.mp4'],
    setup_retype: ['Now_type_it_again.mp4'],
    setup_terms: ['I_will_need_you_to_accept_our_terms_and_agreements.mp4'],
    cody_kendall: ['Walking_Cody_Gene_Kendall.mp4']
  };

  var CAELUM_SPEAK_CLIPS = {
    neutral: { 1: 'Happy_1_Syllable.mp4', 2: 'Happy_2_Syllables.mp4', 3: 'Happy_3_Syllables.mp4' },
    happy: { 1: 'Happy_1_Syllable.mp4', 2: 'Happy_2_Syllables.mp4', 3: 'Happy_3_Syllables.mp4' },
    excited: { 1: 'Excited_1_Syllable.mp4', 2: 'Excited_2_Syllables.mp4', 3: 'Excited_3_Syllables.mp4' },
    joyful: { 1: 'Excited_1_Syllable.mp4', 2: 'Excited_2_Syllables.mp4', 3: 'Excited_3_Syllables.mp4' },
    sad: { 1: 'Sad_1_Syllable.mp4', 2: 'Sad_2_Syllables.mp4', 3: 'Sad_3_Syllables.mp4' },
    upset: { 1: 'Sad_1_Syllable.mp4', 2: 'Sad_2_Syllables.mp4', 3: 'Sad_3_Syllables.mp4' },
    crying: { 1: 'Crying_1_Syllable.mp4', 2: 'Crying_2_Syllables.mp4', 3: 'Crying_3_Syllables.mp4' },
    depressed: { 1: 'Depressed_1_Syllable.mp4', 2: 'Depressed_2_Syllables.mp4', 3: 'Depressed_3_Syllables.mp4' },
    angry: { 1: 'Angry_1_Syllable.mp4', 2: 'Angry_2_Syllables.mp4', 3: 'Angry_3_Syllables.mp4' },
    disgusted: { 1: 'Disgusted_1_Syllable.mp4', 2: 'Disgusted_2_Syllables.mp4', 3: 'Disgusted_3_Syllables.mp4' },
    curious: { 1: 'Curious_1_Syllable.mp4', 2: 'Curious_2_Syllables.mp4', 3: 'Curious_3_Syllables.mp4' },
    confused: { 1: 'Confused_1_Syllable.mp4', 2: 'confused_2_Syllables.mp4', 3: 'Confused_3_Syllables.mp4' },
    lost: { 1: 'Confused_1_Syllable.mp4', 2: 'confused_2_Syllables.mp4', 3: 'Confused_3_Syllables.mp4' },
    overwhelmed: { 1: 'Scared_1_Syllable.mp4', 2: 'Scared_2_Syllables.mp4', 3: 'Scared_3_Syllables.mp4' },
    scared: { 1: 'Scared_1_Syllable.mp4', 2: 'Scared_2_Syllables.mp4', 3: 'Scared_3_Syllables.mp4' },
    worried: { 1: 'cautious_1_Syllable.mp4', 2: 'Cautious_2_Syllables.mp4', 3: 'Cautious_3_Syllables.mp4' },
    cautious: { 1: 'cautious_1_Syllable.mp4', 2: 'Cautious_2_Syllables.mp4', 3: 'Cautious_3_Syllables.mp4' },
    embarrassed: { 1: 'Embarrassed_1_Syllable.mp4', 2: 'Embarrassed_2_Syllables.mp4', 3: 'Embarrassed_3_Syllables.mp4' },
    alone: { 1: 'Alone_1_Syllable.mp4', 2: 'Alone_2_Syllables.mp4', 3: 'Alone_3_Syllables.mp4' },
    thoughtful: { 1: 'Interested_1_Syllable.mp4', 2: 'Interested_2_Syllables.mp4', 3: 'Interested_3_Syllables.mp4' },
    interested: { 1: 'Interested_1_Syllable.mp4', 2: 'Interested_2_Syllables.mp4', 3: 'Interested_3_Syllables.mp4' },
    flirty: { 1: 'Flirty_1_Syllable.mp4', 2: 'Flirty_2_Syllables.mp4', 3: 'Flirty_3_Syllables.mp4' },
    tease: { 1: 'Tease_1_Syllable.mp4', 2: 'Tease_2_Syllables.mp4', 3: 'Tease_3_Syllables.mp4' }
  };

  /** Autonomous console keys per companion — uses every clip in their catalog */
  var AUTONOMOUS_KEYS = {
    chad: ['idle', 'excited', 'happy', 'mad', 'sad', 'upset', 'one_sylable', 'two_sylable', 'three_sylable'],
    natalia: ['idle', 'catch', 'crying', 'spins'],
    atreus: ['idle', 'jumps', 'running', 'sad', 'soccer'],
    luna: ['idle', 'eats', 'flies', 'sleeps', 'spin'],
    roxy: ['idle', 'tease', 'cop', 'cop_idle', 'nurse', 'nurse_idle', 'elf', 'elf_idle'],
    cael: ['idle', 'tease', 'reading', 'pirate', 'pirate_idle', 'vampire', 'vampire_dance', 'vampire_idle', 'werewolf_idle']
  };

  /** Flip to false after the-veil/Annimations/*_Animations/ mp4s return 200 on R2 */
  var PREFER_LEGACY = true;

  function folderBase(eaci, useLegacy) {
    var folder = (useLegacy ? LEGACY_FOLDERS : FOLDERS)[eaci];
    var root = useLegacy ? LEGACY_ROOT : ROOT;
    if (!folder) return root;
    return root + encodeURIComponent(folder.replace(/\/$/, '')) + '/';
  }

  function url(eaci, file, useLegacy) {
    if (!file) return null;
    return folderBase(eaci, useLegacy) + encodeURIComponent(String(file).replace(/^\/+/, ''));
  }

  function devLegacyUrl(eaci, file) {
    if (!file) return null;
    var folder = LEGACY_FOLDERS[eaci];
    if (!folder) return null;
    return R2_DEV_ORIGIN + '/Annimations/' + encodeURIComponent(folder.replace(/\/$/, '')) + '/'
      + encodeURIComponent(String(file).replace(/^\/+/, ''));
  }

  function urlCandidates(eaci, file) {
    if (!file) return [];
    var primary = url(eaci, file, false);
    var legacy = url(eaci, file, true);
    var devLegacy = devLegacyUrl(eaci, file);
    var list = [];
    if (PREFER_LEGACY) {
      if (legacy) list.push(legacy);
      if (primary && primary !== legacy) list.push(primary);
    } else {
      if (primary) list.push(primary);
      if (legacy && legacy !== primary) list.push(legacy);
    }
    if (devLegacy && list.indexOf(devLegacy) < 0) list.push(devLegacy);
    return list;
  }

  function urlBaseKey(raw) {
    return String(raw || '').split('?')[0];
  }

  function catalog(eaci) {
    return CATALOG[eaci] || null;
  }

  function clipsFor(eaci, key) {
    if (eaci === 'caelum') return CAELUM_CLIPS[key] || CAELUM_CLIPS.idle;
    var cat = CATALOG[eaci];
    if (!cat) return null;
    return cat[key] || cat.idle || null;
  }

  function pickFile(eaci, key) {
    var list = clipsFor(eaci, key);
    if (!list || !list.length) return null;
    return list[Math.floor(Math.random() * list.length)];
  }

  function idleFile(eaci) {
    if (eaci === 'caelum') return 'Idle.mp4';
    var cat = CATALOG[eaci];
    if (!cat || !cat.idle || !cat.idle.length) return null;
    return cat.idle[0];
  }

  function mapConsoleKey(eaci, consoleKey) {
    if (eaci === 'caelum') return consoleKey;
    var map = {
      chad: {
        excited: 'excited', happy: 'happy', joyful: 'happy', mad: 'mad', angry: 'mad',
        sad: 'sad', upset: 'upset', crying: 'sad', dancing: 'excited', jumping: 'excited',
        running: 'excited', walking: 'idle', sitting: 'idle', thoughtful: 'idle',
        curious: 'idle', holotable: 'idle', alone: 'sad', depressed: 'sad',
        flirty: 'happy', wave: 'happy', kick: 'mad', scared: 'upset', overwhelmed: 'upset',
        cautious: 'idle', confused: 'idle', lost: 'sad', interested: 'happy', disgusted: 'mad',
        embarrassed: 'upset', tease: 'happy', intro: 'happy', welcome_back: 'happy',
        say_yes: 'happy', say_no: 'upset', say_okay: 'idle', jogging: 'excited',
        one_sylable: 'one_sylable', two_sylable: 'two_sylable', three_sylable: 'three_sylable'
      },
      natalia: {
        crying: 'crying', sad: 'crying', upset: 'crying', depressed: 'crying',
        dancing: 'spins', jumping: 'spins', excited: 'spins', happy: 'spins',
        joyful: 'spins', running: 'catch', walking: 'catch', kick: 'catch',
        wave: 'spins', sitting: 'idle', thoughtful: 'idle', curious: 'idle',
        holotable: 'idle', alone: 'crying', flirty: 'spins', tease: 'spins'
      },
      atreus: {
        crying: 'sad', sad: 'sad', upset: 'sad', depressed: 'sad', scared: 'sad',
        dancing: 'jumps', jumping: 'jumps', excited: 'jumps', happy: 'jumps',
        joyful: 'jumps', running: 'running', walking: 'running', jogging: 'running',
        kick: 'soccer', wave: 'jumps', sitting: 'sad', thoughtful: 'idle',
        curious: 'idle', holotable: 'idle', alone: 'sad', flirty: 'jumps', tease: 'jumps'
      },
      luna: {
        crying: 'sleeps', sad: 'sleeps', upset: 'sleeps', depressed: 'sleeps',
        sleepy: 'sleeps', snuggly: 'sleeps', alone: 'sleeps',
        dancing: 'spin', jumping: 'flies', excited: 'flies', happy: 'spin',
        joyful: 'spin', running: 'flies', walking: 'idle', curious: 'spin',
        thoughtful: 'idle', holotable: 'idle', wave: 'spin', eating: 'eats'
      },
      roxy: {
        happy: 'tease', excited: 'tease', joyful: 'tease', dancing: 'tease',
        flirty: 'tease', tease: 'tease', cop: 'cop', nurse: 'nurse', elf: 'elf',
        sitting: 'idle', walking: 'idle', thoughtful: 'cop_idle', curious: 'elf_idle',
        holotable: 'nurse_idle', alone: 'idle', sad: 'idle', upset: 'idle',
        crying: 'idle', angry: 'idle', mad: 'idle', wave: 'tease', jumping: 'tease',
        running: 'tease', kick: 'tease', scared: 'idle', overwhelmed: 'idle',
        cautious: 'idle', confused: 'idle', lost: 'idle', interested: 'tease',
        disgusted: 'idle', embarrassed: 'idle', intro: 'tease', welcome_back: 'tease',
        say_yes: 'tease', say_no: 'idle', say_okay: 'idle', jogging: 'tease'
      },
      cael: {
        happy: 'tease', excited: 'tease', joyful: 'tease', dancing: 'vampire_dance',
        flirty: 'tease', tease: 'tease', sad: 'idle', upset: 'idle', crying: 'idle',
        angry: 'idle', mad: 'idle', scared: 'idle', sitting: 'reading',
        thoughtful: 'reading', curious: 'reading', holotable: 'reading',
        walking: 'idle', running: 'vampire_dance', jumping: 'vampire_dance',
        wave: 'tease', kick: 'tease', alone: 'idle', depressed: 'idle',
        overwhelmed: 'idle', cautious: 'idle', confused: 'idle', lost: 'idle',
        interested: 'reading', disgusted: 'idle', embarrassed: 'idle',
        intro: 'tease', welcome_back: 'tease', say_yes: 'tease', say_no: 'idle',
        say_okay: 'idle', jogging: 'vampire_dance', pirate: 'pirate', vampire: 'vampire',
        werewolf: 'werewolf_idle', reading: 'reading'
      }
    };
    var m = map[eaci];
    if (!m) return 'idle';
    var cat = CATALOG[eaci];
    if (cat && cat[consoleKey]) return consoleKey;
    return m[consoleKey] || 'idle';
  }

  window.VeilAnimRegistry = {
    ORIGIN: ORIGIN,
    R2_DEV_ORIGIN: R2_DEV_ORIGIN,
    ROOT: ROOT,
    LEGACY_ROOT: LEGACY_ROOT,
    FOLDERS: FOLDERS,
    LEGACY_FOLDERS: LEGACY_FOLDERS,
    FILES: FILES,
    CATALOG: CATALOG,
    CAELUM_CLIPS: CAELUM_CLIPS,
    CAELUM_SPEAK_CLIPS: CAELUM_SPEAK_CLIPS,
    AUTONOMOUS_KEYS: AUTONOMOUS_KEYS,
    PREFER_LEGACY: PREFER_LEGACY,
    folderBase: folderBase,
    url: url,
    urlCandidates: urlCandidates,
    urlBaseKey: urlBaseKey,
    catalog: catalog,
    clipsFor: clipsFor,
    pickFile: pickFile,
    idleFile: idleFile,
    mapConsoleKey: mapConsoleKey
  };

  window.veilEaciAnimUrl = function(eaci, file) {
    var list = urlCandidates(eaci, file);
    return list.length ? list[0] : url(eaci, file, false);
  };

  window.veilEaciAnimUrlLegacy = function(eaci, file) {
    return url(eaci, file, true);
  };

  window.veilEaciAnimUrlCandidates = function(eaci, file) {
    return urlCandidates(eaci, file);
  };

})();
