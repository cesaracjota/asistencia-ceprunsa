/**
 * Converts a duration string like "5 h 23 min", "44 min", "57 s", "1 h" to total minutes.
 * @param {string} durationStr - Raw duration text from the spreadsheet.
 * @returns {number} Total minutes as an integer.
 */
export function parseDurationToMinutes(durationStr) {
  if (!durationStr || typeof durationStr !== 'string') return 0;

  let total = 0;

  // Match hours: "5 h", "1h", "2 hr", etc.
  const hoursMatch = durationStr.match(/(\d+)\s*h(?:r|rs|our|ours)?/i);
  if (hoursMatch) {
    total += parseInt(hoursMatch[1], 10) * 60;
  }

  // Match minutes: "23 min", "44min", "5 m", etc.
  const minutesMatch = durationStr.match(/(\d+)\s*m(?:in|ins|inute|inutes)?(?!\s*s)/i);
  if (minutesMatch) {
    total += parseInt(minutesMatch[1], 10);
  }

  // Match seconds: "57 s", "30 sec" — convert to fractional minutes (floor)
  const secondsMatch = durationStr.match(/(\d+)\s*s(?:ec|ecs|econd|econds)?/i);
  if (secondsMatch) {
    total += Math.floor(parseInt(secondsMatch[1], 10) / 60);
  }

  return total;
}

/**
 * Determines attendance status: "A" if >= 180 minutes, "F" otherwise.
 * @param {number} minutes
 * @returns {"A"|"F"}
 */
export function getAttendanceStatus(minutes) {
  return minutes >= 180 ? 'A' : 'F';
}

/**
 * Filters out rows that are empty, header residuals, or contain "monitor"/"supervisor".
 * @param {object} row - Raw row from the spreadsheet.
 * @returns {boolean} True if the row should be kept.
 */
function isValidRow(row) {
  const email = (row['Correo electrónico'] || row['Correo electronico'] || row['Email'] || '').toString().trim();
  const nombre = (row['Nombre'] || '').toString().trim().toLowerCase();
  const apellido = (row['Apellido'] || '').toString().trim().toLowerCase();

  // Must contain '@' to be a valid email
  if (!email.includes('@')) return false;

  // Exclude monitors and supervisors
  const combined = `${email.toLowerCase()} ${nombre} ${apellido}`;
  if (combined.includes('monitor') || combined.includes('supervisor')) return false;

  return true;
}

/**
 * Normalizes column names to handle slight variations.
 */
function normalizeHeaders(rawRow) {
  const normalized = {};
  for (const key of Object.keys(rawRow)) {
    const trimmedKey = key.trim();
    normalized[trimmedKey] = rawRow[key];
  }
  return normalized;
}

/**
 * Processes raw rows from an XLSX/CSV file into structured attendance records.
 * @param {object[]} rawRows - Array of raw row objects from SheetJS.
 * @returns {object[]} Processed and sorted attendance records.
 */
export function processAttendanceData(rawRows) {
  const records = rawRows
    .map(normalizeHeaders)
    .filter(isValidRow)
    .map((row) => {
      const nombre = (row['Nombre'] || '').toString().trim();
      const apellido = (row['Apellido'] || '').toString().trim();
      const email = (row['Correo electrónico'] || row['Correo electronico'] || row['Email'] || '').toString().trim();
      const duracionRaw = (row['Duración'] || row['Duracion'] || row['Duration'] || '').toString().trim();
      const joined = (row['Hora a la que se unió'] || row['Hora a la que se unio'] || row['Join Time'] || '').toString().trim();
      const left = (row['Hora a la que abandonó la reunión'] || row['Hora a la que abandono la reunion'] || row['Leave Time'] || '').toString().trim();

      const minutes = parseDurationToMinutes(duracionRaw);
      const status = getAttendanceStatus(minutes);

      return { nombre, apellido, email, duracionRaw, minutes, joined, left, status };
    })
    // Sort alphabetically by apellido, then nombre
    .sort((a, b) => {
      const apellidoComp = a.apellido.localeCompare(b.apellido, 'es', { sensitivity: 'base' });
      if (apellidoComp !== 0) return apellidoComp;
      return a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' });
    });

  return records;
}

/**
 * Formats total minutes to a human-readable string like "3 h 20 min".
 * @param {number} minutes
 * @returns {string}
 */
export function formatMinutes(minutes) {
  if (minutes === 0) return '0 min';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}
