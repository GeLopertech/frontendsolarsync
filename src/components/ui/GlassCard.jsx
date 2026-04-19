export default function GlassCard({ children, variant = 'default', className = '', style = {} }) {
  const cls = {
    default: 'glass',
    neon: 'glass-neon',
    elec: 'glass-elec',
    amber: 'glass-amber',
  }[variant] || 'glass';

  return (
    <div className={`${cls} p-4 ${className}`} style={style}>
      {children}
    </div>
  );
}
