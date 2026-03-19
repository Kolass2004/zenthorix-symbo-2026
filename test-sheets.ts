import { appendToGoogleSheet } from "./src/lib/google-docs";

async function test() {
  console.log("Testing Google Sheets API...");
  const result = await appendToGoogleSheet([
    new Date().toISOString(),
    "TEST-TICKET",
    "John Doe",
    "john@example.com",
    "Test College",
    "1234567890",
    "Test Dept",
    "I-YEAR",
    "None",
    "None",
    "None",
    "No",
    "123456789012"
  ]);
  console.log("Result:", result);
}

test();
