import db from "#db/client";
import { createEmployee } from "./queries/employees.js";
import { faker } from "@faker-js/faker";

async function seedEmployees() {
  const employees = [];
  for (let i = 0; i <= 10; i++) {
    const name = faker.person.firstName();
    const birthday = faker.date.between({
      from: "1970-01-01",
      to: "2030-01-01",
    });
    const salary = faker.number.int({ min: 2000, max: 30000 });

    employees.push({
      name,
      birthday,
      salary,
    });
  }

  for (const emp of employees) await createEmployee(emp);
}

await db.connect();
await seedEmployees();
await db.end();
console.log("🌱 Database seeded.");
