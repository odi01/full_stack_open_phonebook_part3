require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");

morgan.token("req-body", (req) => JSON.stringify(req.body));

const app = express();

app.use(express.json());
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :req-body"
  )
);
app.use(cors());
app.use(express.static("build"));

app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>");
});

app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => response.json(persons));
});

const errHandlerNoResource = (err, req, res, next) => {
  console.error(err.message);
  if (err.name === "CastError") {
    return res.status(400).send({ err: "malformatted id" });
  }

  next(err);
};

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((note) => response.json(note).status(204))
    .catch((err) => next(err));
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((note) => response.json({ result: "Success" }).status(204))
    .catch((err) => next(err));
});

app.get("/info", (request, response) => {
  Person.countDocuments().then((count) => {
    response.send(`<p>Phonebook has info of ${count} people</p>
    <p>${Date().toLocaleString()}</p>
    `);
  });
});

app.post("/api/persons", (request, response) => {
  const body = request.body;
  const personName = body.name;
  const personPhoneNumber = body.number;

  if (!personName || !personPhoneNumber) {
    return response.status(400).json({
      error: "Missing name or phone number",
    });
  }

  const query = Person.where({ name: personName });
  query
    .findOne()
    .lean()
    .then((match) => {
      if (match) {
        return response.status(409).json({
          error: "name must be unique",
        });
      } else {
        const person = new Person({
          name: personName,
          number: personPhoneNumber,
        });

        person.save().then(() => {
          console.log(
            `added ${personName} number ${personPhoneNumber} to phonebook`
          );
        });
      }
    });
});

app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;

  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(errHandlerNoResource);

app.use(unknownEndpoint);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
