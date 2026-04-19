// Seed data matching original SolarSync dashboard

export const solarData16 = [0,0,0.1,0.8,2.2,3.5,4.1,3.8,2.9,1.8,0.9,0.4,0.2,0,0,0];
export const consData16  = [0.3,0.2,0.2,0.3,0.9,1.2,1.1,0.8,0.7,0.9,1.4,1.2,0.6,0.4,0.3,0.3];
export const gridData16  = [0.3,0.2,0.1,0,0,0,0,0,0,0,0,0,0,0.4,0.3,0.3];

// 8-point (hourly buckets) for charts
const labels8 = ['12am','3am','6am','9am','12pm','3pm','6pm','9pm'];
export const chartData = labels8.map((time, i) => ({
  time,
  solar: solarData16[i * 2],
  consumption: consData16[i * 2],
  grid: gridData16[i * 2],
  soc: [20,18,15,22,45,62,74,80][i],
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
  { id:0, name:'EV Charger',       icon:'🚗', watts:7200, scheduled:10, flex:true,  on:true  },
  { id:1, name:'Washing Machine',  icon:'👕', watts:1000, scheduled:11, flex:true,  on:true  },
  { id:2, name:'Dishwasher',       icon:'🍽️', watts:1200, scheduled:12, flex:true,  on:false },
  { id:3, name:'Air Conditioner',  icon:'❄️', watts:2000, scheduled:null,flex:false, on:true  },
];

export const communityMembers = [
  { name:'Alex Johnson (You)', initials:'AJ', color:'#39FF14', soc:74 },
  { name:'Maria Chen',         initials:'MC', color:'#00F0FF', soc:61 },
  { name:'James Park',         initials:'JP', color:'#8B5CF6', soc:88 },
  { name:'Priya Sharma',       initials:'PS', color:'#F59E0B', soc:42 },
  { name:'Tom Wright',         initials:'TW', color:'#FF3B5C', soc:55 },
];

export const trades = [
  { from:'James P.',  to:'Priya S.',    kwh:1.2, price:'₹28' },
  { from:'Alex J.',   to:'Tom W.',      kwh:0.8, price:'₹19' },
  { from:'Maria C.',  to:'Community',   kwh:2.0, price:'₹46' },
];

export const insights = [
  {
    icon:'💡', bg:'rgba(245,158,11,0.12)', border:'rgba(245,158,11,0.25)',
    title:'Shift dishwasher to 12pm',
    body:'Your solar peaks 11am–2pm. Running the dishwasher (1.2 kW) then saves ₹14 and avoids grid import.',
  },
  {
    icon:'🔋', bg:'rgba(0,240,255,0.08)', border:'rgba(0,240,255,0.2)',
    title:'Battery at optimal range',
    body:'SOC at 74% is ideal. Full charge by 3pm enables ~1.8 kWh export to the community grid.',
  },
  {
    icon:'🌤️', bg:'rgba(139,92,246,0.1)', border:'rgba(139,92,246,0.25)',
    title:'Cloudy tomorrow (82%)',
    body:'Heavy cloud forecast. Charge battery fully today and minimise consumption tonight.',
  },
  {
    icon:'📈', bg:'rgba(57,255,20,0.08)', border:'rgba(57,255,20,0.2)',
    title:'Score trending up',
    body:'Your 7-day average is 88, up from 79 last week. Top 12% of your community this month.',
  },
];

export const communities = [
  { value:'sunnyvale', label:'🌞 Sunnyvale Community', members:12 },
  { value:'greenpark', label:'🌿 Green Park Community', members:8 },
  { value:'solarhill', label:'⚡ Solar Hill Community', members:21 },
  { value:'ecoblock',  label:'🏘️ EcoBlock Community',  members:6 },
  { value:'brightzone',label:'🔆 BrightZone Community', members:15 },
];
