require("dotenv").config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dbModels = require('../models/dbModels');

const login = async (req, res) => {
    try {
        const { Email, Password } = req.body;

        // Make sure there is an Email and Password in the request
        if (!(Email && Password)) {
            return res.status(400).send("all input is required");
        }

        // Use a Promise-based approach to make the code more readable
        const user = await new Promise((resolve, reject) => {
            const sql = "SELECT * FROM Users WHERE Email = ?";
            dbModels.all(sql, Email, (err, rows) => {
                if (err) {
                    reject(err);
                    return;  // Ajoutez cette ligne pour éviter de résoudre la promesse après le rejet
                }

                if (rows.length === 0) {
                    resolve(null);  // Utilisateur non trouvé, résoudre avec null
                } else {
                    resolve(rows[0]);
                }
            });
        });

        if (!user) {
            return res.status(400).send("Utilisateur non trouvé");
        }

        // Use bcrypt.compare as a Promise
        const validCredentials = await bcrypt.compare(Password, user.Password);

        if (!validCredentials) {
            return res.status(400).send("Invalid credentials");
        }

        console.log("Token Key:", process.env.TOKEN_KEY);
        // Créer le jeton JWT ici
        const token = jwt.sign(
            { user_id: user.Id, username: user.Username, Email },
            process.env.TOKEN_KEY,
            { expiresIn: "1h" }
        );

        user.Token = token;

        return res.status(200).json({
            user:{
                Id : user.Id,
                Username: user.Username,
                Email: user.Email,
                Salt: user.Salt,
                Token: user.Token,
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
    try {
        const userId = req.params.userId;
        const { Username, Email, Password } = req.body;

        // Vérifier si l'utilisateur a le droit de mettre à jour ces informations
        if (req.user.id !== parseInt(userId)) {
            return res.status(403).json({ message: 'Vous n\'avez pas le droit de mettre à jour cet utilisateur.' });
        }

        // Le reste du code pour mettre à jour l'utilisateur...
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


module.exports = {
    login,
    register,
    updateUser,
};