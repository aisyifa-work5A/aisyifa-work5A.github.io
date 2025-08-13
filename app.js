// Utility: currency formatting (IDR)
const fmt = (n) => new Intl.NumberFormat('id-ID', {style:'currency', currency:'IDR'}).format(n);

// Year
document.getElementById('year').textContent = new Date().getFullYear();

// ----- Slider -----
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
function start(){ timer = setInterval(next, 4000); }
function stop(){ clearInterval(timer); }
function restart(){ stop(); start(); }

document.getElementById('nextSlide').addEventListener('click', next);
document.getElementById('prevSlide').addEventListener('click', prev);
buildDots(); start();
const slider = document.querySelector('.slider');
slider.addEventListener('mouseenter', stop);
slider.addEventListener('mouseleave', start);

// ----- Products (Wahana) -----
const products = [
  { id:'P1', name:'Glow Mini Golf', price:45000, img:'https://images.unsplash.com/photo-1596449914667-5f2b2fc63f86?q=80&w=1200&auto=format&fit=crop', meta:'Golf mini neon 9-hole' },
  { id:'P2', name:'Neon Arcade Pass', price:55000, img:'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format&fit=crop', meta:'Main sepuasnya 60 menit' },
  { id:'P3', name:'VR Freefall', price:65000, img:'https://images.unsplash.com/photo-1581276879432-15e50529f34b?q=80&w=1200&auto=format&fit=crop', meta:'Simulasi jatuh bebas VR' },
  { id:'P4', name:'Laser Maze', price:60000, img:'https://images.unsplash.com/photo-1553456558-aff63285bdd1?q=80&w=1200&auto=format&fit=crop', meta:'Rintang laser ala film' },
  { id:'P5', name:'Skate Bowl Indoor', price:70000, img:'https://images.unsplash.com/photo-1510279528647-6a8e0f58a8c6?q=80&w=1200&auto=format&fit=crop', meta:'Zona skate aman & fun' },
  { id:'P6', name:'Snack Combo', price:25000, img:'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1200&auto=format&fit=crop', meta:'Popcorn + drink' },
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

// ----- Cart State -----
const cart = JSON.parse(localStorage.getItem('havevun_cart') || '[]');
const save = ()=> localStorage.setItem('havevun_cart', JSON.stringify(cart));

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
    addItem(btn.dataset.id, btn.dataset.name, Number(btn.dataset.price), 'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1200&auto=format&fit=crop');
  })
})

// ----- Cart UI -----
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
    cartItems.innerHTML = '<p>Keranjang kosong. Yuk pilih wahana dulu!</p>';
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

// ----- Checkout -----
const checkoutBtn = document.getElementById('checkoutBtn');
const modal = document.getElementById('checkoutModal');
const closeCheckout = document.getElementById('closeCheckout');
const form = document.getElementById('checkoutForm');

checkoutBtn.addEventListener('click', ()=>{
  if(!cart.length){ ping('Keranjang masih kosong'); return; }
  modal.classList.add('show'); modal.setAttribute('aria-hidden', 'false');
});
closeCheckout.addEventListener('click', ()=>{
  modal.classList.remove('show'); modal.setAttribute('aria-hidden', 'true');
});

form.addEventListener('submit', (e)=>{
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  // Simple fake payment then make receipt
  const orderId = 'HV-' + Math.random().toString(36).slice(2,8).toUpperCase();
  const lines = [
    'Have Vun — E-Receipt',
    'Order: ' + orderId,
    'Nama: ' + data.name,
    'Email: ' + data.email,
    'Tanggal: ' + data.date,
    '-----------------------------',
    ...cart.map(i=> \`\${i.qty}x \${i.name} — \${fmt(i.price * i.qty)}\`),
    '-----------------------------',
    'TOTAL: ' + fmt(cartTotal()),
    'Catatan: ' + (data.note || '-'),
    'Terima kasih & sampai jumpa!'
  ];
  const blob = new Blob([lines.join('\n')], {type:'text/plain'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = orderId + '_HaveVun_Receipt.txt';
  a.click();
  URL.revokeObjectURL(url);

  // Reset UI
  cart.splice(0, cart.length); save(); renderCart();
  form.reset();
  modal.classList.remove('show'); 
  ping('Pembayaran sukses! E-Receipt terunduh.');
});

// ----- Toast -----
const toast = document.getElementById('toast');
let toastTimer;
function ping(msg){
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> toast.classList.remove('show'), 1800);
}

// ----- Animate on scroll -----
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
