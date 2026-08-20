const products = [
  {name:'Sơn chống thấm TNANO 1L TRONG', price:'195.000₫', volume:'1L', type:'TRONG', image:'./design/T3.jpg'},
  {name:'Sơn chống thấm TNANO 1L PU', price:'205.000₫', volume:'1L', type:'PU', image:'./design/A2.jpg'},
  {name:'Sơn chống thấm TNANO 5L TRONG', price:'670.000₫', volume:'5L', type:'TRONG', image:'./design/A1.jpg'},
  {name:'Sơn chống thấm TNANO 5L PU', price:'723.000₫', volume:'5L', type:'PU', image:'./design/A3.jpg'},
  {name:'Sơn chống thấm TNANO 18L TRONG', price:'2.236.000₫', volume:'18L', type:'TRONG', image:'./design/A4.jpg'},
  {name:'Sơn chống thấm TNANO 18L PU', price:'2.300.000₫', volume:'18L', type:'PU', image:'./design/1787122930851_5062789529714247547_5062789529714247547_21a805e3d03f90b6d81da014fe5d1847.jpg'}
];

const productGrid = document.querySelector('#productGrid');
productGrid.innerHTML = products.map((product, index) => `
  <article class="product-card reveal">
    <div class="product-media"><img loading="lazy" src="${product.image}" alt="${product.name}"></div>
    <div class="product-info">
      <span class="badge">${product.volume} · ${product.type}</span>
      <h3>${product.name}</h3>
      <p class="price">${product.price}</p>
      <ul class="benefits">
        <li>Phù hợp nhiều bề mặt công trình</li>
        <li>Hỗ trợ hạn chế thấm nước</li>
        <li>Dễ thi công, dễ tư vấn định mức</li>
      </ul>
      <div class="card-actions">
        <button class="btn btn-primary" data-product="${index}">Xem chi tiết</button>
        <a class="btn btn-gold" href="#bao-gia">Mua / nhận tư vấn</a>
      </div>
    </div>
  </article>
`).join('');

const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 18);
}, {passive:true});

menuToggle.addEventListener('click', () => {
  const open = !mobileMenu.classList.contains('open');
  mobileMenu.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  mobileMenu.setAttribute('aria-hidden', String(!open));
});

document.querySelectorAll('.mobile-menu a, a[href^="#"]').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    document.body.classList.remove('menu-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  });
});

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {threshold:.12});
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const modal = document.querySelector('#productModal');
const modalBody = modal.querySelector('.modal-body');

function openProduct(index) {
  const product = products[index];
  modalBody.innerHTML = `
    <img src="${product.image}" alt="${product.name}">
    <div>
      <span class="badge">${product.volume} · ${product.type}</span>
      <h2>${product.name}</h2>
      <p class="price">${product.price}</p>
      <p>Giải pháp sơn chống thấm TNANO cho các hạng mục cần bảo vệ trước nước mưa, độ ẩm và bề mặt thường xuyên tiếp xúc nước.</p>
      <h3>Ưu điểm</h3>
      <ul>
        <li>Hỗ trợ chống thấm cho mái, sân thượng, tường ngoài trời.</li>
        <li>Bề mặt thi công gọn, dễ tư vấn theo nhu cầu thực tế.</li>
        <li>Phù hợp khách hàng gia đình, thợ thi công và công trình.</li>
      </ul>
      <h3>Ứng dụng</h3>
      <p>Sân thượng, mái, tường ngoài trời, ban công, nhà vệ sinh và khu vực có nguy cơ thấm nước.</p>
      <div class="hero-ctas">
        <a class="btn btn-primary" href="tel:0974780678">Gọi hotline</a>
        <a class="btn btn-gold" href="#bao-gia">Nhận báo giá</a>
      </div>
    </div>
  `;
  modal.classList.add('open');
  document.body.classList.add('modal-open');
  modal.setAttribute('aria-hidden', 'false');
}

productGrid.addEventListener('click', event => {
  const button = event.target.closest('[data-product]');
  if (button) openProduct(button.dataset.product);
});

function closeModal() {
  modal.classList.remove('open');
  document.body.classList.remove('modal-open');
  modal.setAttribute('aria-hidden', 'true');
}
modal.querySelector('.modal-close').addEventListener('click', closeModal);
modal.addEventListener('click', event => {
  if (event.target === modal) closeModal();
});

document.querySelector('.quote-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  const message = form.querySelector('.form-message');
  const data = new FormData(form);
  const phone = String(data.get('phone') || '').replace(/\s/g, '');
  if (!data.get('name') || !phone || !data.get('city') || !data.get('category')) {
    message.textContent = 'Vui lòng điền đầy đủ họ tên, số điện thoại, tỉnh/thành phố và hạng mục.';
    return;
  }
  if (!/^(0|\+84)\d{8,10}$/.test(phone)) {
    message.textContent = 'Số điện thoại chưa đúng định dạng.';
    return;
  }
  message.textContent = 'Cảm ơn bạn. TNANO đã ghi nhận thông tin và sẽ liên hệ tư vấn sớm.';
  form.reset();
});

document.querySelectorAll('.faq-item').forEach(item => {
  item.addEventListener('click', () => {
    item.classList.toggle('active');
  });
});

const gallery = [
  './design/1787122930873_5062789529714247547_5062789529714247547_bf448c453522ffe0a1bbbee7a33205c1.jpg',
  './design/1787122930894_5062789529714247547_5062789529714247547_6bf2a3affff4de2ef927d7bc7baf19a1.jpg',
  './design/ChatGPT%20Image%2011_28_53%2018%20thg%208%2C%202026.png',
  './design/ChatGPT%20Image%2016_06_53%2018%20thg%208%2C%202026.png',
  './design/ChatGPT%20Image%2016_22_21%2018%20thg%208%2C%202026.png'
];
const lightbox = document.querySelector('#lightbox');
const lightboxImage = lightbox.querySelector('img');
let galleryIndex = 0;

function renderLightbox() {
  lightboxImage.src = gallery[galleryIndex];
}
function openLightbox(index) {
  galleryIndex = Number(index);
  renderLightbox();
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}
function closeLightbox() {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}
document.querySelectorAll('[data-gallery]').forEach(item => {
  item.addEventListener('click', () => openLightbox(item.dataset.gallery));
});
document.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
document.querySelector('.lightbox-prev').addEventListener('click', () => {
  galleryIndex = (galleryIndex - 1 + gallery.length) % gallery.length;
  renderLightbox();
});
document.querySelector('.lightbox-next').addEventListener('click', () => {
  galleryIndex = (galleryIndex + 1) % gallery.length;
  renderLightbox();
});
lightbox.addEventListener('click', event => {
  if (event.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeModal();
    closeLightbox();
  }
});
