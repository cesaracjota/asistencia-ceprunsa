import React from 'react';
import {
  StyleSheet,
  Page,
  Text,
  View,
  Document,
  pdf,
} from '@react-pdf/renderer';
import { formatMinutes } from '../utils/parseAttendance';

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────────────
const NAVY  = '#0A192F';
const GOLD  = '#C5A021';
const WHITE = '#FFFFFF';
const GRAY_LIGHT = '#F4F6F9';
const GRAY_MID   = '#D1D5DB';
const TEXT_DARK  = '#1E293B';
const TEXT_MID   = '#475569';
const TEXT_LIGHT  = '#94A3B8';
const GREEN = '#16A34A';
const RED   = '#DC2626';

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  // PAGE
  page: {
    backgroundColor: WHITE,
    fontFamily: 'Helvetica',
    padding: 44,
    fontSize: 10,
  },

  // LUXURY FRAME
  pageFrame: {
    position: 'absolute',
    top: 18, left: 18, right: 18, bottom: 18,
    border: `3 solid ${NAVY}`,
  },
  innerFrame: {
    position: 'absolute',
    top: 27, left: 27, right: 27, bottom: 27,
    border: `1 solid ${GOLD}`,
  },
  cornerTL: { position: 'absolute', top: 23, left: 23, width: 18, height: 18, borderTop: `3 solid ${GOLD}`, borderLeft: `3 solid ${GOLD}` },
  cornerTR: { position: 'absolute', top: 23, right: 23, width: 18, height: 18, borderTop: `3 solid ${GOLD}`, borderRight: `3 solid ${GOLD}` },
  cornerBL: { position: 'absolute', bottom: 23, left: 23, width: 18, height: 18, borderBottom: `3 solid ${GOLD}`, borderLeft: `3 solid ${GOLD}` },
  cornerBR: { position: 'absolute', bottom: 23, right: 23, width: 18, height: 18, borderBottom: `3 solid ${GOLD}`, borderRight: `3 solid ${GOLD}` },

  // WATERMARK
  watermark: {
    position: 'absolute',
    top: '32%',
    left: '18%',
    opacity: 0.025,
    fontSize: 110,
    color: NAVY,
  },

  // ── PAGE 1 HEADER ──────────────────────────────────────────────────────────
  headerBand: {
    backgroundColor: NAVY,
    marginHorizontal: -44,
    marginTop: -44,
    paddingHorizontal: 44,
    paddingVertical: 22,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandLabel: {
    fontSize: 7,
    color: GOLD,
    letterSpacing: 3,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 19,
    color: WHITE,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 4,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  headerDateLabel: {
    fontSize: 7,
    color: GOLD,
    letterSpacing: 2,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 3,
  },
  headerDate: {
    fontSize: 11,
    color: WHITE,
    fontFamily: 'Helvetica-Bold',
  },
  headerThreshold: {
    fontSize: 8,
    color: '#94A3B8',
    marginTop: 5,
  },

  // ── GOLD DIVIDER ───────────────────────────────────────────────────────────
  goldDivider: {
    height: 1,
    backgroundColor: GOLD,
    opacity: 0.5,
    marginBottom: 18,
  },
  goldDividerFull: {
    height: 1,
    backgroundColor: GOLD,
    opacity: 0.4,
    marginVertical: 10,
  },

  // ── SUMMARY BOXES ──────────────────────────────────────────────────────────
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 22,
  },
  summaryBox: {
    flex: 1,
    borderRadius: 6,
    padding: 14,
    alignItems: 'center',
  },
  summaryBoxTotal: {
    backgroundColor: '#EFF6FF',
    border: `1 solid #BFDBFE`,
  },
  summaryBoxA: {
    backgroundColor: '#F0FDF4',
    border: `1 solid #86EFAC`,
  },
  summaryBoxF: {
    backgroundColor: '#FEF2F2',
    border: `1 solid #FECACA`,
  },
  summaryBoxAvg: {
    backgroundColor: '#FFFBEB',
    border: `1 solid #FDE68A`,
  },
  summaryValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 22,
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 7,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: TEXT_MID,
    fontFamily: 'Helvetica-Bold',
  },
  summaryPct: {
    fontSize: 8,
    marginTop: 2,
    fontFamily: 'Helvetica-Bold',
  },

  // ── TABLE ──────────────────────────────────────────────────────────────────
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: NAVY,
    paddingVertical: 7,
    paddingHorizontal: 8,
    marginBottom: 0,
  },
  tableHeaderCell: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: GOLD,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottom: `0.5 solid ${GRAY_MID}`,
  },
  tableRowAlt: {
    backgroundColor: GRAY_LIGHT,
  },
  tableCell: {
    fontSize: 8.5,
    color: TEXT_DARK,
  },
  tableCellMuted: {
    fontSize: 8,
    color: TEXT_LIGHT,
  },
  tableCellBold: {
    fontSize: 8.5,
    color: TEXT_DARK,
    fontFamily: 'Helvetica-Bold',
  },

  // STATUS PILL
  badgeA: {
    backgroundColor: '#DCFCE7',
    borderRadius: 99,
    paddingHorizontal: 7,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  badgeAText: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: GREEN,
    letterSpacing: 0.5,
  },
  badgeF: {
    backgroundColor: '#FEE2E2',
    borderRadius: 99,
    paddingHorizontal: 7,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  badgeFText: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: RED,
    letterSpacing: 0.5,
  },

  // COL WIDTHS (total ~100%)
  colNum:      { width: '6%' },
  colApellido: { width: '18%' },
  colNombre:   { width: '18%' },
  colEmail:    { width: '30%' },
  colDur:      { width: '16%' },
  colStatus:   { width: '12%' },

  // ── SIGNATURE / SEAL (Page 1) ───────────────────────────────────────────────
  sigSection: {
    position: 'absolute',
    bottom: 52,
    left: 52,
    width: 150,
  },
  sigLine: {
    borderTop: `1 solid ${NAVY}`,
    marginTop: 4,
  },
  sigName: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
    marginTop: 3,
  },
  sigTitle: {
    fontSize: 7.5,
    color: TEXT_MID,
    marginTop: 1,
  },
  sealContainer: {
    position: 'absolute',
    bottom: 48,
    right: 52,
  },
  sealCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    border: `1.5 dashed ${GOLD}`,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFBF0',
  },
  sealText: {
    fontSize: 6.5,
    color: GOLD,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
  },

  // ── PAGE 2 HEADER BAND ─────────────────────────────────────────────────────
  page2HeaderBand: {
    backgroundColor: NAVY,
    marginHorizontal: -44,
    marginTop: -44,
    paddingHorizontal: 44,
    paddingVertical: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  page2Title: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: GOLD,
    letterSpacing: 1,
  },
  page2Subtitle: {
    fontSize: 8,
    color: '#94A3B8',
    marginTop: 3,
  },

  // ── SECTION TITLE ──────────────────────────────────────────────────────────
  sectionTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
    borderLeft: `3 solid ${GOLD}`,
    paddingLeft: 8,
    marginTop: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // ── STATS GRID (Page 2) ─────────────────────────────────────────────────────
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    width: '22%',
    backgroundColor: GRAY_LIGHT,
    border: `1 solid ${GRAY_MID}`,
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 6.5,
    color: TEXT_MID,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontFamily: 'Helvetica-Bold',
  },

  // ── FOOTER ─────────────────────────────────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 36,
    left: 44,
    right: 44,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTop: `0.5 solid ${GRAY_MID}`,
    paddingTop: 6,
  },
  footerText: {
    fontSize: 7,
    color: TEXT_LIGHT,
  },
  footerGold: {
    fontSize: 7,
    color: GOLD,
    fontFamily: 'Helvetica-Bold',
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function formatDateLong(date) {
  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatTime(date) {
  return date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
function FrameDecor() {
  return (
    <>
      <View style={S.pageFrame} fixed />
      <View style={S.innerFrame} fixed />
      <View style={S.cornerTL} fixed />
      <View style={S.cornerTR} fixed />
      <View style={S.cornerBL} fixed />
      <View style={S.cornerBR} fixed />
    </>
  );
}

function GoldDivider() {
  return <View style={S.goldDivider} />;
}

function StatusBadge({ status }) {
  return status === 'A' ? (
    <View style={S.badgeA}><Text style={S.badgeAText}>Asistencia</Text></View>
  ) : (
    <View style={S.badgeF}><Text style={S.badgeFText}>Falta</Text></View>
  );
}

// Reusable table header
function TableHeader() {
  return (
    <View style={S.tableHeaderRow} fixed>
      <Text style={[S.tableHeaderCell, S.colNum]}>#</Text>
      <Text style={[S.tableHeaderCell, S.colApellido]}>Apellido</Text>
      <Text style={[S.tableHeaderCell, S.colNombre]}>Nombre</Text>
      <Text style={[S.tableHeaderCell, S.colEmail]}>Correo</Text>
      <Text style={[S.tableHeaderCell, S.colDur]}>Duración</Text>
      <Text style={[S.tableHeaderCell, S.colStatus]}>Estado</Text>
    </View>
  );
}

function TableRow({ record, index }) {
  const isAlt = index % 2 === 1;
  return (
    <View style={[S.tableRow, isAlt && S.tableRowAlt]} wrap={false}>
      <Text style={[S.tableCellMuted, S.colNum]}>{index + 1}</Text>
      <Text style={[S.tableCellBold, S.colApellido]}>{record.apellido}</Text>
      <Text style={[S.tableCell, S.colNombre]}>{record.nombre}</Text>
      <Text style={[S.tableCellMuted, S.colEmail]} numberOfLines={1}>{record.email}</Text>
      <Text style={[S.tableCell, S.colDur]}>{formatMinutes(record.minutes)}</Text>
      <View style={S.colStatus}>
        <StatusBadge status={record.status} />
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENT COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export function AttendancePDFDocument({ records, thresholdMinutes, fileName }) {
  const now = new Date();
  const dateStr = formatDateLong(now);
  const timeStr = formatTime(now);

  // Stats
  const total = records.length;
  const asistencias = records.filter((r) => r.minutes >= thresholdMinutes).length;
  const faltas = total - asistencias;
  const avgMin = total > 0
    ? Math.round(records.reduce((acc, r) => acc + r.minutes, 0) / total)
    : 0;
  const pctA = total > 0 ? ((asistencias / total) * 100).toFixed(1) : '0.0';
  const pctF = total > 0 ? (100 - parseFloat(pctA)).toFixed(1) : '0.0';

  // Live status based on current threshold
  const evaluated = records.map((r) => ({
    ...r,
    status: r.minutes >= thresholdMinutes ? 'A' : 'F',
  }));

  const sourceFile = fileName || 'Reporte de sesión';

  return (
    <Document
      title="Reporte de Asistencia — CEPRUNSA"
      author="Sistema Asistencia CEPRUNSA"
      subject="Control de Asistencia"
      creator="Asistencia CEPRUNSA"
    >
      {/* ================================================================
          PAGE 1 — PORTADA + TABLA PRINCIPAL
      ================================================================ */}
      <Page size="A4" style={S.page}>
        <FrameDecor />
        <Text style={S.watermark}>CEPRUNSA</Text>

        {/* Header band */}
        <View style={S.headerBand}>
          <View>
            <Text style={S.brandLabel}>Universidad Nacional de San Agustín</Text>
            <Text style={S.headerTitle}>Reporte de Asistencia</Text>
            <Text style={S.headerSubtitle}>Archivo: {sourceFile}</Text>
          </View>
          <View style={S.headerRight}>
            <Text style={S.headerDateLabel}>Generado el</Text>
            <Text style={S.headerDate}>{dateStr}</Text>
            <Text style={S.headerThreshold}>
              Umbral: {formatMinutes(thresholdMinutes)} mínimo → Asistencia (A)
            </Text>
          </View>
        </View>

        <GoldDivider />

        {/* Summary boxes */}
        <View style={S.summaryRow}>
          <View style={[S.summaryBox, S.summaryBoxTotal]}>
            <Text style={[S.summaryValue, { color: '#1D4ED8' }]}>{total}</Text>
            <Text style={S.summaryLabel}>Total Evaluados</Text>
            <Text style={[S.summaryPct, { color: '#3B82F6' }]}>100%</Text>
          </View>
          <View style={[S.summaryBox, S.summaryBoxA]}>
            <Text style={[S.summaryValue, { color: GREEN }]}>{asistencias}</Text>
            <Text style={S.summaryLabel}>Asistencias (A)</Text>
            <Text style={[S.summaryPct, { color: GREEN }]}>{pctA}%</Text>
          </View>
          <View style={[S.summaryBox, S.summaryBoxF]}>
            <Text style={[S.summaryValue, { color: RED }]}>{faltas}</Text>
            <Text style={S.summaryLabel}>Faltas (F)</Text>
            <Text style={[S.summaryPct, { color: RED }]}>{pctF}%</Text>
          </View>
          <View style={[S.summaryBox, S.summaryBoxAvg]}>
            <Text style={[S.summaryValue, { color: '#92400E', fontSize: 16 }]}>
              {formatMinutes(avgMin)}
            </Text>
            <Text style={S.summaryLabel}>Duración Promedio</Text>
            <Text style={[S.summaryPct, { color: '#B45309' }]}>Por participante</Text>
          </View>
        </View>

        {/* Table */}
        <TableHeader />
        {evaluated.map((r, i) => (
          <TableRow key={`${r.email}-${i}`} record={r} index={i} />
        ))}

        {/* Signature */}
        <View style={S.sigSection}>
          <Text style={{ fontSize: 9, fontStyle: 'italic', color: TEXT_MID }}>
            Sistema de Control de Asistencia
          </Text>
          <View style={S.sigLine} />
          <Text style={S.sigName}>ASISTENCIA CEPRUNSA</Text>
          <Text style={S.sigTitle}>Plataforma de Registro Académico</Text>
        </View>

        {/* Seal */}
        <View style={S.sealContainer}>
          <View style={S.sealCircle}>
            <Text style={S.sealText}>GENERADO{'\n'}AUTOMÁTICAMENTE</Text>
            <Text style={[S.sealText, { fontSize: 5.5, marginTop: 3, opacity: 0.7 }]}>
              {timeStr} · {dateStr}
            </Text>
          </View>
        </View>

        {/* Page footer */}
        <View style={S.footer} fixed>
          <Text style={S.footerText}>Procesamiento local — sin envío de datos a servidores</Text>
          <Text style={S.footerGold}>CEPRUNSA · Control de Asistencia</Text>
          <Text style={S.footerText} render={({ pageNumber, totalPages }) =>
            `Página ${pageNumber} de ${totalPages}`
          } />
        </View>
      </Page>

      {/* ================================================================
          PAGE 2 — RESUMEN ANALÍTICO
      ================================================================ */}
      <Page size="A4" style={S.page}>
        <FrameDecor />
        <Text style={S.watermark}>CEPRUNSA</Text>

        {/* Page 2 header */}
        <View style={S.page2HeaderBand}>
          <View>
            <Text style={S.page2Title}>Informe Analítico de Asistencia</Text>
            <Text style={S.page2Subtitle}>
              Umbral de evaluación: {formatMinutes(thresholdMinutes)} · {dateStr}
            </Text>
          </View>
          <Text style={{ fontSize: 9, color: '#64748B', fontFamily: 'Helvetica-Bold' }}>
            ASISTENCIA CEPRUNSA
          </Text>
        </View>

        {/* Section: stats breakdown */}
        <Text style={S.sectionTitle}>I. Estadísticas Generales</Text>
        <View style={S.statsGrid}>
          {[
            { label: 'Total', val: String(total), color: '#1D4ED8' },
            { label: 'Asistencias', val: String(asistencias), color: GREEN },
            { label: 'Faltas', val: String(faltas), color: RED },
            { label: '% Asistencia', val: `${pctA}%`, color: '#92400E' },
          ].map((s) => (
            <View key={s.label} style={S.statCard}>
              <Text style={[S.statValue, { color: s.color }]}>{s.val}</Text>
              <Text style={S.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Section: asistencias list */}
        <Text style={S.sectionTitle}>II. Participantes con Asistencia (A)</Text>
        <View style={S.tableHeaderRow}>
          <Text style={[S.tableHeaderCell, S.colNum]}>#</Text>
          <Text style={[S.tableHeaderCell, S.colApellido]}>Apellido</Text>
          <Text style={[S.tableHeaderCell, S.colNombre]}>Nombre</Text>
          <Text style={[S.tableHeaderCell, S.colEmail]}>Correo</Text>
          <Text style={[S.tableHeaderCell, { width: '16%' }]}>Duración</Text>
        </View>
        {evaluated
          .filter((r) => r.status === 'A')
          .map((r, i) => (
            <View
              key={`a-${i}`}
              style={[S.tableRow, i % 2 === 1 && S.tableRowAlt]}
              wrap={false}
            >
              <Text style={[S.tableCellMuted, S.colNum]}>{i + 1}</Text>
              <Text style={[S.tableCellBold, S.colApellido]}>{r.apellido}</Text>
              <Text style={[S.tableCell, S.colNombre]}>{r.nombre}</Text>
              <Text style={[S.tableCellMuted, S.colEmail]}>{r.email}</Text>
              <Text style={[S.tableCell, { width: '16%', color: GREEN, fontFamily: 'Helvetica-Bold' }]}>
                {formatMinutes(r.minutes)}
              </Text>
            </View>
          ))}

        {/* Section: faltas list */}
        <Text style={S.sectionTitle}>III. Participantes con Falta (F)</Text>
        <View style={S.tableHeaderRow}>
          <Text style={[S.tableHeaderCell, S.colNum]}>#</Text>
          <Text style={[S.tableHeaderCell, S.colApellido]}>Apellido</Text>
          <Text style={[S.tableHeaderCell, S.colNombre]}>Nombre</Text>
          <Text style={[S.tableHeaderCell, S.colEmail]}>Correo</Text>
          <Text style={[S.tableHeaderCell, { width: '16%' }]}>Duración</Text>
        </View>
        {evaluated
          .filter((r) => r.status === 'F')
          .map((r, i) => (
            <View
              key={`f-${i}`}
              style={[S.tableRow, i % 2 === 1 && S.tableRowAlt]}
              wrap={false}
            >
              <Text style={[S.tableCellMuted, S.colNum]}>{i + 1}</Text>
              <Text style={[S.tableCellBold, S.colApellido]}>{r.apellido}</Text>
              <Text style={[S.tableCell, S.colNombre]}>{r.nombre}</Text>
              <Text style={[S.tableCellMuted, S.colEmail]}>{r.email}</Text>
              <Text style={[S.tableCell, { width: '16%', color: RED, fontFamily: 'Helvetica-Bold' }]}>
                {formatMinutes(r.minutes)}
              </Text>
            </View>
          ))}

        {/* Footer */}
        <View style={S.footer} fixed>
          <Text style={S.footerText}>Asistencia CEPRUNSA · Procesamiento 100% local en el navegador</Text>
          <Text style={S.footerGold}>CEPRUNSA</Text>
          <Text style={S.footerText} render={({ pageNumber, totalPages }) =>
            `Página ${pageNumber} de ${totalPages}`
          } />
        </View>
      </Page>
    </Document>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT UTILITY
// ─────────────────────────────────────────────────────────────────────────────
export async function downloadAttendancePDF({ records, thresholdMinutes, fileName }) {
  const blob = await pdf(
    <AttendancePDFDocument
      records={records}
      thresholdMinutes={thresholdMinutes}
      fileName={fileName}
    />
  ).toBlob();

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const base = fileName ? fileName.replace(/\.[^.]+$/, '') : 'reporte';
  link.download = `asistencia_${base}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
