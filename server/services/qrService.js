import QRCode from "qrcode";

const generateQRCode = async (bookingId) => {
  try {
    const qr = await QRCode.toDataURL(bookingId);

    return qr;

  } catch (error) {
    throw error;
  }
};

export default generateQRCode;