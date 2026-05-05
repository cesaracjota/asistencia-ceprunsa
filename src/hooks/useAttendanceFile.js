import { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { processAttendanceData } from '../utils/parseAttendance';

/**
 * Custom hook to handle file reading via XLSX and processing attendance data.
 */
export function useAttendanceFile() {
  const [records, setRecords] = useState(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const processFile = useCallback((file) => {
    if (!file) return;

    const isValid =
      file.name.endsWith('.xlsx') ||
      file.name.endsWith('.xls') ||
      file.name.endsWith('.csv');

    if (!isValid) {
      setError('Formato no soportado. Por favor sube un archivo .xlsx, .xls o .csv');
      return;
    }

    setError('');
    setIsProcessing(true);
    setFileName(file.name);

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array', cellText: true, cellDates: true });

        // Take the first sheet
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convert to JSON — defval ensures empty cells become empty strings
        const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        const processed = processAttendanceData(rawRows);

        if (processed.length === 0) {
          setError(
            'No se encontraron registros válidos en el archivo. Verifica que las cabeceras sean correctas y que los correos contengan "@".'
          );
          setIsProcessing(false);
          return;
        }

        setRecords(processed);
        setIsProcessing(false);
      } catch (err) {
        console.error(err);
        setError('Error al procesar el archivo. Asegúrate de que no esté corrupto.');
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setError('Error al leer el archivo.');
      setIsProcessing(false);
    };

    reader.readAsArrayBuffer(file);
  }, []);

  const reset = useCallback(() => {
    setRecords(null);
    setFileName('');
    setError('');
    setIsProcessing(false);
  }, []);

  return { records, fileName, error, isProcessing, processFile, reset };
}
