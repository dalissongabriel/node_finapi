const express = require('express');
const { v4: uuidv4} = require("uuid");
const app = express();
app.use(express.json());

const customers = [];

app.post("/account", (request, response) => {
  const { cpf, name } = request.body;
  const id = uuidv4();

  const newCustomers = {
    cpf,
    name,
    id,
    statement: [],
  };

  customers.push(newCustomers);

  response.status(201).send();
});

app.listen(3333);