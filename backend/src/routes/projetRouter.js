const express = require('express');
const projetController = require('../controllers/projetController');
const router = express.Router();

router.post("/addProjet", projetController.addProjet);
router.put("/updateProjet", projetController.updateProjet);
router.get("/listProjet", projetController.listProject);
router.post("/addUserToProject", projetController.addUserToProject);

module.exports = router;