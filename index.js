require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const cors = require('cors')


const Person = require('./models/person')

const app = express()

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

// APP START ==================================================
app.use(express.static('build'))
app.use(express.json())

app.use(morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    JSON.stringify(req.body)
  ].join(' ')
}))

app.use(cors())


// ROUTES START ==========================================
app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})
app.get('/api/info', (request, response) => {
  Person.countDocuments({}, function (err, count) {
    if (err){
      console.log(err)
    }else{
      response.send(`<p>Phonebook has info for ${count} people. </p><p> ${new Date()}</p>`)
    }
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findByIdAndUpdate(
    request.params.id,
    { name,number },
    { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  Person.find({ name : body.name }, function (err, docs) {
    if (docs.length){
      return response.status(409).json({
        error: 'this person already exists in db'
      })
    }
    else{

      const person = new Person({
        name: body.name,
        number: body.number
      })

      person.save().then(savedPerson => {
        response.json(savedPerson)
      })
        .catch(error => next(error))
    }
  })
})

// ROUTES END===========================================
// this has to be the last loaded middleware.
app.use(errorHandler)

const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})


