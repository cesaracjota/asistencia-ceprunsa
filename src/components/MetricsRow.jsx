import { Users, UserCheck, UserX, Clock } from 'lucide-react';
import { formatMinutes } from '../utils/parseAttendance';

function MetricCard({ title, value, sub, cardClass, valueClass, icon: Icon, iconStyle }) {
  return (
    <div
      className={`metric-card ${cardClass}`}
      style={{ borderRadius: '1rem', padding: '1.25rem' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{
          width: 42, height: 42,
          borderRadius: 10,
          background: iconStyle.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon style={{ width: 20, height: 20, color: iconStyle.color }} />
        </div>
        {sub !== undefined && (
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: iconStyle.color,
            opacity: 0.7,
            marginTop: 4,
          }}>
            {sub}
          </span>
        )}
      </div>
      <p style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 6 }}>
        {title}
      </p>
      <p
        className={`count-pop ${valueClass}`}
        style={{ fontSize: '2.25rem', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em' }}
      >
        {value}
      </p>
    </div>
  );
}

export default function MetricsRow({ records, thresholdMinutes }) {
  const total = records.length;
  // Re-evaluate against current threshold (same logic as AttendanceTable)
  const asistencias = records.filter((r) => r.minutes >= thresholdMinutes).length;
  const faltas = total - asistencias;
  const avgMin = total > 0
    ? Math.round(records.reduce((acc, r) => acc + r.minutes, 0) / total)
    : 0;
  const pctA = total > 0 ? ((asistencias / total) * 100).toFixed(1) : '0.0';
  const pctF = total > 0 ? (100 - parseFloat(pctA)).toFixed(1) : '0.0';

  const cards = [
    {
      title: 'Total Evaluados',
      value: total,
      sub: '100%',
      cardClass: 'glass-card-blue fade-up-1',
      valueClass: 'neon-blue',
      icon: Users,
      iconStyle: { bg: 'rgba(96,165,250,0.12)', color: 'var(--accent-blue)' },
    },
    {
      title: 'Asistencias (A)',
      value: asistencias,
      sub: `${pctA}%`,
      cardClass: 'glass-card-green fade-up-2',
      valueClass: 'neon-green',
      icon: UserCheck,
      iconStyle: { bg: 'rgba(52,211,153,0.12)', color: 'var(--accent-green)' },
    },
    {
      title: 'Faltas (F)',
      value: faltas,
      sub: `${pctF}%`,
      cardClass: 'glass-card-red fade-up-3',
      valueClass: 'neon-red',
      icon: UserX,
      iconStyle: { bg: 'rgba(248,113,113,0.12)', color: 'var(--accent-red)' },
    },
    {
      title: 'Duración Promedio',
      value: formatMinutes(avgMin),
      sub: `mín: ${formatMinutes(thresholdMinutes)}`,
      cardClass: 'glass-card-amber fade-up-4',
      valueClass: 'neon-amber',
      icon: Clock,
      iconStyle: { bg: 'rgba(251,191,36,0.12)', color: 'var(--accent-amber)' },
    },
  ];

  return (
    <div
      style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}
      className="metrics-grid"
    >
      <style>{`
        @media (max-width: 900px) {
          .metrics-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
      {cards.map((c) => (
        <MetricCard key={c.title} {...c} />
      ))}
    </div>
  );
}
