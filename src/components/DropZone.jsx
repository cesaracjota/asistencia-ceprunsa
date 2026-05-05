import { useState, useRef, useCallback } from 'react';
import { UploadCloud, FileSpreadsheet, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function DropZone({ onFile, isProcessing, fileName, error }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDragEnter = useCallback((e) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e) => { e.preventDefault(); setIsDragging(false); }, []);
  const handleDragOver = useCallback((e) => { e.preventDefault(); }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFile(file);
  }, [onFile]);

  const handleChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
    e.target.value = '';
  }, [onFile]);

  const hasFile = !!fileName && !error && !isProcessing;

  const zoneClass = `drop-zone p-10 flex flex-col items-center justify-center gap-5 text-center
    ${isDragging ? 'drag-active' : ''}
    ${hasFile ? 'file-ok' : ''}
    ${error ? 'file-error' : ''}
  `;

  return (
    <div
      className={zoneClass}
      style={{ minHeight: '240px' }}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => !isProcessing && inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      aria-label="Zona de carga de archivos de asistencia"
    >
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={handleChange}
        id="file-upload-input"
      />

      {/* Icon */}
      <div className={!hasFile && !error && !isProcessing ? 'float-anim' : ''}>
        {isProcessing && (
          <div style={{ width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'rgba(96,165,250,0.08)' }}>
            <Loader2 className="spin" style={{ width: 36, height: 36, color: 'var(--accent-blue)' }} />
          </div>
        )}
        {hasFile && !isProcessing && (
          <div style={{ width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'rgba(52,211,153,0.08)' }}>
            <CheckCircle2 style={{ width: 36, height: 36, color: 'var(--accent-green)' }} />
          </div>
        )}
        {error && !isProcessing && (
          <div style={{ width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'rgba(248,113,113,0.08)' }}>
            <XCircle style={{ width: 36, height: 36, color: 'var(--accent-red)' }} />
          </div>
        )}
        {!isProcessing && !hasFile && !error && (
          <div style={{ width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'rgba(96,165,250,0.08)' }}>
            <UploadCloud style={{ width: 36, height: 36, color: 'var(--accent-blue)' }} />
          </div>
        )}
      </div>

      {/* Text */}
      <div>
        {isProcessing && (
          <>
            <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Procesando...</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{fileName}</p>
          </>
        )}
        {hasFile && !isProcessing && (
          <>
            <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-green)', marginBottom: 6 }}>¡Archivo cargado exitosamente!</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
              <FileSpreadsheet style={{ width: 14, height: 14 }} />
              <span>{fileName}</span>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 8 }}>Clic para cargar otro archivo</p>
          </>
        )}
        {error && !isProcessing && (
          <>
            <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-red)', marginBottom: 6 }}>Error al procesar</p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: 380 }}>{error}</p>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 8 }}>Clic para intentar nuevamente</p>
          </>
        )}
        {!isProcessing && !hasFile && !error && (
          <>
            <p style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
              Arrastra tu reporte de sesión aquí
            </p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              o{' '}
              <span style={{ color: 'var(--accent-blue)', fontWeight: 600, cursor: 'pointer' }}>
                haz clic para seleccionar
              </span>
            </p>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 14 }}>
              {['.xlsx', '.xls', '.csv'].map((ext) => (
                <span key={ext} style={{
                  padding: '2px 10px',
                  fontSize: '0.7rem',
                  fontFamily: 'monospace',
                  borderRadius: 4,
                  background: 'rgba(255,255,255,0.05)',
                  color: 'var(--text-secondary)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  letterSpacing: '0.05em',
                }}>
                  {ext}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
