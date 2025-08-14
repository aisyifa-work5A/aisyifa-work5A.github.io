// ===== Utils =====
const fmt = n => new Intl.NumberFormat('id-ID', {style:'currency', currency:'IDR'}).format(n);
document.getElementById('year').textContent = new Date().getFullYear();

// ===== Backsound =====
const bgm = document.getElementById('bgm');
const soundToggle = document.getElementById('soundToggle');
let soundOn = false;
function updateSoundBtn(){ soundToggle.textContent = soundOn ? '🔈' : '🔊'; }
soundToggle.addEventListener('click', async ()=>{
  try{
    if(!soundOn){ await bgm.play(); soundOn = true; } else { bgm.pause(); soundOn = false; }
    updateSoundBtn();
  }catch(e){ alert('Klik sekali lagi jika audio belum berjalan (kebijakan browser).'); }
});
updateSoundBtn();

// ===== Slider =====
const slides = [...document.querySelectorAll('.slide')];
const dotsWrap = document.getElementById('dots');
let current = 0, timer;

function buildDots(){
  slides.forEach((_, i)=>{
    const d = document.createElement('button');
    d.className = 'dot' + (i===0 ? ' active':'');
    d.setAttribute('aria-label', 'Ke slide ' + (i+1));
    d.addEventListener('click', ()=> go(i));
    dotsWrap.appendChild(d);
  });
}
function go(n){
  slides[current].classList.remove('current');
  dotsWrap.children[current].classList.remove('active');
  current = (n + slides.length) % slides.length;
  slides[current].classList.add('current');
  dotsWrap.children[current].classList.add('active');
  restart();
}
function next(){ go(current+1); }
function prev(){ go(current-1); }
function start(){ timer = setInterval(next, 4200); }
function stop(){ clearInterval(timer); }
function restart(){ stop(); start(); }

document.getElementById('nextSlide').addEventListener('click', next);
document.getElementById('prevSlide').addEventListener('click', prev);
buildDots(); start();
const slider = document.querySelector('.slider');
slider.addEventListener('mouseenter', stop);
slider.addEventListener('mouseleave', start);

// ===== Products (Services) =====
const products = [
  { id:'S1', name:'Haircut & Style', price:80000, img:'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=1200&auto=format&fit=crop', meta:'Potong + blow kekinian' },
  { id:'S2', name:'Gel Manicure', price:120000, img:'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1200&auto=format&fit=crop', meta:'Tahan lama & glossy' },
  { id:'S3', name:'Hydrating Facial', price:150000, img:'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop', meta:'Glow sehat natural' },
  { id:'S4', name:'Keratin Hair Spa', price:220000, img:'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop', meta:'Rambut halus & kuat' },
  { id:'S5', name:'Aromatherapy Body Spa', price:250000, img:'https://images.unsplash.com/photo-1519827119036-9141302f1e96?q=80&w=1200&auto=format&fit=crop', meta:'Relaks total' },
  { id:'S6', name:'Deluxe Pedicure', price:110000, img:'https://images.unsplash.com/photo-1556228720-94dab7cf5f04?q=80&w=1200&auto=format&fit=crop', meta:'Kaki lembut & rapi' },
];

