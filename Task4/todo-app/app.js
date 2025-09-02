const STORAGE_KEY = 'todo-items-v1';

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []; }
  catch { return []; }
}
function save(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}
function uid() { return Math.random().toString(36).slice(2,9); }

let items = load();
let filter = 'all';

const list = document.getElementById('list');
const input = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const count = document.getElementById('count');
const clearCompleted = document.getElementById('clear-completed');

function render() {
  list.innerHTML = '';
  const filtered = items.filter(i => {
    if (filter === 'active') return !i.completed;
    if (filter === 'completed') return i.completed;
    return true;
  });
  filtered.forEach(i => {
    const li = document.createElement('li');
    li.className = 'item' + (i.completed ? ' completed' : '');
    li.innerHTML = `
      <input type="checkbox" ${i.completed ? 'checked' : ''} aria-label="Toggle complete" />
      <label>${escapeHtml(i.text)}</label>
      <span class="time" title="Created">${new Date(i.createdAt).toLocaleString()}</span>
      <button class="kebab" title="Delete">⋮</button>`;
    const cb = li.querySelector('input[type="checkbox"]');
    cb.addEventListener('change', () => toggle(i.id));
    const kebab = li.querySelector('.kebab');
    kebab.addEventListener('click', (e) => openMenu(e, i.id));
    list.appendChild(li);
  });
  const activeCount = items.filter(i => !i.completed).length;
  count.textContent = `${items.length} items • ${activeCount} active`;
}
function openMenu(e, id) {
  // simple menu: click deletes; double-click -> edit
  const action = confirm('Delete this task? Click "Cancel" to edit instead.');
  if (action) del(id);
  else edit(id);
}
function edit(id){
  const item = items.find(i => i.id === id);
  const text = prompt('Edit task:', item.text);
  if (text === null) return;
  const t = text.trim();
  if (!t) return;
  item.text = t;
  save(items);
  render();
}
function toggle(id){
  items = items.map(i => i.id === id ? {...i, completed: !i.completed} : i);
  save(items); render();
}
function del(id){
  items = items.filter(i => i.id !== id);
  save(items); render();
}
function add(text){
  const t = text.trim();
  if (!t) return;
  items.unshift({ id: uid(), text: t, completed:false, createdAt: Date.now() });
  save(items);
  input.value = '';
  render();
}
function escapeHtml(str){
  return str.replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
}
// Events
addBtn.addEventListener('click', () => add(input.value));
input.addEventListener('keydown', (e) => { if (e.key === 'Enter') add(input.value); });
document.querySelectorAll('.chip').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.chip').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    filter = btn.dataset.filter;
    render();
  });
});
clearCompleted.addEventListener('click', () => {
  items = items.filter(i => !i.completed);
  save(items); render();
});

// export/import
document.getElementById('export').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(items, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'todos.json'; a.click();
  URL.revokeObjectURL(url);
});
document.getElementById('import').addEventListener('click', () => {
  document.getElementById('import-file').click();
});
document.getElementById('import-file').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (Array.isArray(data)) {
        items = data; save(items); render();
      } else alert('Invalid JSON');
    } catch { alert('Invalid JSON'); }
  };
  reader.readAsText(file);
});

render();
