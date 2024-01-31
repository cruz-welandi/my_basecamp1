const dbModels = require('../models/dbModels');

const addProjet = async (req, res) => {
    const { NameProjet, desProjet } = req.body;
    const creatorId = req.user.id; // Supposons que vous ayez une propriété user dans la requête contenant l'ID de l'utilisateur actuel

    try {
        if (!NameProjet || !desProjet) {
            return res.status(400).json({ message: "Le nom et la description du projet sont requis." });
        }

        const sql = `INSERT INTO Projets (NameProjet, desProjet, CreatorId, DateCreated) VALUES (?, ?, ?, ?)`;
        const params = [NameProjet, desProjet, creatorId, new Date().toISOString()];

        await dbModels.run(sql, params, async function(err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Erreur interne du serveur." });
            }

            const projectId = this.lastID;
            const adminSql = `INSERT INTO ProjetMembers (UserId, ProjetId, Role) VALUES (?, ?, ?)`;
            const adminParams = [creatorId, projectId, 'admin'];

            await dbModels.run(adminSql, adminParams);
            return res.status(201).json({ message: "Le projet a été ajouté avec succès." });
        });
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
    const userId = req.user.id; // Supposons que vous ayez une propriété user dans la requête contenant l'ID de l'utilisateur actuel

    try {
        // Sélectionnez tous les projets créés par l'utilisateur
        const sql = `SELECT * FROM Projets WHERE CreatorId = ?`;
        const userProjects = await dbModels.all(sql, [userId]);

        // Sélectionnez tous les projets où l'utilisateur a été ajouté
        const sql2 = `SELECT p.* FROM Projets p INNER JOIN ProjetMembers pm ON p.Id = pm.ProjetId WHERE pm.UserId = ?`;
        const projectsAddedTo = await dbModels.all(sql2, [userId]);

        return res.status(200).json({ userProjects, projectsAddedTo });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur interne du serveur." });
    }
};


const addUserToProject = async (req, res) => {
    const { Email, projectId, Role } = req.body;
    const userId = req.user.id; // Supposons que vous ayez une propriété user dans la requête contenant l'ID de l'utilisateur actuel

    try {
        // Vérifiez si l'utilisateur effectuant l'ajout est un administrateur
        const isAdminQuery = "SELECT * FROM ProjetMembers WHERE UserId = ? AND ProjetId = ? AND Role = 'admin'";
        const isAdmin = await dbModels.get(isAdminQuery, [userId, projectId]);

        if (!isAdmin) {
            return res.status(403).json({ message: "Vous n'avez pas les autorisations nécessaires pour ajouter un utilisateur à ce projet." });
        }

        // Vérifier si l'utilisateur avec cet email existe
        const userExistsQuery = "SELECT * FROM Users WHERE Email = ?";
        const user = await dbModels.get(userExistsQuery, [Email]);

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