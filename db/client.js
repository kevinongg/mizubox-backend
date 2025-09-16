import pg from "pg";

/**** Use SSL if using external database ****/
// const options = { connectionString: process.env.DATABASE_URL };
// if (process.env.NODE_ENV === "production") {
//   options.ssl = { rejectUnauthorized: false };
// }

const db = new pg.Client(process.env.DATABASE_URL);
export default db;
