const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://finland:${password}@freestackopen.vovxo2w.mongodb.net/phoneBook?retryWrites=true&w=majority`

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

mongoose
  .connect(url)
  .then(() => {
    console.log('connected')

    if (process.argv[3]){
      const person = new Person({
        name: process.argv[3],
        number: process.argv[4],
      })
      return person.save()
        .then(() => {
          console.log('note saved!')
          return mongoose.connection.close()
        })}
    else{
      Person.find({}).then(result => {
        result.forEach(note => {
          console.log(note)
        })
        mongoose.connection.close()
      })
    }
  })

  .catch((err) => console.log(err))