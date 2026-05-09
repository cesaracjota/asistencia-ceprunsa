import { Users, UserCheck, UserX, CalendarCheck } from 'lucide-react';

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

export default function MetricsRow({ aggregatedRecords, daysData, thresholdMinutes }) {
  if (!aggregatedRecords) return null;
  const totalStudents = aggregatedRecords.length;
  
  const activeDaysCount = Object.values(daysData).filter(records => records && records.length > 0).length;

  let perfectAttendances = 0;
  let studentsWithMisses = 0;
  let totalAttendances = 0;

  aggregatedRecords.forEach(student => {
    let studentTotalA = 0;
    let studentTotalF = 0;
    
    // Evaluate for active days
    Object.keys(daysData).forEach(dayId => {
      const records = daysData[dayId];
      if (records && records.length > 0) {
        const d = student.attendance[dayId];
        if (d && d.minutes >= thresholdMinutes) {
          studentTotalA++;
        } else {
          studentTotalF++;
        }
      }
    });

    totalAttendances += studentTotalA;

    if (studentTotalF === 0 && studentTotalA > 0) perfectAttendances++;
    if (studentTotalF > 0) studentsWithMisses++;
  });

  const avgDays = totalStudents > 0 ? (totalAttendances / totalStudents).toFixed(1) : '0.0';
  const pctPerfect = totalStudents > 0 ? ((perfectAttendances / totalStudents) * 100).toFixed(1) : '0.0';
  const pctMissed = totalStudents > 0 ? ((studentsWithMisses / totalStudents) * 100).toFixed(1) : '0.0';

  const cards = [
    {
      title: 'Total Estudiantes',
      value: totalStudents,
      sub: `${activeDaysCount} días ev.`,
      cardClass: 'glass-card-blue fade-up-1',
      valueClass: 'neon-blue',
      icon: Users,
      iconStyle: { bg: 'rgba(96,165,250,0.12)', color: 'var(--accent-blue)' },
    },
    {
      title: 'Asistencia Perfecta',
      value: perfectAttendances,
      sub: `${pctPerfect}%`,
      cardClass: 'glass-card-green fade-up-2',
      valueClass: 'neon-green',
      icon: UserCheck,
      iconStyle: { bg: 'rgba(52,211,153,0.12)', color: 'var(--accent-green)' },
    },
    {
      title: 'Con Faltas',
      value: studentsWithMisses,
      sub: `${pctMissed}%`,
      cardClass: 'glass-card-red fade-up-3',
      valueClass: 'neon-red',
      icon: UserX,
      iconStyle: { bg: 'rgba(248,113,113,0.12)', color: 'var(--accent-red)' },
    },
    {
      title: 'Promedio Asistencia',
      value: avgDays,
      sub: `de ${activeDaysCount} días`,
      cardClass: 'glass-card-amber fade-up-4',
      valueClass: 'neon-amber',
      icon: CalendarCheck,
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
