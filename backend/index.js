const express = require('express');
const cors = require('cors');
//const auth = require('../middleware/auth');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const authRoutes = require('./src/routes/authRoutes');
const projetRoute = require('./src/routes/projetRouter');
const viewsRouter = require('./src/routes/viewsRoutes');
const dbModels = require('./src/models/dbModels');
const app = express();
const port = 5000;


//views
app.set('view engine', 'ejs');
app.set('views', 'views/pages');

app.use('/views', viewsRouter);

// Middleware pour afficher les détails de la requête dans la console
app.use((req, res, next) => {
  const startTime = new Date();
  // Capture the original res.end function
  const originalEnd = res.end;

  // Override res.end to log the response status
  res.end = function () {
      const endTime = new Date();
      const duration = endTime - startTime;
      console.log(`[${endTime.toLocaleString()}] ${req.method} ${req.url} - Status: ${res.statusCode} - Duration: ${duration}ms`);
      // Call the original res.end function
      originalEnd.apply(res, arguments);
  };

  next();
});

const corsOptions = {
  origin: 'http://localhost:5000',
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE']
};

app.use(cors(corsOptions));

// Middleware pour analyser le corps des requêtes au format URL encodé
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use('/api', authRoutes);
app.use('/api', projetRoute);

app.use('/views/assets', express.static('views/assets'));
app.listen(port, () => {

  console.log(`Le serveur tourne sur le port ${port} \n http://localhost:5000/views \n`);

  process.on('SIGINT', () => {
    dbModels.close((err) => {
      console.log("Base de données fermée");
      process.exit(err ? 1 : 0);
    });
  });

});