import PDFDocument from "pdfkit";
import QRCode from "qrcode";

// ---------------------------------------------------------------------------
// Recreates the "dark gold" Jamverse Bhuj ticket (ticket.html / ticket.css)
// as a PDF using PDFKit. Layout mirrors the HTML design:
//   LEFT  = main panel  (brand, attendee card, QR, policy strip, footer)
//   RIGHT = stub panel  (entry badge, booking id, mini details, barcode)
// separated by a dashed perforation with punch-hole notches.
// ---------------------------------------------------------------------------

const generateTicketPDF = async (booking) => {
  // -------------------------------------------------------------------------
  // 0. Normalize input — everything except these has a sane static default,
  //    matching the fields the HTML template treats as dynamic.
  // -------------------------------------------------------------------------
  const data = {
    fullName: booking.fullName || "GUEST",
    bookingId: booking.bookingId || "EVT-2026-0000",
    tickets: booking.tickets ?? 1,
    status: (booking.paymentStatus || "Approved").toUpperCase(),
    date: booking.date || "12 JULY 2026",
    day: booking.day || "SATURDAY",
    time: booking.time || "08:00 PM",
    timeNote: booking.timeNote || "ONWARDS",
    venue: booking.venue || "HVR GROUND",
    venueNote: booking.venueNote || "BHUJ, GUJARAT",
    gateNote: booking.gateNote || "07:00 PM",
  };

  // -------------------------------------------------------------------------
  // 1. Page setup
  // -------------------------------------------------------------------------
  const PAGE_W = 1311;
  const PAGE_H = 546;
  const doc = new PDFDocument({ size: [PAGE_W, PAGE_H], margin: 0 });
  const buffers = [];
  doc.on("data", buffers.push.bind(buffers));

  // Page backdrop — same light gray the HTML <body> sits on, also doubles
  // as the "punch hole" color for the perforation notches.
  const PAGE_BG = "#e9e9e9";
  doc.rect(0, 0, PAGE_W, PAGE_H).fill(PAGE_BG);

  // -------------------------------------------------------------------------
  // 2. Palette (matches :root vars in ticket.css)
  // -------------------------------------------------------------------------
  const C = {
    bgDark: "#16130f",
    bgDark2: "#1c1712",
    gold: "#d9a441",
    goldLight: "#f3c96b",
    goldSoft: "#caa15c",
    cream: "#f3ede1",
    muted: "#9a9186",
    green: "#2fae5a",
    borderGold: "#8a672f",
    heart: "#e0455c",
  };

  const STATUS_STYLES = {
    APPROVED: { border: C.green, text: C.green, bg: "#1c2b20" },
    PENDING: { border: C.gold, text: C.goldLight, bg: "#2a2115" },
    REJECTED: { border: C.heart, text: C.heart, bg: "#2b1a1c" },
    CANCELLED: { border: C.heart, text: C.heart, bg: "#2b1a1c" },
  };
  const statusStyle = STATUS_STYLES[data.status] || STATUS_STYLES.APPROVED;

  // Outer ticket frame
  const TICKET_MARGIN = 20;
  const TX = TICKET_MARGIN;
  const TY = TICKET_MARGIN;
  const TW = PAGE_W - TICKET_MARGIN * 2;
  const TH = PAGE_H - TICKET_MARGIN * 2;

  const STUB_X = TX + TW * 0.72; // split point between main panel and stub
  const RADIUS = 20;

  // -------------------------------------------------------------------------
  // 3. Ticket base — rounded dark card behind both panels
  // -------------------------------------------------------------------------
  doc.roundedRect(TX, TY, TW, TH, RADIUS).fill(C.bgDark);
  doc.roundedRect(TX, TY, TW, TH, RADIUS)
    .lineWidth(1)
    .strokeColor(C.borderGold)
    .stroke();

  // Clip so panel gradients/notches respect the rounded corners
  doc.save();
  doc.roundedRect(TX, TY, TW, TH, RADIUS).clip();

  drawLeftPanel(doc, C, statusStyle, data, { x: TX, y: TY, w: STUB_X - TX, h: TH });
  drawRightStub(doc, C, data, { x: STUB_X, y: TY, w: TX + TW - STUB_X, h: TH });
  await drawQRAndBarcode(doc, C, data, { TX, TY, TW, TH, STUB_X });
  drawPerforation(doc, PAGE_BG, { STUB_X, TY, TH });

  doc.restore(); // end clip
  doc.roundedRect(TX, TY, TW, TH, RADIUS)
    .lineWidth(1)
    .strokeColor(C.borderGold)
    .stroke();

  // -------------------------------------------------------------------------
  return new Promise((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);
    doc.end();
  });
};

