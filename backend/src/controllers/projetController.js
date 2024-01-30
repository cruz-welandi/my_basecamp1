const dbModels = require('../models/dbModels');

const addProjet = async (req, res) => {
    const { NameProjet, desProjet } = req.body;

    try {
        if (!NameProjet || !desProjet) {
            return res.status(400).json({ message: "Le nom et la description du projet sont requis." });
        }

        const sql = `INSERT INTO Projets (NameProjet, desProjet, DateCreated) VALUES (?, ?, ?)`;
        const params = [NameProjet, desProjet, new Date().toISOString()];

        await dbModels.run(sql, params);
        return res.status(201).json({ message: "Le projet a été ajouté avec succès." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur interne du serveur." });
    }
};

const updateProjet = async (req, res) => {
    const { id } = req.params;
    const { NameProjet, desProjet } = req.body;

    try {
        if (!id || !NameProjet || !desProjet) {
            return res.status(400).json({ message: "L'identifiant du projet, le nom et la description du projet sont requis pour la mise à jour." });
        }

        const sql = `UPDATE Projets SET NameProjet = ?, desProjet = ?, DateCreated = ? WHERE id = ?`;
        const params = [NameProjet, desProjet, new Date().toISOString(), id];

        await dbModels.run(sql, params);
        return res.status(200).json({ message: "Le nom et la description du projet ont été mis à jour avec succès." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur interne du serveur." });
    }
};

const listProject = async (req, res) => {
    try {
        const sql = `SELECT * FROM Projets`;
        const projects = await dbModels.all(sql);

        return res.status(200).json({ projects });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur interne du serveur." });
    }
};


const addUserToProject = async (req, res) => {
    const { Email, projectId, Role } = req.body;

    try {
        // Vérifier si l'utilisateur avec cet email existe
        const userExistsQuery = "SELECT * FROM Users WHERE Email = ?";
        const user = await dbModels.get(userExistsQuery, [Email]);

        console.log(`email : ${user}`);

        if (!user) {
            return res.status(400).json({ message: "L'utilisateur avec cet email n'existe pas." });
        }

        // Insérer l'utilisateur dans la table ProjetMembers avec le rôle spécifié
        const insertQuery = "INSERT INTO ProjetMembers (UserId, ProjetId, Role) VALUES (?, ?, ?)";
        await dbModels.run(insertQuery, [user.id, projectId, Role]);

        return res.status(200).json({ message: "L'utilisateur a été ajouté au projet avec succès." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur interne du serveur." });
    }
};


module.exports = {
    addProjet,
    updateProjet,
    listProject,
    addUserToProject,
};
