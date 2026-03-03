export default function handler(req, res) {
  // Only send non-sensitive config to the browser
  // (Overshoot key is still a key, but this avoids putting it in GitHub.)
  res.status(200).json({
    overshootKey: process.env.OVERSHOOT_API_KEY
  });
}
