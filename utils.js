// ============================================================
// HELPER FUNCTIONS
// ============================================================

export const uid = () => 'id_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);

export const fmt = (n) => {
  if (n === null || n === undefined) return '₹0';
  const num = Math.round(Number(n));
  return '₹' + num.toLocaleString('en-IN');
};

export const fmtDate = (ts) => {
  if (!ts) return '-';
  const d = new Date(ts);
  return d.getDate().toString().padStart(2,'0') + '-' + (d.getMonth()+1).toString().padStart(2,'0') + '-' + d.getFullYear();
};

export const fmtTime = (ts) => {
  if (!ts) return '-';
  const d = new Date(ts);
  let h = d.getHours(); const m = d.getMinutes().toString().padStart(2,'0');
  const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
  return h + ':' + m + ' ' + ap;
};

export const isToday = (ts) => {
  if (!ts) return false;
  const d = new Date(ts);
  const t = new Date();
  return d.getDate()===t.getDate()&&d.getMonth()===t.getMonth()&&d.getFullYear()===t.getFullYear();
};
