(() => {
  document.documentElement.classList.add('js');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const hero = document.querySelector('[data-sv-hero]');
  if (hero) {
    const views = {
      nap: ['/obubba-personalised-nap-prediction-app.jpg', 'OBubba personalised nap prediction', 'Your baby’s rhythm is taking shape', 'Today’s real wake time reshaped the next nap'],
      story: ['/obubba-tonight-sleep-story.jpg', 'OBubba tonight sleep story', 'The day becomes tonight’s story', 'Naps, feeds and teething clues stay connected'],
      fireflies: ['/obubba-fireflies-night-clock.jpg', 'OBubba fireflies during a night waking', 'Nobody does the 3am shift alone', 'Each firefly is another parent awake right now'],
    };
    hero.querySelectorAll('[data-sv-view]').forEach((button) => button.addEventListener('click', () => {
      const [src, alt, title, copy] = views[button.dataset.svView];
      hero.querySelectorAll('[data-sv-view]').forEach((item) => { const active = item === button; item.classList.toggle('is-active', active); item.setAttribute('aria-pressed', String(active)); });
      const image = hero.querySelector('[data-sv-hero-image]');
      image.src = src; image.alt = alt; image.classList.remove('is-changing');
      hero.querySelector('[data-sv-hero-title]').textContent = title;
      hero.querySelector('[data-sv-hero-copy]').textContent = copy;
      requestAnimationFrame(() => image.classList.add('is-changing'));
    }));
  }

  const village = document.querySelector('[data-sv-village]');
  if (village) {
    const stage = village.querySelector('[data-sv-stage]');
    const stories = {
      nursery: { time:'12:14 PM · Nursery', event:'Short nap logged', detail:'35 minutes instead of the usual 1 hour', before:'Bedtime 7:30 PM', after:'Bedtime 7:05 PM', reason:'A shorter nursery nap built sleep pressure sooner.', title:'Nursery logged a short nap.', copy:'OBubba connects it to the rest of the day, updates bedtime and shares the reason with the carers you have invited.', action:'Reading the nap', actionCopy:'Comparing it with today’s rhythm', image:'/obubba-personalised-nap-prediction-app.jpg', alt:'OBubba personalised nap prediction', popImage:'/obubba-nursery-naps-handover.jpg', popAlt:'Nursery records a baby nap for a parent', popKicker:'Nursery → OBubba → Home', popTitle:'Nursery records the nap. OBubba updates the plan at home.', popCopy:'The care link lets nursery log a 35-minute nap without downloading the app. OBubba updates today’s rhythm and shows the parent why bedtime moved earlier.', popPoints:['Nursery sees only the care view','Parent keeps full control','The evening plan updates for everyone invited'] },
      grandparents: { time:'3:48 PM · Grandparents', event:'Teething signs noticed', detail:'Sore gums and a more unsettled afternoon', before:'Bedtime 7:20 PM', after:'Gentler wind-down 6:50 PM', reason:'Teething adds context, so tonight begins with comfort.', title:'Grandparents noticed sore gums.', copy:'OBubba keeps the clue beside naps and feeds, then gives Partner a calmer plan for the evening.', action:'Adding context', actionCopy:'Connecting comfort with sleep', image:'/obubba-teething-sleep-comfort.jpg', alt:'OBubba teething and sleep insight', popImage:'/obubba-day-type-grandparent-handover.jpg', popAlt:'Grandparent sharing a care update with a parent', popKicker:'Grandparents → OBubba → Parents', popTitle:'Grandparents add the detail that changes the evening.', popCopy:'They record sore gums and an unsettled afternoon through their limited care view. OBubba connects that clue with naps and feeds, then suggests a gentler wind-down.', popPoints:['Grandparents see only what today’s care needs','Parents receive the update instantly','Teething becomes useful sleep context'] },
      partner: { time:'5:36 PM · Partner', event:'Evening feed logged', detail:'Baby took less than usual after a busy day', before:'Bedtime feed 6:50 PM', after:'Offer again before 7:10 PM', reason:'The shared feed log keeps the wind-down coordinated.', title:'Partner logged the evening feed.', copy:'OBubba adds it to today’s rhythm so nobody repeats the question or loses the sleep context.', action:'Joining the evening', actionCopy:'Keeping the handover in sync', image:'/obubba-connect-live-family-sync.jpg', alt:'OBubba live family sync', popImage:'/obubba-share-baby-tracker-with-partner.jpg', popAlt:'Partners using separate accounts to coordinate baby care', popKicker:'Partner account → Shared baby → One rhythm', popTitle:'Two accounts stay perfectly in step.', popCopy:'A partner logs the evening feed on their own account. The shared baby timeline updates immediately, while other children and family profiles stay private.', popPoints:['No shared passwords','Both parents see the same baby timeline','Other family profiles remain separate'] },
      night: { time:'3:07 AM · Family home', event:'Another night waking', detail:'The third wake after an unusual nursery day', before:'An unexplained night', after:'One pattern to try tomorrow', reason:'OBubba brings short naps, feeds and teething into one story.', title:'Baby woke again at 3:07 AM.', copy:'OBubba looks across the whole day, shows the strongest clues and offers one gentle change to test tomorrow.', action:'Connecting the clues', actionCopy:'Turning the day into a sleep story', image:'/obubba-tonight-sleep-story.jpg', alt:'OBubba tonight sleep story', popImage:'/obubba-2am-wake-yesterday.jpg', popAlt:'A parent checking a baby sleep insight at night', popKicker:'The whole day → One sleep story', popTitle:'The night wake is not an isolated dot anymore.', popCopy:'OBubba connects nursery sleep, feeds, teething and earlier wakes, then gives parents one gentle experiment for tomorrow instead of another unexplained night.', popPoints:['Every carer’s useful clues come together','Parents see why the plan changed','One calm next step replaces guesswork'] },
    };
    let active = 'nursery'; let timer = null;
    const setStep = (step) => {
      const story = stories[active]; stage.dataset.step = String(step);
      village.querySelectorAll('[data-sv-step]').forEach((button) => button.classList.toggle('is-on', Number(button.dataset.svStep) <= step));
      const actions = [['Waiting for a moment','Choose a story to begin'],['Moment logged',story.event],['Receiving the update','No message chasing needed'],[story.action,story.actionCopy],['Sharing the reason','The whole village is up to date'],['Adjusting the sleep plan',story.reason]];
      village.querySelector('[data-sv-action]').textContent = actions[step][0];
      village.querySelector('[data-sv-detail]').textContent = actions[step][1];
    };
    const paint = (key) => {
      active = key; clearInterval(timer); timer = null; const story = stories[key]; stage.dataset.scenario = key;
      village.querySelectorAll('[data-sv-scenario]').forEach((button) => { const on = button.dataset.svScenario === key; button.classList.toggle('is-active', on); button.setAttribute('aria-pressed', String(on)); });
      const fields = { '[data-sv-event-time]':story.time,'[data-sv-event-title]':story.event,'[data-sv-event-detail]':story.detail,'[data-sv-before]':story.before,'[data-sv-after]':story.after,'[data-sv-reason]':story.reason,'[data-sv-explainer-title]':story.title,'[data-sv-explainer-copy]':story.copy };
      Object.entries(fields).forEach(([selector,value]) => village.querySelector(selector).textContent = value);
      const image = village.querySelector('[data-sv-app-image]'); image.src = story.image; image.alt = story.alt;
      const popover = village.querySelector('[data-sv-popover]');
      const popImage = village.querySelector('[data-sv-popover-image]'); popImage.src = story.popImage; popImage.alt = story.popAlt;
      village.querySelector('[data-sv-popover-kicker]').textContent = story.popKicker;
      village.querySelector('[data-sv-popover-title]').textContent = story.popTitle;
      village.querySelector('[data-sv-popover-copy]').textContent = story.popCopy;
      village.querySelector('[data-sv-popover-points]').innerHTML = story.popPoints.map((point) => `<li>${point}</li>`).join('');
      popover.classList.remove('is-open'); requestAnimationFrame(() => popover.classList.add('is-open'));
      village.querySelector('[data-sv-play]').innerHTML = '<span>▶</span> Play this story'; setStep(0);
    };
    const play = () => {
      clearInterval(timer); let step = 0; const button = village.querySelector('[data-sv-play]'); button.innerHTML = '<span>Ⅱ</span> Playing'; setStep(0);
      timer = setInterval(() => { step += 1; setStep(step); if (step >= 5) { clearInterval(timer); timer = null; button.innerHTML = '<span>↻</span> Replay this story'; } }, 850);
    };
    village.querySelectorAll('[data-sv-scenario]').forEach((button) => button.addEventListener('click', () => { paint(button.dataset.svScenario); play(); }));
    village.querySelectorAll('[data-sv-step]').forEach((button) => button.addEventListener('click', () => setStep(Number(button.dataset.svStep))));
    village.querySelector('[data-sv-popover-close]').addEventListener('click', () => village.querySelector('[data-sv-popover]').classList.remove('is-open'));
    village.querySelector('[data-sv-popover-watch]').addEventListener('click', () => { village.querySelector('[data-sv-popover]').classList.remove('is-open'); play(); });
    village.querySelector('[data-sv-play]').addEventListener('click', play); paint(active);
    if (!reduced && 'IntersectionObserver' in window) { const observer = new IntersectionObserver((entries) => { if (!entries.some((entry) => entry.isIntersecting)) return; observer.disconnect(); setTimeout(play, 450); }, { threshold:.45 }); observer.observe(stage); }
  }

  const accessDemo = document.querySelector('[data-sv-access-demo]');
  if (accessDemo) {
    const views = {
      parent: { a:['Full family timeline','Full access','full'], b:['Full family timeline','Full access','full'], icon:'✓', title:'Parent sees both children.', copy:'Full history, insights and controls stay with the parent. Each partner sees only the baby they have been invited to.' },
      partnerA: { a:['Shared Baby A timeline','Invited','full'], b:['Baby B stays private','Not shared','locked'], icon:'A', title:'Partner A sees Baby A only.', copy:'Their separate account stays synced with Baby A. Baby B, Partner B and every unrelated family detail remain invisible.' },
      partnerB: { a:['Baby A stays private','Not shared','locked'], b:['Shared Baby B timeline','Invited','full'], icon:'B', title:'Partner B sees Baby B only.', copy:'Their separate account stays synced with Baby B. Baby A, Partner A and every unrelated family detail remain invisible.' },
      nursery: { a:["Today’s naps, feeds and care","Care link","care"], b:['Baby B stays private','Not shared','locked'], icon:'N', title:'Nursery gets a small care window.', copy:'No app or family account is needed. The care link shows only what Nursery needs for Baby A today and lets them record the day.' },
      grandparents: { a:["Today’s care plan","Care access","care"], b:['Baby B stays private','Not shared','locked'], icon:'G', title:'Grandparents see the plan, not the private history.', copy:'They can record today’s care for Baby A without opening the wider family timeline. The parent can switch this access off at any time.' },
    };
    let person = 'parent'; let careOn = true;
    const paintAccess = () => {
      let view = views[person];
      if (!careOn && (person === 'nursery' || person === 'grandparents')) view = { a:['Care link paused','Access off','locked'], b:['Baby B stays private','Not shared','locked'], icon:'○', title:'Care access is paused.', copy:'Nursery and grandparents can no longer open the care link or add logs. The parent can turn it back on whenever care begins again.' };
      [['a',view.a],['b',view.b]].forEach(([key,data]) => {
        const card = accessDemo.querySelector(`[data-sv-baby="${key}"]`); card.dataset.access = data[2];
        accessDemo.querySelector(`[data-sv-status-${key}]`).textContent = data[0];
        accessDemo.querySelector(`[data-sv-badge-${key}]`).textContent = data[1];
      });
      accessDemo.querySelector('[data-sv-access-icon]').textContent = view.icon;
      accessDemo.querySelector('[data-sv-access-title]').textContent = view.title;
      accessDemo.querySelector('[data-sv-access-copy]').textContent = view.copy;
      accessDemo.querySelectorAll('[data-sv-person]').forEach((button) => { const active = button.dataset.svPerson === person; button.classList.toggle('is-active', active); button.setAttribute('aria-pressed', String(active)); });
    };
    accessDemo.querySelectorAll('[data-sv-person]').forEach((button) => button.addEventListener('click', () => { person = button.dataset.svPerson; paintAccess(); }));
    accessDemo.querySelector('[data-sv-care-toggle]').addEventListener('click', (event) => { careOn = !careOn; event.currentTarget.setAttribute('aria-pressed', String(careOn)); event.currentTarget.classList.toggle('is-off', !careOn); event.currentTarget.lastChild.textContent = careOn ? ' Care links on' : ' Care links off'; paintAccess(); });
    paintAccess();
  }

  const showTools = document.querySelector('[data-sv-show-tools]');
  if (showTools) showTools.addEventListener('click', () => { const list = document.querySelector('[data-sv-tools]'); const expanded = !list.classList.contains('is-expanded'); list.classList.toggle('is-expanded', expanded); showTools.setAttribute('aria-expanded', String(expanded)); showTools.textContent = expanded ? 'Show sleep essentials ↑' : 'See all 11 free tools →'; });

  const reviews = document.querySelector('[data-sv-reviews]');
  if (reviews) {
    reviews.querySelectorAll('[data-sv-review-phone]').forEach((phone) => {
      const slides = [...phone.querySelectorAll('[data-sv-review-slide]')];
      let activeReview = 0; let reviewTimer = null; let startTimer = null;
      const showReview = (index) => {
        activeReview = (index + slides.length) % slides.length;
        slides.forEach((slide, i) => { const active = i === activeReview; slide.classList.toggle('is-active', active); slide.setAttribute('aria-hidden', String(!active)); });
        phone.querySelector('[data-sv-review-current]').textContent = String(activeReview + 1);
      };
      const stopReviews = () => { clearTimeout(startTimer); clearInterval(reviewTimer); };
      const restartReviews = () => {
        stopReviews();
        if (!reduced) startTimer = setTimeout(() => { reviewTimer = setInterval(() => showReview(activeReview + 1), 5600); }, Number(phone.dataset.svReviewDelay || 0));
      };
      phone.querySelector('[data-sv-review-prev]').addEventListener('click', () => { showReview(activeReview - 1); restartReviews(); });
      phone.querySelector('[data-sv-review-next]').addEventListener('click', () => { showReview(activeReview + 1); restartReviews(); });
      phone.addEventListener('mouseenter', stopReviews); phone.addEventListener('mouseleave', restartReviews); restartReviews();
    });
  }
})();
