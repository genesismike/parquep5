var currentIndex = 0;
var allImgs = null;

function getImgs() {
  if (!allImgs) allImgs = document.querySelectorAll('.photo-item img');
  return allImgs;
}

function getCaption(idx) {
  var item = document.querySelectorAll('.photo-item')[idx];
  var cap = item ? item.querySelector('.photo-caption') : null;
  return cap ? cap.textContent : '';
}

window.openLightbox = function(idx) {
  currentIndex = idx;
  var lb = document.getElementById('lightbox');
  lb.classList.add('open');
  updateLb();
  document.body.style.overflow = 'hidden';
};

window.closeLb = function() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
};

window.closeLightbox = function(e) {
  if (e.target === document.getElementById('lightbox')) window.closeLb();
};

window.lbNav = function(dir) {
  var total = document.querySelectorAll('.photo-item').length;
  currentIndex = (currentIndex + dir + total) % total;
  updateLb();
};

function updateLb() {
  var imgs = getImgs();
  document.getElementById('lb-img').src = imgs[currentIndex].src;
  document.getElementById('lb-img').alt = getCaption(currentIndex);
  document.getElementById('lb-caption').textContent = getCaption(currentIndex);
  document.getElementById('lb-counter').textContent = (currentIndex + 1) + ' / ' + imgs.length;
}

window.filterGallery = function(cat, btn) {
  document.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  document.querySelectorAll('.gallery-section').forEach(function(s) {
    s.style.display = (cat === 'todas' || s.dataset.cat === cat) ? '' : 'none';
  });
  allImgs = null;
};

document.addEventListener('keydown', function(e) {
  var lb = document.getElementById('lightbox');
  if (!lb || !lb.classList.contains('open')) return;
  if (e.key === 'ArrowLeft')  window.lbNav(-1);
  if (e.key === 'ArrowRight') window.lbNav(1);
  if (e.key === 'Escape')     window.closeLb();
});
