const express = require('express');

const report = require('./report');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'Auth',
  });
});
router.use('/report', report);

module.exports = router;
