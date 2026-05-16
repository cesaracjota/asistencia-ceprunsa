import { useState, useCallback, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { processAttendanceData, aggregateAttendanceData } from '../utils/parseAttendance';

/**
 * Custom hook to handle multiple file readings via XLSX by day of the week.
 */
export function useAttendanceFiles(masterTemplate = null) {
  const [daysData, setDaysData] = useState({});
  const [fileNames, setFileNames] = useState({});
  const [errors, setErrors] = useState({});
  const [processingState, setProcessingState] = useState({});

  const processFileForDay = useCallback((dayId, file) => {
    if (!file) return;

    const isValid =
      file.name.endsWith('.xlsx') ||
      file.name.endsWith('.xls') ||
      file.name.endsWith('.csv');

    if (!isValid) {
      setErrors(prev => ({ ...prev, [dayId]: 'Formato no soportado.' }));
      return;
    }

    setErrors(prev => ({ ...prev, [dayId]: '' }));
    setProcessingState(prev => ({ ...prev, [dayId]: true }));
    setFileNames(prev => ({ ...prev, [dayId]: file.name }));

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
          setErrors(prev => ({
            ...prev,
            [dayId]: 'No se encontraron registros válidos.'
          }));
          setProcessingState(prev => ({ ...prev, [dayId]: false }));
          return;
        }

        setDaysData(prev => ({ ...prev, [dayId]: processed }));
        setProcessingState(prev => ({ ...prev, [dayId]: false }));
      } catch (err) {
        console.error(err);
        setErrors(prev => ({ ...prev, [dayId]: 'Error al procesar el archivo.' }));
        setProcessingState(prev => ({ ...prev, [dayId]: false }));
      }
    };

    reader.onerror = () => {
      setErrors(prev => ({ ...prev, [dayId]: 'Error al leer el archivo.' }));
      setProcessingState(prev => ({ ...prev, [dayId]: false }));
    };

    reader.readAsArrayBuffer(file);
  }, []);

  const removeFileForDay = useCallback((dayId) => {
    setDaysData(prev => { const n = { ...prev }; delete n[dayId]; return n; });
    setFileNames(prev => { const n = { ...prev }; delete n[dayId]; return n; });
    setErrors(prev => { const n = { ...prev }; delete n[dayId]; return n; });
    setProcessingState(prev => { const n = { ...prev }; delete n[dayId]; return n; });
  }, []);

  const resetAll = useCallback(() => {
    setDaysData({});
    setFileNames({});
    setErrors({});
    setProcessingState({});
  }, []);

  const { aggregated: aggregatedRecords, unmatched: unmatchedRecords } = useMemo(() => aggregateAttendanceData(daysData, masterTemplate), [daysData, masterTemplate]);

  return {
    daysData,
    fileNames,
    errors,
    processingState,
    aggregatedRecords,
    unmatchedRecords,
    processFileForDay,
    removeFileForDay,
    resetAll
  };
}
