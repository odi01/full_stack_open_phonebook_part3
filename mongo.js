/** @format */

const mongoose = require("mongoose");

if (process.argv.length < 3) {
	console.log("give password as argument");
	process.exit(1);
}

const password = process.argv[2];
const personName = process.argv[3];
const personPhoneNumber = process.argv[4];

const url = `mongodb+srv://odi:${password}@cluster0.rcz3o5a.mongodb.net/phonebook?retryWrites=true&w=majority`;

mongoose.set("strictQuery", false);
mongoose.connect(url);

const personSchema = new mongoose.Schema({
	name: String,
	phone_number: String,
});

const Person = mongoose.model("Person", personSchema);

if (personName && personPhoneNumber) {
	const person = new Person({
		name: personName,
		phone_number: personPhoneNumber,
	});

	person.save().then(() => {
		console.log(`added ${personName} number ${personPhoneNumber} to phonebook`);
		mongoose.connection.close();
	});
} else {
	Person.find({}).then((result) => {
		result.forEach((personData) => console.log(personData));
		mongoose.connection.close();
	});
}
