const express = require("express");
const React = require("react");
const ReactDOMServer = require("react-dom/server");

const TicketTemplate = require("../template/ticketTemplate").default;

const router = express.Router();

router.get("/", (req, res) => {

    const booking = {
        customerName: "YASH THACKER",
        bookingId: "JVB-2026-00001",
        tickets: 2,
        qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=JVB-2026-00001"
    };

    const html = ReactDOMServer.renderToString(
        React.createElement(TicketTemplate, { booking })
    );

    res.send(`
        <!DOCTYPE html>
        <html>

        <head>
            <link rel="stylesheet" href="/template/ticket.css">
        </head>

        <body>

            ${html}

        </body>

        </html>
    `);

});

module.exports = router;