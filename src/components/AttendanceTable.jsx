import { useState, useMemo, useEffect } from 'react';
import { Search, ArrowUpDown, ArrowUp, ArrowDown, FileDown, FileSpreadsheet, Loader2 } from 'lucide-react';
import { formatMinutes } from '../utils/parseAttendance';
import * as XLSX from 'xlsx';
import { downloadAttendancePDF } from './AttendancePDF';

const DAYS_OF_WEEK = [
  { id: 'lunes', short: 'Lu' },
  { id: 'martes', short: 'Ma' },
  { id: 'miercoles', short: 'Mi' },
  { id: 'jueves', short: 'Ju' },
  { id: 'viernes', short: 'Vi' },
  { id: 'sabado', short: 'Sa' }
];

// ─── Compact Badge ────────────────────────────────────────────────────────────
function CompactBadge({ status, minutes }) {
  if (!status) return <span style={{ color: 'var(--text-muted)' }}>-</span>;
  if (status === 'A') {
    return (
      <div 
        title={`${formatMinutes(minutes)}`}
        style={{
          width: 20, height: 20, borderRadius: '50%',
          background: 'rgba(52, 211, 153, 0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.65rem', fontWeight: 700, color: 'var(--accent-green)',
          border: '1px solid rgba(52, 211, 153, 0.3)',
          margin: '0 auto'
        }}
      >
        A
      </div>
    );
  }
  return (
    <div 
      title={`${formatMinutes(minutes)}`}
      style={{
        width: 20, height: 20, borderRadius: '50%',
        background: 'rgba(248, 113, 113, 0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.65rem', fontWeight: 700, color: 'var(--accent-red)',
        border: '1px solid rgba(248, 113, 113, 0.3)',
        margin: '0 auto'
      }}
    >
      F
    </div>
  );
}

// ─── Sort Icon ────────────────────────────────────────────────────────────────
function SortIcon({ column, sort }) {
  if (sort.column !== column) return <ArrowUpDown style={{ width: 11, height: 11, opacity: 0.3 }} />;
  return sort.direction === 'asc'
    ? <ArrowUp style={{ width: 11, height: 11, color: 'var(--accent-blue)' }} />
    : <ArrowDown style={{ width: 11, height: 11, color: 'var(--accent-blue)' }} />;
}

