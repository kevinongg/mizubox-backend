import db from "#db/client";
import bcrypt from "bcrypt";

// ----------------menu items get all nigiris-------------
export const getAllNigiris = async () => {
    const sql = `select * from nigiris`;
    const { rows: nigiris } = await db.query(sql);
    return nigiris;
}

// ----------------menu items get all nigiris by id -------------
export const getNigiriById = async (id) => {
    const sql = `select * from nigiris where id = $1`;
    const { rows: [nigiri] } = await db.query(sql, [id]);
    return nigiri;
}

// ----------------get pre-made-boxes-------------
export const getAllPreMadeBoxes = async () => {
    const sql = `select * from pre_made_boxes`;
    const { rows: preMadeBoxes } = await db.query(sql);
    return preMadeBoxes;
}
// ----------------get pre-made-boxes by id -------------

export const getPreMadeBoxById = async (id) => {        
    const sql = `select * from pre_made_boxes where id = $1`;
    const { rows: [preMadeBox] } = await db.query(sql, [id]);
    return preMadeBox;
}

// ----------------get all sauces -------------

export const getAllSauces = async () => {
    const sql = `select * from sauces`;
    const { rows: sauces } = await db.query(sql);
    return sauces;
}

// ----------------get all extras-------------

export const getAllExtras = async () => {
    const sql = `select * from extras`;
    const { rows: extras } = await db.query(sql);
    return extras;
}