// Utilities: format with Indian commas
function formatINR(num) {
  if (num === null || num === undefined || isNaN(num)) return '';
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Number(num));
}

// Convert number to Indian currency words (Rupees only)
function numberToIndianWords(num) {
  num = Math.floor(Number(num || 0));
  if (num === 0) return 'Zero rupees';

  const belowTwenty = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  const tens = ['','', 'Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];

  function twoDigits(n){
    if (n < 20) return belowTwenty[n];
    const t = Math.floor(n/10), r = n%10;
    return tens[t] + (r? ' ' + belowTwenty[r] : '');
  }
  function threeDigits(n){
    const h = Math.floor(n/100), r = n%100;
    return (h? belowTwenty[h] + ' Hundred' + (r? ' ' : '') : '') + (r? twoDigits(r) : '');
  }

  const units = [
    { size: 10000000, name: 'Crore' },
    { size: 100000, name: 'Lakh' },
    { size: 1000, name: 'Thousand' },
    { size: 100, name: 'Hundred' },
  ];

  let words = [];
  let n = num;

  for (const u of units) {
    if (n >= u.size) {
      const q = Math.floor(n / u.size);
      n = n % u.size;
      const w = u.size === 100 ? belowTwenty[q] + ' ' + u.name : threeDigits(q) + ' ' + u.name;
      words.push(w);
    }
  }
  if (n > 0) words.push(twoDigits(n));

  const result = words.join(' ') + ' rupees';
  return result.charAt(0).toUpperCase() + result.slice(1);
}

function $(id){ return document.getElementById(id); }

function loadPersistedImages(){
  const logo = localStorage.getItem('pe_logo');
  const sign = localStorage.getItem('pe_sign');
  if (logo) { $('logoPreview').src = logo; $('logoOut').src = logo; }
  if (sign) { $('signOut').src = sign; }
}

function handleImageInput(inputEl, outIds, key){
  inputEl.addEventListener('change', () => {
    const file = inputEl.files && inputEl.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      const data = String(e.target.result);
      outIds.forEach(id => { const el = $(id); if (el) el.src = data; });
      try { localStorage.setItem(key, data); } catch {}
    };
    reader.readAsDataURL(file);
  });
}

function setToday(){
  const now = new Date();
  const dd = String(now.getDate()).padStart(2,'0');
  const mm = String(now.getMonth()+1).padStart(2,'0');
  const yyyy = now.getFullYear();
  $('today').textContent = `${dd}/${mm}/${yyyy}`;
}

function generateReceipt(){
  const name = $('custName').value.trim();
  const addr = $('custAddress').value.trim();
  const kw = Number($('systemKw').value || 0);
  const total = Number($('totalAmount').value || 0);
  const loan = $('loanAmount').value;
  const margin = $('marginAmount').value;
  const item1 = $('item1').value.trim() || `${kw || 3}kw Ongrid Solar System`;

  $('toName').textContent = name || '—';
  $('toAddr').textContent = addr || '—';
  $('row1desc').textContent = item1;
  if (total) $('row1total').textContent = `₹${formatINR(total)}`;
  if (loan) $('row2total').textContent = `₹${formatINR(loan)}`;
  if (margin) $('row3total').textContent = `₹${formatINR(margin)}`;

  const words = numberToIndianWords(total);
  const sizeText = kw ? `${kw}kw` : '3kw';
  $('messageText').textContent = `Our Fees of solar installation is ${words} for installation of ${sizeText} on grid solar system.`;
}

function initEditableSync(){
  // When user edits totals directly, try to infer total for message
  ['row1total','row2total','row3total'].forEach(id => {
    const el = $(id);
    el.addEventListener('input', () => {
      const m = el.textContent.replace(/[^0-9]/g,'');
      if (id === 'row1total' && m) {
        $('totalAmount').value = Number(m);
        const words = numberToIndianWords(Number(m));
        const kw = Number($('systemKw').value || 0);
        const sizeText = kw ? `${kw}kw` : '3kw';
        $('messageText').textContent = `Our Fees of solar installation is ${words} for installation of ${sizeText} on grid solar system.`;
      }
    });
  });
}

function attachEvents(){
  $('generateBtn').addEventListener('click', generateReceipt);
  $('printBtn').addEventListener('click', () => window.print());
  handleImageInput($('logoInput'), ['logoPreview','logoOut'], 'pe_logo');
  handleImageInput($('signInput'), ['signOut'], 'pe_sign');
}

function setDefaults(){
  $('custName').value = 'Udaya Singh Banara';
  $('custAddress').value = 'Jajapur';
  $('systemKw').value = '3';
  $('totalAmount').value = '210000';
  $('loanAmount').value = '189000';
  $('marginAmount').value = '21000';
  $('item1').value = '3kw Ongrid Solar System';
}

document.addEventListener('DOMContentLoaded', () => {
  setToday();
  loadPersistedImages();
  attachEvents();
  initEditableSync();
  setDefaults();
  generateReceipt();
});


