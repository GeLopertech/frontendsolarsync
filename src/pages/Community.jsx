import { useState } from 'react';
import GlassCard from '../components/ui/GlassCard';
import StatCard from '../components/ui/StatCard';
import { communityMembers } from '../data/seed';
import { useTrading } from '../hooks/useTrading';

// ── Bill receipt component ────────────────────────────────────────────────────
function TradeBill({ bill, onClose }) {
  if (!bill) return null;
  const printBill = () => {
    const w = window.open('', '_blank');
    w.document.write(`
      <html><head><title>SolarSync Trade Receipt</title>
      <style>
        body { font-family: 'Courier New', monospace; max-width: 400px; margin: 40px auto; background:#fff; color:#000; }
        h2 { text-align:center; } .row { display:flex; justify-content:space-between; margin:6px 0; }
        .divider { border-top: 1px dashed #ccc; margin: 12px 0; }
        .total { font-weight:bold; font-size:1.1em; } .footer { text-align:center; margin-top:20px; color:#666; font-size:0.8em; }
      </style></head>
      <body>
        <h2>☀️ SolarSync AI</h2>
        <h3 style="text-align:center">Energy Trade Receipt</h3>
        <div class="divider"></div>
        <div class="row"><span>Transaction ID</span><span>#${bill.id.slice(0,8).toUpperCase()}</span></div>
        <div class="row"><span>Type</span><span>${bill.type === 'buy' ? '📥 Purchase' : '📤 Sale'}</span></div>
        <div class="row"><span>Quantity</span><span>${bill.quantityKwh} kWh</span></div>
        <div class="row"><span>Rate</span><span>₹${bill.pricePerKwh.toFixed(4)}/kWh</span></div>
        <div class="divider"></div>
        <div class="row total"><span>Total ${bill.type === 'buy' ? 'Paid' : 'Earned'}</span><span>₹${bill.totalCost.toFixed(2)}</span></div>
        <div class="divider"></div>
        <div class="row"><span>Date</span><span>${new Date(bill.completedAt).toLocaleString()}</span></div>
        <div class="footer">Powered by SolarSync AI · Green Energy Trading</div>
      </body></html>
    `);
    w.document.close();
    w.print();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div className="glass-neon rounded-2xl p-6 w-full max-w-sm animate-fade-in">
        <div className="text-center mb-5">
          <div style={{ fontSize: 40 }}>{bill.type === 'buy' ? '📥' : '📤'}</div>
          <div className="font-outfit font-bold text-lg mt-2" style={{ color: '#39FF14' }}>
            Trade {bill.type === 'buy' ? 'Complete!' : 'Posted!'}
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
            #{bill.id.slice(0, 8).toUpperCase()}
          </div>
        </div>

        <div className="flex flex-col gap-2 mb-5 p-4 rounded-xl"
             style={{ background: 'rgba(57,255,20,0.04)', border: '1px dashed rgba(57,255,20,0.2)' }}>
          {[
            ['Type',     bill.type === 'buy' ? '📥 Energy Purchase' : '📤 Energy Sale'],
            ['Quantity', `${bill.quantityKwh} kWh`],
            ['Rate',     `₹${bill.pricePerKwh.toFixed(4)}/kWh`],
            ['Date',     new Date(bill.completedAt).toLocaleTimeString()],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between text-xs">
              <span style={{ color: 'var(--text-muted)' }}>{k}</span>
              <span style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono' }}>{v}</span>
            </div>
          ))}
          <div className="flex justify-between text-sm font-bold pt-2 mt-1 border-t"
               style={{ borderColor: 'rgba(57,255,20,0.2)' }}>
            <span style={{ color: 'var(--text-primary)' }}>
              Total {bill.type === 'buy' ? 'Paid' : 'Earned'}
            </span>
            <span style={{ color: '#39FF14', textShadow: '0 0 8px rgba(57,255,20,0.5)' }}>
              ₹{bill.totalCost.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="btn-neon flex-1 py-2.5 text-xs font-outfit font-semibold" onClick={printBill}>
            🖨️ Print Receipt
          </button>
          <button onClick={onClose}
            style={{ flex: 1, padding: '10px', borderRadius: 10, background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border-dim)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Community page ───────────────────────────────────────────────────────
export default function Community() {
  const { prices, offers, history, loading, busy, postOffer, buyEnergy } = useTrading();
  const [sellQty,   setSellQty]   = useState('0.5');
  const [sellPrice, setSellPrice] = useState('');
  const [error,     setError]     = useState('');
  const [bill,      setBill]      = useState(null);

  const doSell = async () => {
    const qty   = parseFloat(sellQty);
    const price = parseFloat(sellPrice) || prices?.sellPricePerKwh || 0.15;
    if (!qty || qty <= 0) { setError('Enter valid quantity.'); return; }
    setError('');
    try {
      const res = await postOffer(qty, price, 1);
      setBill({ ...res.data, type: 'sell', totalCost: qty * price, completedAt: new Date().toISOString() });
    } catch (err) { setError(err.message); }
  };

  const doBuy = async (offer) => {
    setError('');
    try {
      const res = await buyEnergy(offer.id, offer.quantityKwh);
      setBill({ ...res.data, type: 'buy' });
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="p-4 md:p-6 animate-fade-in">
      {bill && <TradeBill bill={bill} onClose={() => setBill(null)} />}

      <div className="mb-5">
        <h2 className="font-outfit font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
          {/* We import useCommunity and use it here... Wait, Community.jsx doesn't have useCommunity imported by default. I will just call it "Energy Community" to be safe without changing imports if it doesn't exist, but wait I can check if it is imported. It is not. I will change it to "Local Community". */}
          Local Community
        </h2>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>P2P energy trading · Live market</p>
      </div>

      <div className="stats-grid grid grid-cols-4 gap-3 mb-5">
        <StatCard label="Buy Price"  icon="📥" value={prices ? (prices.buyPricePerKwh * 100).toFixed(1)  : '—'} unit="¢/kWh" delta="Community rate" accent="elec"   />
        <StatCard label="Sell Price" icon="📤" value={prices ? (prices.sellPricePerKwh * 100).toFixed(1) : '—'} unit="¢/kWh" delta="Your earnings"  accent="neon"   />
        <StatCard label="Grid Rate"  icon="⚡" value={prices ? (prices.gridPricePerKwh * 100).toFixed(1) : '—'} unit="¢/kWh" delta="vs grid"        accent="amber"  />
        <StatCard label="My Trades"  icon="🔄" value={history.length} unit="" delta="Completed"          accent="violet" />
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl text-xs"
             style={{ background: 'rgba(255,59,92,0.08)', border: '1px solid rgba(255,59,92,0.25)', color: '#FF3B5C' }}>
          {error}
        </div>
      )}

      <div className="community-grid grid gap-4 mb-5" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {/* Members */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <span className="font-outfit font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Members · SOC</span>
            <span className="badge badge-elec">{communityMembers.length} online</span>
          </div>
          {communityMembers.map(m => (
            <div key={m.name} className="flex items-center gap-3 py-2.5 border-b last:border-0"
                 style={{ borderColor: 'var(--border-dim)' }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                   style={{ background: m.color + '22', border: `1px solid ${m.color}55`, color: m.color }}>
                {m.initials}
              </div>
              <span className="flex-1 text-xs" style={{ color: 'var(--text-secondary)' }}>{m.name}</span>
              <span className="font-outfit font-semibold text-xs" style={{ color: m.color, fontFamily: 'JetBrains Mono' }}>{m.soc}%</span>
              <div className="w-12 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="h-full rounded-full" style={{ width: `${m.soc}%`, background: m.color }} />
              </div>
            </div>
          ))}
        </GlassCard>

        {/* Sell surplus */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <span className="font-outfit font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Sell Surplus</span>
            <span className="badge badge-neon">Live Market</span>
          </div>
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Quantity (kWh)</label>
              <input className="form-input text-xs" type="number" min="0.1" step="0.1"
                value={sellQty} onChange={e => setSellQty(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                Price/kWh {prices ? `(market: ₹${prices.sellPricePerKwh.toFixed(3)})` : ''}
              </label>
              <input className="form-input text-xs" type="number" min="0.01" step="0.001"
                placeholder={prices ? prices.sellPricePerKwh.toFixed(3) : '0.150'}
                value={sellPrice} onChange={e => setSellPrice(e.target.value)} />
            </div>
            <button className="btn-neon w-full py-2.5 text-xs font-outfit font-semibold"
              onClick={doSell} disabled={busy || loading}>
              {busy ? '⏳ Posting…' : '📤 Post sell offer →'}
            </button>
          </div>
        </GlassCard>
      </div>

      {/* Live offers */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <span className="font-outfit font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
            Live Offers {loading && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(loading…)</span>}
          </span>
          <span className="badge badge-amber">{offers.length} available</span>
        </div>
        {offers.length === 0 && !loading && (
          <p className="text-xs py-4 text-center" style={{ color: 'var(--text-muted)' }}>No active offers right now.</p>
        )}
        {offers.map(offer => (
          <div key={offer.id} className="flex items-center gap-3 py-3 border-b last:border-0 text-xs"
               style={{ borderColor: 'var(--border-dim)' }}>
            <div className="flex-1">
              <div style={{ color: 'var(--text-secondary)' }}>{offer.sellerName}</div>
              <div style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', marginTop: 2 }}>
                {offer.quantityKwh} kWh · expires {new Date(offer.expiresAt).toLocaleTimeString()}
              </div>
            </div>
            <div style={{ color: '#39FF14', fontFamily: 'JetBrains Mono', fontWeight: 600 }}>
              ₹{offer.pricePerKwh.toFixed(3)}/kWh
            </div>
            <button className="btn-elec py-1.5 px-3 text-xs font-outfit"
              onClick={() => doBuy(offer)} disabled={busy}>
              📥 Buy
            </button>
          </div>
        ))}
      </GlassCard>

      {/* Trade history */}
      {history.length > 0 && (
        <GlassCard className="mt-4">
          <div className="font-outfit font-bold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>My Trade History</div>
          {history.slice(0, 5).map(t => (
            <div key={t.id} className="flex items-center gap-3 py-2.5 border-b last:border-0 text-xs"
                 style={{ borderColor: 'var(--border-dim)' }}>
              <span style={{ color: t.buyerId === t.sellerId ? '#F59E0B' : '#39FF14' }}>
                {t.buyerId ? '📥' : '📤'}
              </span>
              <span className="flex-1" style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono' }}>
                {t.quantityKwh} kWh @ ₹{t.pricePerKwh.toFixed(3)}
              </span>
              <span style={{ color: '#39FF14', fontFamily: 'JetBrains Mono', fontWeight: 600 }}>
                ₹{t.totalCost.toFixed(2)}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>
                {new Date(t.completedAt).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </GlassCard>
      )}
    </div>
  );
}