// ---------------------------------------------------------------------------
// LEFT PANEL — brand block, attendee details card, policy strip, footer
// ---------------------------------------------------------------------------
function drawLeftPanel(doc, C, statusStyle, data, panel) {
  const { x, y, w, h } = panel;

  // Panel background gradient (dark, subtle top-to-bottom shift)
  const grad = doc.linearGradient(x, y, x, y + h);
  grad.stop(0, C.bgDark).stop(1, C.bgDark2);
  doc.rect(x, y, w, h).fill(grad);

  const pad = 40;
  const innerX = x + pad;
  const innerW = w - pad * 2;

  // --- top row: tagline + status badge -------------------------------------
  doc.font("Helvetica-Bold").fontSize(9).fillColor(C.muted)
    .text("LIVE MUSIC.", innerX, y + 26, { characterSpacing: 0.5 })
    .text("UNLIMITED VIBES.", innerX, y + 38, { characterSpacing: 0.5 });

  drawPill(doc, {
    text: data.status,
    x: innerX + innerW - 140,
    y: y + 24,
    w: 140,
    h: 24,
    border: statusStyle.border,
    bg: statusStyle.bg,
    textColor: statusStyle.text,
  });

  // --- brand block -----------------------------------------------------------
  doc.font("Helvetica-Bold").fontSize(58).fillColor(C.goldLight)
    .text("JAMVERSE", innerX, y + 62, { width: innerW, align: "center", characterSpacing: 1 });
  doc.font("Helvetica-Bold").fontSize(26).fillColor(C.cream)
    .text("B H U J", innerX, y + 122, { width: innerW, align: "center", characterSpacing: 6 });
  doc.font("Helvetica-Bold").fontSize(11).fillColor(C.goldSoft)
    .text("FEEL THE MUSIC. LIVE THE MOMENT.", innerX, y + 154, {
      width: innerW, align: "center", characterSpacing: 2,
    });

  // --- details card ------------------------------------------------------
  // NOTE: cardY/cardH were tightened (was y+188 / h-188-90) because the
  // 5 detail rows + their sub-labels didn't actually fit inside the old
  // card height and were spilling into the policy strip below. These
  // numbers are mirrored in drawQRAndBarcode() — keep them in sync if
  // you change either one.
  const cardY = y + 170;
  const cardH = h - 170 - 90; // leave room for policy row + footer
  doc.roundedRect(innerX, cardY, innerW, cardH, 14)
    .fillOpacity(0.04).fill(C.cream);
  doc.fillOpacity(1);
  doc.roundedRect(innerX, cardY, innerW, cardH, 14)
    .lineWidth(1).strokeColor(C.borderGold).stroke();

  // Fix: "\u2605" (★) isn't in the standard Helvetica font's encoding that
  // PDFKit uses, so it was rendering as "&". "\u2022" (•) is supported.
  doc.font("Helvetica-Bold").fontSize(15).fillColor(C.cream)
    .text(`\u2022  ${data.fullName}  \u2022`, innerX, cardY + 16, {
      width: innerW, align: "center", characterSpacing: 0.5,
    });

  drawPill(doc, {
    text: "OFFICIAL ENTRY PASS",
    x: innerX + innerW / 2 - 90,
    y: cardY + 40,
    w: 180,
    h: 20,
    border: C.gold,
    bg: C.gold,
    textColor: C.bgDark,
    solid: true,
  });

  // detail rows (left column of the card)
  const rows = [
    { label: "BOOKING ID", value: data.bookingId, accent: true },
    { label: "TICKETS", value: String(data.tickets) },
    { label: "DATE", value: data.date, sub: data.day },
    { label: "TIME", value: data.time, sub: data.timeNote },
    { label: "VENUE", value: data.venue, sub: data.venueNote },
  ];

  const rowStartY = cardY + 78;
  const rowGap = 30; // was 40 — tightened to fit inside the card box
  const bulletX = innerX + 24;
  const labelX = bulletX + 18;
  const labelW = innerW * 0.55;

  rows.forEach((row, i) => {
    const ry = rowStartY + i * rowGap;
    // small gold square bullet stands in for the HTML emoji icon
    doc.roundedRect(bulletX - 5, ry + 3, 10, 10, 2).fill(C.gold);

    doc.font("Helvetica").fontSize(8).fillColor(C.muted)
      .text(row.label, labelX, ry, { characterSpacing: 0.5 });
    doc.font("Helvetica-Bold").fontSize(13)
      .fillColor(row.accent ? C.goldLight : C.cream)
      .text(row.value, labelX, ry + 11);
    if (row.sub) {
      doc.font("Helvetica").fontSize(8).fillColor(C.muted)
        .text(row.sub, labelX, ry + 22);
    }
  });

  // --- policy strip --------------------------------------------------------
  const policyY = cardY + cardH + 22;
  doc.moveTo(innerX, policyY - 12).lineTo(innerX + innerW, policyY - 12)
    .lineWidth(0.75).dash(3, { space: 3 }).strokeColor(C.borderGold).stroke();
  doc.undash();

  const policies = [
    ["CARRY", "VALID ID"],
    ["NON", "TRANSFERABLE"],
    ["NO", "REFUND"],
    ["GATE OPENS", data.gateNote],
  ];
  const colW = innerW / policies.length;
  policies.forEach(([line1, line2], i) => {
    const cx = innerX + colW * i + colW / 2;
    doc.circle(cx - colW / 2 + 14, policyY + 6, 3).fill(C.gold);
    doc.font("Helvetica-Bold").fontSize(7.5).fillColor(C.muted)
      .text(line1, cx - colW / 2, policyY, { width: colW, align: "center", characterSpacing: 0.5 })
      .text(line2, cx - colW / 2, policyY + 10, { width: colW, align: "center", characterSpacing: 0.5 });
  });

  // --- footer line -----------------------------------------------------------
  const footerY = y + h - 34;
  doc.font("Helvetica-Bold").fontSize(11).fillColor(C.goldLight)
    .text("SEE YOU AT JAMVERSE!", innerX, footerY, { width: innerW - 20, align: "center", characterSpacing: 0.5 });
  drawHeart(doc, innerX + innerW / 2 + 100, footerY + 6, 6, C.heart);
}

