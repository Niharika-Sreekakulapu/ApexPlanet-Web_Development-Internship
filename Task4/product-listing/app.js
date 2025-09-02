const products = [
  {id:1, name:'Aurora Headphones', category:'Electronics', price:5999, rating:4.5},
  {id:2, name:'Nimbus Laptop Sleeve', category:'Accessories', price:1299, rating:4.2},
  {id:3, name:'Solace Office Chair', category:'Furniture', price:10999, rating:4.7},
  {id:4, name:'Pulse Fitness Band', category:'Electronics', price:2499, rating:4.1},
  {id:5, name:'Terra Coffee Beans', category:'Grocery', price:799, rating:4.6},
  {id:6, name:'Cascade Water Bottle', category:'Accessories', price:999, rating:4.0},
  {id:7, name:'Lumen Desk Lamp', category:'Furniture', price:1899, rating:4.4},
  {id:8, name:'Zephyr Backpack', category:'Accessories', price:2199, rating:4.3},
  {id:9, name:'Echo Bluetooth Speaker', category:'Electronics', price:3299, rating:4.5},
  {id:10, name:'Hearth Non-stick Pan', category:'Home & Kitchen', price:1499, rating:4.2},
  {id:11, name:'Silk Notebook', category:'Stationery', price:299, rating:4.8},
  {id:12, name:'Nimbus Pillow', category:'Home & Kitchen', price:899, rating:4.1},
];

let state = {
  query: '',
  categories: new Set(),
  minPrice: 0,
  maxPrice: 100000,
  minRating: 0,
  sort: 'relevance'
};

const grid = document.getElementById('grid');
const count = document.getElementById('count');

// Build category chips
const cats = [...new Set(products.map(p => p.category))].sort();
const catsDiv = document.getElementById('categories');
cats.forEach(c => {
  const el = document.createElement('button');
  el.className = 'chip';
  el.textContent = c;
  el.addEventListener('click', () => {
    if (state.categories.has(c)) { state.categories.delete(c); el.classList.remove('active'); }
    else { state.categories.add(c); el.classList.add('active'); }
    render();
  });
  catsDiv.appendChild(el);
});

// Inputs
document.getElementById('search').addEventListener('input', (e) => { state.query = e.target.value.toLowerCase(); render(); });
document.getElementById('minPrice').addEventListener('input', (e) => { state.minPrice = Number(e.target.value || 0); render(); });
document.getElementById('maxPrice').addEventListener('input', (e) => { state.maxPrice = Number(e.target.value || 1e9); render(); });
document.getElementById('minRating').addEventListener('change', (e) => { state.minRating = Number(e.target.value); render(); });
document.getElementById('sort').addEventListener('change', (e) => { state.sort = e.target.value; render(); });

function render(){
  const res = products
    .filter(p => p.name.toLowerCase().includes(state.query))
    .filter(p => state.categories.size ? state.categories.has(p.category) : true)
    .filter(p => p.price >= state.minPrice && p.price <= state.maxPrice)
    .filter(p => p.rating >= state.minRating);

  const sorted = res.slice().sort((a,b) => {
    switch(state.sort){
      case 'price-asc': return a.price - b.price;
      case 'price-desc': return b.price - a.price;
      case 'rating-desc': return b.rating - a.rating;
      case 'name-asc': return a.name.localeCompare(b.name);
      default: return 0; // relevance (original order)
    }
  });

  count.textContent = `${sorted.length} items`;
  grid.innerHTML = '';
  sorted.forEach(p => grid.appendChild(card(p)));
}

function card(p){
  const el = document.createElement('div');
  el.className = 'card';
  el.innerHTML = `
    <div class="thumb">${initials(p.name)}</div>
    <h3>${escapeHtml(p.name)}</h3>
    <div class="meta">
      <span>${escapeHtml(p.category)}</span>
      <span class="price">₹${p.price.toLocaleString()}</span>
    </div>
    <div class="meta">
      <span>⭐ ${p.rating.toFixed(1)}</span>
      <button class="add btn-small">Add to cart</button>
    </div>
  `;
  el.querySelector('.add').addEventListener('click', () => alert('Demo only: added to cart'));
  return el;
}

function initials(name){
  return name.split(' ').map(w=>w[0]).join('').slice(0,3).toUpperCase();
}
function escapeHtml(str){
  return str.replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
}
// Small button styles injected for convenience
const style = document.createElement('style');
style.textContent = `.btn-small{background:#0b1220;border:1px solid #1f2937;border-radius:10px;padding:.35rem .6rem;color:#e5e7eb;cursor:pointer}`;
document.head.appendChild(style);

render();
