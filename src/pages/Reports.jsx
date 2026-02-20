import { useState } from 'react';
import { getLS, STORAGE_KEYS } from '../storage';
import { fmt, fmtDate, fmtTime } from '../utils';
import { useToast } from '../hooks';
import { Toast } from '../components/Common';

// ============================================================
// REPORTS & EXPORT (OWNER)
// ============================================================
export const Reports = ({ user }) => {
  const [tab, setTab] = useState('daily');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [dateFrom, setDateFrom] = useState(() => { const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().split('T')[0]; });
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const { toast, showToast } = useToast();

  const villages = (getLS(STORAGE_KEYS.VILLAGES) || []).filter(v => v.ownerId === user.id);
  const agents = (getLS(STORAGE_KEYS.AGENTS) || []).filter(a => a.ownerId === user.id);
  const customers = (getLS(STORAGE_KEYS.CUSTOMERS) || []).filter(c => c.ownerId === user.id);
  const sales = (getLS(STORAGE_KEYS.SALES) || []).filter(s => s.ownerId === user.id);
  const payments = (getLS(STORAGE_KEYS.PAYMENTS) || []).filter(p => p.ownerId === user.id);

  // Filter payments by selected date for daily report
  const dailyPayments = payments.filter(p => {
    const d = new Date(p.paymentDate);
    const rd = new Date(reportDate);
    return d.getDate() === rd.getDate() && d.getMonth() === rd.getMonth() && d.getFullYear() === rd.getFullYear();
  });

  // Range-filtered payments
  const rangePayments = payments.filter(p => {
    const d = new Date(p.paymentDate);
    return d >= new Date(dateFrom) && d <= new Date(dateTo + 'T23:59:59');
  });

  // Village-wise for daily
  const dailyByVillage = villages.map(v => {
    const vp = dailyPayments.filter(p => p.villageId === v.id);
    return { ...v, amount: vp.reduce((s, p) => s + p.amountCollected, 0), count: vp.length, uniqueCustomers: [...new Set(vp.map(p => p.customerId))].length };
  }).filter(v => v.count > 0);

  // Agent-wise for daily
  const dailyByAgent = agents.map(a => {
    const ap = dailyPayments.filter(p => p.agentId === a.id);
    return { ...a, amount: ap.reduce((s, p) => s + p.amountCollected, 0), count: ap.length };
  }).filter(a => a.count > 0);

  // Outstanding by village
  const outstandingByVillage = villages.map(v => {
    const vSales = sales.filter(s => s.villageId === v.id);
    const vActive = vSales.filter(s => s.status === 'active');
    return { ...v, totalSales: vSales.reduce((s, sale) => s + sale.productPrice, 0), outstanding: vActive.reduce((s, sale) => s + sale.outstandingAmount, 0), activeSales: vActive.length, customers: [...new Set(vSales.map(s => s.customerId))].length };
  });

  // PDF generation - downloads as HTML file (open in browser to print as PDF)
  const generatePDF = (title, headers, rows, summary = []) => {
    const tableRows = rows.map(row => '<tr>' + row.map(cell => `<td style="padding:8px 10px;border-bottom:1px solid #eee;font-size:13px;">${cell}</td>`).join('') + '</tr>').join('');
    const summaryHTML = summary.map(s => `<div style="display:flex;justify-content:space-between;padding:6px 0;"><span style="color:#666;">${s[0]}</span><span style="font-weight:700;color:#333;">${s[1]}</span></div>`).join('');
    const html = `<!DOCTYPE html><html><head><title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 30px; color: #333; max-width: 800px; margin: 0 auto; }
        h1 { font-size: 22px; margin-bottom: 4px; color: #1a1a2e; }
        .subtitle { color: #666; font-size: 13px; margin-bottom: 20px; }
        .summary-box { background: #f0f4ff; border-radius: 10px; padding: 16px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #1a1a2e; color: #fff; padding: 10px; text-align: left; font-size: 12px; text-transform: uppercase; letterSpacing: 0.5px; }
        td { padding: 8px 10px; border-bottom: 1px solid #eee; font-size: 13px; }
        .footer { margin-top: 30px; text-align: center; color: #999; font-size: 12px; }
        .print-btn { background: #1a1a2e; color: #fff; border: none; padding: 10px 24px; border-radius: 6px; font-size: 15px; cursor: pointer; margin-bottom: 20px; }
        .print-btn:hover { background: #2a2a4e; }
        @media print { .print-btn { display: none; } body { padding: 0; } }
      </style></head><body>
        <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
        <h1>🏘️ Village EMI Manager</h1>
        <div class="subtitle">${title} &nbsp;|&nbsp; Generated: ${new Date().toLocaleString()}</div>
        ${summary.length ? `<div class="summary-box">${summaryHTML}</div>` : ''}
        <table><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${tableRows}</tbody></table>
        <div class="footer">Village EMI Manager &nbsp;|&nbsp; ${new Date().toLocaleDateString()}</div>
      </body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('PDF file downloaded! Open it and click Print → Save as PDF');
  };

  // Excel export - downloads as CSV (opens directly in Excel)
  const exportExcel = (title, headers, rows) => {
    const esc = (v) => {
      const s = String(v);
      if (s.indexOf(',') > -1 || s.indexOf('"') > -1) return '"' + s.split('"').join('""') + '"';
      return s;
    };
    const allRows = [headers].concat(rows);
    const csv = allRows.map(function(row) { return row.map(esc).join(','); }).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = title.split(' ').join('_') + '_' + new Date().toISOString().split('T')[0] + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Excel file downloaded!');
  };

  // Daily report data
  const dailyHeaders = ['Village', 'Customers', 'Payments', 'Total Amount'];
  const dailyRows = dailyByVillage.map(v => [v.villageName, v.uniqueCustomers, v.count, fmt(v.amount)]);

  const dailyDetailHeaders = ['Time', 'Village', 'Customer ID', 'Customer Name', 'Agent', 'Amount'];
  const dailyDetailRows = dailyPayments.map(p => {
    const v = villages.find(vi => vi.id === p.villageId);
    const c = customers.find(ci => ci.id === p.customerId);
    const a = agents.find(ai => ai.id === p.agentId);
    return [fmtTime(p.paymentDate), v?.villageName || '-', c?.customerNumber || '-', c?.customerName || '-', p.agentId === 'owner' ? 'Owner' : (a?.agentName || '-'), fmt(p.amountCollected)];
  });

  return (
    <div>
      <Toast toast={toast} />
      <div className="page-header"><div><h2>Reports</h2><p>View and export collection reports</p></div></div>
      <div className="report-tabs">
        {['daily', 'outstanding', 'agents', 'sales'].map(t => (
          <div key={t} className={`report-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t === 'daily' ? '📅 Daily' : t === 'outstanding' ? '💰 Outstanding' : t === 'agents' ? '🚶 Agents' : '📊 Sales'}</div>
        ))}
      </div>

      {/* DAILY REPORT */}
      {tab === 'daily' && (
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <label className="input-label" style={{ margin: 0, minWidth: 40 }}>Date:</label>
              <input className="input" type="date" value={reportDate} onChange={e => setReportDate(e.target.value)} style={{ width: 180 }} />
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                <button className="btn btn-outline btn-sm" onClick={() => generatePDF('Daily Collection Report - ' + reportDate, dailyDetailHeaders, dailyDetailRows, [['Date', reportDate], ['Total Collected', fmt(dailyPayments.reduce((s,p)=>s+p.amountCollected,0))], ['Total Payments', dailyPayments.length]])}>📄 PDF</button>
                <button className="btn btn-outline btn-sm" onClick={() => exportExcel('Daily_Collection_' + reportDate, dailyDetailHeaders, dailyDetailRows)}>📊 Excel</button>
              </div>
            </div>
          </div>

          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="stat-card blue"><div className="stat-label">Total Collected</div><div className="stat-value">{fmt(dailyPayments.reduce((s,p)=>s+p.amountCollected,0))}</div><div className="stat-sub">{dailyPayments.length} payments</div></div>
            <div className="stat-card green"><div className="stat-label">Villages Active</div><div className="stat-value">{dailyByVillage.length}</div><div className="stat-sub">of {villages.length} total</div></div>
            <div className="stat-card amber"><div className="stat-label">Agents Active</div><div className="stat-value">{dailyByAgent.length}</div><div className="stat-sub">of {agents.length} total</div></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            <div className="card">
              <div className="card-header"><div className="card-title">By Village</div></div>
              {dailyByVillage.length === 0 ? <p className="table-empty">No collections on this date</p> : (
                <div className="table-wrap"><table>
                  <thead><tr><th>Village</th><th>Customers</th><th>Payments</th><th>Amount</th></tr></thead>
                  <tbody>{dailyByVillage.map(v => (<tr key={v.id}><td style={{ fontWeight: 600, color: '#e2e8f0' }}>{v.villageName}</td><td>{v.uniqueCustomers}</td><td>{v.count}</td><td style={{ color: '#4ade80', fontWeight: 700 }}>{fmt(v.amount)}</td></tr>))}</tbody>
                </table></div>
              )}
            </div>
            <div className="card">
              <div className="card-header"><div className="card-title">By Agent</div></div>
              {dailyByAgent.length === 0 ? <p className="table-empty">No agent activity</p> : (
                <div className="table-wrap"><table>
                  <thead><tr><th>Agent</th><th>Collections</th><th>Amount</th></tr></thead>
                  <tbody>{dailyByAgent.map(a => (<tr key={a.id}><td style={{ fontWeight: 600, color: '#e2e8f0' }}>{a.agentName}</td><td>{a.count}</td><td style={{ color: '#4ade80', fontWeight: 700 }}>{fmt(a.amount)}</td></tr>))}</tbody>
                </table></div>
              )}
            </div>
          </div>

          <div className="card" style={{ marginTop: 16 }}>
            <div className="card-header"><div className="card-title">Detailed Transactions</div></div>
            {dailyPayments.length === 0 ? <p className="table-empty">No transactions</p> : (
              <div className="table-wrap"><table>
                <thead><tr><th>Time</th><th>Village</th><th>Customer</th><th>Agent</th><th>Amount</th></tr></thead>
                <tbody>{dailyPayments.map(p => {
                  const v = villages.find(vi => vi.id === p.villageId);
                  const c = customers.find(ci => ci.id === p.customerId);
                  const a = agents.find(ai => ai.id === p.agentId);
                  return (<tr key={p.id}><td>{fmtTime(p.paymentDate)}</td><td>{v?.villageName}</td><td>{c ? `${c.customerNumber} - ${c.customerName}` : '-'}</td><td>{p.agentId==='owner'?'Owner':(a?.agentName||'-')}</td><td style={{ color: '#4ade80', fontWeight: 700 }}>{fmt(p.amountCollected)}</td></tr>);
                })}</tbody>
              </table></div>
            )}
          </div>
        </div>
      )}

      {/* OUTSTANDING REPORT */}
      {tab === 'outstanding' && (
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="btn btn-outline btn-sm" onClick={() => {
                const h = ['Village', 'Customers', 'Active Sales', 'Total Sales Value', 'Outstanding'];
                const r = outstandingByVillage.map(v => [v.villageName, v.customers, v.activeSales, fmt(v.totalSales), fmt(v.outstanding)]);
                generatePDF('Outstanding Report', h, r, [['Total Outstanding', fmt(outstandingByVillage.reduce((s,v)=>s+v.outstanding,0))], ['Active Sales', outstandingByVillage.reduce((s,v)=>s+v.activeSales,0)]]);
              }}>📄 PDF</button>
              <button className="btn btn-outline btn-sm" onClick={() => {
                const h = ['Village', 'Customers', 'Active Sales', 'Total Sales Value', 'Outstanding'];
                const r = outstandingByVillage.map(v => [v.villageName, v.customers, v.activeSales, fmt(v.totalSales), fmt(v.outstanding)]);
                exportExcel('Outstanding_Report', h, r);
              }}>📊 Excel</button>
            </div>
          </div>
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="stat-card red"><div className="stat-label">Total Outstanding</div><div className="stat-value">{fmt(outstandingByVillage.reduce((s,v)=>s+v.outstanding,0))}</div><div className="stat-sub">{sales.filter(s=>s.status==='active').length} active sales</div></div>
            <div className="stat-card green"><div className="stat-label">Total Collected</div><div className="stat-value">{fmt(payments.reduce((s,p)=>s+p.amountCollected,0))}</div><div className="stat-sub">{payments.length} payments</div></div>
            <div className="stat-card blue"><div className="stat-label">Completed Sales</div><div className="stat-value">{sales.filter(s=>s.status==='completed').length}</div><div className="stat-sub">of {sales.length} total</div></div>
          </div>
          <div className="card">
            <div className="card-header"><div className="card-title">Village-wise Outstanding</div></div>
            <div className="table-wrap"><table>
              <thead><tr><th>Village</th><th>Customers</th><th>Active Sales</th><th>Total Sales</th><th>Outstanding</th><th>Progress</th></tr></thead>
              <tbody>{outstandingByVillage.map(v => {
                const pct = v.totalSales > 0 ? Math.round(((v.totalSales - v.outstanding) / v.totalSales) * 100) : 100;
                return (<tr key={v.id}><td style={{ fontWeight: 600, color: '#e2e8f0' }}>{v.villageName}</td><td>{v.customers}</td><td>{v.activeSales}</td><td>{fmt(v.totalSales)}</td><td style={{ color: v.outstanding > 0 ? '#f59e0b' : '#4ade80', fontWeight: 700 }}>{fmt(v.outstanding)}</td><td style={{ minWidth: 100 }}><div className="progress-wrap"><div className="progress-bar green" style={{ width: pct + '%' }}></div></div><span style={{ fontSize: 11, color: '#64748b' }}>{pct}% collected</span></td></tr>);
              })}</tbody>
            </table></div>
          </div>
        </div>
      )}

      {/* AGENT REPORT */}
      {tab === 'agents' && (
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <label className="input-label" style={{ margin: 0 }}>From:</label>
              <input className="input" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ width: 160 }} />
              <label className="input-label" style={{ margin: 0 }}>To:</label>
              <input className="input" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ width: 160 }} />
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                <button className="btn btn-outline btn-sm" onClick={() => {
                  const h = ['Agent', 'Villages', 'Collections', 'Amount'];
                  const r = agents.map(a => {
                    const ap = rangePayments.filter(p => p.agentId === a.id);
                    const vids = [...new Set(ap.map(p => p.villageId))];
                    return [a.agentName, vids.map(vid => villages.find(v=>v.id===vid)?.villageName).filter(Boolean).join(', '), ap.length, fmt(ap.reduce((s,p)=>s+p.amountCollected,0))];
                  });
                  generatePDF('Agent Performance Report', h, r);
                }}>📄 PDF</button>
                <button className="btn btn-outline btn-sm" onClick={() => {
                  const h = ['Agent', 'Villages', 'Collections', 'Amount'];
                  const r = agents.map(a => {
                    const ap = rangePayments.filter(p => p.agentId === a.id);
                    const vids = [...new Set(ap.map(p => p.villageId))];
                    return [a.agentName, vids.map(vid => villages.find(v=>v.id===vid)?.villageName).filter(Boolean).join(', '), ap.length, fmt(ap.reduce((s,p)=>s+p.amountCollected,0))];
                  });
                  exportExcel('Agent_Performance', h, r);
                }}>📊 Excel</button>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><div className="card-title">Agent Performance</div></div>
            <div className="table-wrap"><table>
              <thead><tr><th>Agent</th><th>Assigned Villages</th><th>Collections</th><th>Customers</th><th>Amount</th></tr></thead>
              <tbody>{agents.map(a => {
                const ap = rangePayments.filter(p => p.agentId === a.id);
                return (<tr key={a.id}><td style={{ fontWeight: 600, color: '#e2e8f0' }}>{a.agentName}</td><td><div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{a.assignedVillages.map(vid => { const v = villages.find(vi=>vi.id===vid); return v ? <span key={vid} className="badge badge-active">{v.villageName}</span> : null; })}</div></td><td>{ap.length}</td><td>{[...new Set(ap.map(p=>p.customerId))].length}</td><td style={{ color: '#4ade80', fontWeight: 700 }}>{fmt(ap.reduce((s,p)=>s+p.amountCollected,0))}</td></tr>);
              })}</tbody>
            </table></div>
          </div>
        </div>
      )}

      {/* SALES REPORT */}
      {tab === 'sales' && (
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="btn btn-outline btn-sm" onClick={() => {
                const h = ['Village', 'Customer ID', 'Customer Name', 'Product', 'Price', 'Advance', 'Outstanding', 'Status', 'Date'];
                const r = sales.map(s => {
                  const c = customers.find(ci => ci.id === s.customerId);
                  const v = villages.find(vi => vi.id === s.villageId);
                  return [v?.villageName||'-', c?.customerNumber||'-', c?.customerName||'-', s.productName, fmt(s.productPrice), fmt(s.advanceAmount), fmt(s.outstandingAmount), s.status, fmtDate(s.saleDate)];
                });
                generatePDF('Sales Report', h, r, [['Total Sales', sales.length], ['Active', sales.filter(s=>s.status==='active').length], ['Completed', sales.filter(s=>s.status==='completed').length], ['Total Value', fmt(sales.reduce((sum,s)=>sum+s.productPrice,0))]]);
              }}>📄 PDF</button>
              <button className="btn btn-outline btn-sm" onClick={() => {
                const h = ['Village', 'Customer ID', 'Customer Name', 'Product', 'Price', 'Advance', 'Outstanding', 'Status', 'Date'];
                const r = sales.map(s => {
                  const c = customers.find(ci => ci.id === s.customerId);
                  const v = villages.find(vi => vi.id === s.villageId);
                  return [v?.villageName||'-', c?.customerNumber||'-', c?.customerName||'-', s.productName, fmt(s.productPrice), fmt(s.advanceAmount), fmt(s.outstandingAmount), s.status, fmtDate(s.saleDate)];
                });
                exportExcel('Sales_Report', h, r);
              }}>📊 Excel</button>
            </div>
          </div>
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
            <div className="stat-card blue"><div className="stat-label">Total Sales</div><div className="stat-value">{sales.length}</div></div>
            <div className="stat-card green"><div className="stat-label">Total Value</div><div className="stat-value">{fmt(sales.reduce((s,sale)=>s+sale.productPrice,0))}</div></div>
            <div className="stat-card amber"><div className="stat-label">Active</div><div className="stat-value">{sales.filter(s=>s.status==='active').length}</div></div>
            <div className="stat-card red"><div className="stat-label">Completed</div><div className="stat-value">{sales.filter(s=>s.status==='completed').length}</div></div>
          </div>
          <div className="card">
            <div className="table-wrap"><table>
              <thead><tr><th>Village</th><th>Cust ID</th><th>Customer</th><th>Product</th><th>Price</th><th>Advance</th><th>Outstanding</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>{sales.map(s => {
                const c = customers.find(ci => ci.id === s.customerId);
                const v = villages.find(vi => vi.id === s.villageId);
                return (<tr key={s.id}><td style={{ color: '#a78bfa' }}>{v?.villageName}</td><td style={{ fontWeight: 600 }}>{c?.customerNumber}</td><td style={{ fontWeight: 600, color: '#e2e8f0' }}>{c?.customerName}</td><td>{s.productName}</td><td>{fmt(s.productPrice)}</td><td style={{ color: '#4ade80' }}>{fmt(s.advanceAmount)}</td><td style={{ color: s.outstandingAmount > 0 ? '#f59e0b' : '#4ade80', fontWeight: 700 }}>{fmt(s.outstandingAmount)}</td><td><span className={`badge ${s.status==='active'?'badge-active':'badge-completed'}`}>{s.status}</span></td><td style={{ color: '#64748b' }}>{fmtDate(s.saleDate)}</td></tr>);
              })}</tbody>
            </table></div>
          </div>
        </div>
      )}
    </div>
  );
};
