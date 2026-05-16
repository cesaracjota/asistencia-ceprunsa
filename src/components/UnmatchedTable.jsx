import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';

const DAYS_OF_WEEK = [
  { id: 'lunes', short: 'Lu' },
  { id: 'martes', short: 'Ma' },
  { id: 'miercoles', short: 'Mi' },
  { id: 'jueves', short: 'Ju' },
  { id: 'viernes', short: 'Vi' },
  { id: 'sabado', short: 'Sa' }
];

export default function UnmatchedTable({ unmatchedRecords, daysData }) {
  const [search, setSearch] = useState('');

  const activeDays = useMemo(() => {
    return DAYS_OF_WEEK.filter(day => daysData[day.id] && daysData[day.id].length > 0);
  }, [daysData]);

  const filtered = useMemo(() => {
    if (!search.trim()) return unmatchedRecords;
    const q = search.toLowerCase();
    return unmatchedRecords.filter(r => 
      r.nombre.toLowerCase().includes(q) || 
      r.apellido.toLowerCase().includes(q) ||
      (r.email && r.email.toLowerCase().includes(q))
    );
  }, [unmatchedRecords, search]);

  if (!unmatchedRecords || unmatchedRecords.length === 0) return null;

  const thStyle = {
    fontSize: '0.65rem',
    fontWeight: 600,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--text-secondary)',
    padding: '0.75rem 0.5rem',
    textAlign: 'left',
    borderBottom: '1px solid var(--border-subtle)',
    borderRight: '1px solid var(--border-subtle)',
    whiteSpace: 'nowrap',
  };
  
  const tdStyle = {
    padding: '0.75rem 0.5rem',
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    borderBottom: '1px solid var(--border-subtle)',
    borderRight: '1px solid var(--border-subtle)',
  };

  return (
    <div className="fade-up" style={{ marginTop: '2rem' }}>
      <div className="glass-card" style={{ overflow: 'hidden', border: '1px solid rgba(248, 113, 113, 0.2)' }}>
        
        {/* Controls bar */}
        <div style={{
          padding: '0.875rem 1.25rem',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10,
          background: 'var(--bg-card)'
        }}>
          <div style={{ flex: 1, minWidth: 120 }}>
            <p style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--accent-red)', letterSpacing: '-0.01em' }}>
              Participantes No Reconocidos
            </p>
            <p style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              {filtered.length} personas que entraron al Meet pero no están en la plantilla maestra.
            </p>
          </div>

          <div style={{ position: 'relative' }}>
            <Search style={{
              position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
              width: 13, height: 13, color: 'var(--text-muted)', pointerEvents: 'none',
            }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar intruso..."
              className="search-input"
              style={{ width: '200px' }}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto', maxHeight: '400px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 10, boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
              <tr>
                <th style={{ ...thStyle, width: 44, textAlign: 'center' }}>#</th>
                <th style={{ ...thStyle, paddingLeft: '1rem' }}>Apellido</th>
                <th style={thStyle}>Nombre</th>
                <th style={thStyle}>Correo</th>
                {activeDays.map(day => (
                  <th key={day.id} style={{ ...thStyle, textAlign: 'center', width: 60 }}>
                    {day.short} (Min)
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4 + activeDays.length} style={{ ...tdStyle, textAlign: 'center', padding: '2rem' }}>
                    Ninguno coincide con la búsqueda.
                  </td>
                </tr>
              ) : (
                filtered.map((r, i) => (
                  <tr key={`${r.email || r.nombre}-${i}`} style={{ background: i % 2 === 0 ? 'var(--bg-zebra)' : 'transparent' }}>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>{i + 1}</td>
                    <td style={{ ...tdStyle, paddingLeft: '1rem', color: 'var(--text-primary)' }}>{r.apellido}</td>
                    <td style={{ ...tdStyle, color: 'var(--text-secondary)' }}>{r.nombre}</td>
                    <td style={{ ...tdStyle }}>{r.email}</td>
                    {activeDays.map(day => {
                      const m = r.attendance[day.id]?.minutes || 0;
                      return (
                        <td key={day.id} style={{ ...tdStyle, textAlign: 'center', color: m > 0 ? 'var(--accent-red)' : 'var(--text-muted)' }}>
                          {m > 0 ? `${m}m` : '-'}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
