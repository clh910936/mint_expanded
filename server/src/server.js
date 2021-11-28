const express = require('express');
require('dotenv').config();
const TRANSACTIONS_TABLE = require('./db/transactionTable.js');
const BUDGET_TABLE = require('./db/budgetTable.js');
const CATEGORY_TABLE = require('./db/categoriesTable.js');
const DATABASE = require('./db/generalDB.js');

const app = express();
const db = DATABASE.openDatabaseConnection();

// expected: array of strings corresponding to expected query keys
function validateQueryParams(expected) {
    return (req, res, next) => {
        const missingParams = [];
        expected.forEach(key => {
            if (!req.query[key]) {
                missingParams.push(key);
            }
        });
        if (missingParams.length > 0) {
            const messages = missingParams.map(param => { return `Missing paramter: ${param}` });
            return sendResponse(res, false, 422, {}, messages);
        }
        next();
    }
}

function sendResponse(res, success, code, data, errors) {
    const response = {
        success,
        data,
        errors
    };
    return res.status(code).send(JSON.stringify(response));
}

app.get('/transactions', async function (req, res) {
    const { month, year, budget_pk, transaction_type } = req.query;
    const transactions = await TRANSACTIONS_TABLE.getTransactions(db, month, year, budget_pk, transaction_type);
    const sum = await TRANSACTIONS_TABLE.sumTransactions(db, month, year, budget_pk, transaction_type);

    const result = {
            sum,
            transactions
    }
    return sendResponse(res, true, 200, result, []);
});

app.get('/budgets', async function (req, res) {
    const { pk, is_monthly, category_pk } = req.query;
    const budgets = await BUDGET_TABLE.getAllBudgets(db, pk, is_monthly, category_pk);

    return sendResponse(res, true, 200, budgets, []);
});

// required: name, budgeted, is_monthly
app.post('/budgets', validateQueryParams(['name', 'budgeted', 'is_monthly']), async function (req, res) {
    const { name, budgeted, is_monthly } = req.query;

    const obj = { name, budgeted, is_monthly: JSON.parse(is_monthly) };
    await BUDGET_TABLE.addAllBudgetRows(db, [obj]);

    return sendResponse(res, true, 200, {}, []);
});

app.put('/budgets', validateQueryParams(['budget_pk']), async function(req, res) {
    const { budget_pk } = req.query;
    var updatedObject = {};
    const possibleUpdatedFields = ['budget_name', 'budgeted', 'is_monthly', 'category_pk'];
    possibleUpdatedFields.forEach(key => {
        if(req.query[key]) {
            updatedObject[key] = req.query[key];
        }
    });
    if(Object.keys(updatedObject).length > 0) {
        await BUDGET_TABLE.updateBudgetRow(db, budget_pk, updatedObject);
        return sendResponse(res, true, 200, {}, []);
    } else {
        const messages = [`No fields passed to updated for budget row with pk: ${budget_pk}`];
        return sendResponse(res, false, 422, {}, messages);
    }
});

// required: budget_pk
app.delete('/budgets', validateQueryParams(['budget_pk']), async function (req, res) {
    const { budget_pk } = req.query;
    const isSuccess = await BUDGET_TABLE.deleteBudgetRow(db, budget_pk);

    return sendResponse(res, isSuccess, 200, {}, []);
});

app.post('/categories', validateQueryParams(['category_name', 'is_monthly', 'padding']), async function (req, res) {
    const { category_name, is_monthly, padding } = req.query;
    const obj = { category_name, padding, is_monthly: JSON.parse(is_monthly) };
    const pks = await CATEGORY_TABLE.addCategoryRows(db, [obj]);

    return sendResponse(res, true, 200, {pks}, []);
});

app.listen(3000);
console.log("Listening on port 3000");