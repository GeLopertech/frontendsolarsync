// ── Existing exports (unchanged) ──────────────────────────────────────────────
export const solarData16 = [0, 0, 0.1, 0.8, 2.2, 3.5, 4.1, 3.8, 2.9, 1.8, 0.9, 0.4, 0.2, 0, 0, 0];
export const consData16 = [0.3, 0.2, 0.2, 0.3, 0.9, 1.2, 1.1, 0.8, 0.7, 0.9, 1.4, 1.2, 0.6, 0.4, 0.3, 0.3];
export const gridData16 = [0.3, 0.2, 0.1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.4, 0.3, 0.3];

const labels8 = ['12am', '3am', '6am', '9am', '12pm', '3pm', '6pm', '9pm'];
export const chartData = labels8.map((time, i) => ({
  time,
  solar: solarData16[i * 2],
  consumption: consData16[i * 2],
  grid: gridData16[i * 2],
  soc: [20, 18, 15, 22, 45, 62, 74, 80][i],
}));

export const forecastDays = [
  { day: 'Mon', icon: '⛅', kwh: 7.2, cloud: 32, today: true },
  { day: 'Tue', icon: '☀️', kwh: 9.1, cloud: 15, today: false },
  { day: 'Wed', icon: '🌧️', kwh: 4.3, cloud: 82, today: false },
  { day: 'Thu', icon: '🌤️', kwh: 8.8, cloud: 28, today: false },
  { day: 'Fri', icon: '☀️', kwh: 9.6, cloud: 12, today: false },
  { day: 'Sat', icon: '⛅', kwh: 6.1, cloud: 45, today: false },
  { day: 'Sun', icon: '🌤️', kwh: 7.4, cloud: 38, today: false },
];

export const appliances = [
  { id: 0, name: 'EV Charger', icon: '🚗', watts: 7200, scheduled: 10, flex: true, on: true },
  { id: 1, name: 'Washing Machine', icon: '👕', watts: 1000, scheduled: 11, flex: true, on: true },
  { id: 2, name: 'Dishwasher', icon: '🍽️', watts: 1200, scheduled: 12, flex: true, on: false },
  { id: 3, name: 'Air Conditioner', icon: '❄️', watts: 2000, scheduled: null, flex: false, on: true },
];

export const communityMembers = [
  { name: 'Alex Johnson (You)', initials: 'AJ', color: '#39FF14', soc: 74 },
  { name: 'Maria Chen', initials: 'MC', color: '#00F0FF', soc: 61 },
  { name: 'James Park', initials: 'JP', color: '#8B5CF6', soc: 88 },
  { name: 'Priya Sharma', initials: 'PS', color: '#F59E0B', soc: 42 },
  { name: 'Tom Wright', initials: 'TW', color: '#FF3B5C', soc: 55 },
];

export const trades = [
  { from: 'James P.', to: 'Priya S.', kwh: 1.2, price: '₹28' },
  { from: 'Alex J.', to: 'Tom W.', kwh: 0.8, price: '₹19' },
  { from: 'Maria C.', to: 'Community', kwh: 2.0, price: '₹46' },
];

export const insights = [
  {
    icon: '💡', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)',
    title: 'Shift dishwasher to 12pm',
    body: 'Your solar peaks 11am–2pm. Running the dishwasher (1.2 kW) then saves ₹14 and avoids grid import.'
  },
  {
    icon: '🔋', bg: 'rgba(0,240,255,0.08)', border: 'rgba(0,240,255,0.2)',
    title: 'Battery at optimal range',
    body: 'SOC at 74% is ideal. Full charge by 3pm enables ~1.8 kWh export to the community grid.'
  },
  {
    icon: '🌤️', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.25)',
    title: 'Cloudy tomorrow (82%)',
    body: 'Heavy cloud forecast. Charge battery fully today and minimise consumption tonight.'
  },
  {
    icon: '📈', bg: 'rgba(57,255,20,0.08)', border: 'rgba(57,255,20,0.2)',
    title: 'Score trending up',
    body: 'Your 7-day average is 88, up from 79 last week. Top 12% of your community this month.'
  },
];

