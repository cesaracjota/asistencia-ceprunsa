import { X, Settings2, Palette, Type, Layout } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, settings, updateSettings, updateVisibleColumns }) {
  if (!isOpen) return null;

  const themes = [
    { id: 'dark', name: 'Oscuro', color: '#0a0c16' },
    { id: 'light', name: 'Claro', color: '#f1f5f9' },
    { id: 'ocean', name: 'Océano', color: '#0f172a' },
    { id: 'forest', name: 'Bosque', color: '#064e3b' },
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)',
      padding: '1rem'
    }}>
      <div 
        className="glass-card fade-up count-pop"
        style={{
          width: '100%', maxWidth: 440,
          background: 'var(--bg-card)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(255,255,255,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 32, height: 32, borderRadius: 8,
              background: 'rgba(96, 165, 250, 0.15)',
              color: 'var(--accent-blue)',
            }}>
              <Settings2 style={{ width: 18, height: 18 }} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, lineHeight: 1.2 }}>Configuración</h3>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>Personaliza la interfaz</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="btn-ghost"
            style={{ padding: '0.4rem' }}
            aria-label="Cerrar"
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          
          {/* Theme Section */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Palette style={{ width: 14, height: 14 }} /> Apariencia
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {themes.map(t => (
                <button
                  key={t.id}
                  onClick={() => updateSettings({ theme: t.id })}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '0.75rem', borderRadius: '0.5rem',
                    background: settings.theme === t.id ? 'rgba(96, 165, 250, 0.1)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${settings.theme === t.id ? 'var(--accent-blue)' : 'var(--border-subtle)'}`,
                    cursor: 'pointer', transition: 'all 0.2s ease',
                    color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.85rem'
                  }}
                >
                  <span style={{ width: 16, height: 16, borderRadius: '50%', background: t.color, border: '1px solid rgba(255,255,255,0.2)' }} />
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Table Config */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Layout style={{ width: 14, height: 14 }} /> Tabla
            </h4>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem', border: '1px solid var(--border-subtle)', cursor: 'pointer', marginBottom: 10 }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Fijar cabecera (Sticky Header)</span>
              <input 
                type="checkbox" 
                checked={settings.stickyHeader}
                onChange={(e) => updateSettings({ stickyHeader: e.target.checked })}
                style={{ width: 16, height: 16, accentColor: 'var(--accent-blue)' }}
              />
            </label>
          </div>

          {/* Column Visibility */}
          <div>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Type style={{ width: 14, height: 14 }} /> Columnas Visibles
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[{ id: 'apellido', label: 'Apellido' }, { id: 'nombre', label: 'Nombre' }, { id: 'email', label: 'Correo' }].map(col => (
                <label key={col.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem', border: '1px solid transparent', cursor: 'pointer' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{col.label}</span>
                  <input 
                    type="checkbox" 
                    checked={settings.visibleColumns[col.id]}
                    onChange={(e) => updateVisibleColumns(col.id, e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: 'var(--accent-blue)' }}
                  />
                </label>
              ))}
            </div>
          </div>

        </div>
        
        <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.02)', textAlign: 'right' }}>
          <button 
            className="btn-export"
            onClick={onClose}
          >
            Guardar y Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
