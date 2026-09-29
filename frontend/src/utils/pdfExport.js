// SQRMT — PDF Export Utility
// Generates individual per-entry PDF reports using jsPDF + jspdf-autotable

async function getBase64Image(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch image");
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error converting image to Base64:", error);
    return null;
  }
}

function drawHeader(doc, { title, docNo, projectTitle, submittedBy }) {
  const pageW = doc.internal.pageSize.getWidth();
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });

  // Navy header background
  doc.setFillColor(0, 51, 102);
  doc.rect(0, 0, pageW, 32, "F");

  // Blue accent right panel
  doc.setFillColor(0, 100, 180);
  doc.rect(pageW - 82, 0, 82, 32, "F");

  // Organisation label (yellow)
  doc.setTextColor(255, 213, 79);
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.text("SOLID STATE PHYSICS LABORATORY · NEW DELHI · DEFENCE RESEARCH & DEVELOPMENT ORGANISATION", 8, 7);

  // Form Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(title, 8, 16);

  // Doc No
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 210, 255);
  doc.text(`Doc No: ${docNo}`, 8, 22);

  // Submitted By
  if (submittedBy) {
    doc.setTextColor(200, 225, 255);
    doc.setFontSize(7);
    doc.text(`Submitted By: ${submittedBy}`, 8, 28);
  }

  // Right panel info
  doc.setTextColor(180, 210, 255);
  doc.setFontSize(6.5);
  doc.text("Issue No.: 01  |  Issue Date: 01.01.2024", pageW - 80, 8);
  doc.text("Rev. No.: 01   |  Rev. Date: 30.04.2025", pageW - 80, 14);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  const projText = `Project: ${projectTitle || "N/A"}`;
  doc.text(projText, pageW - 80, 21, { maxWidth: 78 });
  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 225, 255);
  doc.setFontSize(6.5);
  doc.text(`Generated: ${dateStr}`, pageW - 80, 29);
}

function drawFooter(doc, { footerLeft, footerRight }) {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const pg = doc.internal.getCurrentPageInfo().pageNumber;
  const total = doc.internal.getNumberOfPages();

  doc.setFillColor(245, 247, 250);
  doc.rect(0, pageH - 11, pageW, 11, "F");
  doc.setDrawColor(189, 204, 224);
  doc.line(0, pageH - 11, pageW, pageH - 11);

  doc.setFontSize(6.5);
  doc.setTextColor(90, 110, 140);
  doc.setFont("helvetica", "normal");
  doc.text(footerLeft || "APPROVED BY: Dr. Meena Mishra, Director SSPL", 8, pageH - 4);
  doc.text(footerRight || "ISSUED BY: Dr. R. S. Saxena, Head QMS & MR", pageW / 2, pageH - 4, { align: "center" });
  doc.text(`Page ${pg} of ${total}`, pageW - 8, pageH - 4, { align: "right" });
}

/**
 * Download a single-entry PDF report.
 * @param {Object} opts
 * @param {string} opts.title       - Form title, e.g. "Opportunity Register"
 * @param {string} opts.docNo       - Document number
 * @param {string} opts.projectTitle
 * @param {string} opts.submittedBy - Name of submitter
 * @param {Array}  opts.sections    - Array of { heading, fields: [{label, value}] }
 * @param {string} [opts.footerLeft]
 * @param {string} [opts.footerRight]
 * @param {string} [opts.filename]
 */
export async function downloadEntryPDF({
  title, docNo, projectTitle, submittedBy,
  sections, footerLeft, footerRight, filename,
}) {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  drawHeader(doc, { title, docNo, projectTitle, submittedBy });

  let cursorY = 38;

  for (const section of sections) {
    // Section heading bar
    if (section.heading) {
      doc.setFillColor(232, 240, 251);
      doc.rect(10, cursorY, pageW - 20, 7, "F");
      doc.setDrawColor(42, 84, 148);
      doc.setLineWidth(0.4);
      doc.rect(10, cursorY, pageW - 20, 7, "S");
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 51, 102);
      doc.text(section.heading.toUpperCase(), 13, cursorY + 4.8);
      cursorY += 7;
    }

    // Fields table
    const body = section.fields.map(f => [f.label, f.value || "—"]);

    autoTable(doc, {
      startY: cursorY,
      body,
      theme: "grid",
      styles: {
        fontSize: 9,
        cellPadding: { top: 3, right: 4, bottom: 3, left: 4 },
        overflow: "linebreak",
        lineColor: [200, 215, 235],
        lineWidth: 0.3,
        textColor: [30, 40, 60],
        valign: "middle",
      },
      columnStyles: {
        0: {
          fontStyle: "bold",
          textColor: [42, 84, 148],
          fillColor: [245, 248, 255],
          cellWidth: 55,
        },
        1: {
          textColor: [30, 40, 60],
        },
      },
      margin: { left: 10, right: 10 },
      didDrawPage: () => {
        drawFooter(doc, { footerLeft, footerRight });
      },
    });

    cursorY = doc.lastAutoTable.finalY + 5;
  }

  // Ensure footer on last page
  drawFooter(doc, { footerLeft, footerRight });

  doc.save(filename || `${title.replace(/\s+/g, "_")}_Entry.pdf`);
}

