/* ============================================================
   MPL-PK v2.4 — Futuristic Neon Cyber UI
   Menu: Permintaan Litmas · Registrasi · Pembagian (Penunjukan PK) · Statistik
   Multi-user login (Users sheet)
   ============================================================ */

const STORAGE = {
  session: 'MPLPK_SESSION',
  gas: 'MPLPK_GAS_URL',
  data: 'MPLPK_DATA',
  pk: 'MPLPK_PK',
  upt: 'MPLPK_UPT',
  users: 'MPLPK_USERS'
};

const PAGE_SIZE = 12;
let session = JSON.parse(localStorage.getItem(STORAGE.session) || 'null'); // {username, nama, role}
let gsheetUrl = localStorage.getItem(STORAGE.gas) || '';
let allData = JSON.parse(localStorage.getItem(STORAGE.data) || '[]'); // permintaan/klien
let allPk = JSON.parse(localStorage.getItem(STORAGE.pk) || '[]');
let allUpt = JSON.parse(localStorage.getItem(STORAGE.upt) || '[]');
let allUsers = JSON.parse(localStorage.getItem(STORAGE.users) || '[]');
let pageState = { perm: 1 };
let charts = {};

const DEFAULT_PK = [
  { id: 'pk1', nama: 'Ahmad Fauzi', nip: '', jabatan: 'PK Ahli Muda', status: 'Aktif' },
  { id: 'pk2', nama: 'Siti Rahayu', nip: '', jabatan: 'PK Ahli Pertama', status: 'Aktif' },
  { id: 'pk3', nama: 'Budi Santoso', nip: '', jabatan: 'APK', status: 'Aktif' }
];
const DEFAULT_UPT = [
  { id: 'u1', nama: 'Lapas Kelas IIA', jenis: 'Lapas', wilayah: '', status: 'Aktif' },
  { id: 'u2', nama: 'Rutan Kelas IIB', jenis: 'Rutan', wilayah: '', status: 'Aktif' }
];
const DEFAULT_USERS = [
  { id: 'usr1', username: 'admin', password: 'admin123', nama: 'Administrator', role: 'admin', status: 'Aktif' },
  { id: 'usr2', username: 'pk1', password: 'pk123', nama: 'Ahmad Fauzi', role: 'pk', status: 'Aktif' }
];

if (!allPk.length) allPk = DEFAULT_PK.map(p => ({ ...p }));
if (!allUpt.length) allUpt = DEFAULT_UPT.map(u => ({ ...u }));

if (!allUsers.length) allUsers = DEFAULT_USERS.map(u => ({ ...u }));

// Kategori pidana 1-6 + turunan (praktis untuk litmas)
const PIDANA_KATEGORI = {
  '1': {
    label: 'Kategori 1',
    color: '#f97316',
    turunan: ['POLITIK', 'TERHADAP NEGARA', 'PERDAGANGAN MANUSIA']
  },
  '2': {
    label: 'Kategori 2',
    color: '#22c55e',
    turunan: ['PEMBUNUHAN', 'TERORIS', 'KDRT', 'INFORMASI DAN TRANSAKSI ELEKTRONIK', 'MIGAS', 'PEMBALAKAN LIAR', 'KORUPSI', 'PENCUCIAN UANG', 'PERBANKAN', 'PAJAK', 'CUKAI', 'TINDAK PIDANA KHUSUS LAINNYA']
  },
  '3': {
    label: 'Kategori 3',
    color: '#3b82f6',
    turunan: ['PENYUAPAN', 'MATA UANG', 'PEMALSUAN MATERAI/SURAT/LAINNYA', 'PENIPUAN', 'PENGGELAPAN', 'DALAM JABATAN', 'PENYELUNDUPAN', 'PERIKANAN', 'KEIMIGRASIAN', 'PANGAN', 'KESUSILAAN', 'PERAMPOKAN', 'PORNOGRAFI', 'PERLINDUNGAN ANAK', 'NARKOBA', 'FARMASI']
  },
  '4': {
    label: 'Kategori 4',
    color: '#ef4444',
    turunan: ['LALU LINTAS', 'PENCULIKAN', 'PENGEROYOKAN', 'PENGANIAYAAN', 'PENGRUSAKAN', 'SENJATA API', 'SENJATA TAJAM']
  },
  '5': {
    label: 'Kategori 5',
    color: '#eab308',
    turunan: ['KETERTIBAN', 'PEMBAKARAN', 'PENCURIAN', 'PEMERASAN', 'PENGANCAMAN']
  },
  '6': {
    label: 'Kategori 6',
    color: '#a855f7',
    turunan: ['PENADAHAN']
  }
}

// UPT di lingkungan kerja Bapas Kelas II Lahat
const DEFAULT_UPT_LIST = [
  { id: 'u1', nama: 'Lapas Kelas IIA Lahat', jenis: 'Lapas', wilayah: 'Kabupaten Lahat', status: 'Aktif' },
  { id: 'u2', nama: 'Rutan Kelas IIB Muara Enim', jenis: 'Rutan', wilayah: 'Kabupaten Muara Enim', status: 'Aktif' },
  { id: 'u3', nama: 'Lapas Kelas IIB Muara Enim', jenis: 'Lapas', wilayah: 'Kabupaten Muara Enim', status: 'Aktif' },
  { id: 'u4', nama: 'Rutan Kelas IIB Empat Lawang', jenis: 'Rutan', wilayah: 'Kabupaten Empat Lawang', status: 'Aktif' },
  { id: 'u5', nama: 'Lapas Kelas IIB Empat Lawang', jenis: 'Lapas', wilayah: 'Kabupaten Empat Lawang', status: 'Aktif' },
  { id: 'u6', nama: 'Rutan Kelas IIB PALI', jenis: 'Rutan', wilayah: 'Kabupaten PALI', status: 'Aktif' },
  { id: 'u6b', nama: 'Rutan Kelas IIB Prabumulih', jenis: 'Rutan', wilayah: 'Kota Prabumulih', status: 'Aktif' },
  { id: 'u7', nama: 'Lapas Perempuan Kelas IIB Palembang (cabang wilayah)', jenis: 'Lapas', wilayah: 'Wilayah Kerja', status: 'Aktif' },
  { id: 'u8', nama: 'Rutan Kelas I Palembang (rujukan)', jenis: 'Rutan', wilayah: 'Wilayah Kerja', status: 'Aktif' },
  { id: 'u9', nama: 'Lapas Kelas IIA Pagar Alam', jenis: 'Lapas', wilayah: 'Kota Pagar Alam', status: 'Aktif' },
  { id: 'u10', nama: 'Rutan Kelas IIB Pagar Alam', jenis: 'Rutan', wilayah: 'Kota Pagar Alam', status: 'Aktif' }
];
if (!allUpt.length || allUpt.length <= 2) allUpt = DEFAULT_UPT_LIST.map(u => ({ ...u }));