// ---------------------------------------------------------------------------
// RIGHT STUB — entry badge, monogram, booking id box, mini detail rows
// ---------------------------------------------------------------------------
function drawRightStub(doc, C, data, panel) {
  const { x, y, w, h } = panel;

  const grad = doc.linearGradient(x, y, x, y + h);
  grad.stop(0, C.bgDark2).stop(1, C.bgDark);
  doc.rect(x, y, w, h).fill(grad);

  const innerX = x + 26;
  const innerW = w - 52;
  const centerX = x + w / 2;

  // Fix: "\u2605" (★) -> "\u2022" (•), see note in drawLeftPanel above.
  drawPill(doc, {
    text: "\u2022 ENTRY TICKET \u2022",
    x: centerX - 90,
    y: y + 24,
    w: 180,
    h: 22,
    border: C.gold,
    bg: C.bgDark,
    textColor: C.goldLight,
  });

  // monogram logo circle
  const logoCY = y + 92;
  const logoR = 26;
  const logoGrad = doc.linearGradient(centerX - logoR, logoCY - logoR, centerX + logoR, logoCY + logoR);
  logoGrad.stop(0, C.goldLight).stop(1, C.goldSoft);
  doc.circle(centerX, logoCY, logoR).fill(logoGrad);
  doc.font("Helvetica-Bold").fontSize(18).fillColor(C.bgDark)
    .text("JV", centerX - logoR, logoCY - 9, { width: logoR * 2, align: "center" });

  doc.font("Helvetica-Bold").fontSize(15).fillColor(C.cream)
    .text("JAMVERSE", innerX, y + 128, { width: innerW, align: "center", characterSpacing: 1.5 });
  doc.font("Helvetica").fontSize(8).fillColor(C.goldSoft)
    .text("\u2014 BHUJ \u2014", innerX, y + 146, { width: innerW, align: "center", characterSpacing: 2 });

  // booking id box
  const boxY = y + 168;
  doc.roundedRect(innerX, boxY, innerW, 40, 10)
    .fillOpacity(0.04).fill(C.cream);
  doc.fillOpacity(1);
  doc.roundedRect(innerX, boxY, innerW, 40, 10)
    .lineWidth(0.75).strokeColor(C.borderGold).stroke();
  doc.font("Helvetica").fontSize(7).fillColor(C.muted)
    .text("BOOKING ID", innerX, boxY + 8, { width: innerW, align: "center", characterSpacing: 1 });
  doc.font("Helvetica-Bold").fontSize(12).fillColor(C.goldLight)
    .text(data.bookingId, innerX, boxY + 20, { width: innerW, align: "center" });

  // stash coordinates so drawQRAndBarcode() can add the mini detail rows
  // and barcode below the booking box without recomputing layout.
  doc.__stubInner = { innerX, innerW, y, h, boxY };
}

