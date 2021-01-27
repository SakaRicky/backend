const express = require('express')
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const mongodb_password = process.env.MONGO_PASSWORD

console.log("password:", mongodb_password);

const url =
  `mongodb+srv://rickysaka:${mongodb_password}@cluster0.u3l97.mongodb.net/note-app?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })


const noteSchema = new mongoose.Schema({
  content: String,
  date: Date,
  important: Boolean
})

const Note = mongoose.model('Note', noteSchema);





let notes = [
    {
      id: 1,
      content: "HTML is easy",
      date: "2019-05-30T17:30:31.098Z",
      important: true
    },
    {
      id: 2,
      content: "Browser can execute only Javascript",
      date: "2019-05-30T18:39:34.091Z",
      important: false
    },
    {
      id: 3,
      content: "GET and POST are the most important methods of HTTP protocol",
      date: "2019-05-30T19:20:14.298Z",
      important: true
    }
  ]

app.use(express.json()) // for parsing application/json
app.use(cors());
app.use(express.static('build'));


app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/notes', (request, response) => {
  Note.find({}).then(notes => {
    response.json(notes)
  })
})

app.get('/api/notes/:id', (request, response) => {
    const id = Number(request.params.id)
    const note = notes.find(note => note.id === id)
    note ? response.json(note) : response.status(404).end();
  })

const generateID = () => {
    const maxID = notes.length > 0 ? Math.max(...notes.map(note => note.id)) : 0
    return maxID + 1;
}

app.post('/api/notes', (request, response) => {
  const body = request.body;

    if (!body.content) {
      return response.status(400).json({
        error: 'content missing'
      })
    }

    const note = {
      content: body.content,
      important: body.important || false,
      date: new Date(),
      id: generateID(),
    }

    notes = notes.concat(note);
    
    response.json(note);
})

app.delete('/api/notes/:id', (request, response) => {
    const id = Number(request.params.id);
    notes = notes.filter(note => note.id !== id)

    response.status(204).end();
})

//https://guarded-castle-66521.herokuapp.com/
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})