/**
 * Download Quality Objectives PDF in the exact physical DRDO form format.
 * Matches the photo: bordered header with SSPL logo area + metadata grid,
 * "QUALITY OBJECTIVES" title, table with 5 columns, APPROVED/ISSUED footer.
 *
 * @param {Object} opts
 * @param {string} opts.projectTitle
 * @param {Array}  opts.items       - Array of objective entries to fill the table
 * @param {string} [opts.filename]
 */
export async function downloadObjectivesPDF({ projectTitle, items, filename }) {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();   // 210
  const pageH = doc.internal.pageSize.getHeight();  // 297
  const M = 12; // page margin
  const CW = pageW - 2 * M; // content width

  // Load logo-right.png and convert to base64
  let logoBase64 = null;
  try {
    logoBase64 = await getBase64Image("/logo-right.png");
  } catch (err) {
    console.error("Failed to load logo", err);
  }

  // ── HEADER BOX ──────────────────────────────────────────────────────────────
  const HDR_H = 32;
  const LOGO_W = CW * 0.44;
  const META_W = CW - LOGO_W;
  const LX = M;            // header left edge
  const RX = M + LOGO_W;   // metadata left edge

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.rect(LX, M, CW, HDR_H); // outer border

  // vertical divider between logo area and metadata
  doc.line(RX, M, RX, M + HDR_H);

  // ── Logo area (left side) ─────────────────────────────────
  if (logoBase64) {
    // Add real logo image
    doc.addImage(logoBase64, "PNG", LX + 4, M + 9, 14, 14);
  } else {
    // Fallback: DRDO emblem: concentric circles + text (simplified)
    const CX = LX + 10;
    const CY = M + HDR_H / 2;
    doc.setLineWidth(0.4);
    doc.circle(CX, CY, 6.5);
    doc.circle(CX, CY, 4.8);
    doc.setFontSize(4.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("DRDO", CX, CY - 1.2, { align: "center" });
    doc.text("SSPL", CX, CY + 2.5, { align: "center" });
  }

  // Org text
  const TXT_X = LX + 49.5;
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Solid State Physics Laboratory", TXT_X, M + 7, { align: "center" });
  doc.text("New Delhi", TXT_X, M + 12.5, { align: "center" });
  doc.setFontSize(7.5);
  doc.text("QUALITY FORMAT", TXT_X, M + 19, { align: "center" });
  doc.text("QUALITY PROMOTION GROUP", TXT_X, M + 24, { align: "center" });
  doc.text("ACTIVITY", TXT_X, M + 29, { align: "center" });

  // ── Metadata grid (right side) ──────────────────────────────
  doc.setLineWidth(0.3);
  // Row boundaries at y = M+8, M+16, M+24 (inside header)
  const rows = [M + 8, M + 16, M + 24];
  rows.forEach(y => doc.line(RX, y, M + CW, y));

  // Mid-column for issue/rev split (rows 2 & 3)
  const MID_X = RX + META_W / 2;
  doc.line(MID_X, M + 8, MID_X, M + 24);

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  // Row 1: Doc No. (full width)
  doc.text("Doc. No.: QF/QPG/QUALITY OBJECTIVES", RX + 2, M + 5.5);
  // Row 2: Issue
  doc.text("Issue No.: 01", RX + 2, M + 13);
  doc.text("Issue Date: 01.01.2024", MID_X + 2, M + 13);
  // Row 3: Rev
  doc.text("Rev. No.: 01", RX + 2, M + 21);
  doc.text("Rev. Date: 30.04.2025", MID_X + 2, M + 21);
  // Row 4: Pages (full width)
  doc.text("Pages: 1 of 1", RX + 2, M + 29);

  // ── TITLE ───────────────────────────────────────────────────────────────────
  const TITLE_Y = M + HDR_H + 10;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("QUALITY OBJECTIVES", pageW / 2, TITLE_Y, { align: "center" });
  // Underline
  const tw = doc.getTextWidth("QUALITY OBJECTIVES");
  doc.setLineWidth(0.4);
  doc.line(pageW / 2 - tw / 2, TITLE_Y + 1.2, pageW / 2 + tw / 2, TITLE_Y + 1.2);

  // ── Sub-heading ─────────────────────────────────────────────────────────────
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Responsibility: Activity In charge.", M, TITLE_Y + 8);

  // ── TABLE ───────────────────────────────────────────────────────────────────
  const TABLE_Y = TITLE_Y + 12;
  const FOOTER_H = 18; // reserve for footer
  const maxTableY = pageH - M - FOOTER_H;

  autoTable(doc, {
    startY: TABLE_Y,
    head: [["Details of\nActivity", "Target", "Status", "Remarks", "Signature &\nDate"]],
    body: items.map(item => [
      item.detailsActivity || "",
      item.target || "",
      item.status || "",
      item.remarks || "",
      item.signatureDate || "",
    ]),
    theme: "grid",
    styles: {
      fontSize: 9,
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.3,
      valign: "top",
      overflow: "linebreak",
      cellPadding: { top: 3, left: 2, right: 2, bottom: 3 },
      fillColor: [255, 255, 255],
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      fontSize: 9,
      halign: "center",
      lineColor: [0, 0, 0],
      lineWidth: 0.3,
    },
    alternateRowStyles: { fillColor: [255, 255, 255] },
    columnStyles: {
      0: { cellWidth: 45 },
      1: { cellWidth: 28 },
      2: { cellWidth: 24 },
      3: { cellWidth: 52 },
      4: { cellWidth: CW - 45 - 28 - 24 - 52 },
    },
    margin: { left: M, right: M, bottom: FOOTER_H + M },
    tableWidth: CW,
    rowPageBreak: "avoid",
    didDrawPage: () => {
      // Re-draw footer on every page
      const FY = pageH - M - FOOTER_H;
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.4);
      doc.rect(M, FY, CW, FOOTER_H);
      const MF = M + CW / 2;
      doc.line(MF, FY, MF, FY + FOOTER_H);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      doc.text("APPROVED BY", M + CW * 0.25, FY + FOOTER_H - 4, { align: "center" });
      doc.text("ISSUED BY", M + CW * 0.75, FY + FOOTER_H - 4, { align: "center" });
    },
  });

  doc.save(filename || `Quality_Objectives_${projectTitle || "Report"}.pdf`);
}

