require("dotenv").config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dbModels = require('../models/dbModels');

const login = async (req, res) => {
    try {
        const { Email, Password } = req.body;

        // Assurez-vous qu'il y a un Email et un Password dans la requête
        if (!(Email && Password)) {
            return res.status(400).send("Tous les champs sont requis");
        }

        // Utilisez une approche basée sur les promesses pour rendre le code plus lisible
        const user = await new Promise((resolve, reject) => {
            const sql = "SELECT * FROM Users WHERE Email = ?";
            dbModels.get(sql, [Email], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(row);
            });
        });

        if (!user) {
            return res.status(400).send("Utilisateur non trouvé");
        }

        // Vérifiez si les identifiants sont valides en utilisant bcrypt.compare
        const validCredentials = await bcrypt.compare(Password, user.Password);

        if (!validCredentials) {
            return res.status(400).send("Identifiants invalides");
        }

        console.log("Clé du jeton :", process.env.TOKEN_KEY);
        // Créez le jeton JWT ici
        const token = jwt.sign(
            { user_id: user.Id, username: user.Username, Email },
            process.env.TOKEN_KEY,
            { expiresIn: "1h" }
        );

        // Définir le cookie dans la réponse
        res.cookie('userToken', token, {
            maxAge: 9600000, // Durée de vie du cookie en millisecondes (1 heure)
            httpOnly: true // Le cookie ne peut être accédé que par le serveur, pas par JavaScript côté client
        });

        return res.status(200).json({
            user: {
                Id: user.Id,
                Username: user.Username,
                Email: user.Email,
                DateLoggedIn: user.DateLoggedIn,
                DateCreated: user.DateCreated
            }
        });
    } catch (err) {
        console.log(err);
        return res.status(500).send("Erreur interne du serveur");
    }
};

// route register
const register = async (req, res) => {
    try {
        var errors = [];
        const { Username, Email, Password } = req.body;

        if (!Username) {
            errors.push("Username is missing");
        }

        if (!Email) {
            errors.push("Email is missing");
        } else if (!isValidEmail(Email)) {
            errors.push("Invalid email format");
        }

        if (errors.length > 0) {
            return res.status(400).json({ "error": errors.join(",") });
        }

        let userExists = false;

        var sql = "SELECT * FROM Users WHERE Email = ?";
        await dbModels.all(sql, Email, async (err, result) => {
            if (err) {
                return res.status(402).json({ "error": err.message });
            }

            if (result.length === 0) {
                var salt = bcrypt.genSaltSync(10);

                var data = {
                    Username: Username,
                    Email: Email,
                    Password: bcrypt.hashSync(Password, salt),
                    Salt: salt,
                    DateCreated: new Date().toISOString()
                }

                var insertSql = 'INSERT INTO Users (Username, Email, Password, Salt, DateCreated) VALUES (?,?,?,?,?)'
                var params = [data.Username, data.Email, data.Password, data.Salt, data.DateCreated]

                dbModels.run(insertSql, params, function (innerErr, innerResult) {
                    if (innerErr) {
                        return res.status(400).json({ "error": innerErr.message });
                    }

                    return res.status(201).json("Success");
                });
            } else {
                userExists = true;
            }
            // Note: You don't need setTimeout here
            if (userExists) {
                return res.status(409).json("Record already exists. Please login");
            }
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ "error": "Internal Server Error" });
    }
}

//route pour mettre à jour les information de l'utilisateur

const updateUser = async (req, res) => {
    console.log("debut updateUser")
    try {
        const token = req.cookies.userToken;
        console.log("Token reçu!"); // Pour vérifier le token reçu

        if (!token) {
            console.log("Aucun token fourni");
            return res.status(401).send("Token non fourni. Accès non autorisé.");
        }

        const decodedToken = jwt.decode(token);
        console.log("Token décodé"); // Pour inspecter le token décodé
        const userId = decodedToken ? decodedToken['user_id'] : null;

        const { Username, Email, Password } = req.body;

    
        // Validation des données
        if (!Username || !Email || (Password && !isValidEmail(Email))) {
            return res.status(400).json({ message: 'Données invalides.' });
        }

        // Hash du nouveau mot de passe si fourni
        let newPassword = Password ? bcrypt.hashSync(Password, 10) : undefined;

        // Mise à jour dans la base de données
        let updateSql = `UPDATE Users SET Username = ?, Email = ?${newPassword ? ', Password = ?' : ''} WHERE Id = ?`;
        let params = [Username, Email];
        if (newPassword) params.push(newPassword);
        params.push(userId);

        dbModels.run(updateSql, params, function (err) {
            if (err) {
                return res.status(500).json({ message: err.message });
            }
            return res.status(200).json({ message: 'Mise à jour réussie.' });
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
};

// Fonction pour valider le format de l'adresse e-mail
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}


// route pour la déconnexion (sign out)
const signOut = async (req, res) => {
    try {
        // Supprimez le cookie si vous le gérez côté serveur
        res.clearCookie('userToken');

        return res.status(200).json({ message: "Déconnexion réussie." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
};


module.exports = {
    login,
    register,
    updateUser,
    signOut,
};