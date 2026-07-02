import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

const uploadPdfToCloudinary = (pdfBuffer, bookingId) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: "jamverse/tickets",
        public_id: bookingId,
        format: "pdf",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    streamifier.createReadStream(pdfBuffer).pipe(stream);
  });
};

export default uploadPdfToCloudinary;