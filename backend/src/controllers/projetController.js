const dbModels = require('../models/dbModels');
const jwt = require('jsonwebtoken');


const addProjet = async (req, res) => {
    console.log("Début de la fonction addProjet"); // Pour confirmer l'entrée dans la fonction

    const token = req.cookies.userToken;
    console.log("Token reçu!"); // Pour vérifier le token reçu

    if (!token) {
        console.log("Aucun token fourni");
        return res.status(401).send("Token non fourni. Accès non autorisé.");
    }

    const decodedToken = jwt.decode(token);
    console.log("Token décodé"); // Pour inspecter le token décodé

    const { nameProjet, desProjet } = req.body;
    console.log("Données reçues"); // Pour vérifier les données reçues

    if (!nameProjet || !desProjet) {
        console.log("Données requises manquantes");
        return res.status(400).json({ message: "Le nom et la description du projet sont requis." });
    }

    const CreatorId = decodedToken ? decodedToken['user_id'] : null;
    console.log("ID du créateur"); // Pour vérifier l'ID extrait du token

    try {
        const date = new Date();
        const dateProjet = `${date.getFullYear()}:${date.getMonth() + 1}:${date.getDate()}`;

        const sql = "INSERT INTO Projets (nameProjet, desProjet, CreatorId, DateCreated) VALUES (?, ?, ?, ?)";
        const params = [nameProjet, desProjet, CreatorId, dateProjet];

        await dbModels.run(sql, params, async function(err) {
            if (err) {
                console.error("Erreur lors de l'insertion dans la base de données:", err);
                return res.status(500).json({ message: "Erreur interne du serveur 0." });
            }

            const projectId = this.lastID;
            console.log("Projet ajouté avec succès, ID:", projectId); // Pour confirmer le succès de l'insertion

            const adminSql = 'INSERT INTO ProjetMembers (UserId, ProjetId, Role) VALUES (?, ?, ?)';
            const adminParams = [CreatorId, projectId, 'admin'];
            console.log("Paramètres SQL pour ProjetMembers correcte"); // Avant d'ajouter le membre admin

            await dbModels.run(adminSql, adminParams);
            console.log("Membre admin ajouté avec succès");

            return res.status(201).json({ message: "Le projet a été ajouté avec succès." });
        });
    } catch (error) {
        console.error("Erreur capturée dans addProjet:", error);
        return res.status(500).json({ message: "Erreur interne du serveur." });
    }
};

const updateProjet = async (req, res) => {
    console.log("Début de la fonction updateProjet");

    const token = req.cookies.userToken;
    console.log("Token reçu!"); 

    if (!token) {
        console.log("Aucun token fourni");
        return res.status(401).send("Token non fourni. Accès non autorisé.");
    }

    const decodedToken = jwt.decode(token);
    console.log("Token décodé"); // Pour inspecter le token décodé

    const userId = decodedToken ? decodedToken['user_id'] : null;
    console.log("ID du créateur"); // Pour vérifier l'ID extrait du token


    const { currentNameProjet, nameProjet, desProjet, email, role } = req.body;
    // Validation des données
    /*if (!userId || !nameProjet || !desProjet || !email || !role){
        return res.status(400).json({ message: "L'identifiant du projet, le nom et la description du projet sont requis pour la mise à jour." });
    }*/
    console.log(currentNameProjet + "\n"+ userId)

    /*function getProjectIdByName(name) {
        return new Promise((resolve, reject) => {
            dbModels.get(`SELECT Id FROM Projets WHERE nameProjet = ?`, [name], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }*/

    try {

        const getProjetIdByName = (name) => new Promise((resolve, reject) => {
            dbModels.get(`SELECT Id FROM Projets WHERE nameProjet = ?`, [name], (err, row) => {
                if (err) {
                    reject(err);
                } else if (row) {
                    resolve(row.Id);
                } else {
                    resolve(null);
                }
            });
        });

        const projetId = await getProjetIdByName(currentNameProjet);
        console.log(projetId)

        if (!projetId) {
            return res.status(404).json({ message: "Projet introuvable." });
        }

        
        // Mise à jour du projet
        const date = new Date();
        const dateProjet = `${date.getFullYear()}:${date.getMonth() + 1}:${date.getDate()}`;

        const runQuery = (sql, params) => new Promise((resolve, reject) => {
            dbModels.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes);
                    if (this.changes === 0) {
                        return res.status(404).json({ message: "Aucun projet trouvé avec l'identifiant spécifié." });
                    }
                }
            });
        });

        console.log(desProjet)

        if(nameProjet != "" && desProjet==""){
            const sql = `UPDATE Projets SET nameProjet = ?, DateCreated = ? WHERE id = ?`;
            const params = [nameProjet, dateProjet, projetId];

            await runQuery(sql, params);

            return res.status(200).json({ message: "Le nom du projet ont été mis à jour avec succès." });

        } else if(desProjet != "" && nameProjet == ""){

            const sql = `UPDATE Projets SET desProjet = ?, DateCreated = ? WHERE id = ?`;
            const params = [desProjet, dateProjet, projetId];

            await runQuery(sql, params);

            return res.status(200).json({ message: "La description du projet ont été mis à jour avec succès." });

        } else if(nameProjet != "" && desProjet != ""){

            const sql = `UPDATE Projets SET nameProjet = ?, desProjet = ?, DateCreated = ? WHERE id = ?`;
            const params = [nameProjet, desProjet, dateProjet, projetId];

            await runQuery(sql, params);

            return res.status(200).json({ message: "Le nom et la description du projet ont été mis à jour avec succès." });
        }
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur interne du serveur." });
    }
};

