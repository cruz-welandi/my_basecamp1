const express = require('express');
const viewsRouter = express.Router();

viewsRouter.get('/', (req, res) => {
    res.render('index', { title: 'Accueil' });
  });

//view forgot password
viewsRouter.get('/password-forgot', (req, res) => {
    res.render('Forgot', { title: 'forgot password'});
});

//view login
viewsRouter.get('/login', (req, res) => {
    res.render('Login', { title: 'login'});
});

//view register
viewsRouter.get('/register', (req, res) => {
    res.render('Register', { title: 'register'});
});

//view projets
viewsRouter.get('/create-projet', (req, res) => {
    res.render('Projet', { title: 'create projet'});
});

//view new-project
viewsRouter.get('/new-projet', (req, res) => {
    res.render('New-projet', { title: 'new-projet'});
});

module.exports = viewsRouter;