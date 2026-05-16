import { useState, useCallback, useEffect } from 'react';
import * as XLSX from 'xlsx';

const STORAGE_KEY = 'asistencia_master_template';

export function useMasterTemplate() {
  const [masterTemplate, setMasterTemplate] = useState(null);
  const [error, setError] = useState('');

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setMasterTemplate(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Error reading master template from localStorage:', err);
    }
  }, []);

  const processMasterFile = useCallback((file) => {
    if (!file) return;

    const isValid = file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv');
    if (!isValid) {
      setError('Formato no soportado. Sube un Excel o CSV.');
      return;
    }

    setError('');
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array', cellText: true, cellDates: true });
        
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        // Normalize headers
        const processed = rawRows.map(row => {
          const normalized = {};
          for (const key of Object.keys(row)) {
            normalized[key.trim().toLowerCase()] = row[key];
          }
          return normalized;
        }).filter(row => row.apellidos || row.nombres); // Keep rows that have at least some name data

        const templateData = processed.map((row, index) => ({
          orden: row.orden !== undefined ? row.orden : (index + 1),
          apellidos: (row.apellidos || row.apellido || '').toString().trim().toUpperCase(),
          nombres: (row.nombres || row.nombre || '').toString().trim().toUpperCase(),
        }));

        if (templateData.length === 0) {
          setError('No se encontraron alumnos en la plantilla. Asegúrate de tener las columnas "apellidos" y "nombres".');
          return;
        }

        setMasterTemplate(templateData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(templateData));

      } catch (err) {
        console.error(err);
        setError('Error al procesar el archivo maestro.');
      }
    };

    reader.onerror = () => {
      setError('Error al leer el archivo.');
    };

    reader.readAsArrayBuffer(file);
  }, []);

  const clearMasterTemplate = useCallback(() => {
    setMasterTemplate(null);
    localStorage.removeItem(STORAGE_KEY);
    setError('');
  }, []);

  return {
    masterTemplate,
    processMasterFile,
    clearMasterTemplate,
    templateError: error
  };
}
