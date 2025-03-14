require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()


/*let persons = [
{
"id": "1",
"name": "Arto Hellas",
"number": "040-123456"
},
{
"id": "2",
"name": "Ada Lovelace",
"number": "39-44-5323523"
},
{
"id": "3",
"name": "Dan Abramov",
"number": "12-43-234345"
},
{
"id": "4",
"name": "Mary Poppendieck",
"number": "39-23-6423122"
}
]*/

app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

morgan.token('body', req => {
  return JSON.stringify(req.body)
})
app.use(morgan(':method :url - :response-time ms :body'))

app.get('/info', (request, response) => {
  Person.find({}).then(result => {
    const welcome = 'Phonebook has info for ' + result.length + ' people'
    const date = Date(request.headers.date)
    response.send('<p>' + welcome + '</p>' + '<p>' + date + '</p>')
  })
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(result => {
    response.json(result)
  })
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'either name or number is missing'
    })
  }

  /*if (persons.find(person => person.name === body.name)) {
    return response.status(400).json({
      error: 'name must be unique'
    })
  }*/

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      if (updatedPerson) {
        response.json(updatedPerson)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})


app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then( () => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})