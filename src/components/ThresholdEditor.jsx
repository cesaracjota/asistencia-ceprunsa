import { Clock, X } from 'lucide-react';
import { formatMinutes } from '../utils/parseAttendance';

const PRESETS = [
  { label: '1 h', minutes: 60 },
  { label: '1.5 h', minutes: 90 },
  { label: '2 h', minutes: 120 },
  { label: '2.5 h', minutes: 150 },
  { label: '3 h', minutes: 180 },
  { label: '3.5 h', minutes: 210 },
  { label: '4 h', minutes: 240 },
];

export default function ThresholdEditor({ isOpen, onClose, threshold, onChange }) {
  if (!isOpen) return null;

  const handleSlider = (e) => {
    onChange(Number(e.target.value));
  };

  // Fill % for the slider track gradient
  const fillPct = ((threshold - 30) / (360 - 30)) * 100;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div className="glass-card fade-up" style={{
        width: '100%',
        maxWidth: 500,
        overflow: 'visible',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34,
              borderRadius: 8,
              background: 'rgba(96,165,250,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Clock style={{ width: 16, height: 16, color: 'var(--accent-blue)' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>
                Umbral de Asistencia
              </p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                Mínimo requerido para marcar como Asistencia
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: 4,
            }}
            aria-label="Cerrar modal"
          >
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem 1.25rem' }}>
          {/* Slider */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>
                Duración mínima
              </span>
              <span style={{
                fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-blue)',
                letterSpacing: '-0.02em',
                background: 'rgba(96,165,250,0.1)',
                border: '1px solid rgba(96,165,250,0.2)',
                borderRadius: 8,
                padding: '4px 14px',
              }}>
                {formatMinutes(threshold)}
              </span>
            </div>
            <input
              type="range"
              min={30}
              max={360}
              step={5}
              value={threshold}
              onChange={handleSlider}
              className="threshold-slider"
              style={{
                background: `linear-gradient(to right, var(--accent-blue) ${fillPct}%, rgba(255,255,255,0.1) ${fillPct}%)`,
              }}
              aria-label="Umbral de asistencia en minutos"
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>30 min</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>6 h</span>
            </div>
          </div>

          {/* Preset buttons */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
              Accesos rápidos
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {PRESETS.map((p) => {
                const active = p.minutes === threshold;
                return (
                  <button
                    key={p.minutes}
                    onClick={() => onChange(p.minutes)}
                    style={{
                      padding: '6px 16px',
                      borderRadius: 6,
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      border: '1px solid',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      background: active ? 'rgba(96,165,250,0.15)' : 'rgba(255,255,255,0.04)',
                      color: active ? 'var(--accent-blue)' : 'var(--text-secondary)',
                      borderColor: active ? 'rgba(96,165,250,0.4)' : 'rgba(255,255,255,0.08)',
                    }}
                    aria-pressed={active}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Info strip */}
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: 8,
            background: 'rgba(96,165,250,0.05)',
            border: '1px solid rgba(96,165,250,0.12)',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
          }}>
            ℹ Los cambios se aplican <strong style={{ color: 'var(--text-primary)' }}>inmediatamente</strong> a toda la tabla sin necesidad de volver a cargar el archivo.
          </div>
        </div>
      </div>
    </div>
  );
}
