import { useState, useRef, useCallback } from 'react';
import { UploadCloud, FileSpreadsheet, CheckCircle2, XCircle, Loader2, Trash2 } from 'lucide-react';

export default function DayDropZone({ dayId, dayLabel, onFile, onRemove, isProcessing, fileName, error }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDragEnter = useCallback((e) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e) => { e.preventDefault(); setIsDragging(false); }, []);
  const handleDragOver = useCallback((e) => { e.preventDefault(); }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFile(dayId, file);
  }, [onFile, dayId]);

  const handleChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) onFile(dayId, file);
    e.target.value = '';
  }, [onFile, dayId]);

  const hasFile = !!fileName && !error && !isProcessing;

  const zoneClass = `day-drop-zone p-4 flex flex-col items-center justify-center text-center relative
    ${isDragging ? 'drag-active' : ''}
    ${hasFile ? 'file-ok' : ''}
    ${error ? 'file-error' : ''}
  `;

  return (
    <div className="flex flex-col gap-2">
      <div className="text-center">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
          {dayLabel}
        </span>
      </div>
      <div
        className={zoneClass}
        style={{ 
          minHeight: '120px', 
          border: '1px dashed rgba(255,255,255,0.15)',
          borderRadius: '0.75rem',
          background: 'rgba(255,255,255,0.02)',
          transition: 'all 0.2s ease',
          cursor: hasFile ? 'default' : 'pointer'
        }}
        onDragEnter={!hasFile ? handleDragEnter : undefined}
        onDragLeave={!hasFile ? handleDragLeave : undefined}
        onDragOver={!hasFile ? handleDragOver : undefined}
        onDrop={!hasFile ? handleDrop : undefined}
        onClick={() => !isProcessing && !hasFile && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={handleChange}
        />

        {/* Status Icons */}
        <div className="mb-2">
          {isProcessing && <Loader2 className="spin w-6 h-6 text-[var(--accent-blue)]" />}
          {hasFile && !isProcessing && <CheckCircle2 className="w-6 h-6 text-[var(--accent-green)]" />}
          {error && !isProcessing && <XCircle className="w-6 h-6 text-[var(--accent-red)]" />}
          {!isProcessing && !hasFile && !error && (
            <UploadCloud className="w-6 h-6 text-[var(--text-muted)] group-hover:text-[var(--accent-blue)] transition-colors" />
          )}
        </div>

        {/* Text */}
        <div className="w-full px-1">
          {isProcessing && (
            <p className="text-[0.65rem] text-[var(--text-secondary)]">Procesando...</p>
          )}
          {hasFile && !isProcessing && (
            <>
              <p className="text-[0.65rem] text-[var(--text-secondary)] truncate w-full" title={fileName}>
                {fileName}
              </p>
              <button 
                onClick={(e) => { e.stopPropagation(); onRemove(dayId); }}
                className="mt-2 text-[0.6rem] flex items-center justify-center gap-1 w-full py-1 rounded bg-[rgba(248,113,113,0.1)] text-[var(--accent-red)] hover:bg-[rgba(248,113,113,0.2)] transition-colors"
              >
                <Trash2 className="w-3 h-3" /> Quitar
              </button>
            </>
          )}
          {error && !isProcessing && (
            <p className="text-[0.6rem] text-[var(--accent-red)] leading-tight">{error}</p>
          )}
          {!isProcessing && !hasFile && !error && (
            <p className="text-[0.65rem] text-[var(--text-muted)]">
              Clic o arrastrar
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
