import { google } from "googleapis";
import { Readable } from 'stream';

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive'
];

export const getGoogleAuth = () => {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: SCOPES,
  });
};

export const uploadImageToDrive = async (base64Data: string, fileName: string): Promise<string | null> => {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!folderId) {
    console.warn("GOOGLE_DRIVE_FOLDER_ID not set. Skipping image upload to Drive.");
    return null;
  }

  try {
    const auth = getGoogleAuth();
    const client = await auth.getClient() as any;
    const drive = google.drive({ version: 'v3', auth: client });

    const buffer = Buffer.from(base64Data, 'base64');
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    const fileMetadata = {
      name: fileName,
      parents: [folderId]
    };
    
    const media = {
      mimeType: 'image/jpeg',
      body: stream
    };

    const file = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink',
    });

    return file.data.webViewLink || null;
  } catch (error) {
    console.error("Google Drive Upload Error:", error);
    return null;
  }
};

export const appendToGoogleSheet = async (values: string[]) => {
  const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID; 

  if (!SPREADSHEET_ID) {
    console.warn("GOOGLE_SHEET_ID not provided. Skipping Google Sheets integration.");
    return false;
  }

  try {
    const auth = getGoogleAuth();
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
        range: "Sheet1!A:N",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [
            ["Timestamp", "Ticket ID", "Name", "Email", "College Name", "Phone No", "Department", "Year", "Event Pair 1", "Event Pair 2", "Event Pair 3", "GreenWave", "UPI ID", "Screenshot Link"]
          ],
        },
      });
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Sheet1!A:N", // Append to columns A to N
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