// ─── Excel Export ─────────────────────────────────────────────────────────────
function exportToExcel({ data, activeDays, thresholdMinutes }) {
  const rows = data.map((r, i) => {
    const row = {
      '#': i + 1,
      'Apellido': r.apellido,
      'Nombre': r.nombre,
      'Correo Electrónico': r.email,
    };

    activeDays.forEach(day => {
      const d = r.attendance[day.id];
      row[`${day.short} (Min)`] = d ? d.minutes : 0;
      row[`${day.short} (Estado)`] = d ? d.status : '-';
    });

    row['Total Asistencias'] = r.totalA;
    row['Total Faltas'] = r.totalF;
    return row;
  });

  const ws = XLSX.utils.json_to_sheet(rows);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Asistencia Semanal');

  // Summary sheet
  const summary = [
    ['Reporte de Asistencia Semanal — CEPRUNSA', ''],
    [''],
    ['Total estudiantes', data.length],
    ['Umbral por día', `${formatMinutes(thresholdMinutes)} (${thresholdMinutes} min)`],
    ['Fecha de generación', new Date().toLocaleDateString('es-PE')],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summary);
  wsSummary['!cols'] = [{ wch: 28 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen');

  XLSX.writeFile(wb, `asistencia_semanal.xlsx`);
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AttendanceTable({ aggregatedRecords, daysData, thresholdMinutes }) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ column: 'apellido', direction: 'asc' });
  const [filterStatus, setFilterStatus] = useState('all'); // all, perfect, missed
  const [pdfLoading, setPdfLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  // Determine which days have data to show only those columns
  const activeDays = useMemo(() => {
    return DAYS_OF_WEEK.filter(day => daysData[day.id] && daysData[day.id].length > 0);
  }, [daysData]);

  const handleSort = (col) => {
    setSort((prev) =>
      prev.column === col
        ? { column: col, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { column: col, direction: 'asc' }
    );
  };

  // Re-evaluate status live against current threshold
  const evaluated = useMemo(() => {
    if (!aggregatedRecords) return [];
    
    return aggregatedRecords.map(student => {
      let totalA = 0;
      let totalF = 0;
      const evaluatedAttendance = {};
      
      activeDays.forEach(d => {
        const record = student.attendance[d.id];
        if (record) {
          const isA = record.minutes >= thresholdMinutes;
          if (isA) totalA++; else totalF++;
          evaluatedAttendance[d.id] = { ...record, status: isA ? 'A' : 'F' };
        }
      });

      return {
        ...student,
        attendance: evaluatedAttendance,
        totalA,
        totalF,
        totalDays: totalA + totalF
      };
    });
  }, [aggregatedRecords, thresholdMinutes, activeDays]);

  const filtered = useMemo(() => {
    let data = [...evaluated];
    
    if (filterStatus === 'perfect') {
      data = data.filter(r => r.totalF === 0 && r.totalA > 0);
    } else if (filterStatus === 'missed') {
      data = data.filter(r => r.totalF > 0);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (r) =>
          r.nombre.toLowerCase().includes(q) ||
          r.apellido.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q)
      );
    }

    data.sort((a, b) => {
      let valA, valB;
      if (sort.column === 'totalA') {
        valA = a.totalA; valB = b.totalA;
      } else {
        valA = a[sort.column] ?? '';
        valB = b[sort.column] ?? '';
      }

      if (typeof valA === 'number') {
        return sort.direction === 'asc' ? valA - valB : valB - valA;
      }
      const cmp = valA.toString().localeCompare(valB.toString(), 'es', { sensitivity: 'base' });
      return sort.direction === 'asc' ? cmp : -cmp;
    });
    return data;
  }, [evaluated, search, sort, filterStatus]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedRow) return;

      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();

        const currentIndex = filtered.findIndex((r) => r.email === selectedRow);
        if (currentIndex === -1) return;

        let nextIndex = currentIndex;
        if (e.key === 'ArrowUp' && currentIndex > 0) {
          nextIndex = currentIndex - 1;
        } else if (e.key === 'ArrowDown' && currentIndex < filtered.length - 1) {
          nextIndex = currentIndex + 1;
        }

        if (nextIndex !== currentIndex) {
          const nextEmail = filtered[nextIndex].email;
          setSelectedRow(nextEmail);

          const rowElement = document.getElementById(`row-${nextEmail}`);
          if (rowElement) {
            rowElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedRow, filtered]);

  const handlePDF = async () => {
    setPdfLoading(true);
    try {
      await downloadAttendancePDF({ 
        records: evaluated, 
        activeDays,
        thresholdMinutes 
      });
    } catch (e) {
      console.error('PDF error:', e);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleExcel = () => {
    exportToExcel({ data: filtered, activeDays, thresholdMinutes });
  };

  const pillClass = (val) => {
    if (filterStatus !== val) return 'pill pill-inactive';
    if (val === 'all') return 'pill pill-active-all';
    if (val === 'perfect') return 'pill pill-active-a';
    return 'pill pill-active-f';
  };

  // Shared styles
  const thStyle = {
    fontSize: '0.65rem',
    fontWeight: 600,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--text-secondary)',
    padding: '0.75rem 0.5rem',
    textAlign: 'left',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    whiteSpace: 'nowrap',
    background: 'transparent',
  };
  const tdStyle = {
    padding: '0.85rem 0.5rem',
    fontSize: '0.875rem',
    color: 'var(--text-primary)',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
  };
  const sortBtnStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
    font: 'inherit',
    fontSize: '0.65rem',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    fontWeight: 600,
    padding: 0,
  };

  return (
    <div className="glass-card fade-up" style={{ overflow: 'hidden' }}>

      {/* ── Controls bar ── */}
      <div style={{
        padding: '0.875rem 1.25rem',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 10,
      }}>
        <div style={{ flex: 1, minWidth: 120 }}>
          <p style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            Registro Semanal Consolidado
          </p>
          <p style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: 2 }}>
            {filtered.length} de {evaluated.length} estudiantes
          </p>
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { label: 'Todos', val: 'all' },
            { label: 'Perfecta (100% A)', val: 'perfect' },
            { label: 'Con Faltas', val: 'missed' },
          ].map((o) => (
            <button key={o.val} className={pillClass(o.val)} onClick={() => setFilterStatus(o.val)}>
              {o.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search style={{
            position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
            width: 13, height: 13, color: 'var(--text-muted)', pointerEvents: 'none',
          }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o correo..."
            className="search-input"
            style={{ width: '240px' }}
            aria-label="Buscar estudiante"
          />
        </div>

        {/* Export buttons */}
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={handleExcel}
            aria-label="Exportar a Excel"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '0.42rem 0.8rem', borderRadius: '0.5rem',
              fontSize: '0.78rem', fontWeight: 600,
              background: 'rgba(34,197,94,0.1)', color: '#4ade80',
              border: '1px solid rgba(34,197,94,0.25)',
              cursor: 'pointer', transition: 'all 0.2s ease', whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(34,197,94,0.18)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(34,197,94,0.1)'}
          >
            <FileSpreadsheet style={{ width: 13, height: 13 }} />
            Excel
          </button>

          <button
            onClick={handlePDF}
            disabled={pdfLoading}
            aria-label="Exportar reporte PDF"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '0.42rem 0.8rem', borderRadius: '0.5rem',
              fontSize: '0.78rem', fontWeight: 600,
              background: 'rgba(248,113,113,0.1)', color: '#fb7185',
              border: '1px solid rgba(248,113,113,0.25)',
              cursor: pdfLoading ? 'wait' : 'pointer',
              transition: 'all 0.2s ease', opacity: pdfLoading ? 0.7 : 1, whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => !pdfLoading && (e.currentTarget.style.background = 'rgba(248,113,113,0.18)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(248,113,113,0.1)')}
          >
            {pdfLoading
              ? <Loader2 style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }} />
              : <FileDown style={{ width: 13, height: 13 }} />
            }
            {pdfLoading ? 'Generando...' : 'PDF'}
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}
          aria-label="Tabla de registro de asistencia"
        >
          <thead>
            <tr>
              <th style={{ ...thStyle, width: 44, textAlign: 'center' }}>#</th>
              <th style={{...thStyle, paddingLeft: '1rem'}}>
                <button style={sortBtnStyle} onClick={() => handleSort('apellido')}>
                  Apellido <SortIcon column="apellido" sort={sort} />
                </button>
              </th>
              <th style={thStyle}>
                <button style={sortBtnStyle} onClick={() => handleSort('nombre')}>
                  Nombre <SortIcon column="nombre" sort={sort} />
                </button>
              </th>
              <th style={thStyle} className="hidden sm:table-cell">Correo</th>
              
              {/* Dynamic Day Columns */}
              {activeDays.map(day => (
                <th key={day.id} style={{ ...thStyle, textAlign: 'center', width: 44 }}>
                  {day.short}
                </th>
              ))}

              <th style={{ ...thStyle, textAlign: 'center', width: 80, paddingRight: '1rem' }}>
                <button style={sortBtnStyle} onClick={() => handleSort('totalA')}>
                  Total <SortIcon column="totalA" sort={sort} />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5 + activeDays.length} style={{ ...tdStyle, textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No se encontraron registros.
                </td>
              </tr>
            ) : (
              filtered.map((r, i) => {
                const isSelected = selectedRow === r.email;
                return (
                  <tr
                    id={`row-${r.email}`}
                    key={`${r.email}-${i}`}
                    onClick={() => setSelectedRow(isSelected ? null : r.email)}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                    style={{ 
                      transition: 'background 0.15s', 
                      background: isSelected ? 'rgba(188, 157, 128, 0.15)' : 'transparent',
                      cursor: 'pointer'
                    }}
                  >
                    <td style={{ ...tdStyle, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {i + 1}
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 600, paddingLeft: '1rem' }}>{r.apellido}</td>
                    <td style={{ ...tdStyle, color: '#cbd5e1' }}>{r.nombre}</td>
                    <td style={{ ...tdStyle, color: 'var(--text-muted)', fontSize: '0.75rem', maxWidth: '150px' }} className="hidden sm:table-cell">
                      <div className="truncate" title={r.email}>{r.email}</div>
                    </td>
                    
                    {/* Active Days Badges */}
                    {activeDays.map(day => {
                      const dayData = r.attendance[day.id];
                      return (
                        <td key={day.id} style={{ ...tdStyle, textAlign: 'center' }}>
                          <CompactBadge 
                            status={dayData?.status} 
                            minutes={dayData?.minutes} 
                          />
                        </td>
                      )
                    })}

                    <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 800, paddingRight: '1rem' }}>
                      <span style={{ color: r.totalA > 0 ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                        {r.totalA}
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginLeft: 4 }}>
                        / {activeDays.length}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
