require('dotenv').config();
var XLSX = require("xlsx");
var UTILS = require("./utils.js");
const BUDGET_TABLE = require('./db/budgetTable.js');
const TRANSACTIONS_TABLE = require('./db/transactionTable.js');
const DATABASE = require('./db/generalDB.js');
const {budgets} = require('./constants/budgets.js');


main();

async function main() {
    const db = DATABASE.openDatabaseConnection();
    // await BUDGET_TABLE.createBudgetsTable(db);
    await DATABASE.clearTable(db, 'transactions');
    await DATABASE.clearTable(db, 'budgets');

    // await uploadBudgetJSON(db, budgets);


    // console.log(__dirname);
    const path = `./excel/transactions.xlsx`;
    await uploadTransactionsCSV(db, path);

    db.end();
}

async function uploadTransactionsCSV(db, path) {
    var workbook;
    try{
        workbook = await XLSX.readFile(path);
    } catch (e) {
        console.error("Failed to load read transaction file");
        console.log(e);
        return;
    }
    var sheet_name_list = workbook.SheetNames;
    const jsonArray = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]], { raw: false });
    UTILS.writeToFile("raw", jsonArray);
    await TRANSACTIONS_TABLE.addAllTransactions(db, jsonArray);
}

async function uploadBudgetJSON(db, jsonObject) {
    await BUDGET_TABLE.addAllBudgetRows(db, jsonObject);
}