/**
 * Download Quality Opportunities PDF in the exact physical DRDO form format.
 * Matches the photo: bordered header with SSPL logo area + metadata grid,
 * and immediate table with 6 columns: Op. No., Process, Opportunity, Potential Benefit,
 * Implementation Plan (if any), Remarks.
 *
 * @param {Object} opts
 * @param {string} opts.projectTitle
 * @param {Array}  opts.items       - Array of opportunity entries to fill the table
 * @param {string} [opts.filename]
 */
export async function downloadOpportunitiesPDF({ projectTitle, items, filename }) {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();   // 210
  const pageH = doc.internal.pageSize.getHeight();  // 297
  const M = 12; // page margin
  const CW = pageW - 2 * M; // content width

  // Load logo-right.png and convert to base64
  let logoBase64 = null;
  try {
    logoBase64 = await getBase64Image("/logo-right.png");
  } catch (err) {
    console.error("Failed to load logo", err);
  }

  // ── HEADER BOX ──────────────────────────────────────────────────────────────
  const HDR_H = 32;
  const LOGO_W = CW * 0.44;
  const META_W = CW - LOGO_W;
  const LX = M;            // header left edge
  const RX = M + LOGO_W;   // metadata left edge

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.rect(LX, M, CW, HDR_H); // outer border

  // vertical divider between logo area and metadata
  doc.line(RX, M, RX, M + HDR_H);

  // ── Logo area (left side) ─────────────────────────────────
  if (logoBase64) {
    // Add real logo image
    doc.addImage(logoBase64, "PNG", LX + 4, M + 9, 14, 14);
  } else {
    // Fallback: DRDO emblem: concentric circles + text (simplified)
    const CX = LX + 10;
    const CY = M + HDR_H / 2;
    doc.setLineWidth(0.4);
    doc.circle(CX, CY, 6.5);
    doc.circle(CX, CY, 4.8);
    doc.setFontSize(4.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("DRDO", CX, CY - 1.2, { align: "center" });
    doc.text("SSPL", CX, CY + 2.5, { align: "center" });
  }

  // Org text
  const TXT_X = LX + 49.5;
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Solid State Physics Laboratory", TXT_X, M + 6.5, { align: "center" });
  doc.text("New Delhi", TXT_X, M + 11.5, { align: "center" });
  doc.setFontSize(7.5);
  doc.text("QUALITY FORMAT", TXT_X, M + 18, { align: "center" });
  
  // Dynamic Activity/Project Title
  const actText = `${projectTitle || "IR MATERIALS AND DEVICES"} ACTIVITY`.toUpperCase();
  doc.setFontSize(7);
  doc.text(actText, TXT_X, M + 24.5, { align: "center", maxWidth: LOGO_W - 20 });

  // ── Metadata grid (right side) ──────────────────────────────
  doc.setLineWidth(0.3);
  // Row boundaries at y = M+8, M+16, M+24 (inside header)
  const rows = [M + 8, M + 16, M + 24];
  rows.forEach(y => doc.line(RX, y, M + CW, y));

  // Mid-column for issue/rev split (rows 2 & 3)
  const MID_X = RX + META_W / 2;
  doc.line(MID_X, M + 8, MID_X, M + 24);

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  // Row 1: Doc No. (full width)
  doc.text("Doc. No.: QF/QPG/OPP", RX + 2, M + 5.5);
  // Row 2: Issue
  doc.text("Issue No.: 01", RX + 2, M + 13);
  doc.text("Issue Date: 01.01.2024", MID_X + 2, M + 13);
  // Row 3: Rev
  doc.text("Rev. No.: 01", RX + 2, M + 21);
  doc.text("Rev. Date: 30.04.2025", MID_X + 2, M + 21);
  // Row 4: Pages (full width)
  doc.text("Pages: 1 of 1", RX + 2, M + 29);

  // ── TABLE ───────────────────────────────────────────────────────────────────
  const TABLE_Y = M + HDR_H + 6;
  const FOOTER_H = 18; // reserve for footer

  autoTable(doc, {
    startY: TABLE_Y,
    head: [["Op. No.", "Process", "Opportunity", "Potential Benefit", "Implementation\nPlan (if any)", "Remarks"]],
    body: items.map(item => [
      item.opNo || "",
      item.process || "",
      item.opportunity || "",
      item.potentialBenefit || "",
      item.implementationPlan || "",
      item.remarks || "",
    ]),
    theme: "grid",
    styles: {
      fontSize: 9,
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.3,
      valign: "top",
      overflow: "linebreak",
      cellPadding: { top: 3, left: 2, right: 2, bottom: 3 },
      fillColor: [255, 255, 255],
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      fontSize: 9,
      halign: "center",
      lineColor: [0, 0, 0],
      lineWidth: 0.3,
    },
    alternateRowStyles: { fillColor: [255, 255, 255] },
    columnStyles: {
      0: { cellWidth: 16, halign: "center" },
      1: { cellWidth: 26 },
      2: { cellWidth: 42 },
      3: { cellWidth: 42 },
      4: { cellWidth: 38 },
      5: { cellWidth: CW - 16 - 26 - 42 - 42 - 38 },
    },
    margin: { left: M, right: M, bottom: FOOTER_H + M },
    tableWidth: CW,
    rowPageBreak: "avoid",
    didDrawPage: () => {
      // Re-draw footer on every page
      const FY = pageH - M - FOOTER_H;
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.4);
      doc.rect(M, FY, CW, FOOTER_H);
      const MF = M + CW / 2;
      doc.line(MF, FY, MF, FY + FOOTER_H);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      doc.text("APPROVED BY", M + CW * 0.25, FY + FOOTER_H - 4, { align: "center" });
      doc.text("ISSUED BY", M + CW * 0.75, FY + FOOTER_H - 4, { align: "center" });
    },
  });

  doc.save(filename || `Opportunity_Register_${projectTitle || "Report"}.pdf`);
}

