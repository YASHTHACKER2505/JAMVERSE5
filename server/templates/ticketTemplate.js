import React from "react";
import "./ticket.css";

const TicketTemplate = () => {
  const booking = {
    customerName: "YASH THACKER",
    bookingId: "JVB-2026-000001",
    tickets: 2,
    qrCode:
      "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=JVB-2026-000001",
  };

  return (
    <div className="ticket-page">

      <div className="ticket-container">

        {/* Left Ticket */}

        <div className="ticket-main">

          <div className="approved-badge">
            ✓ APPROVED
          </div>

          <div className="ticket-header">

            <h1>JAMVERSE</h1>

            <span>BHUJ</span>

            <p>
              MUSIC • CULTURE • CELEBRATION
            </p>

          </div>

          <div className="gold-line"></div>

          <div className="ticket-body">

            <div className="left-content">

              <div className="customer-block">

                <p className="label">
                  ATTENDEE
                </p>

                <h2>
                  {booking.customerName}
                </h2>

              </div>

              <div className="detail-grid">

                <div className="detail-box">

                  <span className="small-title">
                    BOOKING ID
                  </span>

                  <h4>
                    {booking.bookingId}
                  </h4>

                </div>

                <div className="detail-box">

                  <span className="small-title">
                    TICKETS
                  </span>

                  <h4>
                    {booking.tickets}
                  </h4>

                </div>

                <div className="detail-box">

                  <span className="small-title">
                    DATE
                  </span>

                  <h4>
                    12 JULY 2026
                  </h4>

                </div>

                <div className="detail-box">

                  <span className="small-title">
                    DAY
                  </span>

                  <h4>
                    SUNDAY
                  </h4>

                </div>

                <div className="detail-box full">

                  <span className="small-title">
                    TIME
                  </span>

                  <h4>
                    08:00 PM ONWARDS
                  </h4>

                </div>

                <div className="detail-box full">

                  <span className="small-title">
                    VENUE
                  </span>

                  <h4>
                    HVR GROUND,
                    <br />
                    BHUJ, GUJARAT
                  </h4>

                </div>

              </div>

            </div>

            <div className="right-content">

              <div className="qr-card">

                <img
                  src={booking.qrCode}
                  alt="QR Code"
                />

                <p>
                  Scan at Entry
                </p>

              </div>

            </div>

          </div>

          <div className="gold-line"></div>

          <div className="rules">

            <div>Carry Valid ID</div>

            <div>No Refund</div>

            <div>Non Transferable</div>

            <div>Entry Before 8 PM</div>

          </div>

          <div className="footer">

            <div className="footer-title">
              THANK YOU FOR BOOKING
            </div>

            <div className="footer-subtitle">
              SEE YOU AT JAMVERSE BHUJ
            </div>

          </div>

        </div>

        {/* Ticket Divider */}

        <div className="divider">

          <div className="circle top"></div>

          <div className="dash"></div>

          <div className="circle bottom"></div>

        </div>

        {/* Right Stub */}

        <div className="ticket-side">

          <div className="side-logo">

            <h2>JAMVERSE</h2>

            <span>BHUJ</span>

          </div>

          <div className="vertical-line"></div>

          <div className="side-details">

            <p>
              ATTENDEE
            </p>

            <h3>
              {booking.customerName}
            </h3>

            <p>
              BOOKING ID
            </p>

            <h4>
              {booking.bookingId}
            </h4>

            <p>
              DATE
            </p>

            <h4>
              12 JULY
            </h4>

            <p>
              TIME
            </p>

            <h4>
              08:00 PM
            </h4>

            <img
              src={booking.qrCode}
              alt="QR"
            />

          </div>

        </div>

      </div>

    </div>
  );
};

export default TicketTemplate;