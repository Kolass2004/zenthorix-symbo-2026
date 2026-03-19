import { google } from "googleapis";

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

export const appendToGoogleSheet = async (values: string[]) => {
  const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID; 

  if (!SPREADSHEET_ID) {
    console.warn("GOOGLE_SHEET_ID not provided. Skipping Google Sheets integration.");
    return false;
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: SCOPES,
    });

    const client = await auth.getClient() as any;
    const sheets = google.sheets({ version: "v4", auth: client });

    // Check if the sheet is empty to add headers
    const getRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Sheet1!A1:M1",
    });

    if (!getRes.data.values || getRes.data.values.length === 0) {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: "Sheet1!A:M",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [
            ["Timestamp", "Ticket ID", "Name", "Email", "College Name", "Phone No", "Department", "Year", "Event Pair 1", "Event Pair 2", "Event Pair 3", "GreenWave", "UPI ID"]
          ],
        },
      });
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Sheet1!A:M", // Append to columns A to M
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [values],
      },
    });

    return true;
  } catch (error) {
    console.error("Google Sheets Error:", error);
    return false;
  }
};
