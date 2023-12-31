const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('connecting to', url)

mongoose.connect(url)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const formValidator = (number) => {
  const parts = number.split('-')

  if (parts.length === 2) {
    if ((parts[0].length === 2) || (parts[0].length === 3)) {
      if ((/^[0-9]+$/.test(parts[0])) && (/^[0-9]+$/.test(parts[1]))) {

        return true
      }
    }
  }

  return false
}
const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true
  },
  number: {
    type: String,
    minLength: 8,
    validate: {
      validator: formValidator,
      message: 'invalid number'
    },
    required: true
  },
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)