const grid = document.getElementById('productGrid');
products.forEach(p=>{
  const el = document.createElement('article');
  el.className = 'card'; 
  el.innerHTML = \`
    <img class="cover" src="\${p.img}" alt="\${p.name}">
    <div class="body">
      <div class="title">\${p.name}</div>
      <div class="meta">\${p.meta}</div>
      <div class="line" style="justify-content:space-between; align-items:center;">
        <div class="price">\${fmt(p.price)}</div>
        <button class="btn btn-ghost add" data-id="\${p.id}">Tambah</button>
      </div>
    </div>\`;
  grid.appendChild(el);
});

// ===== Cart State =====
const cart = JSON.parse(localStorage.getItem('ourbeutie_cart') || '[]');
const save = ()=> localStorage.setItem('ourbeutie_cart', JSON.stringify(cart));

function addItem(id, name, price, img){
  const existing = cart.find(i => i.id === id);
  if(existing){ existing.qty += 1; }
  else { cart.push({ id, name, price, img, qty:1 }); }
  save(); renderCart(); ping('Ditambahkan ke keranjang');
}
function removeItem(id){
  const idx = cart.findIndex(i=> i.id===id);
  if(idx>-1){ cart.splice(idx,1); save(); renderCart(); }
}
function changeQty(id, delta){
  const item = cart.find(i=> i.id===id);
  if(!item) return;
  item.qty += delta;
  if(item.qty<=0){ removeItem(id); return; }
  save(); renderCart();
}
function cartTotal(){ return cart.reduce((a,b)=> a + b.price * b.qty, 0); }

// Bind Add buttons
grid.addEventListener('click', (e)=>{
  const btn = e.target.closest('.add');
  if(!btn) return;
  const id = btn.dataset.id;
  const p = products.find(x=> x.id===id);
  addItem(p.id, p.name, p.price, p.img);
});
document.querySelectorAll('.add-bundle').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    addItem(btn.dataset.id, btn.dataset.name, Number(btn.dataset.price), 'https://images.unsplash.com/photo-1559599238-9e70de69f2e5?q=80&w=1200&auto=format&fit=crop');
  })
})

// ===== Cart UI =====
const drawer = document.getElementById('cartDrawer');
const openCart = document.getElementById('openCart');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotalEl = document.getElementById('cartTotal');

function renderCart(){
  cartItems.innerHTML = '';
  cartCount.textContent = cart.reduce((a,b)=>a+b.qty,0);
  cartTotalEl.textContent = fmt(cartTotal());
  if(!cart.length){
    cartItems.innerHTML = '<p>Keranjang kosong. Yuk pilih layanan dulu!</p>';
    return;
  }
  cart.forEach(i=>{
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = \`
      <img src="\${i.img}" alt="\${i.name}">
      <div>
        <div class="name">\${i.name}</div>
        <div class="meta">\${fmt(i.price)}</div>
      </div>
      <div class="qty">
        <button aria-label="Kurangi" data-act="dec" data-id="\${i.id}">−</button>
        <strong>\${i.qty}</strong>
        <button aria-label="Tambah" data-act="inc" data-id="\${i.id}">+</button>
        <button class="icon-btn" style="margin-left:8px" data-act="del" data-id="\${i.id}">Hapus</button>
      </div>\`;
    cartItems.appendChild(row);
  });
}
cartItems.addEventListener('click', (e)=>{
  const id = e.target.dataset.id;
  if(!id) return;
  if(e.target.dataset.act==='inc') changeQty(id, +1);
  if(e.target.dataset.act==='dec') changeQty(id, -1);
  if(e.target.dataset.act==='del') removeItem(id);
});
openCart.addEventListener('click', ()=>{ drawer.classList.add('open'); drawer.setAttribute('aria-hidden','false'); });
closeCart.addEventListener('click', ()=>{ drawer.classList.remove('open'); drawer.setAttribute('aria-hidden','true'); });

renderCart();

// ===== Checkout =====
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutCart = document.getElementById('checkoutCart');
const modal = document.getElementById('checkoutModal');
const closeCheckout = document.getElementById('closeCheckout');
const form = document.getElementById('checkoutForm');

function openCheckout(){
  if(!cart.length){ ping('Keranjang masih kosong'); return; }
  modal.classList.add('show'); modal.setAttribute('aria-hidden', 'false');
}
checkoutBtn.addEventListener('click', openCheckout);
checkoutCart.addEventListener('click', openCheckout);
closeCheckout.addEventListener('click', ()=>{
  modal.classList.remove('show'); modal.setAttribute('aria-hidden', 'true');
});

form.addEventListener('submit', (e)=>{
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  const orderId = 'OB-' + Math.random().toString(36).slice(2,8).toUpperCase();
  const lines = [
    'Our Beutie — E-Receipt',
    'Order: ' + orderId,
    'Nama: ' + data.name,
    'Email: ' + data.email,
    'Tanggal: ' + data.date,
    '-----------------------------',
    ...cart.map(i=> \`\${i.qty}x \${i.name} — \${fmt(i.price * i.qty)}\`),
    '-----------------------------',
    'TOTAL: ' + fmt(cartTotal()),
    'Catatan: ' + (data.note || '-'),
    'Terima kasih sudah mempercayakan kecantikanmu kepada Our Beutie 💖'
  ];
  const blob = new Blob([lines.join('\n')], {type:'text/plain'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = orderId + '_OurBeutie_Receipt.txt';
  a.click();
  URL.revokeObjectURL(url);

  cart.splice(0, cart.length); save(); renderCart();
  form.reset();
  modal.classList.remove('show'); 
  ping('Pembayaran sukses! E-Receipt terunduh.');
});

// ===== Toast =====
const toast = document.getElementById('toast');
let toastTimer;
function ping(msg){
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> toast.classList.remove('show'), 1800);
}

// ===== Animate on scroll =====
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      const delay = e.target.dataset.delay || 0;
      e.target.style.setProperty('--delay', delay+'ms');
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, {threshold: .1});
document.querySelectorAll('[data-animate]').forEach(el=> io.observe(el));
