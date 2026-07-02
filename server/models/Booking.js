import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      unique: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
    },

    mobile: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },

    age: {
      type: Number,
      required: true,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },

    tickets: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
      max: 5,
    },

    ticketPrice: {
      type: Number,
      default: 499,
    },

    totalAmount: {
      type: Number,
    },
transactionId: {
  type: String,
  required: true,
  unique: true,
  trim: true,
},

    paymentScreenshot: {
      type: String,
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    ticketSent: {
      type: Boolean,
      default: false,
    },
    qrCode: {
  type: String,
  default: "",
},

ticketPdf: {
  type: String,
  default: "",
},

pdfGenerated: {
  type: Boolean,
  default: false,
},
approvedAt: {
  type: Date,
},

  adminRemark: {
      type: String,
      default: "",
    },
    checkedIn: {
  type: Boolean,
  default: false,
},

checkedInAt: {
  type: Date,
},

checkedInBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Guard",
},
  },
  
  {
    timestamps: true,
  }
);

bookingSchema.pre("save", function () {
  this.totalAmount = this.ticketPrice * this.tickets;
});
export default mongoose.model("Booking", bookingSchema);