// ---------- Utils ----------
function uid() { return 'id_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function isAdmin() { return session && session.role === 'admin'; }
function canEdit() { return session && (session.role === 'admin' || session.role === 'pk' || session.role === 'operator'); }
function saveLocal() {
  localStorage.setItem(STORAGE.data, JSON.stringify(allData));
  localStorage.setItem(STORAGE.pk, JSON.stringify(allPk));
  localStorage.setItem(STORAGE.upt, JSON.stringify(allUpt));
  localStorage.setItem(STORAGE.users, JSON.stringify(allUsers));
}
function toast(msg, type = 'info') {
  const c = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = 'toast';
  el.style.background = type === 'error' ? '#ff4d6d' : type === 'success' ? '#b8ff3c' : '#00e5ff';
  el.textContent = msg;
  c.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

function esc(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function romanMonth(m) {
  return ['','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'][m] || 'I';
}
/** Generate next no register: 0001/MPL/I/2026 */
function nextNoRegister(tgl) {
  const d = tgl ? new Date(tgl) : new Date();
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const roman = romanMonth(month);
  // Ambil nomor urut tertinggi di tahun yang sama
  let max = 0;
  allData.forEach(item => {
    const nr = String(item.noRegister || '');
    const m = nr.match(/^(\d+)\/DW\//i);
    if (m) {
      const n = parseInt(m[1], 10);
      if (!isNaN(n) && n > max) max = n;
    }
  });
  const next = max + 1;
  return String(next).padStart(4, '0') + '/MPL/' + roman + '/' + year;
}
function setSheetStatus(ok, text) {

  const dot = document.getElementById('sheet-status-dot');
  const txt = document.getElementById('sheet-status-text');
  if (dot) dot.style.background = ok ? '#10b981' : '#f59e0b';
  if (txt) txt.textContent = text || (ok ? 'Terhubung Google Sheet' : 'Mode Lokal');
}
function badge(status) {
  const map = {
    'Permintaan': 'badge-amber', 'Terregistrasi': 'badge-blue', 'Ditunjuk PK': 'badge-green',
    'Selesai': 'badge-purple', 'Aktif': 'badge-green', 'Nonaktif': 'badge-slate',
    'admin': 'badge-purple', 'pk': 'badge-teal', 'operator': 'badge-blue', 'guest': 'badge-slate'
  };
  return `<span class="badge ${map[status] || 'badge-slate'}">${status || '-'}</span>`;
}

// Status alur data:
// - Permintaan (baru masuk)
// - Terregistrasi (punya noRegister)
// - Ditunjuk PK (punya pk)
function statusOf(item) {
  if (item.pk) return 'Ditunjuk PK';
  if (item.noRegister) return 'Terregistrasi';
  return 'Permintaan';
}

// ---------- Auth (multi-user) ----------
async function doLogin() {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  const errEl = document.getElementById('login-error');
  const btn = document.getElementById('btn-login');
  errEl.classList.add('hidden');
  btn.disabled = true;
  btn.innerHTML = 'Memeriksa…';

  try {
    // Coba login via GAS jika URL ada
    if (gsheetUrl) {
      try {
        const res = await callGAS('login', { username, password });
        if (res.ok && res.user) {
          session = { username: res.user.username, nama: res.user.nama, role: res.user.role };
          localStorage.setItem(STORAGE.session, JSON.stringify(session));
          if (Array.isArray(res.users)) { allUsers = res.users; saveLocal(); }
          enterApp();
          return;
        }
        throw new Error(res.error || 'Username atau password salah');
      } catch (e) {
        // fallback lokal jika GAS gagal
        if (e.message && e.message.includes('salah')) throw e;
      }
    }

    // Login lokal
    const user = allUsers.find(u =>
      u.username === username &&
      u.password === password &&
      (u.status || 'Aktif') !== 'Nonaktif'
    );
    if (!user) throw new Error('Username atau password salah');
    session = { username: user.username, nama: user.nama, role: user.role };
    localStorage.setItem(STORAGE.session, JSON.stringify(session));
    enterApp();
  } catch (e) {
    errEl.textContent = e.message || 'Login gagal';
    errEl.classList.remove('hidden');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i data-lucide="log-in" class="w-4 h-4"></i> Masuk';
    lucide.createIcons();
  }
}

function logoutUser() {
  session = null;
  localStorage.removeItem(STORAGE.session);
  document.getElementById('login-overlay').style.display = 'flex';
  document.getElementById('login-username').value = '';
  document.getElementById('login-password').value = '';
  document.getElementById('login-error').classList.add('hidden');
}

function enterApp() {
  document.getElementById('login-overlay').style.display = 'none';
  document.getElementById('logged-user-label').textContent = session.nama || session.username;
  document.getElementById('header-role').textContent = (session.role || '').toUpperCase();
  applyRoleUI();
  lucide.createIcons();
  if (gsheetUrl) syncFromSheets(false);
  else renderAll();
}

function applyRoleUI() {
  document.querySelectorAll('.admin-only').forEach(el => {
    el.style.display = isAdmin() ? '' : 'none';
  });
}

// ---------- Navigation ----------
function navigateTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById('page-' + page);
  if (el) el.classList.add('active');
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.toggle('active', l.dataset.page === page));
  const titles = {
    dashboard: 'Dashboard',
    permintaan: 'Permintaan Litmas',
    registrasi: 'Registrasi',
    pembagian: 'Pembagian Litmas (Penunjukan PK)',
    statistik: 'Statistik Semua Aspek',
    pk: 'Master PK & APK',
    upt: 'Master UPT',
    users: 'Pengguna'
  };
  document.getElementById('nav-title').textContent = titles[page] || page;
  closeSidebar();
  renderAll();
  lucide.createIcons();
}
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('-translate-x-full');
  document.getElementById('sidebar-overlay').classList.toggle('hidden');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.add('-translate-x-full');
  document.getElementById('sidebar-overlay').classList.add('hidden');
}
function toggleDarkMode() { document.documentElement.classList.toggle('dark'); }

// ---------- GAS ----------
async function callGAS(action, payload = {}) {
  if (!gsheetUrl) throw new Error('URL Google Apps Script belum diisi');
  const body = JSON.stringify({ action, ...payload });
  const res = await fetch(gsheetUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch {
    throw new Error('Respons bukan JSON. Cek deployment Web App (/exec, Anyone).');
  }
  if (data.error) throw new Error(data.error);
  return data;
}

async function syncFromSheets(showToast = true) {
  if (!gsheetUrl) {
    if (showToast) toast('Isi URL GAS di Pengaturan', 'error');
    return;
  }
  setSheetStatus(false, 'Menyinkronkan…');
  try {
    const data = await callGAS('getAll');
    if (Array.isArray(data.klien)) allData = data.klien;
    if (Array.isArray(data.pk) && data.pk.length) allPk = data.pk;
    if (Array.isArray(data.upt) && data.upt.length) allUpt = data.upt;
    if (Array.isArray(data.users) && data.users.length) allUsers = data.users;
    saveLocal();
    setSheetStatus(true, 'Terhubung • ' + new Date().toLocaleTimeString('id-ID'));
    if (showToast) toast('Sinkron berhasil', 'success');
    renderAll();
  } catch (e) {
    setSheetStatus(false, 'Gagal sinkron');
    toast(e.message || 'Gagal sinkron', 'error');
    renderAll();
  }
}

// ---------- Dashboard ----------
function renderDashboard() {
  const total = allData.length;
  const reg = allData.filter(d => d.noRegister).length;
  const ditunjuk = allData.filter(d => d.pk).length;
  const belum = reg - ditunjuk;
  document.getElementById('k-permintaan').textContent = total;
  document.getElementById('k-reg').textContent = reg;
  document.getElementById('k-pk').textContent = ditunjuk;
  document.getElementById('k-belum').textContent = Math.max(0, belum);
  document.getElementById('dash-updated').textContent = 'Diperbarui ' + new Date().toLocaleString('id-ID');

  const recent = allData.slice().sort((a,b) => (b.tglTerima||'').localeCompare(a.tglTerima||'')).slice(0, 8);
  document.getElementById('dash-recent').innerHTML = recent.length
    ? recent.map(d => `<tr>
        <td class="font-semibold">${esc(d.nama)}</td>
        <td>${esc(d.noSurat||'-')}</td>
        <td>${badge(statusOf(d))}</td>
        <td>${esc(d.pk||'-')}</td>
        <td>${esc(d.tglTerima||'-')}</td>
      </tr>`).join('')
    : '<tr><td colspan="5" class="text-center text-slate-400 py-6">Belum ada data</td></tr>';

  destroyChart('chart-status');
  destroyChart('chart-beban');
  const c1 = document.getElementById('chart-status');
  if (c1) {
    const nPerm = allData.filter(d => statusOf(d)==='Permintaan').length;
    const nReg = allData.filter(d => statusOf(d)==='Terregistrasi').length;
    const nPk = allData.filter(d => statusOf(d)==='Ditunjuk PK').length;
    charts['chart-status'] = new Chart(c1, {
      type: 'doughnut',
      data: {
        labels: ['Permintaan', 'Terregistrasi', 'Ditunjuk PK'],
        datasets: [{ data: [nPerm, nReg, nPk], backgroundColor: ['#ffb020','#00e5ff','#ff2bd6'], borderWidth: 0 }]
      },
      options: { plugins: { legend: { position: 'bottom' } }, cutout: '60%' }
    });
  }
  const beban = bebanPk();
  const labels = Object.keys(beban).slice(0, 8);
  const c2 = document.getElementById('chart-beban');
  if (c2) {
    charts['chart-beban'] = new Chart(c2, {
      type: 'bar',
      data: {
        labels,
        datasets: [{ label: 'Klien', data: labels.map(l => beban[l]), backgroundColor: '#00e5ff', borderRadius: 8 }]
      },
      options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
    });
  }
}
function destroyChart(id) { if (charts[id]) { charts[id].destroy(); delete charts[id]; } }
function bebanPk() {
  const map = {};
  allPk.filter(p => p.status !== 'Nonaktif').forEach(p => { map[p.nama] = 0; });
  allData.forEach(d => { if (d.pk) map[d.pk] = (map[d.pk] || 0) + 1; });
  return map;
}

// ---------- Permintaan Litmas ----------
function renderPermintaan() {
  const q = (document.getElementById('perm-search')?.value || '').toLowerCase();
  let list = allData.filter(d => !q || (d.nama||'').toLowerCase().includes(q) || (d.noSurat||'').toLowerCase().includes(q));
  list = list.slice().sort((a,b) => (b.tglTerima||'').localeCompare(a.tglTerima||''));
  const total = list.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (pageState.perm > pages) pageState.perm = 1;
  const start = (pageState.perm - 1) * PAGE_SIZE;
  const slice = list.slice(start, start + PAGE_SIZE);

  document.getElementById('perm-tbody').innerHTML = slice.length
    ? slice.map((d, i) => `<tr>
        <td>${start + i + 1}</td>
        <td class="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">${esc(d.noRegister||'-')}</td>
        <td class="font-semibold">${esc(d.nama)}</td>
        <td>${esc(d.jk||'-')}</td>
        <td class="text-xs">${esc(d.noSurat||'-')}</td>
        <td class="text-xs">${esc(d.upt||'-')}</td>
        <td class="text-xs">${esc(d.jenisLitmas||'-')}</td>
        <td class="text-xs">${esc(d.turunanPidana||d.kategoriPidana||'-')}</td>
        <td>${badge(d.keterangan||'Normal')}</td>
        <td>${badge(statusOf(d))}</td>
        <td>
          ${canEdit() ? `<button class="btn btn-ghost btn-sm" onclick="editPermintaan('${d.id}')"><i data-lucide="pencil" class="w-3.5 h-3.5"></i></button>
          <button class="btn btn-ghost btn-sm text-red-500" onclick="deletePermintaan('${d.id}')"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>` : '-'}
        </td>
      </tr>`).join('')
    : '<tr><td colspan="11" class="text-center text-slate-400 py-8">Belum ada permintaan</td></tr>';

  const pag = document.getElementById('perm-pagination');
  if (total <= PAGE_SIZE) pag.innerHTML = total ? `<span class="text-xs text-slate-400">${total} data</span>` : '';
  else pag.innerHTML = `<span class="text-xs">${start+1}–${Math.min(start+PAGE_SIZE,total)} / ${total}</span>
    <div class="flex gap-1">
      <button class="btn btn-ghost btn-sm" ${pageState.perm<=1?'disabled':''} onclick="pageState.perm--;renderPermintaan()">‹</button>
      <button class="btn btn-ghost btn-sm" ${pageState.perm>=pages?'disabled':''} onclick="pageState.perm++;renderPermintaan()">›</button>
    </div>`;
  lucide.createIcons();
}

function openPermintaanModal(item = null) {
  if (!canEdit()) return toast('Tidak punya akses edit', 'error');
  const isEdit = !!item;
  const uptOpts = allUpt.filter(u => u.status !== 'Nonaktif')
    .map(u => `<option value="${esc(u.nama)}" ${item&&item.upt===u.nama?'selected':''}>${esc(u.nama)}</option>`).join('');
  const katOpts = Object.keys(PIDANA_KATEGORI).map(k =>
    `<option value="${k}" ${item&&String(item.kategoriPidana)===k?'selected':''}>${esc(PIDANA_KATEGORI[k].label)} — ${PIDANA_KATEGORI[k].turunan.slice(0,2).join(', ')}…</option>`
  ).join('');

  showModal(`
    <h3 class="text-lg font-extrabold mb-1">${isEdit ? 'Edit' : 'Tambah'} Permintaan Litmas</h3>
    <p class="text-xs text-slate-500 mb-4">No. register otomatis: <code class="text-indigo-500">0001/MPL/I/2026</code></p>

    <form class="space-y-4" onsubmit="event.preventDefault();savePermintaan('${item?item.id:''}')">
      <!-- Data surat (shared) -->
      <div class="rounded-2xl border border-slate-200/60 dark:border-white/10 p-4 space-y-3 bg-slate-50/50 dark:bg-white/5">
        <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Data Surat Permintaan</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="fl">No. Surat Permintaan *</label>
            <input class="form-input" id="f-nosurat" required value="${esc(item?.noSurat||'')}" placeholder="W.6.PAS.…">
          </div>
          <div>
            <label class="fl">Tanggal Permintaan *</label>
            <input type="date" class="form-input" id="f-tgl" required value="${esc(item?.tglTerima||new Date().toISOString().slice(0,10))}">
          </div>
          <div>
            <label class="fl">UPT Pemohon *</label>
            <select class="form-input" id="f-upt" required>
              <option value="">— pilih Lapas/Rutan —</option>
              ${uptOpts}
            </select>
          </div>
          <div>
            <label class="fl">Jenis Litmas *</label>
            <select class="form-input" id="f-jenisLitmas" required>
              <option value="Perawatan" ${item?.jenisLitmas==='Perawatan'?'selected':''}>Perawatan</option>
              <option value="Integrasi" ${item?.jenisLitmas==='Integrasi'?'selected':''}>Integrasi</option>
              <option value="Pembimbingan" ${item?.jenisLitmas==='Pembimbingan'?'selected':''}>Pembimbingan</option>
            </select>
          </div>
          <div>
            <label class="fl">Keterangan *</label>
            <select class="form-input" id="f-keterangan" required>
              <option value="Normal" ${!item||item.keterangan==='Normal'?'selected':''}>Normal</option>
              <option value="Limpah" ${item?.keterangan==='Limpah'?'selected':''}>Limpah</option>
              <option value="Dilimpahkan" ${item?.keterangan==='Dilimpahkan'?'selected':''}>Dilimpahkan</option>
            </select>
          </div>
          <div>
            <label class="fl">Catatan</label>
            <input class="form-input" id="f-catatan" value="${esc(item?.catatan||'')}" placeholder="Opsional">
          </div>
        </div>
      </div>

      ${isEdit ? `
      <!-- Pidana (edit / single) -->
      <div class="rounded-2xl border border-slate-200/60 dark:border-white/10 p-4 space-y-3 bg-slate-50/50 dark:bg-white/5">
        <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tindak Pidana</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="fl">Kategori *</label>
            <select class="form-input" id="f-kategori" required onchange="onKategoriChange()">
              <option value="">— pilih kategori 1–6 —</option>
              ${katOpts}
            </select>
          </div>
          <div>
            <label class="fl">Jenis Tindak Pidana *</label>
            <select class="form-input" id="f-turunan" required>
              <option value="">— pilih kategori dulu —</option>
            </select>
          </div>
        </div>
      </div>
      <div class="rounded-2xl border border-slate-200/60 dark:border-white/10 p-4 space-y-3">
        <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Data Klien</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="fl">Nama *</label>
            <input class="form-input" id="f-nama" required value="${esc(item?.nama||'')}">
          </div>
          <div>
            <label class="fl">Jenis Kelamin</label>
            <select class="form-input" id="f-jk">
              <option value="Laki-laki" ${item?.jk==='Laki-laki'?'selected':''}>Laki-laki</option>
              <option value="Perempuan" ${item?.jk==='Perempuan'?'selected':''}>Perempuan</option>
            </select>
          </div>
        </div>
      </div>
      ` : `
      <!-- Mode selector -->
      <div class="flex gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-white/10">
        <button type="button" id="mode-single" onclick="setInputMode('single')"
          class="flex-1 py-2.5 rounded-xl text-sm font-bold transition mode-btn active-mode">
          <i data-lucide="user" class="w-4 h-4 inline-block mr-1"></i> Satu Klien
        </button>
        <button type="button" id="mode-batch" onclick="setInputMode('batch')"
          class="flex-1 py-2.5 rounded-xl text-sm font-bold transition mode-btn">
          <i data-lucide="users" class="w-4 h-4 inline-block mr-1"></i> Banyak Klien
        </button>
      </div>

      <!-- Single mode: nama + JK + pidana -->
      <div id="panel-single" class="space-y-3">
        <div class="rounded-2xl border border-slate-200/60 dark:border-white/10 p-4 space-y-3">
          <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Data Klien</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="fl">Nama Lengkap *</label>
              <input class="form-input" id="f-nama" value="" placeholder="Nama klien">
            </div>
            <div>
              <label class="fl">Jenis Kelamin</label>
              <select class="form-input" id="f-jk">
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
          </div>
        </div>
        <div class="rounded-2xl border border-slate-200/60 dark:border-white/10 p-4 space-y-3 bg-slate-50/50 dark:bg-white/5">
          <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tindak Pidana</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="fl">Kategori *</label>
              <select class="form-input" id="f-kategori" onchange="onKategoriChange()">
                <option value="">— pilih kategori 1–6 —</option>
                ${katOpts}
              </select>
            </div>
            <div>
              <label class="fl">Jenis Tindak Pidana *</label>
              <select class="form-input" id="f-turunan">
                <option value="">— pilih kategori dulu —</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Batch mode: tiap baris punya nama, JK, kategori, tindak pidana sendiri -->
      <div id="panel-batch" class="hidden space-y-3">
        <div class="flex items-center justify-between">
          <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Daftar Klien <span class="font-normal normal-case text-slate-400">(tiap klien boleh kategori/tindak pidana berbeda)</span></p>
          <span class="text-xs font-semibold text-indigo-500" id="batch-count">0 klien</span>
        </div>
        <div id="batch-rows" class="space-y-3 max-h-80 overflow-y-auto pr-1"></div>
        <div class="flex flex-wrap gap-2">
          <button type="button" class="btn btn-ghost btn-sm" onclick="addBatchRow()">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i> Tambah baris
          </button>
          <button type="button" class="btn btn-ghost btn-sm" onclick="addBatchRow(5)">
            <i data-lucide="list-plus" class="w-3.5 h-3.5"></i> +5 baris
          </button>
          <button type="button" class="btn btn-ghost btn-sm" onclick="openPasteModal()">
            <i data-lucide="clipboard-paste" class="w-3.5 h-3.5"></i> Tempel dari daftar
          </button>
        </div>
      </div>
      `}

      <div class="flex justify-end gap-2 pt-2 border-t border-slate-200/50 dark:border-white/10">
        <button type="button" class="btn btn-ghost" onclick="closeModal()">Batal</button>
        <button type="submit" class="btn btn-primary" id="btn-save-perm">
          ${isEdit ? 'Simpan' : 'Simpan'}
        </button>
      </div>
    </form>
  `);

  if (item && item.kategoriPidana) {
    setTimeout(() => {
      onKategoriChange();
      const sel = document.getElementById('f-turunan');
      if (sel && item.turunanPidana) sel.value = item.turunanPidana;
    }, 40);
  }
  if (!isEdit) {
    window._inputMode = 'single';
    addBatchRow(3);
    setInputMode('single');
  }
  lucide.createIcons();
}

function setInputMode(mode) {
  window._inputMode = mode;
  const single = document.getElementById('panel-single');
  const batch = document.getElementById('panel-batch');
  const btnS = document.getElementById('mode-single');
  const btnB = document.getElementById('mode-batch');
  if (!single || !batch) return;
  if (mode === 'single') {
    single.classList.remove('hidden');
    batch.classList.add('hidden');
    btnS.classList.add('active-mode');
    btnB.classList.remove('active-mode');
  } else {
    single.classList.add('hidden');
    batch.classList.remove('hidden');
    btnB.classList.add('active-mode');
    btnS.classList.remove('active-mode');
    updateBatchCount();
  }
  lucide.createIcons();
}

function addBatchRow(n = 1) {
  const box = document.getElementById('batch-rows');
  if (!box) return;
  const katOptsHtml = Object.keys(PIDANA_KATEGORI).map(k =>
    `<option value="${k}">${esc(PIDANA_KATEGORI[k].label)}</option>`
  ).join('');
  for (let i = 0; i < n; i++) {
    const id = 'br_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    const row = document.createElement('div');
    row.className = 'batch-row rounded-xl bg-white dark:bg-white/5 border border-slate-200/70 dark:border-white/10 p-3 space-y-2';
    row.dataset.id = id;
    row.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="text-[11px] font-bold text-slate-400 w-5 text-center batch-num"></span>
        <input class="form-input flex-1 !py-2" placeholder="Nama lengkap *" data-field="nama">
        <select class="form-input !py-2" style="width:120px" data-field="jk">
          <option value="Laki-laki">Laki-laki</option>
          <option value="Perempuan">Perempuan</option>
        </select>
        <button type="button" class="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" onclick="removeBatchRow(this)" title="Hapus">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-7">
        <div>
          <select class="form-input !py-2 text-sm" data-field="kategori" onchange="onBatchKategoriChange(this)">
            <option value="">— kategori 1–6 —</option>
            ${katOptsHtml}
          </select>
        </div>
        <div>
          <select class="form-input !py-2 text-sm" data-field="turunan">
            <option value="">— pilih kategori dulu —</option>
          </select>
        </div>
      </div>`;
    box.appendChild(row);
    row.querySelector('[data-field="nama"]').addEventListener('input', updateBatchCount);
  }
  renumberBatch();
  updateBatchCount();
  lucide.createIcons();
}

function onBatchKategoriChange(sel) {
  const row = sel.closest('.batch-row');
  if (!row) return;
  const turunanSel = row.querySelector('[data-field="turunan"]');
  const kat = sel.value;
  if (!turunanSel) return;
  if (!kat || !PIDANA_KATEGORI[kat]) {
    turunanSel.innerHTML = '<option value="">— pilih kategori dulu —</option>';
    return;
  }
  const list = PIDANA_KATEGORI[kat].turunan;
  turunanSel.innerHTML = '<option value="">— pilih tindak pidana —</option>' +
    list.map(t => `<option value="${esc(t)}">${esc(t)}</option>`).join('');
}

function removeBatchRow(btn) {
  const row = btn.closest('.batch-row');
  if (row) row.remove();
  renumberBatch();
  updateBatchCount();
}

function renumberBatch() {
  document.querySelectorAll('#batch-rows .batch-row').forEach((r, i) => {
    const num = r.querySelector('.batch-num');
    if (num) num.textContent = i + 1;
  });
}

function updateBatchCount() {
  const n = document.querySelectorAll('#batch-rows .batch-row').length;
  const el = document.getElementById('batch-count');
  if (el) el.textContent = n + ' baris';
  const filled = [...document.querySelectorAll('#batch-rows [data-field="nama"]')].filter(i => i.value.trim()).length;
  const btn = document.getElementById('btn-save-perm');
  if (btn && window._inputMode === 'batch') btn.textContent = filled ? `Simpan ${filled} Klien` : 'Simpan';
}

function openPasteModal() {
  const html = `
    <h3 class="text-lg font-extrabold mb-2">Tempel Daftar Nama</h3>
    <p class="text-xs text-slate-500 mb-3">Satu baris satu nama. Opsional: <code>Nama|Laki-laki</code> atau <code>Nama|Perempuan</code></p>
    <textarea class="form-input font-mono text-sm" id="paste-area" rows="8" placeholder="Budi Santoso|Laki-laki&#10;Siti Aminah|Perempuan&#10;Ahmad Fauzi"></textarea>
    <div class="flex justify-end gap-2 mt-3">
      <button type="button" class="btn btn-ghost" onclick="closeModal()">Batal</button>
      <button type="button" class="btn btn-primary" onclick="applyPaste()">Masukkan ke Form</button>
    </div>`;
  // nested modal: use same root but keep parent form state is hard — instead inject overlay on top
  const root = document.getElementById('modal-root');
  const overlay = document.createElement('div');
  overlay.id = 'paste-overlay';
  overlay.className = 'modal-overlay';
  overlay.style.zIndex = '10000';
  overlay.innerHTML = `<div class="modal-box" style="max-width:520px">${html}</div>`;
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
  root.appendChild(overlay);
  lucide.createIcons();
}

function applyPaste() {
  const text = document.getElementById('paste-area')?.value || '';
  const lines = text.split('\n').map(s => s.trim()).filter(Boolean);
  if (!lines.length) return toast('Kosong', 'error');
  const box = document.getElementById('batch-rows');
  if (!box) return;
  // clear empty rows first
  [...box.querySelectorAll('.batch-row')].forEach(r => {
    const n = r.querySelector('[data-field="nama"]');
    if (n && !n.value.trim()) r.remove();
  });
  lines.forEach(line => {
    let nama = line, jk = 'Laki-laki';
    if (line.includes('|')) {
      const parts = line.split('|').map(p => p.trim());
      nama = parts[0];
      const j = (parts[1] || '').toLowerCase();
      if (j.startsWith('p') || j.includes('perempuan')) jk = 'Perempuan';
    }
    addBatchRow(1);
    const rows = box.querySelectorAll('.batch-row');
    const last = rows[rows.length - 1];
    last.querySelector('[data-field="nama"]').value = nama;
    last.querySelector('[data-field="jk"]').value = jk;
  });
  document.getElementById('paste-overlay')?.remove();
  updateBatchCount();
  toast(lines.length + ' nama dimasukkan', 'success');
}

function collectBatchRows() {
  const rows = [];
  document.querySelectorAll('#batch-rows .batch-row').forEach(r => {
    const nama = r.querySelector('[data-field="nama"]')?.value.trim();
    const jk = r.querySelector('[data-field="jk"]')?.value || 'Laki-laki';
    const kategoriPidana = r.querySelector('[data-field="kategori"]')?.value || '';
    const turunanPidana = r.querySelector('[data-field="turunan"]')?.value || '';
    if (nama) rows.push({ nama, jk, kategoriPidana, turunanPidana });
  });
  return rows;
}

function onKategoriChange() {
  const kat = document.getElementById('f-kategori')?.value;
  const sel = document.getElementById('f-turunan');
  if (!sel) return;
  if (!kat || !PIDANA_KATEGORI[kat]) {
    sel.innerHTML = '<option value="">— pilih kategori dulu —</option>';
    return;
  }
  const list = PIDANA_KATEGORI[kat].turunan;
  sel.innerHTML = '<option value="">— pilih turunan —</option>' +
    list.map(t => `<option value="${esc(t)}">${esc(t)}</option>`).join('');
}

async function savePermintaan(id) {
  const noSurat = document.getElementById('f-nosurat').value.trim();
  const tglTerima = document.getElementById('f-tgl').value;
  const upt = document.getElementById('f-upt').value;
  const jenisLitmas = document.getElementById('f-jenisLitmas').value;
  const keterangan = document.getElementById('f-keterangan').value;
  const catatan = document.getElementById('f-catatan').value.trim();

  if (!noSurat || !tglTerima || !upt || !jenisLitmas) {
    return toast('Lengkapi field wajib (surat, UPT, jenis litmas)', 'error');
  }

  // EDIT single
  if (id) {
    const kategoriPidana = document.getElementById('f-kategori')?.value || '';
    const turunanPidana = document.getElementById('f-turunan')?.value || '';
    if (!kategoriPidana || !turunanPidana) {
      return toast('Lengkapi kategori dan jenis tindak pidana', 'error');
    }
    const nama = document.getElementById('f-nama').value.trim();
    const jk = document.getElementById('f-jk').value;
    if (!nama) return toast('Nama wajib', 'error');
    const i = allData.findIndex(d => d.id === id);
    if (i < 0) return;
    allData[i] = {
      ...allData[i],
      nama, jk, noSurat, tglTerima, upt, catatan,
      kategoriPidana, turunanPidana, jenisLitmas, keterangan
    };
    if (!allData[i].noRegister) {
      allData[i].noRegister = nextNoRegister(tglTerima);
      allData[i].tglReg = tglTerima;
    }
    saveLocal();
    closeModal();
    renderAll();
    toast('Data diperbarui', 'success');
    if (gsheetUrl) try { await callGAS('saveKlien', { item: allData[i] }); } catch(e) {}
    return;
  }

  // CREATE — single or batch
  let people = [];
  if (window._inputMode === 'batch') {
    people = collectBatchRows();
    if (!people.length) return toast('Isi minimal satu nama di daftar klien', 'error');
    const incomplete = people.find(p => !p.kategoriPidana || !p.turunanPidana);
    if (incomplete) {
      return toast(`Klien "${incomplete.nama}" belum lengkap kategori/tindak pidana`, 'error');
    }
  } else {
    const nama = document.getElementById('f-nama').value.trim();
    const jk = document.getElementById('f-jk').value;
    const kategoriPidana = document.getElementById('f-kategori')?.value || '';
    const turunanPidana = document.getElementById('f-turunan')?.value || '';
    if (!nama) return toast('Nama wajib', 'error');
    if (!kategoriPidana || !turunanPidana) {
      return toast('Lengkapi kategori dan jenis tindak pidana', 'error');
    }
    people = [{ nama, jk, kategoriPidana, turunanPidana }];
  }

  const created = [];
  for (const person of people) {
    const noRegister = nextNoRegister(tglTerima);
    const obj = {
      id: uid(),
      nama: person.nama,
      jk: person.jk || 'Laki-laki',
      noSurat,
      tglTerima,
      upt,
      catatan,
      kategoriPidana: person.kategoriPidana,
      turunanPidana: person.turunanPidana,
      jenisLitmas,
      keterangan,
      noRegister,
      tglReg: tglTerima,
      pk: ''
    };
    allData.unshift(obj);
    created.push(obj);
  }

  saveLocal();
  closeModal();
  renderAll();
  toast(created.length === 1
    ? `Tersimpan · ${created[0].noRegister}`
    : `${created.length} klien tersimpan · register otomatis`, 'success');

  if (gsheetUrl) {
    for (const item of created) {
      try { await callGAS('saveKlien', { item }); } catch(e) { console.warn(e); }
    }
  }
}

async function deletePermintaan(id) {
  if (!isAdmin()) return toast('Hanya admin yang bisa hapus', 'error');
  if (!confirm('Hapus permintaan ini?')) return;
  allData = allData.filter(d => d.id !== id);
  saveLocal();
  renderAll();
  toast('Dihapus', 'success');
  if (gsheetUrl) try { await callGAS('deleteKlien', { id }); } catch(e){}
}

// ---------- Registrasi ----------
function renderRegistrasi() {
  const q = (document.getElementById('reg-search')?.value || '').toLowerCase();
  const belum = allData.filter(d => !d.noRegister && (!q || (d.nama||'').toLowerCase().includes(q)));
  const sudah = allData.filter(d => d.noRegister && (!q || (d.nama||'').toLowerCase().includes(q) || (d.noRegister||'').toLowerCase().includes(q)));

  document.getElementById('reg-belum-tbody').innerHTML = belum.length
    ? belum.map(d => `<tr>
        <td class="font-semibold">${esc(d.nama)}</td>
        <td>${esc(d.noSurat||'-')}</td>
        <td>${canEdit()?`<button class="btn btn-primary btn-sm" onclick="openRegModal('${d.id}')"><i data-lucide="hash" class="w-3.5 h-3.5"></i> Registrasi</button>`:'-'}</td>
      </tr>`).join('')
    : '<tr><td colspan="3" class="text-center text-slate-400 py-6">Tidak ada</td></tr>';

  document.getElementById('reg-sudah-tbody').innerHTML = sudah.length
    ? sudah.map(d => `<tr>
        <td class="font-semibold">${esc(d.nama)}</td>
        <td>${esc(d.noRegister)}</td>
        <td>${esc(d.tglReg||'-')}</td>
        <td>${canEdit()?`<button class="btn btn-ghost btn-sm" onclick="openRegModal('${d.id}')"><i data-lucide="pencil" class="w-3.5 h-3.5"></i></button>`:'-'}</td>
      </tr>`).join('')
    : '<tr><td colspan="4" class="text-center text-slate-400 py-6">Belum ada</td></tr>';
  lucide.createIcons();
}

function openRegModal(id) {
  const item = allData.find(d => d.id === id);
  if (!item) return;
  showModal(`
    <h3 class="text-lg font-extrabold mb-4">Registrasi — ${esc(item.nama)}</h3>
    <form class="space-y-3" onsubmit="event.preventDefault();saveRegistrasi('${id}')">
      <div><label class="fl">No. Register *</label><input class="form-input" id="r-noreg" required value="${esc(item.noRegister||'')}" placeholder="Contoh: REG/001/2026"></div>
      <div><label class="fl">Tanggal Registrasi</label><input type="date" class="form-input" id="r-tgl" value="${esc(item.tglReg||new Date().toISOString().slice(0,10))}"></div>
      <div class="flex justify-end gap-2 pt-2">
        <button type="button" class="btn btn-ghost" onclick="closeModal()">Batal</button>
        <button type="submit" class="btn btn-primary">Simpan Registrasi</button>
      </div>
    </form>
  `);
}
async function saveRegistrasi(id) {
  const i = allData.findIndex(d => d.id === id);
  if (i < 0) return;
  allData[i].noRegister = document.getElementById('r-noreg').value.trim();
  allData[i].tglReg = document.getElementById('r-tgl').value;
  if (!allData[i].noRegister) return toast('No. Register wajib', 'error');
  saveLocal();
  closeModal();
  renderAll();
  toast('Registrasi disimpan', 'success');
  if (gsheetUrl) try { await callGAS('saveKlien', { item: allData[i] }); } catch(e){}
}

// ---------- Pembagian Litmas (Penunjukan PK) ----------
function renderPembagian() {
  // Hanya yang sudah registrasi
  const list = allData.filter(d => d.noRegister)
    .slice().sort((a,b) => {
      if (!a.pk && b.pk) return -1;
      if (a.pk && !b.pk) return 1;
      return (a.nama||'').localeCompare(b.nama||'');
    });

  document.getElementById('pembagian-tbody').innerHTML = list.length
    ? list.map(d => `<tr>
        <td class="font-semibold">${esc(d.nama)}</td>
        <td>${esc(d.noRegister)}</td>
        <td>${d.pk ? badge(d.pk) : '<span class="text-indigo-500 text-xs font-semibold">Belum ditunjuk</span>'}</td>
        <td>${canEdit()?`<button class="btn btn-primary btn-sm" onclick="openTunjukPk('${d.id}')"><i data-lucide="user-check" class="w-3.5 h-3.5"></i> ${d.pk?'Ganti':'Tunjuk'} PK</button>`:'-'}</td>
      </tr>`).join('')
    : '<tr><td colspan="4" class="text-center text-slate-400 py-8">Belum ada klien terregistrasi</td></tr>';

  const beban = bebanPk();
  const maxB = Math.max(1, ...Object.values(beban));
  document.getElementById('pembagian-beban').innerHTML = Object.keys(beban).map(nama => {
    const n = beban[nama];
    const pct = Math.round((n / maxB) * 100);
    return `<div class="card-panel p-3">
      <div class="flex justify-between items-center mb-1">
        <span class="font-semibold text-sm">${esc(nama)}</span>
        <span class="text-sm font-extrabold">${n}</span>
      </div>
      <div class="h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
        <div class="h-full rounded-full bg-gradient-to-r from-[#00e5ff] to-[#ff2bd6]" style="width:${pct}%"></div>
      </div>
    </div>`;
  }).join('') || '<p class="text-slate-400 text-sm">Belum ada PK</p>';
  lucide.createIcons();
}

function openTunjukPk(id) {
  const item = allData.find(d => d.id === id);
  if (!item) return;
  const pkOpts = allPk.filter(p => p.status !== 'Nonaktif')
    .map(p => `<option value="${esc(p.nama)}" ${item.pk===p.nama?'selected':''}>${esc(p.nama)} (${p.jabatan||'PK'})</option>`).join('');
  showModal(`
    <h3 class="text-lg font-extrabold mb-1">Penunjukan PK</h3>
    <p class="text-sm text-slate-500 mb-4">${esc(item.nama)} · ${esc(item.noRegister)}</p>
    <form class="space-y-3" onsubmit="event.preventDefault();saveTunjukPk('${id}')">
      <div>
        <label class="fl">Pilih PK / APK *</label>
        <select class="form-input" id="t-pk" required>
          <option value="">— pilih PK —</option>
          ${pkOpts}
        </select>
      </div>
      <div class="flex justify-end gap-2 pt-2">
        <button type="button" class="btn btn-ghost" onclick="closeModal()">Batal</button>
        ${item.pk?`<button type="button" class="btn btn-ghost text-red-500" onclick="clearPk('${id}')">Lepas PK</button>`:''}
        <button type="submit" class="btn btn-primary">Simpan</button>
      </div>
    </form>
  `);
}
async function saveTunjukPk(id) {
  const i = allData.findIndex(d => d.id === id);
  if (i < 0) return;
  allData[i].pk = document.getElementById('t-pk').value;
  saveLocal();
  closeModal();
  renderAll();
  toast('PK ditunjuk', 'success');
  if (gsheetUrl) try { await callGAS('saveKlien', { item: allData[i] }); } catch(e){}
}
async function clearPk(id) {
  const i = allData.findIndex(d => d.id === id);
  if (i < 0) return;
  allData[i].pk = '';
  saveLocal();
  closeModal();
  renderAll();
  toast('PK dilepas', 'success');
  if (gsheetUrl) try { await callGAS('saveKlien', { item: allData[i] }); } catch(e){}
}

// ---------- Statistik Semua Aspek ----------
function countBy(arr, keyFn) {
  const m = {};
  arr.forEach(d => {
    const k = keyFn(d) || 'Lainnya';
    m[k] = (m[k] || 0) + 1;
  });
  return m;
}

function sortEntries(obj, desc = true) {
  return Object.entries(obj).sort((a, b) => desc ? b[1] - a[1] : a[1] - b[1]);
}

const CHART_COLORS = {
  indigo: '#00e5ff', teal: '#00e5ff', violet: '#8b5cff', rose: '#ff2bd6',
  amber: '#ffb020', sky: '#00e5ff', emerald: '#b8ff3c', slate: '#7a8ba3',
  palette: ['#00e5ff','#ff2bd6','#8b5cff','#ffb020','#b8ff3c','#ff4d6d','#67f0ff','#c026d3','#38bdf8','#a3e635','#fb923c','#e879f9']
};

function renderStatistik() {
  const total = allData.length;
  const nPerm = allData.filter(d => statusOf(d) === 'Permintaan').length;
  const nReg = allData.filter(d => statusOf(d) === 'Terregistrasi').length;
  const nPk = allData.filter(d => statusOf(d) === 'Ditunjuk PK').length;
  const nL = allData.filter(d => d.jk === 'Laki-laki').length;
  const nP = allData.filter(d => d.jk === 'Perempuan').length;

  // KPI modern cards
  const kpiEl = document.getElementById('stat-kpi');
  if (kpiEl) {
    const kpis = [
      { label: 'Total Klien', val: total, bar: '#00e5ff' },
      { label: 'Belum Registrasi', val: nPerm, bar: '#ffb020' },
      { label: 'Sudah Registrasi', val: nReg + nPk, bar: '#b8ff3c' },
      { label: 'Ditunjuk PK', val: nPk, bar: '#ff2bd6' }
    ];
    kpiEl.innerHTML = kpis.map(k => `
      <div class="kpi-modern">
        <p class="kpi-val" style="color:${k.bar}">${k.val}</p>
        <p class="kpi-label">${k.label}</p>
        <div class="kpi-bar" style="background:${k.bar};width:${total ? Math.max(8, (k.val / total) * 100) : 8}%"></div>
      </div>`).join('');
  }

  // Destroy old charts
  ['chart-stat-alur','chart-stat-jk','chart-stat-jenis','chart-stat-kategori','chart-stat-ket','chart-stat-upt','chart-stat-pk']
    .forEach(destroyChart);

  const chartOpts = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 14, font: { size: 11 } } } }
  };

  // Status alur
  const cAlur = document.getElementById('chart-stat-alur');
  if (cAlur) charts['chart-stat-alur'] = new Chart(cAlur, {
    type: 'doughnut',
    data: {
      labels: ['Permintaan', 'Terregistrasi', 'Ditunjuk PK'],
      datasets: [{ data: [nPerm, nReg, nPk], backgroundColor: ['#ffb020', '#00e5ff', '#ff2bd6'], borderWidth: 0 }]
    },
    options: { ...chartOpts, cutout: '58%' }
  });

  // JK
  const cJk = document.getElementById('chart-stat-jk');
  if (cJk) charts['chart-stat-jk'] = new Chart(cJk, {
    type: 'doughnut',
    data: {
      labels: ['Laki-laki', 'Perempuan'],
      datasets: [{ data: [nL, nP], backgroundColor: ['#00e5ff', '#ff2bd6'], borderWidth: 0 }]
    },
    options: { ...chartOpts, cutout: '58%' }
  });

  // Jenis Litmas
  const jenisMap = countBy(allData, d => d.jenisLitmas || 'Lainnya');
  const cJenis = document.getElementById('chart-stat-jenis');
  if (cJenis) charts['chart-stat-jenis'] = new Chart(cJenis, {
    type: 'doughnut',
    data: {
      labels: Object.keys(jenisMap),
      datasets: [{ data: Object.values(jenisMap), backgroundColor: CHART_COLORS.palette.slice(0, Object.keys(jenisMap).length), borderWidth: 0 }]
    },
    options: { ...chartOpts, cutout: '58%' }
  });

  // Kategori Pidana 1-6
  const katMap = {};
  Object.keys(PIDANA_KATEGORI).forEach(k => { katMap[PIDANA_KATEGORI[k].label] = 0; });
  allData.forEach(d => {
    const k = String(d.kategoriPidana || '');
    const label = PIDANA_KATEGORI[k] ? PIDANA_KATEGORI[k].label : 'Lainnya';
    katMap[label] = (katMap[label] || 0) + 1;
  });
  const katLabels = Object.keys(katMap);
  const katColors = ['#ffb020','#b8ff3c','#00e5ff','#ff4d6d','#ff2bd6','#8b5cff','#7a8ba3'];
  const cKat = document.getElementById('chart-stat-kategori');
  if (cKat) charts['chart-stat-kategori'] = new Chart(cKat, {
    type: 'bar',
    data: {
      labels: katLabels,
      datasets: [{ data: Object.values(katMap), backgroundColor: katColors.slice(0, katLabels.length), borderRadius: 8, maxBarThickness: 48 }]
    },
    options: {
      ...chartOpts,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } }, x: { ticks: { font: { size: 11 } } } }
    }
  });

  // Keterangan
  const ketMap = countBy(allData, d => d.keterangan || 'Normal');
  const cKet = document.getElementById('chart-stat-ket');
  if (cKet) charts['chart-stat-ket'] = new Chart(cKet, {
    type: 'pie',
    data: {
      labels: Object.keys(ketMap),
      datasets: [{ data: Object.values(ketMap), backgroundColor: ['#b8ff3c', '#ffb020', '#ff4d6d', '#7a8ba3'], borderWidth: 0 }]
    },
    options: chartOpts
  });

  // Top Tindak Pidana (progress bars)
  const turMap = countBy(allData, d => d.turunanPidana || 'Belum diisi');
  const turSorted = sortEntries(turMap).slice(0, 12);
  const maxTur = turSorted.length ? turSorted[0][1] : 1;
  const turColors = CHART_COLORS.palette;
  const barsEl = document.getElementById('stat-turunan-bars');
  if (barsEl) {
    barsEl.innerHTML = turSorted.length
      ? turSorted.map(([nama, n], i) => `
        <div class="progress-row">
          <span class="label" title="${esc(nama)}">${esc(nama)}</span>
          <div class="bar-wrap"><div class="bar-fill" style="width:${(n / maxTur) * 100}%;background:${turColors[i % turColors.length]}"></div></div>
          <span class="val">${n}</span>
        </div>`).join('')
      : '<p class="text-sm text-slate-400 py-4 text-center">Belum ada data tindak pidana</p>';
  }

  // UPT
  const uptMap = countBy(allData, d => d.upt || 'Lainnya');
  const uptSorted = sortEntries(uptMap);
  const cUpt = document.getElementById('chart-stat-upt');
  if (cUpt) charts['chart-stat-upt'] = new Chart(cUpt, {
    type: 'bar',
    data: {
      labels: uptSorted.map(e => e[0].length > 28 ? e[0].slice(0, 26) + '…' : e[0]),
      datasets: [{ data: uptSorted.map(e => e[1]), backgroundColor: '#00e5ff', borderRadius: 8, maxBarThickness: 28 }]
    },
    options: {
      indexAxis: 'y',
      plugins: { legend: { display: false } },
      scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } }
    }
  });

  // Beban PK
  const beban = bebanPk();
  const bebanSorted = sortEntries(beban);
  const cPk = document.getElementById('chart-stat-pk');
  if (cPk) charts['chart-stat-pk'] = new Chart(cPk, {
    type: 'bar',
    data: {
      labels: bebanSorted.map(e => e[0]),
      datasets: [{ data: bebanSorted.map(e => e[1]), backgroundColor: '#00e5ff', borderRadius: 8, maxBarThickness: 40 }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
    }
  });

  // Tabel rekap kategori
  const katTbody = document.getElementById('stat-kat-tbody');
  if (katTbody) {
    // top turunan per kategori
    const perKatTop = {};
    allData.forEach(d => {
      const k = String(d.kategoriPidana || '');
      const label = PIDANA_KATEGORI[k] ? PIDANA_KATEGORI[k].label : 'Lainnya';
      if (!perKatTop[label]) perKatTop[label] = {};
      const t = d.turunanPidana || '-';
      perKatTop[label][t] = (perKatTop[label][t] || 0) + 1;
    });
    katTbody.innerHTML = katLabels.map((label, i) => {
      const n = katMap[label] || 0;
      const pct = total ? ((n / total) * 100).toFixed(1) : '0';
      const tops = perKatTop[label] ? sortEntries(perKatTop[label]).slice(0, 2).map(e => e[0]).join(', ') : '—';
      return `<tr>
        <td class="font-semibold"><span class="inline-block w-2.5 h-2.5 rounded-full mr-2" style="background:${katColors[i]}"></span>${esc(label)}</td>
        <td>${n}</td>
        <td>${pct}%</td>
        <td class="text-xs text-slate-500">${esc(tops)}</td>
      </tr>`;
    }).join('') || '<tr><td colspan="4" class="text-center text-slate-400 py-6">Belum ada data</td></tr>';
  }

  // Tabel rekap PK
  const rekapEl = document.getElementById('stat-rekap-tbody');
  if (rekapEl) {
    rekapEl.innerHTML = Object.keys(beban).length
      ? Object.keys(beban).map(nama =>
          `<tr><td class="font-semibold">${esc(nama)}</td><td>${beban[nama]}</td><td>${beban[nama]}</td></tr>`
        ).join('')
      : '<tr><td colspan="3" class="text-center text-slate-400 py-4">—</td></tr>';
  }

  lucide.createIcons();
}

// ---------- Master PK ----------
function renderPk() {
  const beban = bebanPk();
  document.getElementById('pk-tbody').innerHTML = allPk.map(p => `<tr>
    <td class="font-semibold">${esc(p.nama)}</td>
    <td>${esc(p.nip||'-')}</td>
    <td>${esc(p.jabatan||'-')}</td>
    <td>${badge(p.status)}</td>
    <td><b>${beban[p.nama]||0}</b></td>
    <td class="admin-only">
      <button class="btn btn-ghost btn-sm" onclick="editPk('${p.id}')"><i data-lucide="pencil" class="w-3.5 h-3.5"></i></button>
      <button class="btn btn-ghost btn-sm text-red-500" onclick="deletePk('${p.id}')"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
    </td>
  </tr>`).join('') || '<tr><td colspan="6" class="text-center text-slate-400 py-8">—</td></tr>';
  applyRoleUI();
  lucide.createIcons();
}
function openPkModal(item=null) {
  showModal(`
    <h3 class="text-lg font-extrabold mb-4">${item?'Edit':'Tambah'} PK/APK</h3>
    <form class="space-y-3" onsubmit="event.preventDefault();savePk('${item?item.id:''}')">
      <div><label class="fl">Nama *</label><input class="form-input" id="pk-nama" required value="${esc(item?.nama||'')}"></div>
      <div class="grid grid-cols-2 gap-3">
        <div><label class="fl">NIP</label><input class="form-input" id="pk-nip" value="${esc(item?.nip||'')}"></div>
        <div><label class="fl">Jabatan</label><input class="form-input" id="pk-jabatan" value="${esc(item?.jabatan||'PK')}"></div>
      </div>
      <div><label class="fl">Status</label><select class="form-input" id="pk-status">
        <option ${!item||item.status==='Aktif'?'selected':''}>Aktif</option>
        <option ${item?.status==='Nonaktif'?'selected':''}>Nonaktif</option>
      </select></div>
      <div class="flex justify-end gap-2"><button type="button" class="btn btn-ghost" onclick="closeModal()">Batal</button><button type="submit" class="btn btn-primary">Simpan</button></div>
    </form>
  `);
}
function editPk(id){ const i=allPk.find(p=>p.id===id); if(i) openPkModal(i); }
async function savePk(id){
  const obj={ id:id||uid(), nama:document.getElementById('pk-nama').value.trim(), nip:document.getElementById('pk-nip').value.trim(), jabatan:document.getElementById('pk-jabatan').value.trim()||'PK', status:document.getElementById('pk-status').value };
  if(!obj.nama) return toast('Nama wajib','error');
  if(id){ const i=allPk.findIndex(p=>p.id===id); if(i>=0) allPk[i]=obj; } else allPk.push(obj);
  saveLocal(); closeModal(); renderAll(); toast('Disimpan','success');
  if(gsheetUrl) try{ await callGAS('savePk',{item:obj}); }catch(e){}
}
async function deletePk(id){
  if(!confirm('Hapus?')) return;
  allPk=allPk.filter(p=>p.id!==id); saveLocal(); renderAll();
  if(gsheetUrl) try{ await callGAS('deletePk',{id}); }catch(e){}
}

// ---------- Master UPT ----------
function renderUpt() {
  document.getElementById('upt-tbody').innerHTML = allUpt.map(u => `<tr>
    <td class="font-semibold">${esc(u.nama)}</td>
    <td>${esc(u.jenis||'-')}</td>
    <td>${esc(u.wilayah||'-')}</td>
    <td>${badge(u.status)}</td>
    <td class="admin-only">
      <button class="btn btn-ghost btn-sm" onclick="editUpt('${u.id}')"><i data-lucide="pencil" class="w-3.5 h-3.5"></i></button>
      <button class="btn btn-ghost btn-sm text-red-500" onclick="deleteUpt('${u.id}')"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
    </td>
  </tr>`).join('') || '<tr><td colspan="5" class="text-center text-slate-400 py-8">—</td></tr>';
  applyRoleUI();
  lucide.createIcons();
}
function openUptModal(item=null){
  showModal(`
    <h3 class="text-lg font-extrabold mb-4">${item?'Edit':'Tambah'} UPT</h3>
    <form class="space-y-3" onsubmit="event.preventDefault();saveUpt('${item?item.id:''}')">
      <div><label class="fl">Nama UPT *</label><input class="form-input" id="upt-nama" required value="${esc(item?.nama||'')}"></div>
      <div class="grid grid-cols-2 gap-3">
        <div><label class="fl">Jenis</label><select class="form-input" id="upt-jenis">
          <option>Lapas</option><option>Rutan</option><option>Bapas</option><option>Lainnya</option>
        </select></div>
        <div><label class="fl">Wilayah</label><input class="form-input" id="upt-wilayah" value="${esc(item?.wilayah||'')}"></div>
      </div>
      <div><label class="fl">Status</label><select class="form-input" id="upt-status"><option>Aktif</option><option>Nonaktif</option></select></div>
      <div class="flex justify-end gap-2"><button type="button" class="btn btn-ghost" onclick="closeModal()">Batal</button><button type="submit" class="btn btn-primary">Simpan</button></div>
    </form>
  `);
  if(item){ document.getElementById('upt-jenis').value=item.jenis||'Lapas'; document.getElementById('upt-status').value=item.status||'Aktif'; }
}
function editUpt(id){ const i=allUpt.find(u=>u.id===id); if(i) openUptModal(i); }
async function saveUpt(id){
  const obj={ id:id||uid(), nama:document.getElementById('upt-nama').value.trim(), jenis:document.getElementById('upt-jenis').value, wilayah:document.getElementById('upt-wilayah').value.trim(), status:document.getElementById('upt-status').value };
  if(!obj.nama) return toast('Nama wajib','error');
  if(id){ const i=allUpt.findIndex(u=>u.id===id); if(i>=0) allUpt[i]=obj; } else allUpt.push(obj);
  saveLocal(); closeModal(); renderAll(); toast('Disimpan','success');
  if(gsheetUrl) try{ await callGAS('saveUpt',{item:obj}); }catch(e){}
}
async function deleteUpt(id){
  if(!confirm('Hapus?')) return;
  allUpt=allUpt.filter(u=>u.id!==id); saveLocal(); renderAll();
  if(gsheetUrl) try{ await callGAS('deleteUpt',{id}); }catch(e){}
}

// ---------- Users (multi-user) ----------
function renderUsers() {
  if (!isAdmin()) {
    document.getElementById('users-tbody').innerHTML = '<tr><td colspan="5" class="text-center text-slate-400 py-8">Hanya admin</td></tr>';
    return;
  }
  document.getElementById('users-tbody').innerHTML = allUsers.map(u => `<tr>
    <td class="font-semibold">${esc(u.username)}</td>
    <td>${esc(u.nama)}</td>
    <td>${badge(u.role)}</td>
    <td>${badge(u.status||'Aktif')}</td>
    <td>
      <button class="btn btn-ghost btn-sm" onclick="editUser('${u.id}')"><i data-lucide="pencil" class="w-3.5 h-3.5"></i></button>
      <button class="btn btn-ghost btn-sm text-red-500" onclick="deleteUser('${u.id}')"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
    </td>
  </tr>`).join('') || '<tr><td colspan="5" class="text-center text-slate-400 py-8">Belum ada user</td></tr>';
  lucide.createIcons();
}
function openUserModal(item=null) {
  showModal(`
    <h3 class="text-lg font-extrabold mb-4">${item?'Edit':'Tambah'} Pengguna</h3>
    <form class="space-y-3" onsubmit="event.preventDefault();saveUser('${item?item.id:''}')">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div><label class="fl">Username *</label><input class="form-input" id="u-username" required value="${esc(item?.username||'')}" ${item?'readonly':''}></div>
        <div><label class="fl">Nama Lengkap *</label><input class="form-input" id="u-nama" required value="${esc(item?.nama||'')}"></div>
        <div><label class="fl">Password ${item?'(kosongkan jika tidak diubah)':''} *</label><input type="password" class="form-input" id="u-password" ${item?'':'required'} placeholder="${item?'••••••':''}"></div>
        <div><label class="fl">Peran</label><select class="form-input" id="u-role">
          <option value="admin" ${item?.role==='admin'?'selected':''}>Admin</option>
          <option value="operator" ${item?.role==='operator'?'selected':''}>Operator</option>
          <option value="pk" ${item?.role==='pk'?'selected':''}>PK</option>
          <option value="guest" ${item?.role==='guest'?'selected':''}>Guest (view only)</option>
        </select></div>
      </div>
      <div><label class="fl">Status</label><select class="form-input" id="u-status">
        <option ${!item||item.status!=='Nonaktif'?'selected':''}>Aktif</option>
        <option ${item?.status==='Nonaktif'?'selected':''}>Nonaktif</option>
      </select></div>
      <div class="flex justify-end gap-2 pt-2">
        <button type="button" class="btn btn-ghost" onclick="closeModal()">Batal</button>
        <button type="submit" class="btn btn-primary">Simpan</button>
      </div>
    </form>
  `);
}
function editUser(id){ const i=allUsers.find(u=>u.id===id); if(i) openUserModal(i); }
async function saveUser(id){
  const username = document.getElementById('u-username').value.trim();
  const nama = document.getElementById('u-nama').value.trim();
  const password = document.getElementById('u-password').value;
  const role = document.getElementById('u-role').value;
  const status = document.getElementById('u-status').value;
  if (!username || !nama) return toast('Username & nama wajib','error');
  if (!id && !password) return toast('Password wajib untuk user baru','error');
  if (!id && allUsers.some(u => u.username === username)) return toast('Username sudah dipakai','error');

  let obj;
  if (id) {
    const i = allUsers.findIndex(u => u.id === id);
    if (i < 0) return;
    obj = { ...allUsers[i], nama, role, status };
    if (password) obj.password = password;
    allUsers[i] = obj;
  } else {
    obj = { id: uid(), username, password, nama, role, status };
    allUsers.push(obj);
  }
  saveLocal();
  closeModal();
  renderAll();
  toast('User disimpan','success');
  if (gsheetUrl) try { await callGAS('saveUser', { item: obj }); } catch(e){}
}
async function deleteUser(id){
  const u = allUsers.find(x => x.id === id);
  if (u && u.username === session.username) return toast('Tidak bisa hapus akun sendiri','error');
  if (!confirm('Hapus user ini?')) return;
  allUsers = allUsers.filter(u => u.id !== id);
  saveLocal();
  renderAll();
  if (gsheetUrl) try { await callGAS('deleteUser', { id }); } catch(e){}
}

// ---------- Modal & Settings ----------
function showModal(html) {
  document.getElementById('modal-root').innerHTML =
    `<div class="modal-overlay" onclick="if(event.target===this)closeModal()"><div class="modal-box">${html}</div></div>`;
  lucide.createIcons();
}
function closeModal(){ document.getElementById('modal-root').innerHTML=''; }

function openSettingsModal(){
  showModal(`
    <h3 class="text-lg font-extrabold mb-1">Pengaturan</h3>
    <p class="text-xs text-slate-500 mb-4">Hubungkan Google Sheets via Apps Script</p>
    <div class="space-y-3">
      <div>
        <label class="fl">URL Web App (/exec)</label>
        <input class="form-input" id="set-gas" value="${esc(gsheetUrl)}" placeholder="https://script.google.com/macros/s/.../exec">
      </div>
      <div class="flex flex-wrap gap-2">
        <button class="btn btn-primary" onclick="saveSettings()">Simpan URL</button>
        <button class="btn btn-gold" onclick="testConnection()">Uji Koneksi</button>
        <button class="btn btn-ghost" onclick="syncFromSheets(true)">Sinkron</button>
      </div>
      <div id="set-result" class="text-xs text-slate-500"></div>
      <hr class="border-slate-200 dark:border-white/10 my-3">
      <p class="text-xs text-slate-500"><b>Akun default lokal:</b></p>
      <p class="text-xs text-slate-400">admin / admin123 (Admin)</p>
      <p class="text-xs text-slate-400">pk1 / pk123 (PK)</p>
      <p class="text-xs text-slate-400 mt-2">Setelah sinkron, user diambil dari sheet <b>Users</b>.</p>
    </div>
  `);
}
function saveSettings(){
  gsheetUrl = document.getElementById('set-gas').value.trim();
  localStorage.setItem(STORAGE.gas, gsheetUrl);
  toast('URL disimpan','success');
  document.getElementById('set-result').textContent = gsheetUrl ? 'Tersimpan. Uji koneksi atau sinkron.' : 'Mode lokal.';
}
async function testConnection(){
  const el = document.getElementById('set-result');
  el.textContent = 'Menguji…';
  try {
    const data = await callGAS('ping');
    el.innerHTML = `<span class="text-emerald-600 font-semibold">✓ OK</span> — ${esc(data.message||'')}`;
    setSheetStatus(true,'Terhubung');
    toast('Koneksi berhasil','success');
  } catch(e) {
    el.innerHTML = `<span class="text-red-500">✗ ${esc(e.message)}</span>`;
    setSheetStatus(false,'Gagal');
  }
}

function updateTicker(){
  const track = document.getElementById('running-text-track');
  if (!track) return;
  const nTotal = allData.length;
  const nReg = allData.filter(d => d.noRegister).length;
  const nPk = allData.filter(d => d.pk).length;
  const nPkAktif = allPk.filter(p => p.status !== 'Nonaktif').length;
  const nPerm = allData.filter(d => !d.noRegister).length;
  const items = [
    { label: 'TOTAL', val: nTotal },
    { label: 'PERMINTAAN', val: nPerm },
    { label: 'REGISTRASI', val: nReg },
    { label: 'DITUNJUK PK', val: nPk },
    { label: 'PK AKTIF', val: nPkAktif },
  ];
  if (session) items.push({ label: 'OPERATOR', val: session.nama || session.username });
  const html = items.map(t =>
    `<span class="rt-item"><span class="rt-label">${t.label}</span><span class="rt-val">${t.val}</span></span>`
  ).join('');
  // duplicate for seamless loop
  track.innerHTML = html + html;
}

function renderAll(){
  renderDashboard();
  renderPermintaan();
  renderRegistrasi();
  renderPembagian();
  renderStatistik();
  renderPk();
  renderUpt();
  renderUsers();
  updateTicker();
  applyRoleUI();
  lucide.createIcons();
}

// Boot
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  if (session && session.username) enterApp();
  else document.getElementById('login-overlay').style.display = 'flex';
});
