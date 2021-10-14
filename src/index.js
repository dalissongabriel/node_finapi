const express = require('express');
const { v4: uuidv4} = require("uuid");
const app = express();
app.use(express.json());

const customers = [];

function shouldNotAlreadyExistsAccountWithCpf(request, response, next) {
  const { cpf } = request.body;

  if (customers.some((customer) => customer.cpf === cpf)) {
    return response.status(400).json({ error: "Customer already exists"});
  }

  return next();
}
function shouldExistsAccountWithCPF(request, response, next) {
  const { cpf } = request.params;
  console.log(cpf);
  const customerFind = customers.find((customer) => customer.cpf === cpf);

  if (!customerFind) {
    return response.status(400).json({ error: "Customer not found"});
  }
  console.log(customerFind);

  request.customer = customerFind;
  return next();
};

app.post("/account", shouldNotAlreadyExistsAccountWithCpf, (request, response) => {
  const { cpf, name } = request.body;
  const id = uuidv4();

  const newCustomers = {
    cpf,
    name,
    id,
    statment: [],
  };

  customers.push(newCustomers);

  response.status(201).send();
});

app.get("/statment/:cpf", shouldExistsAccountWithCPF, (request, response) => {  
  const { customer } = request;
  return response.json(customer)
});

app.post("/deposit/:cpf", shouldExistsAccountWithCPF, (request, response) => {
  const { customer } = request;
  const { description, amount } = request.body;

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: "credit",
  }

  customer.statment.push(statementOperation);
  return response.status(201).send()
});

app.listen(3333);