// ---------------------------------------------------------------------------
// Async section — QR code (left panel) + mini detail rows/barcode (stub)
// ---------------------------------------------------------------------------
async function drawQRAndBarcode(doc, C, data, layout) {
  const { TX, TY, TW, TH, STUB_X } = layout;
  const pad = 40;
  // NOTE: must stay in sync with cardY/cardH in drawLeftPanel().
  const cardY = TY + 170;
  const cardH = TH - 170 - 90;
  const rightColX = STUB_X - pad - 150;

  // --- QR block on the details card --------------------------------------
  const qrSize = 130;
  const qrBoxX = rightColX;
  const qrBoxY = cardY + 60;

  doc.roundedRect(qrBoxX, qrBoxY, qrSize, qrSize, 10).fill("#ffffff");

  const qrDataUrl = await QRCode.toDataURL(
    JSON.stringify({ bookingId: data.bookingId }),
    { margin: 0, color: { dark: "#16130f", light: "#00000000" } }
  );
  const qrBuffer = Buffer.from(qrDataUrl.split(",")[1], "base64");
  doc.image(qrBuffer, qrBoxX + 8, qrBoxY + 8, { width: qrSize - 16, height: qrSize - 16 });

  drawPill(doc, {
    text: "SCAN AT ENTRY",
    x: qrBoxX + qrSize / 2 - 65,
    y: qrBoxY + qrSize + 14,
    w: 130,
    h: 20,
    border: C.gold,
    bg: C.gold,
    textColor: C.bgDark,
    solid: true,
  });

  // --- stub mini detail rows -----------------------------------------------
  const { innerX, innerW, y: stubY, boxY } = doc.__stubInner;
  const miniRows = [
    { label: "NAME", value: data.fullName },
    { label: "TICKETS", value: String(data.tickets) },
    { label: "DATE", value: data.date, accent: true },
    { label: "TIME", value: `${data.time}`, sub: data.timeNote, accent: true },
    { label: "VENUE", value: data.venue, sub: data.venueNote, accent: true },
  ];
  let ry = boxY + 56;
  miniRows.forEach((row) => {
    doc.font("Helvetica").fontSize(7).fillColor(C.muted)
      .text(row.label, innerX, ry, { width: innerW, align: "center", characterSpacing: 0.5 });
    doc.font("Helvetica-Bold").fontSize(10.5)
      .fillColor(row.accent ? C.goldLight : C.cream)
      .text(row.value, innerX, ry + 10, { width: innerW, align: "center" });
    ry += 12;
    if (row.sub) {
      doc.font("Helvetica").fontSize(8).fillColor(C.muted)
        .text(row.sub, innerX, ry, { width: innerW, align: "center" });
      ry += 12;
    }
    ry += 12;
  });

  // --- barcode (vector bars, deterministic per booking) ---------------------
  const barcodeY = stubY + doc.__stubInner.h - 74;
  const barcodeH = 34;
  drawBarcode(doc, {
    x: innerX,
    y: barcodeY,
    w: innerW,
    h: barcodeH,
    seed: hashString(data.bookingId),
  });

  // Fix: "\u2605" (★) -> "\u2022" (•), see note in drawLeftPanel above.
  doc.font("Helvetica-Bold").fontSize(9).fillColor(C.goldSoft)
    .text("\u2022 THANK YOU! \u2022", innerX, stubY + doc.__stubInner.h - 30, {
      width: innerW, align: "center", characterSpacing: 1,
    });
}

