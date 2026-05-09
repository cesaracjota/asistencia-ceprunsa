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

  // STATUS PILL COMPACT
  badgeA: {
    backgroundColor: '#DCFCE7',
    width: 14, height: 14, borderRadius: 7,
    alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 'auto'
  },
  badgeAText: {
    fontSize: 6, fontFamily: 'Helvetica-Bold', color: GREEN,
  },
  badgeF: {
    backgroundColor: '#FEE2E2',
    width: 14, height: 14, borderRadius: 7,
    alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 'auto'
  },
  badgeFText: {
    fontSize: 6, fontFamily: 'Helvetica-Bold', color: RED,
  },
  badgeEmpty: {
    fontSize: 8, color: TEXT_LIGHT, textAlign: 'center'
  },

  // COL WIDTHS
  colNum:      { width: '6%', textAlign: 'center' },
  colNombre:   { width: '28%' },
  colEmail:    { width: '28%' },
  colDay:      { width: '5%', textAlign: 'center' },
  colTotal:    { width: '8%', textAlign: 'center', fontFamily: 'Helvetica-Bold' },

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
  if (!status) return <Text style={S.badgeEmpty}>-</Text>;
  return status === 'A' ? (
    <View style={S.badgeA}><Text style={S.badgeAText}>A</Text></View>
  ) : (
    <View style={S.badgeF}><Text style={S.badgeFText}>F</Text></View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENT COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export function AttendancePDFDocument({ records, activeDays, thresholdMinutes }) {
  const now = new Date();
  const dateStr = formatDateLong(now);
  const timeStr = formatTime(now);

  const totalStudents = records.length;
  let perfectAttendances = 0;
  let studentsWithMisses = 0;
  let totalAttendances = 0;

  records.forEach(r => {
    totalAttendances += r.totalA;
    if (r.totalF === 0 && r.totalA > 0) perfectAttendances++;
    if (r.totalF > 0) studentsWithMisses++;
  });

  const avgDays = totalStudents > 0 ? (totalAttendances / totalStudents).toFixed(1) : '0.0';
  const pctPerfect = totalStudents > 0 ? ((perfectAttendances / totalStudents) * 100).toFixed(1) : '0.0';
  const pctMissed = totalStudents > 0 ? ((studentsWithMisses / totalStudents) * 100).toFixed(1) : '0.0';

  return (
    <Document
      title="Reporte de Asistencia Semanal — CEPRUNSA"
      author="Sistema Asistencia CEPRUNSA"
      subject="Control de Asistencia Multidía"
      creator="Asistencia CEPRUNSA"
    >
      <Page size="A4" style={S.page}>
        <FrameDecor />
        <Text style={S.watermark}>CEPRUNSA</Text>

        {/* Header band */}
        <View style={S.headerBand}>
          <View>
            <Text style={S.brandLabel}>Universidad Nacional de San Agustín</Text>
            <Text style={S.headerTitle}>Reporte de Asistencia Semanal</Text>
            <Text style={S.headerSubtitle}>Consolidado multidía por estudiante</Text>
          </View>
          <View style={S.headerRight}>
            <Text style={S.headerDateLabel}>Generado el</Text>
            <Text style={S.headerDate}>{dateStr}</Text>
            <Text style={S.headerThreshold}>
              Umbral: {formatMinutes(thresholdMinutes)} por día
            </Text>
          </View>
        </View>

        <GoldDivider />

        {/* Summary boxes */}
        <View style={S.summaryRow}>
          <View style={[S.summaryBox, S.summaryBoxTotal]}>
            <Text style={[S.summaryValue, { color: '#1D4ED8' }]}>{totalStudents}</Text>
            <Text style={S.summaryLabel}>Estudiantes Ev.</Text>
            <Text style={[S.summaryPct, { color: '#3B82F6' }]}>{activeDays.length} días</Text>
          </View>
          <View style={[S.summaryBox, S.summaryBoxA]}>
            <Text style={[S.summaryValue, { color: GREEN }]}>{perfectAttendances}</Text>
            <Text style={S.summaryLabel}>Asist. Perfecta</Text>
            <Text style={[S.summaryPct, { color: GREEN }]}>{pctPerfect}%</Text>
          </View>
          <View style={[S.summaryBox, S.summaryBoxF]}>
            <Text style={[S.summaryValue, { color: RED }]}>{studentsWithMisses}</Text>
            <Text style={S.summaryLabel}>Con Faltas</Text>
            <Text style={[S.summaryPct, { color: RED }]}>{pctMissed}%</Text>
          </View>
          <View style={[S.summaryBox, S.summaryBoxAvg]}>
            <Text style={[S.summaryValue, { color: '#92400E' }]}>{avgDays}</Text>
            <Text style={S.summaryLabel}>Promedio Días</Text>
            <Text style={[S.summaryPct, { color: '#B45309' }]}>Por estudiante</Text>
          </View>
        </View>

        {/* Table Header */}
        <View style={S.tableHeaderRow} fixed>
          <Text style={[S.tableHeaderCell, S.colNum]}>#</Text>
          <Text style={[S.tableHeaderCell, S.colNombre]}>Apellidos y Nombres</Text>
          <Text style={[S.tableHeaderCell, S.colEmail]}>Correo</Text>
          {activeDays.map(day => (
            <Text key={day.id} style={[S.tableHeaderCell, S.colDay]}>{day.short}</Text>
          ))}
          <Text style={[S.tableHeaderCell, S.colTotal]}>Total</Text>
        </View>

        {/* Table Rows */}
        {records.map((r, i) => (
          <View key={r.email} style={[S.tableRow, i % 2 === 1 && S.tableRowAlt]} wrap={false}>
            <Text style={[S.tableCellMuted, S.colNum]}>{i + 1}</Text>
            <Text style={[S.tableCellBold, S.colNombre]}>{r.apellido}, {r.nombre}</Text>
            <Text style={[S.tableCellMuted, S.colEmail]} numberOfLines={1}>{r.email}</Text>
            
            {activeDays.map(day => (
              <View key={day.id} style={S.colDay}>
                <StatusBadge status={r.attendance[day.id]?.status} />
              </View>
            ))}

            <Text style={[S.tableCellBold, S.colTotal, { color: r.totalA > 0 ? GREEN : TEXT_LIGHT }]}>
              {r.totalA} / {activeDays.length}
            </Text>
          </View>
        ))}

        {/* Signature */}
        <View style={S.sigSection}>
          <Text style={{ fontSize: 9, fontStyle: 'italic', color: TEXT_MID }}>
            Sistema de Control Multidía
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
    </Document>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT UTILITY
// ─────────────────────────────────────────────────────────────────────────────
export async function downloadAttendancePDF({ records, activeDays, thresholdMinutes }) {
  const blob = await pdf(
    <AttendancePDFDocument
      records={records}
      activeDays={activeDays}
      thresholdMinutes={thresholdMinutes}
    />
  ).toBlob();

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `asistencia_semanal.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
