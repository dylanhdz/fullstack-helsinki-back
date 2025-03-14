const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('connecting to', url)
mongoose.connect(url)

  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })

function validateNumber(number) {
  const parts = number.split('-')
  if (parts.length !== 2) {
    return false
  }
  if (parts[0].length < 2 || parts[0].length > 3) {
    return false
  }
  return true
}
const customValidator = [
  validateNumber,
  'Number has to have two parts separated by -. The first part has to be 2-3 characters long.'
]

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: [3, 'Name must be at least 3 characters long.']
  },
  number: {
    type: String,
    required: true,
    minlength: [8, 'Number must be at least 8 characters long'],
    validate: customValidator
  }
  /*
    Previously.
    name: String,
    number: String,
  */
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)