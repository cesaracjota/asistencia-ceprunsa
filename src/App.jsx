import { useState } from 'react';
import { GraduationCap, RefreshCw, BookOpen, Clock } from 'lucide-react';
import DropZone from './components/DropZone';
import MetricsRow from './components/MetricsRow';
import AttendanceTable from './components/AttendanceTable';
import ThresholdEditor from './components/ThresholdEditor';
import { useAttendanceFile } from './hooks/useAttendanceFile';

const DEFAULT_THRESHOLD = 180; // 3 hours in minutes

// ─── Header ─────────────────────────────────────────────────────────────────
function Header({ hasData, onReset, onOpenConfig }) {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      background: 'rgba(7,7,15,0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        
        {/* Brand (Left) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--brand-maroon) 0%, #8a1f36 100%)',
            boxShadow: '0 0 20px rgba(104,21,39,0.3)',
          }}>
            <GraduationCap style={{ color: '#fff', width: 18, height: 18 }} />
          </div>
          <div>
            <h1 style={{ fontSize: '0.95rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1, color: 'var(--text-primary)' }}>
              ASISTENCIA CEPRU
            </h1>
            <p style={{ fontSize: '0.65rem', color: 'var(--accent-blue)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Procesador Local
            </p>
          </div>
        </div>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {hasData && (
            <>
              <button 
                className="btn-ghost" 
                onClick={onOpenConfig} 
                aria-label="Configuración de umbral"
                style={{ background: 'rgba(96,165,250,0.1)', color: 'var(--accent-blue)', borderColor: 'rgba(96,165,250,0.25)' }}
              >
                <Clock style={{ width: 13, height: 13 }} />
                Umbral
              </button>
              <button className="btn-ghost" onClick={onReset} aria-label="Cargar nuevo archivo">
                <RefreshCw style={{ width: 13, height: 13 }} />
                Nuevo
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

// ─── Column hints ────────────────────────────────────────────────────────────
const EXPECTED_COLUMNS = [
  'Apellido', 'Nombre', 'Correo electrónico',
  'Duración', 'Hora a la que se unió', 'Hora a la que abandonó la reunión',
];

function ColumnHints() {
  return (
    <div className="glass-card" style={{ padding: '1rem 1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <BookOpen style={{ width: 14, height: 14, color: 'var(--text-muted)' }} />
        <p style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Cabeceras esperadas
        </p>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {EXPECTED_COLUMNS.map((col) => (
          <span key={col} style={{
            padding: '3px 10px',
            fontSize: '0.72rem',
            fontFamily: 'monospace',
            borderRadius: 5,
            background: 'rgba(255,255,255,0.04)',
            color: 'var(--text-secondary)',
            border: '1px solid rgba(255,255,255,0.07)',
            letterSpacing: '0.02em',
          }}>
            {col}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const { records, fileName, error, isProcessing, processFile, reset } = useAttendanceFile();
  const [threshold, setThreshold] = useState(DEFAULT_THRESHOLD);
  const [isConfigOpen, setConfigOpen] = useState(false);
  const hasData = !!records && records.length > 0;

  return (
    <div className="bg-glow" style={{ minHeight: '100vh', position: 'relative' }}>
      <Header hasData={hasData} onReset={reset} onOpenConfig={() => setConfigOpen(true)} />

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 1.5rem', position: 'relative', zIndex: 1 }}>

        {/* ── Upload view ── */}
        {!hasData && (
          <div className="fade-up" style={{ maxWidth: 680, margin: '0 auto' }}>
            {/* Hero */}
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '4px 14px', borderRadius: 99,
                background: 'rgba(96,165,250,0.08)',
                border: '1px solid rgba(96,165,250,0.18)',
                marginBottom: 20,
              }}>
                <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-blue)', display: 'inline-block' }} />
                <span style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent-blue)' }}>
                  Listo para procesar
                </span>
              </div>
              <h2 style={{
                fontSize: 'clamp(2rem, 5vw, 2.75rem)',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                color: 'var(--text-primary)',
                marginBottom: 14,
              }}>
                Control de{' '}
                <span style={{
                  background: 'linear-gradient(135deg, var(--brand-gold) 0%, #e2cba6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  Asistencia
                </span>
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 480, margin: '0 auto' }}>
                Sube tu reporte exportado en{' '}
                <strong style={{ color: 'var(--text-primary)' }}>.xlsx</strong> o{' '}
                <strong style={{ color: 'var(--text-primary)' }}>.csv</strong>. El sistema
                evalúa la duración de cada participante y asigna automáticamente{' '}
                <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>A</span> o{' '}
                <span style={{ color: 'var(--accent-red)', fontWeight: 600 }}>F</span>.
              </p>
            </div>

            {/* Drop zone */}
            <div style={{ marginBottom: 16 }}>
              <DropZone onFile={processFile} isProcessing={isProcessing} fileName={fileName} error={error} />
            </div>

            {/* Column hints */}
            <ColumnHints />
          </div>
        )}

        {/* ── Data dashboard ── */}
        {hasData && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Threshold editor Modal */}
            <ThresholdEditor 
              isOpen={isConfigOpen} 
              onClose={() => setConfigOpen(false)} 
              threshold={threshold} 
              onChange={setThreshold} 
            />

            {/* Metrics */}
            <MetricsRow records={records} thresholdMinutes={threshold} />

            {/* Table */}
            <AttendanceTable records={records} fileName={fileName} thresholdMinutes={threshold} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.04)',
        padding: '1.25rem 1.5rem',
        textAlign: 'center',
        marginTop: '3rem',
        position: 'relative',
        zIndex: 1,
      }}>
        <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
          Asistencia CEPRUNSA · Procesamiento 100% local en el navegador · Ningún dato es enviado a servidores
        </p>
      </footer>
    </div>
  );
}
