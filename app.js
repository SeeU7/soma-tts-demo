const modelOptions = ['All models', 'CosyVoice2', 'CosyVoice3', 'Qwen3-TTS-AC'];
const taskOptions = ['All tasks', 'DSD', 'RP', 'APS'];
const taskPriority = { DSD: 0, RP: 1, APS: 2 };
const state = { model: 'All models', task: 'All tasks', lang: 'all', visible: 12 };
let samples = [];
const list = document.querySelector('#sample-list');
const count = document.querySelector('#result-count');
const more = document.querySelector('#load-more');

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function renderFilters(containerId, options, key) {
  const container = document.querySelector(containerId);
  for (const option of options) {
    const button = element('button', '', option);
    button.type = 'button';
    button.setAttribute('aria-pressed', String(state[key] === option));
    button.addEventListener('click', () => {
      state[key] = option;
      state.visible = 12;
      for (const item of container.querySelectorAll('button')) item.setAttribute('aria-pressed', String(item === button));
      render();
    });
    container.append(button);
  }
}

function sampleCard(sample) {
  const article = element('article', 'sample-card');
  const top = element('div', 'card-top');
  const identity = element('div', 'card-id');
  identity.append(element('span', 'sample-number', String(sample.rank).padStart(2, '0')));
  identity.append(element('h3', '', `Sample ${sample.id}`));
  const meta = element('div', 'sample-meta');
  for (const label of [sample.model, sample.task, sample.lang === 'zh' ? 'Mandarin' : 'English']) meta.append(element('span', '', label));
  top.append(identity, meta);
  article.append(top, element('span', 'instruction-label', 'Voice instruction'));
  const instruction = element('p', 'instruction', sample.instruction);
  article.append(instruction);
  if (sample.instruction.length > 160 || sample.instruction.includes('\n')) {
    const expand = element('button', 'expand-instruction', 'Show full instruction ↓');
    expand.type = 'button';
    expand.setAttribute('aria-expanded', 'false');
    expand.addEventListener('click', () => {
      const expanded = instruction.classList.toggle('expanded');
      expand.setAttribute('aria-expanded', String(expanded));
      expand.textContent = expanded ? 'Show less ↑' : 'Show full instruction ↓';
    });
    article.append(expand);
  }
  const audioGrid = element('div', 'audio-grid');
  for (const [label, src, extraClass] of [['Baseline', sample.baseline, ''], ['+SOMA', sample.method, 'method']]) {
    const box = element('div', `audio-box ${extraClass}`);
    const audio = element('audio');
    audio.controls = true;
    audio.preload = 'none';
    audio.src = src;
    audio.setAttribute('aria-label', `${sample.model} ${sample.task} ${sample.id} ${label}`);
    audio.addEventListener('play', () => {
      for (const other of document.querySelectorAll('audio')) if (other !== audio) other.pause();
    });
    box.append(element('label', '', label), audio);
    audioGrid.append(box);
  }
  article.append(audioGrid);
  return article;
}

function render() {
  for (const audio of list.querySelectorAll('audio')) audio.pause();
  const filtered = samples.filter(sample =>
    (state.model === 'All models' || sample.model === state.model) &&
    (state.task === 'All tasks' || sample.task === state.task) &&
    (state.lang === 'all' || sample.lang === state.lang)
  ).sort((a, b) =>
    Number(a.task === 'APS') - Number(b.task === 'APS') ||
    modelOptions.indexOf(a.model) - modelOptions.indexOf(b.model) ||
    a.rank - b.rank ||
    taskPriority[a.task] - taskPriority[b.task]
  );
  count.textContent = `${filtered.length} ${filtered.length === 1 ? 'example' : 'examples'}`;
  list.replaceChildren(...filtered.slice(0, state.visible).map(sampleCard));
  more.hidden = filtered.length <= state.visible;
}

renderFilters('#model-filters', modelOptions, 'model');
renderFilters('#task-filters', taskOptions, 'task');
document.querySelector('#language-filter').addEventListener('change', event => {
  state.lang = event.target.value;
  state.visible = 12;
  render();
});
more.addEventListener('click', () => { state.visible += 12; render(); });
fetch('samples.json')
  .then(response => { if (!response.ok) throw new Error(`HTTP ${response.status}`); return response.json(); })
  .then(data => { samples = data; render(); })
  .catch(() => {
    count.textContent = 'Samples unavailable';
    list.append(element('p', 'error-message', 'The sample list could not be loaded. Please refresh the page.'));
  });
