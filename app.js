(() => {
  'use strict';

  const form = document.querySelector('#worksheet');
  const panels = [...document.querySelectorAll('[data-step]')];
  const navigation = [...document.querySelectorAll('.step-link')];
  const coreSteps = [...document.querySelectorAll('[data-core]')];
  const progressbar = document.querySelector('[role="progressbar"]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let activeStep = 1;

  function fitTextarea(field) {
    if (!field.getClientRects().length) return;
    field.style.height = 'auto';
    field.style.height = `${Math.max(104, field.scrollHeight + 2)}px`;
  }

  function updateProgress(announce = false) {
    const count = coreSteps.filter(field => field.checked).length;
    const label = `${count} z ${coreSteps.length} kroků základu`;
    progressbar.setAttribute('aria-valuenow', String(count));
    document.querySelector('.progress-fill').style.width = `${count / coreSteps.length * 100}%`;
    document.querySelectorAll('[data-progress-text]').forEach(node => { node.textContent = label; });
    navigation.forEach(button => {
      const checks = [...document.querySelector(`#uloha-${button.dataset.go}`).querySelectorAll('input[type="checkbox"]')];
      const complete = checks.length > 0 && checks.every(field => field.checked);
      button.classList.toggle('completed', complete);
      button.querySelector('.step-state').textContent = complete ? '✓' : '';
    });
    document.querySelector('#completionMessage').hidden = count !== coreSteps.length;
    if (announce) document.querySelector('#progressAnnouncement').textContent = label;
  }

  function showStep(step, { focus = false, focusId = null, updateHash = true } = {}) {
    if (![1, 2, 3].includes(step)) return;
    activeStep = step;
    panels.forEach(panel => { panel.hidden = Number(panel.dataset.step) !== step; });
    navigation.forEach(button => {
      if (Number(button.dataset.go) === step) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
    document.querySelector('#stepIndicator').textContent = `Úloha ${step} ze 3${step === 3 ? ' · bonus' : ''}`;
    const panel = document.querySelector(`#uloha-${step}`);
    panel.querySelectorAll('textarea').forEach(fitTextarea);
    if (updateHash) history.replaceState(null, '', `#uloha-${step}`);
    if (focus) {
      const target = focusId ? document.getElementById(focusId) : document.querySelector(`#title-${step}`);
      target.focus({ preventScroll: true });
      if (focusId) target.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'center' });
      else window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    }
  }

  function stepFromHash() {
    const match = location.hash.match(/^#uloha-([123])$/);
    return match ? Number(match[1]) : activeStep;
  }

  function clearPageAnswers() {
    form.reset();
    form.querySelectorAll('textarea').forEach(field => { field.style.height = ''; });
    document.querySelectorAll('details').forEach(detail => { detail.open = false; });
    updateProgress();
    showStep(stepFromHash(), { updateHash: false });
  }

  // Answers exist only in the open page. Discard browser-restored form values too.
  clearPageAnswers();
  window.addEventListener('pageshow', clearPageAnswers);
  window.addEventListener('hashchange', () => showStep(stepFromHash(), { focus: true, updateHash: false }));
  window.addEventListener('resize', () => {
    document.querySelector(`#uloha-${activeStep}`).querySelectorAll('textarea').forEach(fitTextarea);
  });
  form.addEventListener('submit', event => event.preventDefault());
  document.querySelectorAll('[data-go]').forEach(button => {
    button.addEventListener('click', () => showStep(Number(button.dataset.go), { focus: true, focusId: button.dataset.focus }));
  });
  form.addEventListener('input', event => {
    if (event.target.matches('textarea')) fitTextarea(event.target);
  });
  form.addEventListener('change', event => {
    if (event.target.matches('input[type="checkbox"]')) updateProgress(true);
  });
})();
