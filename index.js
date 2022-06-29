const express = require('express')
const morgan = require('morgan');
const cors = require('cors')

const app = express()

app.use(express.json());

app.use(morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    JSON.stringify(req.body)
  ].join(' ')
}));

app.use(cors())

// app.use(morgan());

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]
  
  app.get('/api/persons', (request, response) => {
    response.json(persons)
  })

  app.get('/api/info', (request, response) => {
    response.send(`<p>Phonebook has info for ${persons.length} people. </p><p> ${new Date()}</p>`);
  })

  app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
  })

  app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
  
    response.status(204).end()
  })

  const generateId = () => {
    return Math.floor(Math.random() * 3000);
  }
  
  app.post('/api/persons', (request, response) => {
    const body = request.body
  
    if (!body.name) {
        return response.status(400).json({ 
          error: 'name is missing' 
        })
    }
    else if(persons.map(a=>a.name).indexOf(body.name)!==-1) {
        return response.status(409).json({ 
          error: 'this person already exists in db' 
        })
    }
    else if(!body.number) {
        return response.status(400).json({ 
          error: 'number is missing' 
        })
    }
  
    const person = {
      name: body.name,
      number: body.number,
      date: new Date(),
      id: generateId(),
    }
  
    persons = persons.concat(person)
  
    response.json(person)
  })
  
  const PORT = process.env.PORT || 3001

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })