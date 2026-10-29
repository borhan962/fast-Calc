/**
 * CalcSlider - Dual Number Calculator with History Slider & Batch Addition
 */

// Application State
const state = {
  num1: null,
  num2: null,
  operator: '+',
  latestResult: null,
  history: []
};

// DOM Elements
const num1Input = document.getElementById('num1');
const num2Input = document.getElementById('num2');
const operatorGrid = document.getElementById('operatorGrid');
const calcForm = document.getElementById('calcForm');
const currentResultValue = document.getElementById('currentResultValue');
const formulaPreview = document.getElementById('formulaPreview');
const copyResultBtn = document.getElementById('copyResultBtn');
const swapInputsBtn = document.getElementById('swapInputsBtn');
const resetInputsBtn = document.getElementById('resetInputsBtn');

// History & Slider Elements
const sliderTrack = document.getElementById('sliderTrack');
const sliderViewport = document.getElementById('sliderViewport');
const slidePrevBtn = document.getElementById('slidePrevBtn');
const slideNextBtn = document.getElementById('slideNextBtn');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const historyCounterBadge = document.getElementById('historyCounterBadge');
const scrubberContainer = document.getElementById('scrubberContainer');
const historyScrubber = document.getElementById('historyScrubber');
const scrubIndexLabel = document.getElementById('scrubIndexLabel');

// Final Sum Elements
const sumAllResultsBtn = document.getElementById('sumAllResultsBtn');
const finalResultCard = document.getElementById('finalResultCard');
const sumBreakdownFormula = document.getElementById('sumBreakdownFormula');
const finalSumValue = document.getElementById('finalSumValue');
const closeFinalResultBtn = document.getElementById('closeFinalResultBtn');
const statCount = document.getElementById('statCount');
const statAvg = document.getElementById('statAvg');
const statMin = document.getElementById('statMin');
const statMax = document.getElementById('statMax');

// Utilities Elements
const themeToggleBtn = document.getElementById('themeToggleBtn');
const toastEl = document.getElementById('toast');

// --- Helper Functions ---

/**
 * Format float to avoid precision issues (e.g. 0.1 + 0.2 = 0.3)
 */
function cleanNumber(num) {
  if (!Number.isFinite(num)) return num;
  // Handle IEEE 754 precision issues
  return parseFloat(Number(num).toPrecision(12));
}

/**
 * Pretty-format number with commas if applicable
 */
function formatDisplayNumber(num) {
  if (!Number.isFinite(num)) return String(num);
  const parts = String(num).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

/**
 * Display toast message
 */
let toastTimeout;
function showToast(message, type = 'info') {
  clearTimeout(toastTimeout);
  toastEl.textContent = message;
  toastEl.className = 'toast show';
  if (type === 'error') {
    toastEl.classList.add('toast-error');
  } else if (type === 'success') {
    toastEl.classList.add('toast-success');
  }

  toastTimeout = setTimeout(() => {
    toastEl.className = 'toast';
  }, 3000);
}

// --- Theme Management ---
function initTheme() {
  const savedTheme = localStorage.getItem('calcslider_theme') || 'dark';
  document.body.className = `theme-${savedTheme}`;
}

themeToggleBtn.addEventListener('click', () => {
  const isDark = document.body.classList.contains('theme-dark');
  const newTheme = isDark ? 'light' : 'dark';
  document.body.className = `theme-${newTheme}`;
  localStorage.setItem('calcslider_theme', newTheme);
  showToast(`Switched to ${newTheme} mode`);
});

// --- Operator Selection ---
operatorGrid.addEventListener('click', (e) => {
  const btn = e.target.closest('.op-btn');
  if (!btn) return;

  document.querySelectorAll('.op-btn').forEach((b) => {
    b.classList.remove('active');
    b.setAttribute('aria-checked', 'false');
  });

  btn.classList.add('active');
  btn.setAttribute('aria-checked', 'true');
  state.operator = btn.dataset.op;

  // Visual feedback update
  updateFormulaPreview();
});

function getOperatorDisplay(op) {
  switch (op) {
    case '+': return '+';
    case '-': return '−';
    case '*': return '×';
    case '/': return '÷';
    case '%': return '%';
    case '^': return '^';
    default: return op;
  }
}

function updateFormulaPreview() {
  const v1 = num1Input.value.trim();
  const v2 = num2Input.value.trim();
  const opSymbol = getOperatorDisplay(state.operator);

  if (v1 !== '' && v2 !== '') {
    formulaPreview.textContent = `${v1} ${opSymbol} ${v2}`;
  } else if (v1 !== '') {
    formulaPreview.textContent = `${v1} ${opSymbol} ...`;
  } else {
    formulaPreview.textContent = `Awaiting input...`;
  }
}

num1Input.addEventListener('input', updateFormulaPreview);
num2Input.addEventListener('input', updateFormulaPreview);

// Quick Clear Buttons inside input boxes
document.querySelectorAll('.quick-clear-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const targetId = btn.getAttribute('data-target');
    const input = document.getElementById(targetId);
    if (input) {
      input.value = '';
      input.focus();
      updateFormulaPreview();
    }
  });
});

// Swap numbers button
swapInputsBtn.addEventListener('click', () => {
  const temp = num1Input.value;
  num1Input.value = num2Input.value;
  num2Input.value = temp;
  updateFormulaPreview();
  showToast('Swapped Number 1 and Number 2');
});

// Reset inputs
resetInputsBtn.addEventListener('click', () => {
  num1Input.value = '';
  num2Input.value = '';
  state.latestResult = null;
  currentResultValue.textContent = '—';
  formulaPreview.textContent = 'Awaiting calculation...';
  copyResultBtn.style.display = 'none';
  num1Input.focus();
});

// Copy current result
copyResultBtn.addEventListener('click', async () => {
  if (state.latestResult === null) return;
  try {
    await navigator.clipboard.writeText(String(state.latestResult));
    showToast('Result copied to clipboard!', 'success');
  } catch (err) {
    showToast('Failed to copy to clipboard', 'error');
  }
});

// --- Calculation Logic ---
function executeCalculation(a, b, op) {
  switch (op) {
    case '+':
      return cleanNumber(a + b);
    case '-':
      return cleanNumber(a - b);
    case '*':
      return cleanNumber(a * b);
    case '/':
      if (b === 0) throw new Error('Division by zero is undefined');
      return cleanNumber(a / b);
    case '%':
      if (b === 0) throw new Error('Modulo by zero is undefined');
      return cleanNumber(a % b);
    case '^':
      return cleanNumber(Math.pow(a, b));
    default:
      throw new Error('Unknown operator');
  }
}

calcForm.addEventListener('submit', (e) => {
  e.preventDefault();
  handleCalculate();
});

function handleCalculate() {
  const val1 = num1Input.value.trim();
  const val2 = num2Input.value.trim();

  if (val1 === '' || val2 === '') {
    showToast('Please enter both Number 1 and Number 2', 'error');
    if (val1 === '') num1Input.focus();
    else num2Input.focus();
    return;
  }

  const n1 = parseFloat(val1);
  const n2 = parseFloat(val2);

  if (Number.isNaN(n1) || Number.isNaN(n2)) {
    showToast('Please enter valid numeric values', 'error');
    return;
  }

  let result;
  try {
    result = executeCalculation(n1, n2, state.operator);
  } catch (err) {
    showToast(err.message, 'error');
    return;
  }

  // Update current result UI
  state.latestResult = result;
  const opSymbol = getOperatorDisplay(state.operator);
  formulaPreview.textContent = `${formatDisplayNumber(n1)} ${opSymbol} ${formatDisplayNumber(n2)} =`;
  currentResultValue.textContent = formatDisplayNumber(result);
  copyResultBtn.style.display = 'inline-flex';

  // Add to History
  const historyItem = {
    id: Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    num1: n1,
    num2: n2,
    operator: state.operator,
    opSymbol: opSymbol,
    result: result,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  };

  addToHistory(historyItem);
}

