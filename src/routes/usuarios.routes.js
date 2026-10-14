const { Router } = require('express');
const c = require('../controllers/usuarios.controller');

const router = Router();

router.post('/', c.crear);
router.get('/', c.listar);
router.get('/:id', c.obtener);
router.put('/:id', c.actualizar);
router.delete('/:id', c.eliminar);

module.exports = router;
