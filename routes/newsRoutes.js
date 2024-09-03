const express = require('express');
const router = express.Router();
const newsController = require('../controller/newsController');

router.get('/news', newsController.getNews);
router.get('/news/:id', newsController.getNewsById);
router.post('/news', newsController.createNews);  // Đảm bảo rằng route này tồn tại
router.put('/news/:id', newsController.updateNews);
router.delete('/news/:id', newsController.deleteNews);

module.exports = router;
