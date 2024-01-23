const jwt = require('jsonwebtoken');
const dbModels = require('../models/dbModels');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);
        const user = await dbModels.getSingleUser(decoded.user_id);

        if (!user) {
            throw new Error();
        }

        req.user = user; // Ajouter les informations de l'utilisateur à req.user
        req.token = token;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Non autorisé' });
    }
};

module.exports = auth;