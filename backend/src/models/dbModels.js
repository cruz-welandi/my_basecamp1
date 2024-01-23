const sqlite3 = require('sqlite3').verbose();

const DBSOURCE = "basecampdb.sqlite";

const dataBase = new sqlite3.Database(DBSOURCE, (err) => {
  // ... (déplacez le code lié à la base de données ici)
  if(err) {
    // Cannot open database
    console.error(err.message);
    throw err
}
else {
    dataBase.run(`
    CREATE TABLE Users (
        Id INTEGER PRIMARY KEY AUTOINCREMENT,
        Username TEXT,
        Email TEXT,
        Password TEXT,
        Salt TEXT,
        Token TEXT,
        DateLoggedIn DATE,
        DateCreated DATE
    );
    
    CREATE TABLE Projets (
        Id INTEGER PRIMARY KEY AUTOINCREMENT,
        NameProjet TEXT,
        desProjet TEXT,
        DateLoggedIn DATE,
        DateCreated DATE
    );
    
    CREATE TABLE ProjetMembers (
        Id INTEGER PRIMARY KEY AUTOINCREMENT,
        UserId INTEGER,
        ProjetId INTEGER,
        Role TEXT, -- "admin" ou "utilisateur" par exemple
        FOREIGN KEY (UserId) REFERENCES Users(Id),
        FOREIGN KEY (ProjetId) REFERENCES Projets(Id)
    );`,
    (err) =>{
        if(err) {
            // table already created
        }
    }
    )
}
});

module.exports = dataBase;