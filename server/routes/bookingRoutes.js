import express from "express";
import upload from "../middleware/upload.js";
import { createBooking } from "../controllers/bookingController.js";

const router = express.Router();

router.post(
  "/",
  upload.single("paymentScreenshot"),
  createBooking
);

export default router;