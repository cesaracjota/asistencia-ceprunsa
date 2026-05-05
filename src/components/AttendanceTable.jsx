import { useState, useMemo, useEffect } from 'react';
import { Search, ArrowUpDown, ArrowUp, ArrowDown, FileDown, FileSpreadsheet, Loader2 } from 'lucide-react';
import { formatMinutes } from '../utils/parseAttendance';
import * as XLSX from 'xlsx';
import { downloadAttendancePDF } from './AttendancePDF';

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  return status === 'A' ? (
    <span className="badge-a">
      <span className="pulse-dot" style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent-green)', display: 'inline-block' }} />
      Asistencia
    </span>
  ) : (
    <span className="badge-f">
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent-red)', display: 'inline-block' }} />
      Falta
    </span>
  );
}

// ─── Duration Bar ─────────────────────────────────────────────────────────────
function DurationBar({ minutes, thresholdMinutes }) {
  const MAX = Math.max(thresholdMinutes * 2, 300);
  const pct = Math.min((minutes / MAX) * 100, 100);
  const ok = minutes >= thresholdMinutes;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
      <span style={{
        fontSize: '0.8rem',
        color: 'var(--text-primary)',
        fontVariantNumeric: 'tabular-nums',
        flexShrink: 0,
        minWidth: 72,
        textAlign: 'right',
      }}>
        {formatMinutes(minutes)}
      </span>
      <div className="prog-bar-track">
        <div className={ok ? 'prog-bar-fill-green' : 'prog-bar-fill-red'} style={{ width: `${pct}%` }} />
      </div>
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
function exportToExcel({ data, thresholdMinutes, fileName }) {
  const rows = data.map((r, i) => ({
    '#': i + 1,
    'Apellido': r.apellido,
    'Nombre': r.nombre,
    'Correo Electrónico': r.email,
    'Duración Original': r.duracionRaw,
    'Minutos Totales': r.minutes,
    'Duración Formateada': formatMinutes(r.minutes),
    'Estado': r.status,
    'Umbral (min)': thresholdMinutes,
  }));

  const ws = XLSX.utils.json_to_sheet(rows);

  // Column widths
  ws['!cols'] = [
    { wch: 5 }, { wch: 20 }, { wch: 20 },
    { wch: 35 }, { wch: 14 }, { wch: 10 },
    { wch: 16 }, { wch: 10 }, { wch: 12 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Asistencia');

  // Summary sheet
  const summary = [
    ['Reporte de Asistencia — CEPRUNSA', ''],
    [''],
    ['Total evaluados', data.length],
    ['Asistencias (A)', data.filter(r => r.status === 'A').length],
    ['Faltas (F)', data.filter(r => r.status === 'F').length],
    ['Umbral de asistencia', `${formatMinutes(thresholdMinutes)} (${thresholdMinutes} min)`],
    ['Fecha de generación', new Date().toLocaleDateString('es-PE')],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summary);
  wsSummary['!cols'] = [{ wch: 28 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen');

  const base = fileName ? fileName.replace(/\.[^.]+$/, '') : 'reporte';
  XLSX.writeFile(wb, `asistencia_${base}.xlsx`);
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AttendanceTable({ records, fileName, thresholdMinutes }) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ column: 'apellido', direction: 'asc' });
  const [filterStatus, setFilterStatus] = useState('all');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const handleSort = (col) => {
    setSort((prev) =>
      prev.column === col
        ? { column: col, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { column: col, direction: 'asc' }
    );
  };

  // Re-evaluate status live against current threshold
  const evaluated = useMemo(
    () => records.map((r) => ({ ...r, status: r.minutes >= thresholdMinutes ? 'A' : 'F' })),
    [records, thresholdMinutes]
  );

  const filtered = useMemo(() => {
    let data = [...evaluated];
    if (filterStatus !== 'all') data = data.filter((r) => r.status === filterStatus);
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
      const valA = a[sort.column] ?? '';
      const valB = b[sort.column] ?? '';
      if (sort.column === 'minutes') {
        return sort.direction === 'asc'
          ? Number(valA) - Number(valB)
          : Number(valB) - Number(valA);
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
      // Export ALL evaluated records (not just filtered) for the full report
      await downloadAttendancePDF({ records: evaluated, thresholdMinutes, fileName });
    } catch (e) {
      console.error('PDF error:', e);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleExcel = () => {
    exportToExcel({ data: filtered, thresholdMinutes, fileName });
  };

  const pillClass = (val) => {
    if (filterStatus !== val) return 'pill pill-inactive';
    if (val === 'all') return 'pill pill-active-all';
    if (val === 'A') return 'pill pill-active-a';
    return 'pill pill-active-f';
  };

  // Shared styles
  const thStyle = {
    fontSize: '0.65rem',
    fontWeight: 600,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--text-secondary)',
    padding: '0.75rem 1rem',
    textAlign: 'left',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    whiteSpace: 'nowrap',
    background: 'transparent',
  };
  const tdStyle = {
    padding: '0.85rem 1rem',
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
            Registro de Asistencia
          </p>
          <p style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: 2 }}>
            {filtered.length} de {records.length} registros
          </p>
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { label: 'Todos', val: 'all' },
            { label: 'Asistencia', val: 'A' },
            { label: 'Falta', val: 'F' },
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
            placeholder="Buscar..."
            className="search-input"
            aria-label="Buscar estudiante"
          />
        </div>

        {/* Export buttons */}
        <div style={{ display: 'flex', gap: 6 }}>
          {/* Excel */}
          <button
            onClick={handleExcel}
            aria-label="Exportar a Excel"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '0.42rem 0.8rem',
              borderRadius: '0.5rem',
              fontSize: '0.78rem',
              fontWeight: 600,
              background: 'rgba(34,197,94,0.1)',
              color: '#4ade80',
              border: '1px solid rgba(34,197,94,0.25)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(34,197,94,0.18)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(34,197,94,0.1)'}
          >
            <FileSpreadsheet style={{ width: 13, height: 13 }} />
            Excel
          </button>

          {/* PDF */}
          <button
            onClick={handlePDF}
            disabled={pdfLoading}
            aria-label="Exportar reporte PDF"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '0.42rem 0.8rem',
              borderRadius: '0.5rem',
              fontSize: '0.78rem',
              fontWeight: 600,
              background: 'rgba(248,113,113,0.1)',
              color: '#fb7185',
              border: '1px solid rgba(248,113,113,0.25)',
              cursor: pdfLoading ? 'wait' : 'pointer',
              transition: 'all 0.2s ease',
              opacity: pdfLoading ? 0.7 : 1,
              whiteSpace: 'nowrap',
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
              <th style={thStyle}>
                <button style={sortBtnStyle} onClick={() => handleSort('apellido')}>
                  Apellido <SortIcon column="apellido" sort={sort} />
                </button>
              </th>
              <th style={thStyle}>
                <button style={sortBtnStyle} onClick={() => handleSort('nombre')}>
                  Nombre <SortIcon column="nombre" sort={sort} />
                </button>
              </th>
              <th style={thStyle}>
                <button style={sortBtnStyle} onClick={() => handleSort('minutes')}>
                  Duración <SortIcon column="minutes" sort={sort} />
                </button>
              </th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ ...tdStyle, textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
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
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{r.apellido}</td>
                    <td style={{ ...tdStyle, color: '#cbd5e1' }}>{r.nombre}</td>
                    <td style={tdStyle}>
                      <DurationBar minutes={r.minutes} thresholdMinutes={thresholdMinutes} />
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <StatusBadge status={r.status} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer strip ── */}
      <div style={{
        padding: '0.6rem 1.25rem',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        background: 'rgba(255,255,255,0.015)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
          Umbral:{' '}
          <span style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>
            {formatMinutes(thresholdMinutes)}
          </span>
          {' '}→ Asistencia (A)
        </p>
        <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
          <span style={{ color: 'var(--accent-green)' }}>
            {filtered.filter((r) => r.status === 'A').length} A
          </span>
          {' · '}
          <span style={{ color: 'var(--accent-red)' }}>
            {filtered.filter((r) => r.status === 'F').length} F
          </span>
        </p>
      </div>
    </div>
  );
}