const listProjet = async (req, res) => {
    console.log("Début de la fonction listProjet");

    const token = req.cookies.userToken;
    console.log("Token reçu!", token); // Pour vérifier le token reçu

    if (!token) {
        console.log("Aucun token fourni");
        return res.status(401).json({ message: "Token non fourni. Accès non autorisé." });
    }

    const decodedToken = jwt.decode(token);
    console.log("Token décodé"); // Pour inspecter le token décodé

    const userId = decodedToken ? decodedToken['user_id'] : null;
    console.log("ID du créateur: ", userId); // Pour vérifier l'ID extrait du token

    function runQuery(sql, params = []) {
        return new Promise((resolve, reject) => {
            dbModels.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    try {
        // Sélectionnez le nom du projet, la description et l'email du créateur pour tous les projets créés par l'utilisateur
        const sql = `SELECT Projets.Id, Projets.nameProjet, Projets.desProjet, Users.Email 
                     FROM Projets 
                     JOIN Users ON Projets.CreatorId = Users.Id 
                     WHERE Projets.CreatorId = ?`;
        const userProjects = await runQuery(sql, [userId]);

        // Sélectionnez le nom du projet, la description et l'email du créateur pour tous les projets où l'utilisateur a été ajouté
        const sql2 = `SELECT Projets.Id, Projets.nameProjet, Projets.desProjet, Users.Email 
                      FROM Projets 
                      JOIN ProjetMembers ON Projets.Id = ProjetMembers.ProjetId 
                      JOIN Users ON Projets.CreatorId = Users.Id 
                      WHERE ProjetMembers.UserId = ? AND Projets.CreatorId != ?`;
        const projectsAddedTo = await runQuery(sql2, [userId]);

        return res.status(200).json({ userProjects, projectsAddedTo});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur interne du serveur." });
    }
};


const addUserToProject = async (req, res) => {
    const token = req.cookies.token;
    const { Email, projectId, Role } = req.body;

    if (!token) {
        return res.status(401).send("Token non fourni. Accès non autorisé.");
    }

    const userId = req.cookies.user_id; // Supposons que vous ayez une propriété user dans la requête contenant l'ID de l'utilisateur actuel

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

const deleteProjet = async (req, res) => {
    console.log("Début de la fonction deleteProjet");
    const { projectId } = req.body;

    try {
        const projectExistsQuery = "SELECT 1 FROM Projets WHERE Id = ?";
        const project = await dbModels.get(projectExistsQuery, [projectId]);
        if (!project) {
            return res.status(404).json({ message: "Projet non trouvé." });
        }

        dbModels.serialize(() => {
            dbModels.run("BEGIN TRANSACTION;");
            dbModels.run("DELETE FROM Projets WHERE Id = ?", [projectId], function (err) {
                if (err) {
                    dbModels.run("ROLLBACK;");
                    console.error("Erreur lors de la suppression du projet:", err);
                    res.status(500).json({ message: "Erreur interne du serveur.", error: err.message });
                } else {
                    dbModels.run("DELETE FROM ProjetMembers WHERE ProjetId = ?", [projectId], function (err) {
                        if (err) {
                            dbModels.run("ROLLBACK;");
                            console.error("Erreur lors de la suppression des membres du projet:", err);
                            res.status(500).json({ message: "Erreur interne du serveur.", error: err.message });
                        } else {
                            dbModels.run("COMMIT;");
                            res.status(200).json({ message: "Le projet a été supprimé avec succès." });
                        }
                    });
                }
            });
        });
    } catch (error) {
        console.error("Erreur lors de la suppression du projet:", error);
        res.status(500).json({ message: "Erreur interne du serveur.", error: error.message });
    }
};


module.exports = {
    addProjet,
    updateProjet,
    listProjet,
    addUserToProject,
    deleteProjet
};
