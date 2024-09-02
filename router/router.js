const express = require('express');
const router = express.Router();
const passport = require('passport');

const controller = require('../controllers/controllers');

router.post('/register', controller.register);
router.post('/login', controller.login);
router.get('/dashboard', passport.authenticate('jwt', { session: false }), controller.dashboard)
router.get('/getallData', passport.authenticate('jwt', { session: false }), controller.getallData);
router.post('/addData', passport.authenticate('jwt', { session: false }),controller.createData);
router.put('/updateInventory/:id', passport.authenticate('jwt', { session: false }),controller.updateInventory);
router.delete('/deleteInventory/:id', passport.authenticate('jwt', { session: false }),controller.deleteData);
router.get('/getRantedInventory', passport.authenticate('jwt', { session: false }),controller.getRantedInventory);
router.post('/invoices', controller.createInvoice);
module.exports = router;
