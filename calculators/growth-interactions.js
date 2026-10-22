(() => {
  document.documentElement.classList.add('js');
  const hero = document.querySelector('.g-hero');
  if (!hero) return;
  const toolsHub = document.querySelector('.g-tools-hub');
  if (toolsHub) {
    const daybook = toolsHub.querySelector('.g-daybook');
    const rhythmWorld = toolsHub.querySelector('.g-rhythm-world');
    if (daybook && rhythmWorld) daybook.before(rhythmWorld);
  }

  const lang = (document.documentElement.lang || 'en').slice(0, 2);
  const copy = {
    en: { hint: 'Explore the village', nursery: 'Sleep', kitchen: 'Feeding', parent: 'Parent care', nap: 'Nap in progress', napSub: 'Resting peacefully', feed: 'Bottle logged', feedSub: 'The whole village is in sync', check: 'A moment for you', checkSub: 'Parents matter here too' },
    es: { hint: 'Explora el pueblo', nursery: 'Sueño', kitchen: 'Alimentación', parent: 'Cuidado parental', nap: 'Siesta en curso', napSub: 'Descansando tranquilamente', feed: 'Biberón registrado', feedSub: 'Todo el pueblo está sincronizado', check: 'Un momento para ti', checkSub: 'Las familias también importan' },
    fr: { hint: 'Explorez le village', nursery: 'Sommeil', kitchen: 'Repas', parent: 'Soin des parents', nap: 'Sieste en cours', napSub: 'Bébé dort paisiblement', feed: 'Biberon enregistré', feedSub: 'Tout le village reste synchronisé', check: 'Un moment pour vous', checkSub: 'Les parents comptent aussi' },
    de: { hint: 'Erkunde das Dorf', nursery: 'Schlaf', kitchen: 'Füttern', parent: 'Elternfürsorge', nap: 'Schläfchen läuft', napSub: 'Schläft ganz ruhig', feed: 'Flasche eingetragen', feedSub: 'Das ganze Dorf ist synchron', check: 'Ein Moment für dich', checkSub: 'Eltern zählen hier auch' },
    pt: { hint: 'Explore a vila', nursery: 'Sono', kitchen: 'Alimentação', parent: 'Cuidado parental', nap: 'Soneca em andamento', napSub: 'Descansando tranquilamente', feed: 'Mamadeira registrada', feedSub: 'Toda a vila está sincronizada', check: 'Um momento para você', checkSub: 'Os pais também importam' },
    it: { hint: 'Esplora il villaggio', nursery: 'Sonno', kitchen: 'Pappa', parent: 'Cura dei genitori', nap: 'Pisolino in corso', napSub: 'Riposa serenamente', feed: 'Biberon registrato', feedSub: 'Tutto il villaggio è sincronizzato', check: 'Un momento per te', checkSub: 'Anche i genitori contano' }
  }[lang] || null;
  const t = copy || {
    hint: 'Explore the village', nursery: 'Sleep', kitchen: 'Feeding', parent: 'Parent care',
    nap: 'Nap in progress', napSub: 'Resting peacefully', feed: 'Bottle logged',
    feedSub: 'The whole village is in sync', check: 'A moment for you', checkSub: 'Parents matter here too'
  };

  const scene = document.createElement('div');
  scene.className = 'g-home-scene';
  scene.setAttribute('aria-label', t.hint);
  scene.innerHTML = `
    <div class="g-home-sky" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
    <div class="g-home-bubble" role="status"><span>☾</span><p><strong>${t.nap}</strong><small>${t.napSub}</small></p></div>
    <div class="g-village-art" aria-hidden="true">
      <img src="/obubba-village-night-v2.png" alt="" width="1536" height="1024" fetchpriority="high"/>
    </div>
    <button class="g-village-hotspot g-hotspot-sleep" type="button" data-room="nursery" aria-label="${t.nursery}"><span>☾</span></button>
    <button class="g-village-hotspot g-hotspot-feed" type="button" data-room="kitchen" aria-label="${t.kitchen}"><span>♢</span></button>
    <button class="g-village-hotspot g-hotspot-care" type="button" data-room="parent" aria-label="${t.parent}"><span>♡</span></button>
    <div class="g-room-controls" role="group" aria-label="${t.hint}">
      <button type="button" class="is-active" data-room="nursery" aria-pressed="true"><span>☾</span>${t.nursery}</button>
      <button type="button" data-room="kitchen" aria-pressed="false"><span>♢</span>${t.kitchen}</button>
      <button type="button" data-room="parent" aria-pressed="false"><span>♡</span>${t.parent}</button>
    </div>`;
  hero.appendChild(scene);
  hero.classList.add('is-enhanced');

  const states = {
    nursery: ['☾', t.nap, t.napSub],
    kitchen: ['♢', t.feed, t.feedSub],
    parent: ['♡', t.check, t.checkSub]
  };
  const bubble = scene.querySelector('.g-home-bubble');
  scene.querySelectorAll('[data-room]').forEach((button) => {
    button.addEventListener('click', () => {
      const room = button.dataset.room;
      scene.dataset.active = room;
      scene.querySelectorAll('[data-room]').forEach((item) => {
        const active = item.dataset.room === room;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      const [icon, title, detail] = states[room];
      bubble.classList.remove('is-pop');
      bubble.innerHTML = `<span>${icon}</span><p><strong>${title}</strong><small>${detail}</small></p>`;
      requestAnimationFrame(() => bubble.classList.add('is-pop'));
    });
  });

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleepHero = document.querySelector('[data-sleep-hero]');
  if (sleepHero) {
    const sleepViews = {
      nap: {
        image: '/obubba-personalised-nap-prediction-app.jpg',
        alt: 'OBubba personalised nap prediction',
        title: 'Your baby’s rhythm is taking shape',
        note: 'Today’s real wake time gently reshaped the next nap'
      },
      night: {
        image: '/obubba-tonight-sleep-story.jpg',
        alt: 'OBubba tonight sleep story',
        title: 'The day becomes tonight’s story',
        note: 'Naps, feeds and teething clues stay connected'
      },
      fireflies: {
        image: '/obubba-fireflies-night-clock.jpg',
        alt: 'OBubba fireflies during a night waking',
        title: 'Nobody does the 3am shift alone',
        note: 'Each firefly is another parent awake right now'
      }
    };
    sleepHero.querySelectorAll('[data-sleep-view]').forEach((button) => button.addEventListener('click', () => {
      const view = sleepViews[button.dataset.sleepView];
      sleepHero.querySelectorAll('[data-sleep-view]').forEach((item) => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      const screen = sleepHero.querySelector('[data-sleep-hero-screen]');
      screen.classList.remove('is-changing');
      screen.src = view.image;
      screen.alt = view.alt;
      sleepHero.querySelector('[data-sleep-hero-title]').textContent = view.title;
      sleepHero.querySelector('[data-sleep-hero-note]').textContent = view.note;
      requestAnimationFrame(() => screen.classList.add('is-changing'));
    }));
  }
  const clearVillage = document.querySelector('[data-clear-village]');
  if (clearVillage) {
    const clearStage = clearVillage.querySelector('[data-clear-stage]');
    const scenarios = {
      nursery: {
        source: 'Nursery', time: '12:14 PM · Nursery', event: 'Short nap logged', detail: '35 minutes instead of the usual 1 hour',
        before: 'Bedtime 7:30 PM', after: 'Bedtime 7:05 PM', reason: 'A shorter nursery nap built sleep pressure sooner.',
        title: 'Nursery logged a short nap.', copy: 'OBubba connects it to the rest of the day, updates bedtime and shares the reason with the people caring for baby.',
        action: 'Reading the nap', actionDetail: 'Comparing it with today’s rhythm', image: '/obubba-personalised-nap-prediction-app.jpg', imageAlt: 'OBubba personalised nap prediction'
      },
      grandparents: {
        source: 'Grandparents', time: '3:48 PM · Grandparents', event: 'Teething signs noticed', detail: 'Sore gums and a more unsettled afternoon',
        before: 'Bedtime 7:20 PM', after: 'Gentler wind-down 6:50 PM', reason: 'Teething adds context, so tonight begins with comfort.',
        title: 'Grandparents noticed sore gums.', copy: 'OBubba keeps the clue beside naps and feeds, then gives Partner a calmer plan for the evening.',
        action: 'Adding context', actionDetail: 'Connecting comfort with sleep', image: '/obubba-teething-sleep-comfort.jpg', imageAlt: 'OBubba teething and sleep insight'
      },
      partner: {
        source: 'Partner', time: '5:36 PM · Partner', event: 'Evening feed logged', detail: 'Baby took less than usual after a busy day',
        before: 'Bedtime feed 6:50 PM', after: 'Offer again before 7:10 PM', reason: 'The shared feed log keeps the wind-down coordinated.',
        title: 'Partner logged the evening feed.', copy: 'OBubba adds it to today’s rhythm so nobody repeats the question or loses the sleep context.',
        action: 'Joining the evening', actionDetail: 'Keeping the handover in sync', image: '/obubba-connect-live-family-sync.jpg', imageAlt: 'OBubba live family sync'
      },
      night: {
        source: 'Family home', time: '3:07 AM · Family home', event: 'Another night waking', detail: 'The third wake after an unusual nursery day',
        before: 'An unexplained night', after: 'One pattern to try tomorrow', reason: 'OBubba brings short naps, feeds and teething into one story.',
        title: 'Baby woke again at 3:07 AM.', copy: 'OBubba looks across the whole day, shows the strongest clues and offers one gentle change to test tomorrow.',
        action: 'Connecting the clues', actionDetail: 'Turning the day into a sleep story', image: '/obubba-tonight-sleep-story.jpg', imageAlt: 'OBubba tonight sleep story'
      }
    };
    let activeVillageScenario = 'nursery';
    let villageTimer = null;
    const setVillageStep = (step) => {
      const story = scenarios[activeVillageScenario];
      clearStage.dataset.step = String(step);
      clearVillage.querySelectorAll('[data-journey-step]').forEach((button) => button.classList.toggle('is-on', Number(button.dataset.journeyStep) <= step));
      const actions = [
        ['Waiting for a moment', 'Choose a story to begin'],
        [`${story.source} logged it`, story.event],
        ['Receiving the update', 'No message chasing needed'],
        [story.action, story.actionDetail],
        ['Sharing the reason', 'The whole village is up to date'],
        ['Adjusting the sleep plan', story.reason]
      ];
      clearVillage.querySelector('[data-clear-action]').textContent = actions[step][0];
      clearVillage.querySelector('[data-clear-detail]').textContent = actions[step][1];
    };
    const paintVillageStory = (key) => {
      const story = scenarios[key];
      activeVillageScenario = key;
      window.clearInterval(villageTimer);
      villageTimer = null;
      clearStage.dataset.scenario = key;
      clearVillage.querySelectorAll('[data-village-scenario]').forEach((button) => {
        const active = button.dataset.villageScenario === key;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      clearVillage.querySelector('[data-source-label]').textContent = story.event;
      clearVillage.querySelector('[data-event-time]').textContent = story.time;
      clearVillage.querySelector('[data-event-title]').textContent = story.event;
      clearVillage.querySelector('[data-event-detail]').textContent = story.detail;
      clearVillage.querySelector('[data-before-plan]').textContent = story.before;
      clearVillage.querySelector('[data-after-plan]').textContent = story.after;
      clearVillage.querySelector('[data-outcome-reason]').textContent = story.reason;
      clearVillage.querySelector('[data-explainer-title]').textContent = story.title;
      clearVillage.querySelector('[data-explainer-copy]').textContent = story.copy;
      clearVillage.querySelector('[data-step-one]').textContent = `${story.source} logs the moment`;
      const phone = clearVillage.querySelector('[data-clear-phone]');
      phone.src = story.image;
      phone.alt = story.imageAlt;
      clearVillage.querySelector('[data-play-village]').innerHTML = '<span>▶</span> Play this story';
      setVillageStep(0);
    };
    const playVillageStory = () => {
      window.clearInterval(villageTimer);
      let step = 0;
      const play = clearVillage.querySelector('[data-play-village]');
      play.innerHTML = '<span>Ⅱ</span> Playing the story';
      setVillageStep(step);
      villageTimer = window.setInterval(() => {
        step += 1;
        setVillageStep(step);
        if (step >= 5) {
          window.clearInterval(villageTimer);
          villageTimer = null;
          play.innerHTML = '<span>↻</span> Replay this story';
        }
      }, 850);
    };
    clearVillage.querySelectorAll('[data-village-scenario]').forEach((button) => button.addEventListener('click', () => {
      paintVillageStory(button.dataset.villageScenario);
      playVillageStory();
    }));
    clearVillage.querySelectorAll('[data-journey-step]').forEach((button) => button.addEventListener('click', () => setVillageStep(Number(button.dataset.journeyStep))));
    clearVillage.querySelector('[data-play-village]').addEventListener('click', playVillageStory);
    paintVillageStory(activeVillageScenario);
    if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const villageAutoplay = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        villageAutoplay.disconnect();
        window.setTimeout(playVillageStory, 500);
      }, { threshold: .45 });
      villageAutoplay.observe(clearVillage.querySelector('[data-clear-stage]'));
    }
  }
  const livingStory = document.querySelector('[data-living-story]');
  if (false && livingStory) {
    const world = livingStory.querySelector('[data-story-world]');
    const worldStates = {
      morning: ['Good morning', '7:06 AM', 'Today begins with your baby', '/obubba-personalised-nap-prediction-app.jpg'],
      handover: ['Care is moving', '12:14 PM', 'One update reaches everyone', '/obubba-connect-live-family-sync.jpg'],
      constellation: ['The clues gather', '6:42 PM', 'The day is becoming tonight’s story', '/obubba-tonight-sleep-story.jpg'],
      garden: ['Growing gently', '6:55 PM', 'The rhythm changes as baby grows', '/obubba-drop-a-nap-transition.jpg'],
      tonight: ['Good night', '7:18 PM', 'One calm next step for tonight', '/obubba-tonights-guidance-sleep-consultant.jpg']
    };
    const paintWorld = (phase) => {
      const [greeting, clock, message, image] = worldStates[phase];
      world.dataset.phase = phase;
      world.querySelector('[data-story-greeting]').textContent = greeting;
      world.querySelector('[data-story-clock]').textContent = clock;
      world.querySelector('[data-story-message]').textContent = message;
      world.querySelector('[data-story-phone]').src = image;
      livingStory.querySelectorAll('[data-story-chapter]').forEach((chapter) => chapter.classList.toggle('is-current', chapter.dataset.storyChapter === phase));
    };
    if ('IntersectionObserver' in window) {
      const chapters = [...livingStory.querySelectorAll('[data-story-chapter]')];
      const observer = new IntersectionObserver((entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) paintWorld(visible.target.dataset.storyChapter);
      }, { rootMargin: '-25% 0px -42%', threshold: [0, .35, .65] });
      chapters.forEach((chapter) => observer.observe(chapter));
    }
    const builder = livingStory.querySelector('[data-rhythm-builder]');
    const updateBuilder = () => {
      const age = Number(builder.querySelector('[data-builder-age]').value);
      const wake = builder.querySelector('[data-builder-wake]').value || '07:00';
      const [hours, minutes] = wake.split(':').map(Number);
      const windowMinutes = age <= 12 ? 90 : age <= 24 ? 135 : age <= 36 ? 140 : age <= 52 ? 180 : 270;
      const total = hours * 60 + minutes + windowMinutes;
      const h = Math.floor(total / 60) % 24;
      const m = total % 60;
      builder.querySelector('[data-builder-answer]').textContent = `First nap around ${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
      builder.querySelector('[data-builder-note]').textContent = `About ${Math.floor(windowMinutes / 60)}h ${windowMinutes % 60 ? `${windowMinutes % 60}m` : ''} after waking`;
      world.querySelector('[data-story-clock]').textContent = `${hours % 12 || 12}:${String(minutes).padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'}`;
    };
    builder.querySelectorAll('select,input').forEach((input) => input.addEventListener('input', updateBuilder));
    const handover = livingStory.querySelector('[data-handover-demo]');
    const handoverCopy = {
      nursery: ['Nursery', 'A shorter nursery nap reaches Partner and Grandparents. OBubba gently brings bedtime forward.'],
      partner: ['Partner', 'A feed joins the shared day. Nobody needs to ask when baby last ate.'],
      grandparents: ['Grandparents', 'A teething clue gives the next wake more context and keeps the whole family close.']
    };
    handover.querySelectorAll('[data-handover]').forEach((button) => button.addEventListener('click', () => {
      const key = button.dataset.handover;
      handover.querySelectorAll('button').forEach((item) => item.classList.toggle('is-active', item === button));
      handover.querySelectorAll('li').forEach((item, index) => window.setTimeout(() => item.classList.add('is-on'), index * 260));
      world.querySelectorAll('[data-story-carer]').forEach((item) => item.classList.toggle('is-active', item.dataset.storyCarer === key));
      handover.querySelector('[data-handover-result]').textContent = handoverCopy[key][1];
      world.querySelector('[data-story-message]').textContent = `${handoverCopy[key][0]} added a new clue`;
      world.classList.remove('is-rippling');
      requestAnimationFrame(() => world.classList.add('is-rippling'));
    }));
    const constellation = livingStory.querySelector('[data-constellation]');
    const clueCopy = {
      feeds: 'A different feed pattern may shape settling tonight.', naps: 'Nap length and timing help explain bedtime pressure.',
      teething: 'Teething can add useful context to a restless night.', development: 'New skills can bring busy bodies and busy brains.',
      nursery: 'A nursery day can shift naps, feeds and bedtime together.'
    };
    constellation.querySelectorAll('[data-clue]').forEach((button) => button.addEventListener('click', () => {
      constellation.querySelectorAll('button').forEach((item) => item.classList.toggle('is-active', item === button));
      constellation.dataset.active = button.dataset.clue;
      constellation.querySelector('[data-constellation-answer]').textContent = clueCopy[button.dataset.clue];
      world.querySelector('[data-story-message]').textContent = `${button.textContent} joined tonight’s story`;
    }));
    const garden = livingStory.querySelector('[data-nap-garden]');
    const updateGarden = () => {
      const months = Number(garden.querySelector('[data-garden-slider]').value);
      const naps = months < 5 ? 4 : months < 8 ? 3 : months < 16 ? 2 : 1;
      garden.querySelector('[data-garden-age]').textContent = `${months} months`;
      garden.querySelector('[data-garden-note]').textContent = naps === 1 ? 'Often moving towards one midday nap' : `Often settling into ${naps} naps`;
      garden.querySelectorAll('.g-garden-bed i').forEach((flower, index) => flower.classList.toggle('is-growing', index < naps));
    };
    garden.querySelector('[data-garden-slider]').addEventListener('input', updateGarden);
    updateGarden();
    const tonight = livingStory.querySelector('[data-tonight-demo]');
    tonight.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(tonight);
      const nap = data.get('nap');
      const clue = data.get('clue');
      const napCopy = nap === 'short' ? 'A shorter last nap may have built sleep pressure sooner.' : nap === 'late' ? 'A later nap may gently move bedtime.' : 'The last nap looks close to the familiar rhythm.';
      const clueText = clue === 'teething' ? ' Teething signs add a helpful clue.' : clue === 'feed' ? ' A different feed pattern may also matter.' : clue === 'nursery' ? ' The nursery day gives the change more context.' : '';
      const result = tonight.querySelector('[data-tonight-result]');
      result.querySelector('strong').textContent = `${napCopy}${clueText}`;
      result.classList.add('is-revealed');
      world.classList.add('is-night-magic');
    });
  }
  const ending = document.querySelector('[data-night-ending]');
  if (ending) {
    const release = ending.querySelector('[data-release-fireflies]');
    release.addEventListener('click', () => {
      ending.classList.toggle('is-released');
      release.innerHTML = ending.classList.contains('is-released') ? 'The village is glowing <span>✦</span>' : 'Release the fireflies <span>✦</span>';
    });
  }
  const showAllTools = document.querySelector('[data-show-all-tools]');
  if (showAllTools) {
    showAllTools.addEventListener('click', () => {
      const list = document.querySelector('[data-tool-list]');
      const expanded = !list.classList.contains('is-expanded');
      list.classList.toggle('is-expanded', expanded);
      showAllTools.setAttribute('aria-expanded', String(expanded));
      showAllTools.innerHTML = expanded ? 'Show only sleep essentials <span>↑</span>' : 'See all 11 free tools <span>→</span>';
    });
  }
  if (!reduced) {
    hero.addEventListener('pointermove', (event) => {
      const box = hero.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width - .5;
      const y = (event.clientY - box.top) / box.height - .5;
      scene.style.setProperty('--g-parallax-x', `${x * 10}px`);
      scene.style.setProperty('--g-parallax-y', `${y * 7}px`);
    });
    hero.addEventListener('pointerleave', () => {
      scene.style.setProperty('--g-parallax-x', '0px');
      scene.style.setProperty('--g-parallax-y', '0px');
    });
  }

  const rhythm = document.querySelector('[data-rhythm-demo]');
  if (rhythm) {
    const stories = {
      sleep: { icon: '☾', kicker: '{carer} added a nap', title: 'Everyone is in sync', copy: 'Partner and Grandparents see it. The next wake window settles around what actually happened.', time: 'Next nap 12:20', note: 'Wake window gently adjusted' },
      weaning: { icon: '🍐', kicker: '{carer} logged lunch', title: 'Food joins the rhythm', copy: 'A later lunch gently nudges the next sleep. Everyone can see what baby tried.', time: 'Next nap 12:35', note: 'Lunch added to today’s rhythm' },
      nappies: { icon: '☁', kicker: '{carer} changed a nappy', title: 'No need to ask', copy: 'The useful detail is already there when care moves from one person to another.', time: 'Next nap 12:20', note: 'Care timeline up to date' },
      teething: { icon: '✦', kicker: '{carer} noticed teething', title: 'A wake has context', copy: 'A restless nap now has a clue beside it, helping the family respond more calmly.', time: 'Next nap 12:05', note: 'A gentler window suggested' },
      development: { icon: '🌱', kicker: '{carer} spotted a new skill', title: 'Growing changes the day', copy: 'A burst of practice can ripple into naps and nights. The pattern stays together.', time: 'Next nap 12:10', note: 'Development leap in view' },
      milestones: { icon: '★', kicker: '{carer} saved a milestone', title: 'Today becomes a memory', copy: 'A little first lives beside the sleeps, feeds and people who shared the moment.', time: 'Next nap 12:20', note: 'A little big moment saved' }
    };
    const stageTimes = {
      newborn: { sleep: 'Next sleep 10:45', weaning: 'Next feed 10:30', nappies: 'Next sleep 10:45', teething: 'Next sleep 10:35', development: 'Next sleep 10:40', milestones: 'Next sleep 10:45' },
      baby: { sleep: 'Next nap 12:20', weaning: 'Next nap 12:35', nappies: 'Next nap 12:20', teething: 'Next nap 12:05', development: 'Next nap 12:10', milestones: 'Next nap 12:20' },
      toddler: { sleep: 'Bedtime 19:15', weaning: 'Bedtime 19:25', nappies: 'Bedtime 19:15', teething: 'Bedtime 19:00', development: 'Bedtime 19:10', milestones: 'Bedtime 19:15' }
    };
    let activeSignal = 'sleep';
    let activeCarer = 'Nursery';
    let activeStage = 'baby';
    const villageScreens = {
      sleep: ['/obubba-personalised-nap-prediction-app.jpg', 'OBubba personalised nap prediction'],
      weaning: ['/obubba-what-track-starting-solids.jpg', 'OBubba weaning tracker'],
      nappies: ['/obubba-nappy-logger-app.jpg', 'OBubba nappy logger'],
      teething: ['/obubba-teething-sleep-comfort.jpg', 'OBubba teething and sleep insight'],
      development: ['/obubba-development-map-app.jpg', 'OBubba development map'],
      milestones: ['/obubba-milestones-app.jpg', 'OBubba milestones journal']
    };
    const setPressed = (selector, chosen) => rhythm.querySelectorAll(selector).forEach((button) => {
      const active = button === chosen;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    const paintStory = () => {
      const story = stories[activeSignal];
      rhythm.dataset.signal = activeSignal;
      rhythm.querySelector('[data-story-icon]').textContent = story.icon;
      rhythm.querySelector('[data-story-kicker]').textContent = story.kicker.replace('{carer}', activeCarer);
      rhythm.querySelector('[data-story-title]').textContent = story.title;
      rhythm.querySelector('[data-story-copy]').textContent = story.copy;
      rhythm.querySelector('[data-rhythm-time]').textContent = stageTimes[activeStage][activeSignal];
      rhythm.querySelector('[data-rhythm-note]').textContent = story.note;
      const villageScreen = rhythm.querySelector('[data-village-screen]');
      const [screenSrc, screenAlt] = villageScreens[activeSignal];
      villageScreen.src = screenSrc;
      villageScreen.alt = screenAlt;
      rhythm.querySelector('[data-day-scene]').dataset.activeCarer = activeCarer.toLowerCase();
      rhythm.classList.remove('is-pulsing');
      rhythm.classList.remove('has-magic-event');
      requestAnimationFrame(() => {
        rhythm.classList.add('is-pulsing');
        rhythm.classList.add('has-magic-event');
      });
    };
    rhythm.querySelectorAll('[data-signal]').forEach((button) => button.addEventListener('click', () => {
      activeSignal = button.dataset.signal;
      setPressed('[data-signal]', button);
      paintStory();
    }));
    rhythm.querySelectorAll('[data-carer]').forEach((button) => button.addEventListener('click', () => {
      activeCarer = button.dataset.carer.charAt(0).toUpperCase() + button.dataset.carer.slice(1);
      setPressed('[data-carer]', button);
      paintStory();
    }));
    rhythm.querySelectorAll('[data-stage]').forEach((button) => button.addEventListener('click', () => {
      activeStage = button.dataset.stage;
      setPressed('[data-stage]', button);
      paintStory();
    }));
    const play = rhythm.querySelector('[data-play-day]');
    if (play) {
      const sequence = [
        ['sleep', 'Nursery'], ['nappies', 'Partner'], ['weaning', 'Grandparents'],
        ['development', 'Partner'], ['teething', 'Grandparents'], ['milestones', 'Nursery']
      ];
      let timer = null;
      let step = 0;
      const stop = () => {
        window.clearInterval(timer);
        timer = null;
        play.classList.remove('is-playing');
        play.innerHTML = '<span>▶</span> Play the day';
      };
      play.addEventListener('click', () => {
        if (timer) return stop();
        play.classList.add('is-playing');
        play.innerHTML = '<span>Ⅱ</span> Pause';
        const advance = () => {
          const [signal, carer] = sequence[step % sequence.length];
          activeSignal = signal;
          activeCarer = carer;
          const signalButton = rhythm.querySelector(`[data-signal="${signal}"]`);
          const carerButton = rhythm.querySelector(`[data-carer="${carer.toLowerCase()}"]`);
          setPressed('[data-signal]', signalButton);
          setPressed('[data-carer]', carerButton);
          paintStory();
          step += 1;
          if (step >= sequence.length) stop();
        };
        advance();
        timer = window.setInterval(advance, 1800);
      });
    }
    const magicToggle = rhythm.querySelector('[data-magic-toggle]');
    const magicWorld = rhythm.closest('.g-rhythm-world');
    const dayScene = rhythm.querySelector('[data-day-scene]');
    if (magicToggle && magicWorld && dayScene) {
      const setMagic = (on) => {
        magicWorld.classList.toggle('is-magic', on);
        document.body.classList.toggle('g-magic-open', on);
        magicToggle.setAttribute('aria-expanded', String(on));
        magicToggle.innerHTML = on ? '<span>×</span> Leave magic mode' : '<span>✦</span> Magic mode';
        if (on) dayScene.focus({ preventScroll: true });
      };
      dayScene.setAttribute('tabindex', '-1');
      magicToggle.addEventListener('click', () => setMagic(!magicWorld.classList.contains('is-magic')));
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && magicWorld.classList.contains('is-magic')) setMagic(false);
      });
      if (!reduced) {
        dayScene.addEventListener('pointermove', (event) => {
          if (!magicWorld.classList.contains('is-magic')) return;
          const box = dayScene.getBoundingClientRect();
          dayScene.style.setProperty('--mx', `${event.clientX - box.left}px`);
          dayScene.style.setProperty('--my', `${event.clientY - box.top}px`);
          dayScene.style.setProperty('--tilt-x', `${((event.clientX - box.left) / box.width - .5) * 7}deg`);
          dayScene.style.setProperty('--tilt-y', `${((event.clientY - box.top) / box.height - .5) * -5}deg`);
        });
        dayScene.addEventListener('click', (event) => {
          if (!magicWorld.classList.contains('is-magic') || event.target.closest('button')) return;
          const box = dayScene.getBoundingClientRect();
          const burst = document.createElement('span');
          burst.className = 'g-firefly-burst';
          burst.style.left = `${event.clientX - box.left}px`;
          burst.style.top = `${event.clientY - box.top}px`;
          burst.innerHTML = '<i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>';
          dayScene.appendChild(burst);
          window.setTimeout(() => burst.remove(), 1500);
        });
      }
    }
  }

  const miniTimeline = document.querySelector('[data-mini-timeline]');
  if (miniTimeline) {
    const miniStates = {
      wake: ['Next nap around 12:20', 'Based on today\'s first wake window'],
      feed: ['Next nap around 12:28', 'The morning feed joined today\'s rhythm'],
      nap: ['Bedtime around 7:18', 'The real nap moved the rest of the day']
    };
    miniTimeline.querySelectorAll('[data-mini-event]').forEach((button) => button.addEventListener('click', () => {
      miniTimeline.querySelectorAll('[data-mini-event]').forEach((item) => item.classList.toggle('is-active', item === button));
      const [answer, reason] = miniStates[button.dataset.miniEvent];
      miniTimeline.querySelector('[data-mini-answer]').textContent = answer;
      miniTimeline.querySelector('[data-mini-reason]').textContent = reason;
      miniTimeline.classList.remove('is-updating');
      requestAnimationFrame(() => miniTimeline.classList.add('is-updating'));
    }));
  }

  const compass = document.querySelector('[data-care-compass]');
  if (compass) {
    const answers = {
      settle: ['Night waking checker', 'Look at the whole day and find gentle clues behind a difficult night.', '/calculators/night-waking-checker.html', '/obubba-night-wake-pause-app.jpg', 'OBubba night waking guidance'],
      'next-nap': ['Wake window calculator', 'Turn the last wake-up into a calm, age-aware next-nap window.', '/calculators/wake-window-calculator.html', '/obubba-personalised-nap-prediction-app.jpg', 'OBubba personalised nap prediction'],
      transition: ['Nap transition checker', 'Spot the pattern behind nap resistance before changing the rhythm.', '/calculators/nap-transition-checker.html', '/obubba-baby-nap-rhythm-schedule.jpg', 'OBubba baby nap rhythm'],
      'sleep-needs': ['Baby sleep needs calculator', 'See a gentle daily range, then shape it around your actual baby.', '/calculators/baby-sleep-needs-calculator.html', '/obubba-development-map-app.jpg', 'OBubba development and sleep view'],
      plan: ['Sleep schedule maker', 'Build a flexible day around wake-up time, naps, feeds and bedtime.', '/calculators/baby-sleep-schedule-maker.html', '/obubba-baby-nap-rhythm-schedule.jpg', 'OBubba baby day schedule'],
      bedtime: ['Bedtime calculator', 'Find a practical bedtime from the final nap and today\'s real rhythm.', '/calculators/bedtime-calculator.html', '/obubba-tonight-sleep-story-logic.svg', 'OBubba bedtime story logic']
    };
    const image = compass.querySelector('[data-compass-image]');
    const title = compass.querySelector('[data-compass-title]');
    const copy = compass.querySelector('[data-compass-copy]');
    const link = compass.querySelector('[data-compass-link]');
    compass.querySelectorAll('[data-compass]').forEach((button) => button.addEventListener('click', () => {
      const [nextTitle, nextCopy, href, src, alt] = answers[button.dataset.compass];
      compass.querySelectorAll('[data-compass]').forEach((item) => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      title.textContent = nextTitle;
      copy.textContent = nextCopy;
      link.href = href;
      image.src = src;
      image.alt = alt;
      compass.classList.remove('is-answering');
      requestAnimationFrame(() => compass.classList.add('is-answering'));
    }));
  }

  if (document.querySelector('.g-daybook')) {
    const starlight = document.createElement('div');
    starlight.className = 'g-scroll-starlight';
    starlight.setAttribute('aria-hidden', 'true');
    document.body.appendChild(starlight);
    let ticking = false;
    const paintProgress = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      starlight.style.setProperty('--progress', String(max > 0 ? Math.min(window.scrollY / max, 1) : 0));
      document.body.classList.toggle('g-has-travelled', window.scrollY > 48);
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) requestAnimationFrame(paintProgress);
      ticking = true;
    }, { passive: true });
    paintProgress();

    const wash = document.createElement('div');
    wash.className = 'g-world-wash';
    wash.setAttribute('aria-hidden', 'true');
    document.body.appendChild(wash);
    const chapters = [
      ['.g-hero', 'dawn'], ['.g-scene-morning', 'morning'], ['.g-scene-afternoon', 'afternoon'],
      ['.g-scene-evening', 'evening'], ['.g-rhythm-world', 'village'], ['.g-tool-garden', 'tools'], ['.g-final-invite', 'night']
    ];
    const chapterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        document.body.dataset.obubbaChapter = entry.target.dataset.chapter;
        entry.target.classList.add('is-chapter-visible');
      });
    }, { rootMargin: '-28% 0px -48%', threshold: .05 });
    chapters.forEach(([selector, chapter]) => {
      const section = document.querySelector(selector);
      if (!section) return;
      section.dataset.chapter = chapter;
      section.classList.add('g-chapter');
      chapterObserver.observe(section);
    });

    if (!reduced) {
      document.querySelectorAll('.g-tile').forEach((card) => {
        card.addEventListener('pointermove', (event) => {
          const box = card.getBoundingClientRect();
          card.style.setProperty('--card-x', `${((event.clientX - box.left) / box.width - .5) * 3}deg`);
          card.style.setProperty('--card-y', `${((event.clientY - box.top) / box.height - .5) * -3}deg`);
        });
        card.addEventListener('pointerleave', () => {
          card.style.setProperty('--card-x', '0deg');
          card.style.setProperty('--card-y', '0deg');
        });
      });
      document.querySelector('.g-page').addEventListener('click', (event) => {
        if (event.target.closest('a,button,input,select,textarea')) return;
        const burst = document.createElement('span');
        burst.className = 'g-page-fireflies';
        burst.style.left = `${event.clientX}px`;
        burst.style.top = `${event.clientY}px`;
        burst.innerHTML = '<i></i><i></i><i></i><i></i><i></i>';
        document.body.appendChild(burst);
        window.setTimeout(() => burst.remove(), 1300);
      });
    }
  }

  const reveal = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('g-revealed');
      reveal.unobserve(entry.target);
    });
  }, { threshold: .08 });
  document.querySelectorAll('.g-card,.g-tile,.g-pill-card,.g-table-wrap,.g-cta').forEach((item, index) => {
    item.classList.add('g-reveal');
    item.style.setProperty('--g-delay', `${Math.min(index % 6, 5) * 45}ms`);
    reveal.observe(item);
  });
})();
