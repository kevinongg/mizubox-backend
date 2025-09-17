import db from "./client";

await db.connect();
await seed();
await db.end();
console.log("🌱 Database seeded.");

const seed = async () => {};