/**
 * Download FRACAS Failure Report PDF in the exact physical DRDO form format.
 * Matches the photo: bordered header with SSPL logo area + metadata grid,
 * title, and customized form sections table.
 *
 * @param {Object} opts
 * @param {string} opts.projectTitle
 * @param {Object} opts.item         - The FRACAS entry
 * @param {string} [opts.filename]
 */
export async function downloadFracasPDF({ projectTitle, item, filename }) {
  const { default: jsPDF } = await import("jspdf");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();   // 210
  const pageH = doc.internal.pageSize.getHeight();  // 297
  const M = 12; // page margin
  const CW = pageW - 2 * M; // content width

  // Load logo-right.png and convert to base64
  let logoBase64 = null;
  try {
    logoBase64 = await getBase64Image("/logo-right.png");
  } catch (err) {
    console.error("Failed to load logo", err);
  }

  // ── HEADER BOX ──────────────────────────────────────────────────────────────
  const HDR_H = 32;
  const LOGO_W = CW * 0.44;
  const META_W = CW - LOGO_W;
  const LX = M;            // header left edge
  const RX = M + LOGO_W;   // metadata left edge

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.rect(LX, M, CW, HDR_H); // outer border

  // vertical divider between logo area and metadata
  doc.line(RX, M, RX, M + HDR_H);

  // ── Logo area (left side) ─────────────────────────────────
  if (logoBase64) {
    // Add real logo image
    doc.addImage(logoBase64, "PNG", LX + 4, M + 9, 14, 14);
  } else {
    // Fallback: DRDO emblem: concentric circles + text (simplified)
    const CX = LX + 10;
    const CY = M + HDR_H / 2;
    doc.setLineWidth(0.4);
    doc.circle(CX, CY, 6.5);
    doc.circle(CX, CY, 4.8);
    doc.setFontSize(4.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("DRDO", CX, CY - 1.2, { align: "center" });
    doc.text("SSPL", CX, CY + 2.5, { align: "center" });
  }

  // Org text
  const TXT_X = LX + 49.5;
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Solid State Physics Laboratory", TXT_X, M + 6.5, { align: "center" });
  doc.text("New Delhi", TXT_X, M + 11.5, { align: "center" });
  doc.setFontSize(7.5);
  doc.text("QUALITY FORMAT", TXT_X, M + 18, { align: "center" });
  doc.setFontSize(8.5);
  doc.text("FRACAS", TXT_X, M + 24.5, { align: "center" });

  // ── Metadata grid (right side) ──────────────────────────────
  doc.setLineWidth(0.3);
  // Row boundaries at y = M+8, M+16, M+24 (inside header)
  const rows = [M + 8, M + 16, M + 24];
  rows.forEach(y => doc.line(RX, y, M + CW, y));

  // Mid-column for issue/rev split (rows 2 & 3)
  const MID_X = RX + META_W / 2;
  doc.line(MID_X, M + 8, MID_X, M + 24);

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  // Row 1: Doc No. (full width)
  doc.text("Doc. No. : QF/QPG/FRACAS", RX + 2, M + 5.5);
  // Row 2: Issue
  doc.text("Issue No.: 01", RX + 2, M + 13);
  doc.text("Issue Date: 01.01.2024", MID_X + 2, M + 13);
  // Row 3: Rev
  doc.text("Rev. No.: 00", RX + 2, M + 21);
  doc.text("Rev. Date: 30.04.2025", MID_X + 2, M + 21);
  // Row 4: Pages (full width)
  doc.text("Pages : 1 of 1", RX + 2, M + 29);

  // ── TITLE ───────────────────────────────────────────────────────────────────
  const TITLE_Y = M + HDR_H + 10;
  doc.setFontSize(10.5);
  doc.setFont("helvetica", "bold");
  doc.text("Format for Failure Reporting, Analysis and Corrective Actions", pageW / 2, TITLE_Y, { align: "center" });
  // Underline
  const tw = doc.getTextWidth("Format for Failure Reporting, Analysis and Corrective Actions");
  doc.setLineWidth(0.4);
  doc.line(pageW / 2 - tw / 2, TITLE_Y + 1.2, pageW / 2 + tw / 2, TITLE_Y + 1.2);

  // ── No/Lab/Year ─────────────────────────────────────────────────────────────
  const NO_Y = TITLE_Y + 8;
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "normal");
  doc.text(`No/Lab/Year : ${item.noLabYear || "—"}`, LX, NO_Y);

  // ── TABLE ───────────────────────────────────────────────────────────────────
  const TY = NO_Y + 4; // Table Top Y
  const W1 = 40; // Col 1 width
  const W2 = 66; // Col 2 width
  const W3 = CW - W1 - W2; // Col 3 width (80)
  
  // Row 1: Header (Height 10)
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.4);
  doc.rect(LX, TY, CW, 10);
  // Vertical dividers in header
  doc.line(LX + W1, TY, LX + W1, TY + 10);
  doc.line(LX + W1 + W2, TY, LX + W1 + W2, TY + 10);

  // Header Texts
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("Date and Time of\nFailure Event", LX + W1/2, TY + 4, { align: "center" });
  doc.text("Project", LX + W1 + W2/2, TY + 6, { align: "center" });
  doc.text("Failed Component / Item Description", LX + W1 + W2 + W3/2, TY + 6, { align: "center" });

  // Row 2: Content (Height 36)
  const TY2 = TY + 10;
  doc.rect(LX, TY2, CW, 36);
  doc.line(LX + W1, TY2, LX + W1, TY2 + 36);
  doc.line(LX + W1 + W2, TY2, LX + W1 + W2, TY2 + 36);

  // Column 1 Content: Date Time Failure
  doc.setFont("helvetica", "normal");
  doc.text(item.dateTimeFailure || "—", LX + 3, TY2 + 6, { maxWidth: W1 - 6 });

  // Column 2 Content: Project Name & Type
  doc.text("Project Name:", LX + W1 + 3, TY2 + 6);
  doc.setFont("helvetica", "bold");
  doc.text(item.projectName || "—", LX + W1 + 3, TY2 + 11, { maxWidth: W2 - 6 });
  doc.setFont("helvetica", "normal");
  doc.text("Type of Project:", LX + W1 + 3, TY2 + 21);
  doc.setFont("helvetica", "bold");
  doc.text(item.typeOfProject || "—", LX + W1 + 3, TY2 + 26, { maxWidth: W2 - 6 });

  // Column 3 Content: nomenclature, serialNo, manufacturer
  doc.setFont("helvetica", "normal");
  doc.text("Nomenclature:", LX + W1 + W2 + 3, TY2 + 6);
  doc.setFont("helvetica", "bold");
  doc.text(item.nomenclature || "—", LX + W1 + W2 + 3, TY2 + 11, { maxWidth: W3 - 6 });
  doc.setFont("helvetica", "normal");
  doc.text("Serial No.:", LX + W1 + W2 + 3, TY2 + 19);
  doc.setFont("helvetica", "bold");
  doc.text(item.serialNo || "—", LX + W1 + W2 + 3, TY2 + 24, { maxWidth: W3 - 6 });
  doc.setFont("helvetica", "normal");
  doc.text("Component manufacturer name:", LX + W1 + W2 + 3, TY2 + 32);
  doc.setFont("helvetica", "bold");
  doc.text(item.componentManufacturer || "—", LX + W1 + W2 + 48, TY2 + 32, { maxWidth: W3 - 52 });

  // Row 3: Failure Description (Height 48)
  const TY3 = TY2 + 36;
  doc.setFont("helvetica", "bold");
  doc.rect(LX, TY3, CW, 48);
  doc.text("Failure Description:", LX + 3, TY3 + 6);
  
  doc.setFont("helvetica", "normal");
  doc.text("Failure reported:", LX + 3, TY3 + 13);
  doc.text(item.failureReported || "—", LX + 8, TY3 + 18, { maxWidth: CW - 16 });

  doc.text("Defect Observed:", LX + 3, TY3 + 30);
  doc.text(item.defectObserved || "—", LX + 8, TY3 + 35, { maxWidth: CW - 16 });

  // Row 4: Status of Failure Analysis / Investigation (Height 45)
  const TY4 = TY3 + 48;
  doc.setFont("helvetica", "bold");
  doc.rect(LX, TY4, CW, 45);
  doc.text("Status of Failure Analysis / Investigation:", LX + 3, TY4 + 6);
  
  doc.setFont("helvetica", "normal");
  doc.text(item.statusAnalysis || "—", LX + 8, TY4 + 13, { maxWidth: CW - 16 });

  // Row 5: Type of Failure (Height 12)
  const TY5 = TY4 + 45;
  doc.setFont("helvetica", "bold");
  doc.rect(LX, TY5, CW, 12);
  doc.text("Type of Failure :", LX + 3, TY5 + 7.5);
  
  const opts = ["Minor", "Major", "Serious", "Critical"];
  let optX = LX + 32;
  opts.forEach(opt => {
    const isSelected = item.typeOfFailure === opt;
    if (isSelected) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(200, 0, 0); // Red
      doc.text(opt, optX, TY5 + 7.5);
      const twOpt = doc.getTextWidth(opt);
      doc.setDrawColor(200, 0, 0);
      doc.rect(optX - 2, TY5 + 3.5, twOpt + 4, 6);
    } else {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(opt, optX, TY5 + 7.5);
    }
    optX += 28;
  });

  // Reset Colors
  doc.setTextColor(0, 0, 0);
  doc.setDrawColor(0, 0, 0);

  // ── FOOTER BOX ──────────────────────────────────────────────────────────────
  const FOOTER_H = 18;
  const FY = pageH - M - FOOTER_H;
  doc.setLineWidth(0.4);
  doc.rect(M, FY, CW, FOOTER_H);
  const MF = M + CW / 2;
  doc.line(MF, FY, MF, FY + FOOTER_H);
  
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.text("APPROVED BY", M + 3, FY + 5);
  doc.text("ISSUED BY", MF + 3, FY + 5);

  doc.setFont("helvetica", "bold");
  doc.text("Dr. Meena Mishra,", M + CW * 0.25, FY + 10, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.text("Director SSPL", M + CW * 0.25, FY + 14, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.text("Dr. R. S. Saxena,", MF + CW * 0.25, FY + 10, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.text("Head QMS & MR", MF + CW * 0.25, FY + 14, { align: "center" });

  doc.save(filename || `FRACAS_${item.noLabYear || "Report"}.pdf`);
}

/**
 * Download Risk Assessment Table PDF in the exact physical DRDO form format.
 * Matches the photo: bordered header with SSPL logo area + metadata grid,
 * title, Dept/Dealing Officer box, and 2-level header table with 9 columns.
 *
 * @param {Object} opts
 * @param {string} opts.projectTitle
 * @param {Array}  opts.items       - Array of risk entries to fill the table
 * @param {string} [opts.filename]
 */
export async function downloadRisksPDF({ projectTitle, items, filename }) {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();   // 210
  const pageH = doc.internal.pageSize.getHeight();  // 297
  const M = 12; // page margin
  const CW = pageW - 2 * M; // content width

  // Load logo-right.png and convert to base64
  let logoBase64 = null;
  try {
    logoBase64 = await getBase64Image("/logo-right.png");
  } catch (err) {
    console.error("Failed to load logo", err);
  }

  // ── HEADER BOX ──────────────────────────────────────────────────────────────
  const HDR_H = 32;
  const LOGO_W = CW * 0.44;
  const META_W = CW - LOGO_W;
  const LX = M;            // header left edge
  const RX = M + LOGO_W;   // metadata left edge

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.rect(LX, M, CW, HDR_H); // outer border

  // vertical divider between logo area and metadata
  doc.line(RX, M, RX, M + HDR_H);

  // ── Logo area (left side) ─────────────────────────────────
  if (logoBase64) {
    // Add real logo image
    doc.addImage(logoBase64, "PNG", LX + 4, M + 9, 14, 14);
  } else {
    // Fallback: DRDO emblem: concentric circles + text (simplified)
    const CX = LX + 10;
    const CY = M + HDR_H / 2;
    doc.setLineWidth(0.4);
    doc.circle(CX, CY, 6.5);
    doc.circle(CX, CY, 4.8);
    doc.setFontSize(4.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("DRDO", CX, CY - 1.2, { align: "center" });
    doc.text("SSPL", CX, CY + 2.5, { align: "center" });
  }

  // Org text
  const TXT_X = LX + 49.5;
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Solid State Physics Laboratory", TXT_X, M + 6.5, { align: "center" });
  doc.text("New Delhi", TXT_X, M + 11.5, { align: "center" });
  doc.setFontSize(7.5);
  doc.text("QUALITY FORMAT", TXT_X, M + 18, { align: "center" });
  doc.setFontSize(8.5);
  doc.text("QUALITY PROMOTION GROUP ACTIVITY", TXT_X, M + 24.5, { align: "center", maxWidth: LOGO_W - 20 });

  // ── Metadata grid (right side) ──────────────────────────────
  doc.setLineWidth(0.3);
  // Row boundaries at y = M+8, M+16, M+24 (inside header)
  const rows = [M + 8, M + 16, M + 24];
  rows.forEach(y => doc.line(RX, y, M + CW, y));

  // Mid-column for issue/rev split (rows 2 & 3)
  const MID_X = RX + META_W / 2;
  doc.line(MID_X, M + 8, MID_X, M + 24);

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  // Row 1: Doc No. (full width)
  doc.text("Doc. No. : QF/QPG/RAT", RX + 2, M + 5.5);
  // Row 2: Issue
  doc.text("Issue No.: 01", RX + 2, M + 13);
  doc.text("Issue Date: 01.01.2024", MID_X + 2, M + 13);
  // Row 3: Rev
  doc.text("Rev. No.: 01", RX + 2, M + 21);
  doc.text("Rev. Date: 30.04.2025", MID_X + 2, M + 21);
  // Row 4: Pages (full width)
  doc.text("Pages : 1 of 1", RX + 2, M + 29);

  // ── TITLE ───────────────────────────────────────────────────────────────────
  const TITLE_Y = M + HDR_H + 10;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Risk Assessment Table", pageW / 2, TITLE_Y, { align: "center" });
  // Underline
  const tw = doc.getTextWidth("Risk Assessment Table");
  doc.setLineWidth(0.4);
  doc.line(pageW / 2 - tw / 2, TITLE_Y + 1.2, pageW / 2 + tw / 2, TITLE_Y + 1.2);

  // ── Dept/Dealing Officer Info Box ──────────────────────────────────────────
  const BOX_Y = TITLE_Y + 6;
  const BOX_H = 14;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.4);
  doc.rect(LX, BOX_Y, CW, BOX_H);
  
  // Divider
  doc.line(LX, BOX_Y + 7, LX + CW, BOX_Y + 7);
  
  // Vert dividers
  const split1 = LX + CW * 0.45;
  const split2 = LX + CW * 0.65;
  doc.line(split1, BOX_Y + 7, split1, BOX_Y + BOX_H);
  doc.line(split2, BOX_Y + 7, split2, BOX_Y + BOX_H);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(`Dept/Function: ${items[0]?.deptFunction || "—"}`, LX + 3, BOX_Y + 5);
  doc.text(`Dealing Officer: ${items[0]?.dealingOfficer || "—"}`, LX + 3, BOX_Y + 11.5);
  doc.text("SSPL", split1 + 3, BOX_Y + 11.5);
  doc.text(`Date: ${items[0]?.date || "—"}`, split2 + 3, BOX_Y + 11.5);

  // ── TABLE ───────────────────────────────────────────────────────────────────
  const TABLE_Y = BOX_Y + BOX_H + 5;
  const FOOTER_H = 18; // reserve for footer

  autoTable(doc, {
    startY: TABLE_Y,
    head: [
      [
        { content: "Risk\nNo.", rowSpan: 2, styles: { halign: "center", valign: "middle" } },
        { content: "Risk Identification", colSpan: 4, styles: { halign: "center" } },
        { content: "Risk Assessment & Evaluation", colSpan: 4, styles: { halign: "center" } }
      ],
      [
        "Process Title",
        "Process Owner",
        "Risk Description",
        "Consequence of Risk",
        "Likelihood Rating of Risk\n(1-Very Unlikely, 2-\nUnlikely, 3-Possible, 4-\nLikely & 5-Very Likely)\n(L)",
        "Impact Rating of Risk\n(1-Insignificant, 2-Low, 3-\nMedium, 4-High & 5-Very\nHigh)\n(I)",
        "Risk\nRating\nR=LxI",
        "Risk Significance\nLow if R = 1 to 4\nMedium if R = 5 to 12\nHigh if R = 15 to 25"
      ]
    ],
    body: items.map(item => [
      item.riskNo || "",
      item.processTitle || "",
      item.processOwner || "",
      item.riskDescription || "",
      item.consequences || "",
      String(item.likelihoodRating || 1),
      String(item.impactRating || 1),
      String(item.riskRating || 1),
      item.riskSignificance || "Low"
    ]),
    theme: "grid",
    styles: {
      fontSize: 8,
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.3,
      valign: "top",
      overflow: "linebreak",
      cellPadding: { top: 3, left: 1.5, right: 1.5, bottom: 3 },
      fillColor: [255, 255, 255],
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      fontSize: 7.5,
      halign: "center",
      lineColor: [0, 0, 0],
      lineWidth: 0.3,
    },
    alternateRowStyles: { fillColor: [255, 255, 255] },
    columnStyles: {
      0: { cellWidth: 14, halign: "center" },
      1: { cellWidth: 22 },
      2: { cellWidth: 20 },
      3: { cellWidth: 32 },
      4: { cellWidth: 26 },
      5: { cellWidth: 18, halign: "center" },
      6: { cellWidth: 18, halign: "center" },
      7: { cellWidth: 14, halign: "center" },
      8: { cellWidth: CW - 14 - 22 - 20 - 32 - 26 - 18 - 18 - 14, halign: "center" },
    },
    margin: { left: M, right: M, bottom: FOOTER_H + M },
    tableWidth: CW,
    rowPageBreak: "avoid",
    didDrawPage: () => {
      // Re-draw footer on every page
      const FY = pageH - M - FOOTER_H;
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.4);
      doc.rect(M, FY, CW, FOOTER_H);
      const MF = M + CW / 2;
      doc.line(MF, FY, MF, FY + FOOTER_H);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      doc.text("APPROVED BY", M + CW * 0.25, FY + FOOTER_H - 4, { align: "center" });
      doc.text("ISSUED BY", M + CW * 0.75, FY + FOOTER_H - 4, { align: "center" });
    },
  });

  doc.save(filename || `Risk_Assessment_${projectTitle || "Report"}.pdf`);
}

