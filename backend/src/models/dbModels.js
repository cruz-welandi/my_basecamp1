const sqlite3 = require('sqlite3').verbose();

const DBSOURCE = "basecampdb.sqlite";

const dataBase = new sqlite3.Database(DBSOURCE, (err) => {
    if(err) {
        console.error(err.message);
        throw err
    } else {
        dataBase.run(`
        CREATE TABLE IF NOT EXISTS Users (
            Id INTEGER PRIMARY KEY AUTOINCREMENT,
            Username TEXT,
            Email TEXT,
            Password TEXT,
            Salt TEXT,
            Token TEXT,
            DateLoggedIn DATE,
            DateCreated DATE
        );

        CREATE TABLE IF NOT EXISTS Projets (
            Id INTEGER PRIMARY KEY AUTOINCREMENT,
            NameProjet TEXT,
            desProjet TEXT,
            CreatorId INTEGER, -- ID de l'utilisateur qui a créé le projet
            DateLoggedIn DATE,
            DateCreated DATE,
            FOREIGN KEY (CreatorId) REFERENCES Users(Id)
        );

        CREATE TABLE IF NOT EXISTS ProjetMembers (
            Id INTEGER PRIMARY KEY AUTOINCREMENT,
            UserId INTEGER,
            ProjetId INTEGER,
            Role TEXT, -- "admin" ou "utilisateur" par exemple
            FOREIGN KEY (UserId) REFERENCES Users(Id),
            FOREIGN KEY (ProjetId) REFERENCES Projets(Id)
        );`,
        (err) =>{
            if(err) {
                console.error(err.message);
            }
        });
    }
});

module.exports = dataBase;