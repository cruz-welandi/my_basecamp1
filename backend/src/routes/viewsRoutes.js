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
viewsRouter.get('/home', (req, res) => {
    res.render('Projet', { title: 'home'});
});

//view new-project
viewsRouter.get('/createProjet', (req, res) => {
    res.render('New-projet', { title: 'new-projet'});
});

//view edit-project
viewsRouter.get('/editProjet', (req, res) => {
    res.render('Edit-project', { title: 'Edit-project'});
});

//view profil
viewsRouter.get('/profil', (req, res) => {
    res.render('profil', { title: 'profil'});
});

module.exports = viewsRouter;