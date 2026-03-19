const url = "https://script.google.com/macros/s/AKfycbzCmfYHkUoOeRUn5cQTKG11A4Kea4Z4lg8wCxTrXYSVvkTF4uQIghaL9mcTg4rrUClI/exec";
try {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', fileName: 'test.jpg' }),
    redirect: 'follow'
  });
  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Response Text Length:", text.length);
  console.log(text.substring(0, 2000));
} catch (e) {
  console.error(e);
}
