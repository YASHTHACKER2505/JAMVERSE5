import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const htmlPath = path.join(__dirname, "../templates/ticket.html");
const cssPath = path.join(__dirname, "../templates/ticket.css");

export const generateTicketHTML = (booking) => {
  let html = fs.readFileSync(htmlPath, "utf8");

  const css = fs.readFileSync(cssPath, "utf8");

  // Replace external CSS link with embedded CSS
  html = html.replace(
    '<link rel="stylesheet" href="./ticket.css">',
    `<style>${css}</style>`
  );

  // Replace placeholders
  html = html
    .replaceAll("{{FULL_NAME}}", booking.fullName)
    .replaceAll("{{BOOKING_ID}}", booking.bookingId)
    .replaceAll("{{TICKETS}}", booking.tickets)
    .replaceAll("{{QR_CODE}}", booking.qrCode)
    .replaceAll(
      "{{STATUS}}",
      `✓ ${booking.paymentStatus.toUpperCase()}`
    );

  return html;
};