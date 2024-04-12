const express = require('express');
const projetController = require('../controllers/projetController');
const auth = require('../middlewares/auth');
const router = express.Router();

router.post("/addProjet", projetController.addProjet);
router.put("/updateProjet", projetController.updateProjet);
router.get("/listProjet", projetController.listProjet);
router.post("/addUserToProject", projetController.addUserToProject);
router.delete("/deleteProjet",projetController.deleteProjet);

module.exports = router;