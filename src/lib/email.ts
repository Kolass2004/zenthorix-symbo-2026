import nodemailer from "nodemailer";
import QRCode from "qrcode";

// Dummy Setup for missing env variables - creates ethereal account dynamically if needed
const getTransporter = async () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (user && pass && host) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for 587
      auth: { user, pass },
    });
  }

  // Fallback to ethereal for testing if no real email is provided
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });
};

export const generateTicketId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const sendTicketEmail = async (email: string, name: string, ticketId: string, events: any) => {
  try {
    const transporter = await getTransporter();

    const qrData = JSON.stringify({
      ticketId,
      name,
      events,
    });

    const qrCodeDataUrl = await QRCode.toDataURL(qrData);

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background-color: #000000; color: #ffffff !important; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; text-align: center; }
        .header { background: linear-gradient(to right, #7f1d1d, #000); padding: 20px; border-radius: 12px 12px 0 0; }
        .header h1 { margin: 0; font-size: 32px; color: #f87171; letter-spacing: 2px; }
        .content { background-color: #111111; padding: 40px 20px; border-left: 2px solid #b91c1c; border-right: 2px solid #b91c1c; }
        .ticket-box { background-color: #000000; border: 1px dashed #ef4444; border-radius: 8px; padding: 30px; margin: 20px 0; }
        .ticket-id { font-size: 48px; font-weight: bold; color: #ef4444; letter-spacing: 5px; margin: 10px 0; }
        .qr-code { margin-top: 20px; border: 4px solid #fff; border-radius: 8px; padding: 10px; background: #ffffff; }
        .footer { background-color: #000000; padding: 20px; border-radius: 0 0 12px 12px; border-top: 1px solid #333; font-size: 12px; color: #888888; }
      </style>
    </head>
    <body style="background-color: #000000; color: #ffffff;">
      <div class="container">
        <div class="header">
          <h1 style="color: #f87171;">ZENTHORIX 2026</h1>
        </div>
        <div class="content" style="background-color: #111111;">
          <h2 style="color: #ffffff;">Registration Successful!</h2>
          <p style="color: #dddddd;">Hi ${name}, thank you for registering for Zenthorix 2026.</p>
          
          <div class="ticket-box" style="background-color: #000000;">
            <p style="color: #999999; margin: 0;">YOUR TICKET ID</p>
            <div class="ticket-id" style="color: #ef4444;">${ticketId}</div>
            
             <img src="cid:qrcode_image" alt="Ticket QR Code" class="qr-code" width="200" height="200" style="background: #ffffff;" />
            
            <table style="width: 100%; margin-top: 20px; text-align: left; background: #222222; padding: 15px; border-radius: 8px; color: #ffffff;">
              <tr><td style="color:#ef4444; width: 50%;">Pair 1</td><td style="color: #ffffff;">${events.eventPair1}</td></tr>
              <tr><td style="color:#ef4444">Pair 2</td><td style="color: #ffffff;">${events.eventPair2}</td></tr>
              <tr><td style="color:#ef4444">Pair 3</td><td style="color: #ffffff;">${events.eventPair3}</td></tr>
              <tr><td style="color:#ef4444">GreenWave</td><td style="color: #ffffff;">${events.greenWave}</td></tr>
            </table>
          </div>

          <p style="color: #dddddd;">Please show this QR code or Ticket ID at the registration desk on the day of the event.</p>

          <div style="margin-top: 30px; text-align: center;">
            <p style="color: #dddddd; font-size: 14px; margin-bottom: 15px;">Please join our official WhatsApp group for important event updates.</p>
            <a href="https://chat.whatsapp.com/FKMVS90VRkDETvfy87CGcB" target="_blank" style="display: inline-block; background-color: #25D366; color: #ffffff; text-decoration: none; font-weight: bold; padding: 12px 24px; border-radius: 8px; font-size: 16px;">
              <span style="vertical-align: middle;">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" style="vertical-align: middle; margin-right: 8px;">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564c.173.087.289.129.332.202.043.073.043.423-.101.827z"></path>
                </svg>
              </span>
              <span style="vertical-align: middle;">Join WhatsApp Group</span>
            </a>
          </div>
        </div>
        <div class="footer" style="color: #888888;">
          &copy; 2026 Zenthorix Team. All rights reserved.
        </div>
      </div>
    </body>
    </html>
    `;

    const info = await transporter.sendMail({
      from: '"Zenthorix 2026" <noreply@zenthorix.com>',
      to: email,
      subject: "Your Zenthorix 2026 Ticket & Registration Details",
      html: htmlContent,
      attachments: [
        {
          filename: 'qrcode.png',
          path: qrCodeDataUrl,
          cid: 'qrcode_image'
        }
      ]
    });

    console.log("Email sent: %s", info.messageId);
    if (!process.env.SMTP_USER) {
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};
