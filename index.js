const express = require('express')
const morgan = require('morgan')
const app = express()
const Person = require('./models/person')

app.use(express.static('dist'))
app.use(express.json())



morgan.token('type',  (request) => { if (request.method === 'POST') { return JSON.stringify(request.body) } })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :type'))


app.post('/api/person', (request, response, next) => {
  const body = request.body
  const newPerson = new Person({
    name: body.name,
    number: body.number
  })
  newPerson.save()
    .then(() => {
      console.log(`Added ${body.name} number ${body.number} to phonebook`)
      response.json(newPerson)
    })
    .catch(error => next(error))
})
app.put('/api/persons/:id', (request, response, next) => {
  Person.findOneAndUpdate({ id: request.params.id }, { number: request.body.number }, { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      if (updatedPerson) {
        response.json(updatedPerson)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})
app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
    console.log('fetched from server')
  })
})
app.get('/info', (request, response) => {
  const date = String(new Date())
  Person.find({}).then(persons => {
    response.send('Phonebook has info for ' + persons.length + ' people'
    + '<br/><br/>' + date)
  })
})
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      console.log('person', person)
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => {
      next(error)
    })
})
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

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

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})