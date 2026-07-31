const express = require('express');
const leadController = require('../controllers/leadController');

const router = express.Router();

router.post('/', leadController.create);
router.get('/', leadController.list);
router.get('/trash', leadController.listTrash);
router.get('/:id', leadController.getById);
router.put('/:id', leadController.update);
router.delete('/:id', leadController.remove);
router.post('/:id/restore', leadController.restore);

module.exports = router;
