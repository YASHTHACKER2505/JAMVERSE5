const generateBookingId = (count) => {
  return `EVT-2026-${String(count + 1).padStart(4, "0")}`;
};

export default generateBookingId;