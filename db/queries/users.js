import db from "#db/client";
import bcrypt from "bcrypt";

export const createUser = async (name, email, password, role) => {
    const sql = `INSERT INTO 
    users(name, email, password, role)
    VALUES ($1, $2, $3, $4)
    RETURNING *`;


    const hashedPassword = await bcrypt.hash(password,10);
    const {rows} = await db.query(sql, [name, email, hashedPassword, role]);
    return rows[0];
     
};

export const getUserById = async (id)=> {
    const sql = `SELECT * from users WHERE id = $1`;
    const {rows} = await db.query (sql, [id]);
    return rows[0];    
};

export const getUserByEmail = async (email, password) => {
    const sql = `SELECT * from users WHERE email = $1`;
    const {rows} = await db.query (sql, [email]);
    const user = rows[0];
    if (!user) return null;
};