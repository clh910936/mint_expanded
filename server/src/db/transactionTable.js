const format = require('pg-format');
const BUDGET_TABLE = require('./budgetTable.js');

module.exports = {
    createTransactionsTable: async function (db) {
        const query = `CREATE TABLE transactions(
        pk SERIAL PRIMARY KEY,
        date date,
        description VARCHAR(128),
        original_description VARCHAR(128),
        amount money,
        transaction_type VARCHAR(40),
        budget_pk int,
        account_name VARCHAR(40)
        )`;
        await db.query(query);
    },
    addAllTransactions: async function (db, transactions) {
        const finalArr = [];
        for (var obj of transactions) {
            const cleaned = await cleanRawTransactionObj(db, obj);
            finalArr.push(cleaned);
        }
        await addTransactionRows(db, finalArr);
    },
    getTransactions: async function (db, month, year, budget_pk, transaction_type) {
        const queryConditions = getQueryConditions(month, year, budget_pk, transaction_type);
        var baseQuery = `SELECT
                transactions.pk as transaction_pk,
                date,
                description,
                amount,
                transaction_type,
                budget_name,
                budget_pk
            FROM transactions
            LEFT JOIN budgets
            ON transactions.budget_pk = budgets.pk`;

        baseQuery += queryConditions;
        baseQuery += `ORDER BY
            date ASC,
            transactions.pk ASC`;
        
        const result = await db.query(baseQuery);
        return result.rows;
    },
    sumTransactions: async function (db, month, year, budget_pk, transaction_type) {
        const queryConditions = getQueryConditions(month, year, budget_pk, transaction_type);
        var sumPrefix = `SELECT sum(amount) FROM transactions`;
        const query = sumPrefix + queryConditions;
        const result = await db.query(query);
        if(result.rows[0]?.sum) {
            return parseFloat(result.rows[0]?.sum);
        } else {
            // TODO: error handling
            return -1;
        }
    }
}

async function cleanRawTransactionObj(db, raw) {
    const result = [];

    var pk = await BUDGET_TABLE.getBudgetPk(db, raw.Category);
    if(!pk) {
        const budgetObj = {
            name: raw.Category,
            budgeted: 0,
            is_monthly: true,
            category_pk: null,
        };
        const pks = await BUDGET_TABLE.addAllBudgetRows(db, [budgetObj]);
        pk = pks.length == 1 ? pks[0] : -1;
    }
    result.push(new Date(raw.Date));
    result.push(raw.Description);
    result.push(raw["Original Description"]);
    result.push(parseFloat(raw.Amount));
    result.push(raw["Transaction Type"]);
    result.push(pk);
    result.push(raw["Account Name"]);

    return result;
}

async function addTransactionRows(db, transactionObj) {
    // console.log(transactionObj);
    const query = `INSERT INTO transactions(
        date, 
        description, 
        original_description, 
        amount, 
        transaction_type, 
        budget_pk, 
        account_name)
        VALUES %L`;
        // console.log(format(query, transactionObj));
    await db.query(format(query, transactionObj));
}

function getQueryConditions(month, year, budget_pk, transaction_type) {
    const queryParams = [];
    if (month) {
        queryParams.push(`EXTRACT(MONTH FROM date) = ${month}`);
    }
    if (year) {
        queryParams.push(`EXTRACT(YEAR FROM date) = ${year}`);
    }
    if (budget_pk) {
        queryParams.push(`budget_pk = ${budget_pk}`);
    }
    if (transaction_type) {
        queryParams.push(`transaction_type = '${transaction_type}'`);
    }

    var queryConditions = ``;
    queryParams.forEach((val, i) => {
        if (i === 0) {
            queryConditions += ` WHERE ${val}`;
        } else {
            queryConditions += ` AND ${val}`;
        }
    });
    return queryConditions;
}