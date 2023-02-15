const express = require('express');
const path = require('path');
const fs = require('fs');

let dbNotes = require('./db/db.json');
const uuid = require('./public/assets/js/uuid');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

//gets index.html
app.get('/', (req, res) => res.sendFile('public/index.html'));

//gets notes.html
app.get('/notes', (req, res) => res.sendFile(path.join(__dirname, 'public/notes.html')));

//gets api route for notes and returns response to json
app.get('/api/notes', (req, res) => {
    console.info(`${req.method} request has been made to api database`)
    return res.json(dbNotes)
});

//sends text info to db.json by creating an object with title and text input
app.post('/api/notes', (req, res) => {
    console.info(`${req.method} request has been sent`)
    const { title, text } = req.body;
    const id = uuid()
    if (title && text) {
        const newNote = {
            title,
            text,
            id
        };

        //reads db.json, parses the data and pushes new note to dbNotes
        //then overwrites the file with the new note added
        fs.readFile('./db/db.json', 'utf8', (err, data) => {
            if(err) {
                console.error(err)
            } else {
                dbNotes = JSON.parse(data)
                dbNotes.push(newNote)
                fs.writeFile('./db/db.json', JSON.stringify(dbNotes, null, 2), (err) => 
                err ? console.error(err) : console.log('note added to db')
                );
                return res.json(dbNotes)
            };
        });
    };
});

//gets id parameter and filters it out from db, then overwrites db.json
app.delete(`/api/notes/:id`, (req, res) => {
    console.info(`${req.method} request made on id ${req.params.id}`)
    const trashNote = req.params.id
    dbNotes = dbNotes.filter(function(noteObj) {
    //console.info(noteObj.id + '   ' + trashNote)
        return noteObj.id !== trashNote;
    })
    console.info(dbNotes)
    fs.writeFile('./db/db.json', JSON.stringify(dbNotes, null, 2), (err) => 
        err ? console.error(err) : console.log('note added to db')
    );
    return res.json(dbNotes)

});

app.listen(PORT, () =>
console.log(`Port is open on http://localhost:${PORT} 🚀`)
);