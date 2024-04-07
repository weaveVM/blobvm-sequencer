import 'dotenv/config'
import { connect } from '@planetscale/database'
import dotenv from "dotenv";
dotenv.config()

const config = {
  host: process.env.DATABASE_HOST,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD
}


async function test() {
  try {
    const conn = connect(config)
const results = await conn.execute('select * from Contracts', [1])
console.log(results)
  } catch(error) {
    console.log(error)
  }
}


test()