// --- History & Slider Engine ---

function loadHistoryFromStorage() {
  try {
    const raw = localStorage.getItem('calcslider_history');
    if (raw) {
      state.history = JSON.parse(raw);
    }
  } catch (e) {
    state.history = [];
  }
  renderHistorySlider();
}

function saveHistoryToStorage() {
  try {
    localStorage.setItem('calcslider_history', JSON.stringify(state.history));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}

function addToHistory(item) {
  state.history.push(item);
  saveHistoryToStorage();
  renderHistorySlider();

  // Scroll to latest item
  setTimeout(() => {
    scrollToCard(state.history.length - 1);
  }, 50);

  showToast(`Saved ${item.result} to History Slider!`, 'success');
}

function deleteHistoryItem(id) {
  state.history = state.history.filter((item) => item.id !== id);
  saveHistoryToStorage();
  renderHistorySlider();
  showToast('Item removed from history');
  // Re-calculate final sum if it is currently visible
  if (finalResultCard.style.display !== 'none') {
    calculateFinalSum();
  }
}

clearHistoryBtn.addEventListener('click', () => {
  if (state.history.length === 0) {
    showToast('History is already empty');
    return;
  }

  if (confirm('Are you sure you want to clear all saved calculation history?')) {
    state.history = [];
    saveHistoryToStorage();
    renderHistorySlider();
    finalResultCard.style.display = 'none';
    showToast('All history cleared');
  }
});

function renderHistorySlider() {
  const count = state.history.length;
  historyCounterBadge.textContent = `${count} result${count === 1 ? '' : 's'} saved`;

  if (count === 0) {
    sliderTrack.innerHTML = `
      <div class="empty-state" id="emptyState">
        <div class="empty-icon">📊</div>
        <p class="empty-title">No calculations in history yet</p>
        <p class="empty-desc">Perform a calculation above to add cards to this history slider!</p>
      </div>
    `;
    scrubberContainer.style.display = 'none';
    slidePrevBtn.disabled = true;
    slideNextBtn.disabled = true;
    return;
  }

  // Render cards
  sliderTrack.innerHTML = state.history
    .map((item, index) => {
      const seq = index + 1;
      return `
        <div class="history-card" data-index="${index}" data-id="${item.id}">
          <div class="card-top">
            <span class="card-seq-badge">#${seq}</span>
            <button class="card-delete-btn" title="Delete this result" onclick="deleteHistoryItem('${item.id}')">✕</button>
          </div>
          <div class="card-equation">
            <div class="card-expression">${formatDisplayNumber(item.num1)} ${item.opSymbol} ${formatDisplayNumber(item.num2)}</div>
            <div class="card-result-wrap">
              <span class="card-equals">=</span>
              <span class="card-result-num">${formatDisplayNumber(item.result)}</span>
            </div>
          </div>
          <div class="card-footer">
            <span class="card-time">${item.timestamp}</span>
            <div style="display:flex; gap: 4px;">
              <button class="card-reuse-btn" title="Set as Number 1" onclick="useAsInput(${item.result}, 1)">→ Num 1</button>
              <button class="card-reuse-btn" title="Set as Number 2" onclick="useAsInput(${item.result}, 2)">→ Num 2</button>
            </div>
          </div>
        </div>
      `;
    })
    .join('');

  // Update scrubber
  scrubberContainer.style.display = 'flex';
  historyScrubber.min = 0;
  historyScrubber.max = count - 1;
  historyScrubber.value = count - 1;
  scrubIndexLabel.textContent = `${count} / ${count}`;

  slidePrevBtn.disabled = false;
  slideNextBtn.disabled = false;
}

// Global reuse function for cards
window.useAsInput = function (value, inputIndex) {
  if (inputIndex === 1) {
    num1Input.value = value;
    num1Input.focus();
  } else {
    num2Input.value = value;
    num2Input.focus();
  }
  updateFormulaPreview();
  showToast(`Loaded ${value} into Number ${inputIndex}`);
};

window.deleteHistoryItem = deleteHistoryItem;

// Slider Navigation Controls
function scrollToCard(index) {
  const cards = sliderTrack.querySelectorAll('.history-card');
  if (cards[index]) {
    cards[index].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    cards.forEach((c) => c.classList.remove('highlight'));
    cards[index].classList.add('highlight');
    historyScrubber.value = index;
    scrubIndexLabel.textContent = `${index + 1} / ${state.history.length}`;
  }
}

slidePrevBtn.addEventListener('click', () => {
  const cardWidth = 300;
  sliderViewport.scrollBy({ left: -cardWidth, behavior: 'smooth' });
});

slideNextBtn.addEventListener('click', () => {
  const cardWidth = 300;
  sliderViewport.scrollBy({ left: cardWidth, behavior: 'smooth' });
});

// Interactive Scrubber Input
historyScrubber.addEventListener('input', (e) => {
  const index = parseInt(e.target.value, 10);
  scrubIndexLabel.textContent = `${index + 1} / ${state.history.length}`;
  scrollToCard(index);
});

// Sync Scrubber on scroll
sliderViewport.addEventListener('scroll', () => {
  if (state.history.length === 0) return;
  const cards = sliderTrack.querySelectorAll('.history-card');
  if (!cards.length) return;

  const viewportRect = sliderViewport.getBoundingClientRect();
  const viewportCenter = viewportRect.left + viewportRect.width / 2;

  let closestIndex = 0;
  let minDistance = Infinity;

  cards.forEach((card, idx) => {
    const cardRect = card.getBoundingClientRect();
    const cardCenter = cardRect.left + cardRect.width / 2;
    const distance = Math.abs(viewportCenter - cardCenter);
    if (distance < minDistance) {
      minDistance = distance;
      closestIndex = idx;
    }
  });

  historyScrubber.value = closestIndex;
  scrubIndexLabel.textContent = `${closestIndex + 1} / ${state.history.length}`;
});

// --- SUM ALL RESULTS FROM HISTORY (Key User Requirement) ---
sumAllResultsBtn.addEventListener('click', () => {
  calculateFinalSum();
});

function calculateFinalSum() {
  if (state.history.length === 0) {
    showToast('No history results available to add! Please calculate at least one equation first.', 'error');
    return;
  }

  // Extract all results from history
  const results = state.history.map((item) => item.result);

  // Compute addition of all results
  const totalSum = cleanNumber(results.reduce((acc, curr) => acc + curr, 0));

  // Build formula breakdown: e.g. "40 + 12.5 + (-5) + 100 = 147.5"
  const formattedItems = results.map((r) => {
    return r < 0 ? `(${formatDisplayNumber(r)})` : formatDisplayNumber(r);
  });
  
  const formulaText = formattedItems.join(' + ') + ' = ' + formatDisplayNumber(totalSum);

  // Statistics
  const count = results.length;
  const avg = cleanNumber(totalSum / count);
  const min = Math.min(...results);
  const max = Math.max(...results);

  // Update Final Result UI
  sumBreakdownFormula.textContent = formulaText;
  finalSumValue.textContent = formatDisplayNumber(totalSum);
  statCount.textContent = count;
  statAvg.textContent = formatDisplayNumber(avg);
  statMin.textContent = formatDisplayNumber(min);
  statMax.textContent = formatDisplayNumber(max);

  finalResultCard.style.display = 'flex';

  // Smooth scroll to the final result card so user can see it right away
  finalResultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  showToast(`Added all ${count} history results! Final Sum: ${totalSum}`, 'success');
}

closeFinalResultBtn.addEventListener('click', () => {
  finalResultCard.style.display = 'none';
});

// --- Keyboard Shortcuts ---
document.addEventListener('keydown', (e) => {
  // Enter key in inputs triggers calculation
  if (e.key === 'Enter' && (document.activeElement === num1Input || document.activeElement === num2Input)) {
    e.preventDefault();
    handleCalculate();
  }
});

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  initTheme();
  loadHistoryFromStorage();
  updateFormulaPreview();
});

