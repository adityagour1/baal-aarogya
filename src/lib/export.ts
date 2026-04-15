import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Student, BmiStatus, Quarter } from './types';
import { statusLabel } from './bmi';
import { calculateAge } from './utils';

// Helper for professional status coloring in PDF
const getStatusColor = (status: string): [number, number, number] => {
  const s = status?.toUpperCase() || '';
  if (s === 'NORMAL') return [16, 185, 129]; 
  if (s.includes('SEVERELY') || s.includes('OBESE')) return [220, 38, 38]; 
  if (s.includes('UNDERWEIGHT') || s.includes('OVERWEIGHT')) return [245, 158, 11]; 
  return [100, 116, 139]; 
};

/**
 * EXPORT 1: COMPREHENSIVE PDF CLASS REPORT
 * Includes Institutional Header, Quarterly Summaries, and Detailed Registries.
 */
export function exportClassReportPDF(className: string, students: Student[], selectedQuarter: string) {
  const doc = new jsPDF();
  const quarters: Quarter[] = ['Q1', 'Q2', 'Q3', 'Q4'];
  const now = new Date().toLocaleDateString('en-IN');
  const quartersToProcess = selectedQuarter === 'Full Year' ? quarters : [selectedQuarter as Quarter];

  quartersToProcess.forEach((q, index) => {
    // 1. Filter data for the specific quarter
    const quarterData = students.map(s => {
      const record = s.history?.find(h => h.quarter === q);
      return record ? { ...s, ...record } : null;
    }).filter(item => item !== null);

    // Skip quarter if no data exists
    if (quarterData.length === 0) return;

    // Add new page for subsequent quarters in "Full Year" mode
    if (index > 0) doc.addPage();

    // 2. Institutional Header [cite: 40, 41]
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(`BAAL AAROGYA: HEALTH PORTFOLIO`, 14, 18);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`CLASS: ${className.toUpperCase()} | PHASE: ${q} ASSESSMENT`, 14, 28);
    doc.text(`GENERATED: ${now}`, 160, 28);

    // 3. Quarterly Executive Summary (Statistical Breakdown) [cite: 42, 47]
    const stats = {
      total: students.length,
      assessed: quarterData.length,
      normal: quarterData.filter(s => s.bmiStatus === 'normal').length,
      underweight: quarterData.filter(s => s.bmiStatus === 'underweight').length,
      severe: quarterData.filter(s => s.bmiStatus === 'severely-underweight').length,
      other: quarterData.filter(s => ['overweight', 'obese'].includes(s.bmiStatus)).length,
    };

    autoTable(doc, {
      startY: 45,
      head: [['Assessment Metric', 'Count', 'Nutritional Category', 'Total']],
      body: [
        ['Total Enrolled', String(stats.total), 'Healthy (Normal)', String(stats.normal)],
        ['Total Assessed', String(stats.assessed), 'Malnourished (Underweight)', String(stats.underweight)],
        ['Current Phase', q, 'Critical (Severe)', String(stats.severe)],
        ['Completion Rate', `${Math.round((stats.assessed / stats.total) * 100)}%`, 'Others (Overweight/Obese)', String(stats.other)],
      ],
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], fontSize: 9 },
      styles: { fontSize: 8, cellPadding: 2 },
    });

    // 4. Detailed Student Growth Registry [cite: 49, 105]
    const finalY = (doc as any).lastAutoTable.finalY || 85;
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.text(`Detailed Registry: ${q} Phase`, 14, finalY + 10);

    const tableBody = quarterData.map(s => [
      s.name.toUpperCase(),
      calculateAge(s.birthDate || ""),
      `${s.height} cm`,
      `${s.weight} kg`,
      s.bmi.toFixed(1),
      statusLabel(s.bmiStatus as BmiStatus).toUpperCase()
    ]);

    autoTable(doc, {
      startY: finalY + 15,
      head: [['Student Name', 'Age', 'Height', 'Weight', 'BMI', 'Status']],
      body: tableBody,
      headStyles: { fillColor: [30, 41, 59], fontSize: 9 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { fontSize: 8 },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 5) {
          data.cell.styles.textColor = getStatusColor(data.cell.raw as string);
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });
  });

  // Save the PDF [cite: 51]
  doc.save(`Health_Report_${className}_${selectedQuarter.replace(' ', '_')}.pdf`);
}

/**
 * EXPORT 2: ANALYTICAL EXCEL (CLASS REPORT)
 * Generates separate sheets for each quarter with full analytical data. [cite: 148]
 */
export function exportClassReportExcel(className: string, students: Student[], selectedQuarter: string) {
  const wb = XLSX.utils.book_new();
  const quarters: Quarter[] = ['Q1', 'Q2', 'Q3', 'Q4'];
  const quartersToProcess = selectedQuarter === 'Full Year' ? quarters : [selectedQuarter as Quarter];

  quartersToProcess.forEach(q => {
    const sheetData = students.map(s => {
      const record = s.history?.find(h => h.quarter === q);
      if (!record) return null;
      return {
        'Student Name': s.name.toUpperCase(),
        'UID': s.id.toUpperCase(),
        'Age': calculateAge(s.birthDate || ""),
        'Gender': (s.gender || "N/A").toUpperCase(),
        'Quarter': q,
        'Height (cm)': record.height,
        'Weight (kg)': record.weight,
        'BMI Score': record.bmi.toFixed(2),
        'Nutritional Status': statusLabel(record.bmiStatus).toUpperCase(),
        'Assessment Date': record.date || 'N/A'
      };
    }).filter(row => row !== null);

    if (sheetData.length > 0) {
      const ws = XLSX.utils.json_to_sheet(sheetData as any[]);
      ws['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 8 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 22 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, ws, q);
    }
  });

  XLSX.writeFile(wb, `Analytical_Data_${className}_${selectedQuarter.replace(' ', '_')}.xlsx`);
}

/**
 * EXPORT 3: STUDENT REGISTRY (BIO-DATA ONLY) [cite: 144]
 */
export function exportStudentsExcel(students: Student[], fileName: string) {
  const data = students.map(s => ({
    'Student Name': s.name.toUpperCase(),
    'Roll Number': s.id,
    'Date of Birth': s.birthDate,
    'Age': calculateAge(s.birthDate),
    'Gender': s.gender.toUpperCase(),
    'Class': s.className
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Student List');
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}