// ── Communities with energy profiles ─────────────────────────────────────────
// Each community has solar capacity, avg domestic grid usage, EB tariff slab
export const communities = [
  {
    value: 'porur',
    label: '☀️ Porur',
    members: 12,
    // Solar profile
    solarPanels: 24,
    panelWatts: 400,
    batteryKwh: 13.5,
    // Domestic grid profile (monthly kWh consumed from EB)
    monthlyGridKwh: 180,
    // EB tariff — Tamil Nadu TANGEDCO slabs (₹/kWh)
    tariffSlabs: [
      { upTo: 100, rate: 0.00 },  // First 100 units free
      { upTo: 200, rate: 1.50 },
      { upTo: 500, rate: 3.00 },
      { upTo: 1000, rate: 4.50 },
      { upTo: Infinity, rate: 6.00 },
    ],
    fixedCharge: 30,   // ₹/month
    location: 'Chennai, Tamil Nadu',
    gridType: 'TANGEDCO',
  },
  {
    value: 'iyyappanthagal',
    label: '🌿 Iyyappanthagal',
    members: 8,
    solarPanels: 18,
    panelWatts: 380,
    batteryKwh: 10,
    monthlyGridKwh: 220,
    tariffSlabs: [
      { upTo: 100, rate: 0.00 },
      { upTo: 200, rate: 1.50 },
      { upTo: 500, rate: 3.00 },
      { upTo: 1000, rate: 4.50 },
      { upTo: Infinity, rate: 6.00 },
    ],
    fixedCharge: 30,
    location: 'Coimbatore, Tamil Nadu',
    gridType: 'TANGEDCO',
  },
  {
    value: 'kattupakkam',
    label: '⚡ Kattupakkam',
    members: 21,
    solarPanels: 32,
    panelWatts: 450,
    batteryKwh: 20,
    monthlyGridKwh: 120,
    tariffSlabs: [
      { upTo: 100, rate: 0.00 },
      { upTo: 200, rate: 1.50 },
      { upTo: 500, rate: 3.00 },
      { upTo: 1000, rate: 4.50 },
      { upTo: Infinity, rate: 6.00 },
    ],
    fixedCharge: 30,
    location: 'Madurai, Tamil Nadu',
    gridType: 'TANGEDCO',
  },
  {
    value: 'poonamalle',
    label: '🏘️ Poonamalle',
    members: 6,
    solarPanels: 12,
    panelWatts: 350,
    batteryKwh: 7,
    monthlyGridKwh: 260,
    tariffSlabs: [
      { upTo: 100, rate: 0.00 },
      { upTo: 200, rate: 1.50 },
      { upTo: 500, rate: 3.00 },
      { upTo: 1000, rate: 4.50 },
      { upTo: Infinity, rate: 6.00 },
    ],
    fixedCharge: 30,
    location: 'Trichy, Tamil Nadu',
    gridType: 'TANGEDCO',
  },
  {
    value: 'thirumazhisai',
    label: '🔆 Thirumazhisai',
    members: 15,
    solarPanels: 28,
    panelWatts: 400,
    batteryKwh: 15,
    monthlyGridKwh: 150,
    tariffSlabs: [
      { upTo: 100, rate: 0.00 },
      { upTo: 200, rate: 1.50 },
      { upTo: 500, rate: 3.00 },
      { upTo: 1000, rate: 4.50 },
      { upTo: Infinity, rate: 6.00 },
    ],
    fixedCharge: 30,
    location: 'Salem, Tamil Nadu',
    gridType: 'TANGEDCO',
  },
];

// ── EB Bill calculator helper ─────────────────────────────────────────────────
export function calcEBBill(units, slabs, fixedCharge = 30) {
  let bill = fixedCharge;
  let remaining = units;
  let prev = 0;
  for (const slab of slabs) {
    const inSlab = Math.min(remaining, slab.upTo - prev);
    if (inSlab <= 0) break;
    bill += inSlab * slab.rate;
    remaining -= inSlab;
    prev = slab.upTo;
    if (remaining <= 0) break;
  }
  return parseFloat(bill.toFixed(2));
}

// ── Energy saving tips ────────────────────────────────────────────────────────
export const energySavingTips = [
  { icon: '❄️', title: 'AC at 24°C saves 6%', body: 'Each degree above 18°C saves ~6% electricity. Set to 24°C for comfort and savings.', saving: '₹180/month' },
  { icon: '💡', title: 'Switch to LED bulbs', body: 'LED bulbs use 75% less energy than incandescent. Replace all bulbs to cut lighting costs.', saving: '₹120/month' },
  { icon: '🌞', title: 'Run heavy loads at noon', body: 'Solar peaks 10am–2pm. Run washing machine, dishwasher, and EV charger then.', saving: '₹200/month' },
  { icon: '🔌', title: 'Unplug standby devices', body: 'Standby power accounts for 10% of your bill. Unplug chargers and TVs when not in use.', saving: '₹80/month' },
  { icon: '🔋', title: 'Use battery at peak hours', body: '6pm–10pm is peak EB pricing. Discharge battery then to avoid expensive grid units.', saving: '₹250/month' },
  { icon: '🌀', title: 'Full loads only', body: 'Run washing machine and dishwasher only when full. Saves water heating and motor energy.', saving: '₹60/month' },
  { icon: '🌡️', title: 'Water heater timer', body: 'Set water heater to run 30 min before use, not all day. Saves 2–3 kWh daily.', saving: '₹150/month' },
  { icon: '🏠', title: 'Seal windows and doors', body: 'Air leaks make AC work harder. Sealing gaps reduces AC load by up to 20%.', saving: '₹300/month' },
];
// ── Weekly Community rates (last 7 days) ──────────────────────────────────────
export const weeklyCommunityRates = [
  { day: 'Wed', avgRate: 0.145, status: 'stable' },
  { day: 'Thu', avgRate: 0.162, status: 'up' },
  { day: 'Fri', avgRate: 0.138, status: 'down' },
  { day: 'Sat', avgRate: 0.155, status: 'up' },
  { day: 'Sun', avgRate: 0.151, status: 'stable' },
  { day: 'Mon', avgRate: 0.125, status: 'down' },
  { day: 'Tue', avgRate: 0.132, status: 'up' },
];
