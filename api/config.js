export default function handler(req, res) {
  res.status(200).json({
    overshootKey: process.env.OVERSHOOT_API_KEY
  });
}
