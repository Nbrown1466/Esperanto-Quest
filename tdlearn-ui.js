// Presentation state stays separate from the tower-defense simulation.
(() => {
  const byId = id => document.getElementById(id);
  const shopButtons = [...document.querySelectorAll('.tower')];
  const tabs = [...document.querySelectorAll('.sideTab')];
  let lastQuestionOpen = false;
  let lastState = '';
  let lastCoins = -1;
  let lastSelection = '';
  let lastTab = '';
  let lastXp = '';

  function cancelPlacement() {
    selType = null;
    preview = null;
    shopButtons.forEach(button => button.classList.remove('sel'));
    refreshPresentation();
  }

  function refreshPresentation() {
    const currentState = over ? 'over' : qopen ? 'question' : !started ? 'prepare' : paused ? 'paused' : 'live';
    if (currentState !== lastState) {
      const labels = { over: 'Finished', question: 'Learning break', prepare: 'Prepare', paused: 'Paused', live: 'Wave in progress' };
      byId('battleState').textContent = labels[currentState];
      byId('battleState').dataset.state = currentState;
      lastState = currentState;
    }
    const selectionKey = (selType || '') + ':' + started;
    if (selectionKey !== lastSelection) {
      byId('placementHint').hidden = !selType;
      byId('prep').hidden = !!selType || !!started;
      byId('waveHint').hidden = !!selType || !started;
      if (selType) byId('placementName').textContent = T[selType].name + ' · ' + T[selType].cost + ' coins';
      shopButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.type === selType)));
      lastSelection = selectionKey;
    }
    if (Math.floor(coins) !== lastCoins) {
      shopButtons.forEach(button => {
        const affordable = coins >= T[button.dataset.type].cost;
        button.classList.toggle('unaffordable', !affordable);
        button.title = affordable ? 'Choose, then click open ground to place' : 'Needs ' + T[button.dataset.type].cost + ' coins';
      });
      lastCoins = Math.floor(coins);
    }
    const activeTab = tabs.find(button => button.classList.contains('active'))?.dataset.tab || '';
    if (activeTab !== lastTab) {
      tabs.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.tab === activeTab)));
      lastTab = activeTab;
    }
    const width = byId('xpfill').style.width;
    if (width !== lastXp) {
      document.querySelector('.xpbar').setAttribute('aria-valuenow', String(parseFloat(width) || 0));
      lastXp = width;
    }
    document.querySelectorAll('.targetBtn').forEach(button => {
      const selected = String(button.classList.contains('active'));
      if (button.getAttribute('aria-pressed') !== selected) button.setAttribute('aria-pressed', selected);
    });
    if (qopen && !lastQuestionOpen) {
      byId('question').scrollIntoView({ block: 'nearest', behavior: 'instant' });
    }
    lastQuestionOpen = !!qopen;
  }

  byId('cancelPlacement').addEventListener('click', cancelPlacement);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && selType) cancelPlacement();
  });
  // The game updates its HUD every frame. Observe only those values and the
  // controls that can change presentation, then coalesce work into one frame.
  let pending = false;
  const scheduleRefresh = () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => { pending = false; refreshPresentation(); });
  };
  const observer = new MutationObserver(scheduleRefresh);
  observer.observe(document.querySelector('.stats'), { subtree: true, childList: true, characterData: true });
  observer.observe(document.querySelector('.sideTabs'), { subtree: true, attributes: true, attributeFilter: ['class'] });
  observer.observe(byId('question'), { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('click', scheduleRefresh);
  refreshPresentation();
})();
