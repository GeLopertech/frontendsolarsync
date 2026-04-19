import GlassCard from '../components/ui/GlassCard';
import StatCard from '../components/ui/StatCard';
import { communityMembers } from '../data/seed';
import { useTrading } from '../hooks/useTrading';
import { useState } from 'react';

export default function Community() {
  const { prices, offers, history, loading, busy, postOffer, buyEnergy } = useTrading();
  const [sellQty,   setSellQty]   = useState('0.5');
  const [sellPrice, setSellPrice] = useState('');
  const [feedback,  setFeedback]  = useState('');

  const doSell = async () => {
    const qty = parseFloat(sellQty);
    const price = parseFloat(sellPrice) || prices?.sellPricePerKwh || 0.15;
    if (!qty || qty <= 0) { setFeedback('Enter a valid quantity.'); return; }
    try {
      await postOffer(qty, price, 1);
      setFeedback(`✅ Listed ${qty} kWh @ ₹${price.toFixed(3)}/kWh`);
      setTimeout(() => setFeedback(''), 4000);
    } catch (err) {
      setFeedback(`❌ ${err.message}`);
    }
  };

  const doBuy = async (offer) => {
    try {
      await buyEnergy(offer.id, offer.quantityKwh);
      setFeedback(`✅ Bought ${offer.quantityKwh} kWh for ₹${(offer.quantityKwh * offer.pricePerKwh).toFixed(2)}`);
      setTimeout(() => setFeedback(''), 4000);
    } catch (err) {
      setFeedback(`❌ ${err.message}`);
    }
  };

  return (
    <div className="p-4 md:p-6 animate-fade-in">
      <div className="mb-5">
        <h2 className="font-outfit font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Sunnyvale Community</h2>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
          P2P energy trading · Live market
        </p>
      </div>

      {/* Stats */}
      <div className="stats-grid grid grid-cols-4 gap-3 mb-5">
        <StatCard label="Buy Price"  icon="📥" value={prices ? (prices.buyPricePerKwh * 100).toFixed(1)  : '—'} unit="¢/kWh" delta="Community rate" accent="elec"   />
        <StatCard label="Sell Price" icon="📤" value={prices ? (prices.sellPricePerKwh * 100).toFixed(1) : '—'} unit="¢/kWh" delta="Your earnings"  accent="neon"   />
        <StatCard label="Grid Rate"  icon="⚡" value={prices ? (prices.gridPricePerKwh * 100).toFixed(1) : '—'} unit="¢/kWh" delta="vs grid"        accent="amber"  />
        <StatCard label="My Trades"  icon="🔄" value={history.length} unit="" delta="Completed" accent="violet" />
      </div>

      {feedback && (
        <div className="mb-4 px-4 py-3 rounded-xl text-xs" style={{
          background: feedback.startsWith('✅') ? 'rgba(57,255,20,0.08)' : 'rgba(255,59,92,0.08)',
          border: `1px solid ${feedback.startsWith('✅') ? 'rgba(57,255,20,0.25)' : 'rgba(255,59,92,0.25)'}`,
          color: feedback.startsWith('✅') ? '#39FF14' : '#FF3B5C',
        }}>{feedback}</div>
      )}

      <div className="community-grid grid gap-4 mb-5" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {/* Members */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <span className="font-outfit font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Members · SOC</span>
            <span className="badge badge-elec">{communityMembers.length} online</span>
          </div>
          <div className="flex flex-col">
            {communityMembers.map((m) => (
              <div key={m.name} className="flex items-center gap-3 py-2.5 border-b last:border-0"
                   style={{ borderColor: 'var(--border-dim)' }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                     style={{ background: m.color + '22', border: `1px solid ${m.color}55`, color: m.color }}>
                  {m.initials}
                </div>
                <span className="flex-1 text-xs" style={{ color: 'var(--text-secondary)' }}>{m.name}</span>
                <span className="font-outfit font-semibold text-xs" style={{ color: m.color, fontFamily: 'JetBrains Mono' }}>
                  {m.soc}%
                </span>
                <div className="w-12 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full" style={{ width: `${m.soc}%`, background: m.color, boxShadow: `0 0 4px ${m.color}` }} />
                </div>
              </div>
            ))}
          </div>
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
                Price/kWh (default: {prices ? `₹${prices.sellPricePerKwh.toFixed(3)}` : '…'})
              </label>
              <input className="form-input text-xs" type="number" min="0.01" step="0.001"
                placeholder={prices ? prices.sellPricePerKwh.toFixed(3) : '0.150'}
                value={sellPrice} onChange={e => setSellPrice(e.target.value)} />
            </div>
            <button className="btn-neon w-full py-2.5 text-xs font-outfit font-semibold"
              onClick={doSell} disabled={busy || loading}>
              {busy ? '⏳ Posting…' : 'Post sell offer →'}
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
        <div className="flex flex-col">
          {offers.length === 0 && !loading && (
            <p className="text-xs py-4 text-center" style={{ color: 'var(--text-muted)' }}>No active offers right now.</p>
          )}
          {offers.map((offer) => (
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
                Buy
              </button>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
