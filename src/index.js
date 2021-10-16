const express = require('express');
const { v4: uuidv4} = require("uuid");
const {request, response} = require("express");
const app = express();
app.use(express.json());

const customers = [];

const OPERATION_TYPES = {
  DEPOSIT: 'deposit',
  WITHDRAW: 'withdraw',
};

function shouldNotAlreadyExistsAccountWithCpf(request, response, next) {
  const { cpf } = request.body;

  if (customers.some((customer) => customer.cpf === cpf)) {
    return response.status(400).json({ error: "Customer already exists"});
  }

  return next();
};

function shouldExistsAccountWithCPF(request, response, next) {
  const { cpf } = request.params;
  const customerFind = customers.find((customer) => customer.cpf === cpf);

  if (!customerFind) {
    return response.status(400).json({ error: "Customer not found"});
  }

  request.customer = customerFind;
  return next();
};

function getBalance(transactions) {
  const balance = transactions.reduce((acc, transaction) => {
    if (transaction.type === OPERATION_TYPES.DEPOSIT) {
      return acc + transaction.amount;
    } else {
      return acc - transaction.amount;
    }
  }, 0);

  return balance;
};

function isValidType(transactionType) {
  if (transactionType && OPERATION_TYPES[transactionType.toUpperCase()]) {
    return true;
  }
  return false;
}

app.get("/account", shouldExistsAccountWithCPF, (request, response) => {
  const { customer } = request;
  return response.json(customer);
})
app.post("/account", shouldNotAlreadyExistsAccountWithCpf, (request, response) => {
  const { cpf, name } = request.body;
  const id = uuidv4();

  const newCustomers = {
    cpf,
    name,
    id,
    transactions: [],
  };

  customers.push(newCustomers);

  response.status(201).send();
});

app.put("/account/:cpf", shouldExistsAccountWithCPF, (request, response) => {
  const { customer } = request;
  const { name } = request.body;

  if (!name) {
    return response.status(400).json({error: 'Required fields not present in your request!'});
  }
  customer.name = name;
  return response.status(200).json(customer);
});

app.post("/deposit/:cpf", shouldExistsAccountWithCPF, (request, response) => {
  const { customer } = request;
  const { description, amount } = request.body;

  const transaction = {
    description,
    amount,
    created_at: new Date(),
    type: OPERATION_TYPES.DEPOSIT,
  }

  customer.transactions.push(transaction);
  return response.status(201).send()
});

app.post("/withdraw/:cpf", shouldExistsAccountWithCPF, (request, response) => {
  const { customer } = request;
  const { amount } = request.body;

  const balance = getBalance(customer.transactions);

  if (balance < amount) {
    return response.status(400).json({ error: "Insufficient funds!"});
  }

  const transaction = {
    amount,
    created_at: new Date(),
    type: OPERATION_TYPES.WITHDRAW,
  };

  customer.transactions.push(transaction);
  return response.status(201).send();
});

app.get("/transactions/:cpf", shouldExistsAccountWithCPF, (request, response) => {
  const {customer} = request;
  const {date, transactionType} = request.query;

  const report = {
    transactions: customer.transactions
  };

  const actualAmount = getBalance(customer.transactions);

  if (date) {
    report.transactions = report.transactions.filter(transaction => transaction.created_at >= new Date(date));
  }

  if (isValidType(transactionType)) {
    report.transactions = report.transactions.filter( transaction => transaction.type === transactionType );
  }

  const { transactions } = report;
  return response.json({ transactions, actualAmount});
});

app.listen(3333);
