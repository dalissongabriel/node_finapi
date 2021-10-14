const express = require('express');
const { v4: uuidv4} = require("uuid");
const app = express();
app.use(express.json());

const customers = [];

function verifyExistsAccountWithCPF(request, response, next) {
  const { cpf } = request.params;
  const customerFind = customers.find((customer) => customer.cpf === cpf);

  if (!customerFind) {
    return response.status(400).json({ error: "Customer not found"});
  }

  request.customer = customerFind;
  return next();
};

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

app.get("/statment/:cpf", verifyExistsAccountWithCPF, (request, response) => {  
  const { customer } = request;
  return response.json(customer)
})

app.listen(3333);