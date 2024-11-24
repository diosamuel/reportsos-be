const express = require('express');

const report = require('./report');
const login = require('./login');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'Auth',
  });
});
router.use('/report', report);
router.use('/login', login);

module.exports = router;
