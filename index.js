const express = require('express');
const app = express();
let morgan = require('morgan')

let persons = [
    {
        "id": 1,
        "name": "Saka Ricky",
        "number": 698425147
    },
    {
        "id": 2,
        "name": "Saka Rheine",
        "number": 673572219
    },
    {
        "id": 3,
        "name": "Guenang Paulin",
        "number": 697379529
    }
]

app.use(express.json());

// morgan.token('body', (req, res) =>   JSON.stringify(req.body));
morgan.token('body', function (req, res) { return JSON.stringify(req.body) });
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));


const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

// app.use(requestLogger);

app.get('/', (request, response) => {
    response.send('<h1>Hello Phonelist!</h1>')
});

app.get('/api/persons', (request, response) => {
    response.json(persons)
});

app.get('/info', (request, response) => {
    const number_Of_persons = persons.length;
    const date = new Date();
    response.send(`<div>Phonebook has info for ${number_Of_persons} people</div><br><div>${date}</div>`)
})

app.get('/api/persons/:id', (request, response) => {
    console.log(request.params.id);
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id);
    response.json(person)
});

const generateID = () => {
    const maxID = persons.length !== 0 ? Math.max(...persons.map(person => person.id)) : 0
    return maxID;
}

app.post('/api/persons/', (request, response) => {
    const body = request.body

    if (!body.name) {
        return response.status(400).json({
            error: "Name missing"
        })
    }

    if (!body.number) {
        return response.status(400).json({
            error: "Number missing"
        })
    }

    if (persons.map(person => person.name).includes(body.name)) {
        return response.status(400).json({
            error: "Name must be unique"
        })
    }

    person = {
        "id": generateID(),
        "name": body.name,
        "number": body.number,
    }

    return response.json(person)
});

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    const persons_remaining = persons.filter(person => person.id !== id);
    response.status(204).end();
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  
  app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001;
app.listen(PORT);
console.log(`Server running on port ${PORT}`);