// ---------------------------------------------------------------------------
// Perforation divider between the two panels
// ---------------------------------------------------------------------------
function drawPerforation(doc, pageBg, { STUB_X, TY, TH }) {
  const notchR = 14;
  doc.circle(STUB_X, TY, notchR).fill(pageBg);
  doc.circle(STUB_X, TY + TH, notchR).fill(pageBg);

  doc.dash(6, { space: 6 });
  doc.moveTo(STUB_X, TY + notchR + 6).lineTo(STUB_X, TY + TH - notchR - 6)
    .lineWidth(1.5).strokeColor("#8a672f").stroke();
  doc.undash();
}

// ---------------------------------------------------------------------------
// Small drawing helpers
// ---------------------------------------------------------------------------
function drawPill(doc, { text, x, y, w, h, border, bg, textColor, solid = false }) {
  doc.roundedRect(x, y, w, h, h / 2);
  if (solid) {
    doc.fill(bg);
  } else {
    doc.fillOpacity(0.5).fill(bg);
    doc.fillOpacity(1);
    doc.roundedRect(x, y, w, h, h / 2).lineWidth(1).strokeColor(border).stroke();
  }
  doc.font("Helvetica-Bold").fontSize(8.5).fillColor(textColor)
    .text(text, x, y + h / 2 - 4, { width: w, align: "center", characterSpacing: 0.5 });
}

function drawHeart(doc, cx, cy, size, color) {
  doc.save();
  doc.fillColor(color);
  doc.moveTo(cx, cy + size * 0.3);
  doc.bezierCurveTo(cx - size, cy - size * 0.6, cx - size * 1.6, cy + size * 0.5, cx, cy + size * 1.4);
  doc.bezierCurveTo(cx + size * 1.6, cy + size * 0.5, cx + size, cy - size * 0.6, cx, cy + size * 0.3);
  doc.fill();
  doc.restore();
}

function drawBarcode(doc, { x, y, w, h, seed }) {
  const rand = seededRandom(seed);
  doc.save();
  let bx = x;
  while (bx < x + w) {
    const barW = rand() > 0.6 ? 3 : 1.5;
    doc.rect(bx, y, barW, h).fill("#f3ede1");
    bx += barW + (rand() > 0.5 ? 4 : 2.5);
  }
  doc.restore();
}

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h) || 1;
}

// Deterministic pseudo-random generator (same booking -> same barcode).
function seededRandom(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export default generateTicketPDF;