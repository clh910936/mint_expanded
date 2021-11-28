const format = require('pg-format');

module.exports = {
    createCategoriesTable: async function (db) {
        const query = `CREATE TABLE categories(
            pk SERIAL PRIMARY KEY,
            category_name VARCHAR(40),
            padding int,
            is_monthly boolean
        )`;
        await db.query(query);
    },
    addCategoryRows: async function (db, categoryObjects) {
        const finalArr = [];
        for (var obj of categoryObjects) {
            const cleaned = cleanRawCategoryObj(obj);
            finalArr.push(cleaned);
        }
        const query = `INSERT INTO categories(
        category_name, 
        padding, 
        is_monthly)
        VALUES %L RETURNING pk`

        const rawResult = await db.query(format(query, finalArr));
        const result = rawResult.rows.map(obj => {
            return obj.pk;
        });
        return result;
    }
}

function cleanRawCategoryObj(obj) {
    const result = [];
    result.push(obj.category_name);
    result.push(obj.padding);
    result.push(obj.is_monthly);
    return result;
}