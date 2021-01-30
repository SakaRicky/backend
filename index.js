require('dotenv').config();
const express = require('express')
const app = express();
const cors = require('cors');
const Note = require('./models/note');
const morgan = require('morgan');



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

app.use(express.static('build'));
app.use(express.json()) // for parsing application/json
app.use(cors());

morgan.token('body', (request, response) => JSON.stringify(request.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));


app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/notes', (request, response) => {
  Note.find({}).then(notes => {
    response.json(notes)
  })
})

app.get('/api/notes/:id', (request, response, next) => {
     Note.findById(request.params.id)
         .then(requestedNote => {
          if (requestedNote) {
            response.json(requestedNote)
          } else {
            response.status(404).end()
          } 
        })
        .catch(error => next(err))
  })

app.post('/api/notes', (request, response, next) => {
  const body = request.body;

    const note = new Note({
      content: body.content,
      important: body.important || false,
      date: new Date()
    })

    note.save()
        .then(savedNote => savedNote.toJSON())
        .then(saveAndFormatedNote => response.json(saveAndFormatedNote))
        .catch(error => next(error));
})


app.put('/api/notes/:id', (request, response, next) => {
  console.log('app.put test');
  const body = request.body;

  const note = {
    content: body.content,
    important: body.important,
  }

  Note.findByIdAndUpdate(request.params.id, note, { new: true })
      .then(updatedNote => response.json(updatedNote))
      .catch(error => next(error))
})

app.delete('/api/notes/:id', (request, response) => {

    Note.findByIdAndRemove(request.params.id)
        .then(result => {
          response.status(204).end()
        })
        .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({error: "unknown endpoint"})
}

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.log('error.message:', error.message);

  if (error.name === 'CastError') {
    response.status(400).send({error: 'malformated id'})
  } else if (error.name === "ValidationError") {
    return response.status(400).send({error: error.message})
  }

  next(error)
}

//https://guarded-castle-66521.herokuapp.com/
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})