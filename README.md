# General
## Names
`finance_project`: database name

## Login
`carrie`: lowercase + lunch code

# Commands

## General
`psql postgres`: start the psql commandline
`\l`: view all databases
`\c finance_project carrie`: switch to the db with user
`\dt`

## Users
`CREATE DATABASE yourdbname;`
`CREATE USER youruser WITH ENCRYPTED PASSWORD 'yourpass';`
`GRANT ALL PRIVILEGES ON DATABASE yourdbname TO youruser;`

## Table
`DROP TABLE XXX`: delete a table
`CREATE TABLE name(col_name type, ...)`: create a table


CREATE TABLE transactions(
pk SERIAL PRIMARY KEY, 
date date,
description VARCHAR(128), 
original_description VARCHAR(128),
amount NUMERIC,
transaction_type VARCHAR(40),
budget_pk int,
account_name VARCHAR(40)
)

CREATE TABLE budgets(
    pk SERIAL PRIMARY KEY,
    budget_name VARCHAR(40),
    budgeted int,
    is_monthly boolean,
    category_pk int,
)

CREATE TABLE categories(
    pk SERIAL PRIMARY KEY,
    category_name VARCHAR(40),
    padding int,
    is_monthly boolean
)