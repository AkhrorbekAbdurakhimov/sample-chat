const { Pool } = require('pg')
const { DB } = require('./../config')

const pool = new Pool(DB)

const fetch = async (sqlQuery, ...params) => {
    const client = await pool.connect()
    try {
        const {rows: [row]} = await client.query(sqlQuery, params.length ? params : null)
        return row
    } catch (error) {
        throw error
    } finally {
        await client.release()
    }
}

const fetchAll = async (sqlQuery, ...params) => {
	const client = await pool.connect()
	try {
		const { rows } = await client.query(sqlQuery, params.length ? params : null)
		return rows
	} catch(error) {
		throw error
	} finally {
		await client.release()
	}
}

module.exports = { fetch, fetchAll }