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
  // El usuario indica que los datos están invertidos en su Excel:
  const apellido = (row['Nombre'] || row['Nombres'] || '').toString().trim().toUpperCase();
  const nombre = (row['Apellido'] || row['Apellidos'] || '').toString().trim().toUpperCase();

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
      // Intercambiamos el mapeo según la indicación del usuario de que los Nombres aparecían en los Apellidos
      const apellido = (row['Nombre'] || row['Nombres'] || '').toString().trim().toUpperCase();
      const nombre = (row['Apellido'] || row['Apellidos'] || '').toString().trim().toUpperCase();
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

/**
 * Normaliza una cadena removiendo acentos, espacios y pasándola a minúsculas para comparaciones robustas.
 */
function normalizeName(str) {
  if (!str) return '';
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "").toLowerCase();
}

/**
 * Agrega datos de asistencia de múltiples días en una lista consolidada.
 * Si se proporciona un masterTemplate, la lista devuelta sigue exactamente ese orden y contenido.
 * @param {object} daysData - Objeto donde las llaves son días (lunes, martes, etc.) y los valores son arreglos de registros procesados.
 * @param {Array} masterTemplate - (Opcional) Arreglo con la plantilla maestra de estudiantes.
 * @returns {object} Un objeto con { aggregated: [], unmatched: [] }
 */
export function aggregateAttendanceData(daysData, masterTemplate = null) {
  // Primero reunimos a todos los que entraron al Meet en un mapa
  const meetMap = {};
  for (const [day, records] of Object.entries(daysData)) {
    if (!records || !Array.isArray(records)) continue;
    for (const record of records) {
      const key = `${normalizeName(record.apellido)}|${normalizeName(record.nombre)}`;
      if (!meetMap[key]) {
        meetMap[key] = {
          email: record.email,
          nombre: record.nombre,
          apellido: record.apellido,
          attendance: {},
          matched: false
        };
      }
      meetMap[key].attendance[day] = {
        minutes: record.minutes,
        duracionRaw: record.duracionRaw,
        status: record.status
      };
    }
  }

  // Si existe una plantilla maestra, cruzamos los datos
  if (masterTemplate && masterTemplate.length > 0) {
    const aggregated = masterTemplate.map(student => {
      const result = {
        email: '', 
        nombre: student.nombres,
        apellido: student.apellidos,
        orden: student.orden,
        attendance: {}
      };

      const targetApellido = normalizeName(student.apellidos);
      const targetNombre = normalizeName(student.nombres);
      const key = `${targetApellido}|${targetNombre}`;

      if (meetMap[key]) {
        meetMap[key].matched = true; // Lo marcamos como reconocido
        result.email = meetMap[key].email || result.email;
        for (const day of Object.keys(daysData)) {
          if (meetMap[key].attendance[day]) {
            result.attendance[day] = meetMap[key].attendance[day];
          } else {
            result.attendance[day] = { minutes: 0, duracionRaw: '0 min', status: 'F' };
          }
        }
      } else {
        // Estudiante de la plantilla no entró al Meet
        for (const day of Object.keys(daysData)) {
          result.attendance[day] = { minutes: 0, duracionRaw: '0 min', status: 'F' };
        }
      }

      return result;
    });

    // Extraemos los que no hicieron match (invitados, docentes, etc)
    const unmatched = Object.values(meetMap).filter(p => !p.matched);

    return { aggregated, unmatched };
  }

  // Comportamiento original si no hay plantilla
  const aggregated = Object.values(meetMap).sort((a, b) => {
    const apellidoComp = a.apellido.localeCompare(b.apellido, 'es', { sensitivity: 'base' });
    if (apellidoComp !== 0) return apellidoComp;
    return a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' });
  });

  return { aggregated, unmatched: [] };
}
