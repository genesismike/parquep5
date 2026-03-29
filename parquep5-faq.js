window.toggle = function(btn) {
  var item = btn.parentElement;
  var isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(function(el) { el.classList.remove('open'); });
  if (!isOpen) item.classList.add('open');
};

window.filterCat = function(cat, tabEl) {
  document.querySelectorAll('.cat-tab').forEach(function(t) { t.classList.remove('active'); });
  tabEl.classList.add('active');
  document.getElementById('faq-search').value = '';
  document.querySelectorAll('.faq-section').forEach(function(s) {
    s.style.display = (cat === 'todas' || s.dataset.cat === cat) ? '' : 'none';
  });
  document.querySelectorAll('.faq-item').forEach(function(i) { i.style.display = ''; });
  document.getElementById('no-results').style.display = 'none';
};

window.filterFaq = function(query) {
  document.querySelectorAll('.cat-tab').forEach(function(t) { t.classList.remove('active'); });
  document.querySelector('.cat-tab').classList.add('active');
  var q = query.toLowerCase().trim();
  var total = 0;
  document.querySelectorAll('.faq-section').forEach(function(section) {
    var vis = 0;
    section.querySelectorAll('.faq-item').forEach(function(item) {
      var text = (item.dataset.q || '') + ' ' + item.querySelector('.faq-q-text').textContent + ' ' + (item.querySelector('.faq-a') ? item.querySelector('.faq-a').textContent : '');
      var match = !q || text.toLowerCase().indexOf(q) >= 0;
      item.style.display = match ? '' : 'none';
      if (match) vis++;
    });
    section.style.display = vis > 0 ? '' : 'none';
    total += vis;
  });
  document.getElementById('no-results').style.display = total === 0 ? 'block' : 'none';
};
