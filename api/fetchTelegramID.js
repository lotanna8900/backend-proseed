module.exports = (req, res) => {
  const telegramID = req.query.telegramId;
  if (!telegramID) {
    return res.status(400).json({ error: 'Missing telegramId query parameter' });
  }
  res.json({ telegramID });
};

