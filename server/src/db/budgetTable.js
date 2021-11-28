const format = require('pg-format');

module.exports = {
    // budget objects is an array with object having name, budgeted, and is_monthly field
    addAllBudgetRows: async function (db, budgetObjects) {
        const finalArr = [];
        for (var obj of budgetObjects) {
            const cleaned = cleanRawBudgetObj(obj);
            finalArr.push(cleaned);
        }
        const query = `INSERT INTO budgets(
        budget_name, 
        budgeted, 
        is_monthly,
        category_pk)
        VALUES %L RETURNING pk`

        const rawResult = await db.query(format(query, finalArr));
        const result = rawResult.rows.map(obj => {
            return obj.pk;
        });
        return result;
    },
    createBudgetsTable: async function (db) {
        const query = `CREATE TABLE budgets(
            pk SERIAL PRIMARY KEY,
            budget_name VARCHAR(40),
            budgeted int,
            is_monthly boolean,
            category_pk int)`;
        await db.query(query);
    },
    getBudgetPk: async function (db, categoryName) {
        const query = `SELECT * FROM budgets WHERE budget_name='${categoryName}'`;
        const result = await db.query(query);
        if (result?.rowCount != 1) {
            return null;
        } else {
            return result.rows[0].pk;
        }
    },
    getAllBudgets: async function (db, pk, is_monthly, category_pk) {
        const queryConditions = getQueryConditions(pk, is_monthly, category_pk);
        var baseQuery = `SELECT * FROM budgets`;

        baseQuery += queryConditions;
        // baseQuery += `ORDER BY
        //     date ASC,
        //     transactions.pk ASC`;

        const result = await db.query(baseQuery);
        return result.rows;
    },
    deleteBudgetRow: async function (db, pk) {
        const query = `DELETE FROM budgets WHERE pk=${pk}`;
        const result = await db.query(query);
        return result.rows.length == 1;
    },
    updateBudgetRow: async function (db, pk, updatedObject) {
        var prefix = `UPDATE budgets SET`;
        const keys = Object.keys(updatedObject);
        if(keys.length > 0) {
            keys.forEach((key, i) => {
                prefix += ` ${key}='${updatedObject[key]}'`;
                if(i != keys.length-1) {
                    prefix += `,`;
                }
            });
        } else {
            return false;
        }
        prefix += ` WHERE pk=${pk};`;
        await db.query(prefix);
        return true;
    }
}

function cleanRawBudgetObj(raw) {
    const result = [];

    result.push(raw.name);
    result.push(raw.budgeted);
    result.push(raw.is_monthly);
    result.push(raw.category_pk);
    return result;
}

function getQueryConditions(pk, is_monthly, category_pk) {
    const queryParams = [];
    if (pk) {
        queryParams.push(`pk = ${pk}`);
    }
    if (category_pk) {
        queryParams.push(`category_pk = ${category_pk}`);
    }
    if(is_monthly) {
        queryParams.push(`is_monthly=${is_monthly}`)
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