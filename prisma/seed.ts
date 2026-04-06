import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { Client } from 'pg';
const prisma = new PrismaClient();
async function main() {
  console.log('Clearing the database...');
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`;
  const tables = tablenames.map(({ tablename }) => tablename).filter((name) => name !== '_prisma_migrations').map((name) => `"${name}"`).join(', ');
  try {
    if (tables.length > 0) {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE;`);
      console.log('Database cleared successfully.');
    } else {console.log('No tables to clear.');}
  } catch (error) {
    console.error('Error clearing the database.');
    console.error(error);
    process.exit(1);
  }
  console.log('Seeding database from script-seed.sql...');
  const sqlFilePath = path.join(__dirname, 'script-seed.sql');
  let sqlScript = fs.readFileSync(sqlFilePath, 'utf8');
  // Fix the incorrect UPDATE statement
  sqlScript = sqlScript.replace(/UPDATE items SET code = 'sv-'\+id\+'-'\+provider_id\+''\+company_id/g, "UPDATE items SET code = 'sv-' || id || '-' || provider_id || company_id");
  const client = new Client({connectionString: process.env.DATABASE_URL,});
  try {
    await client.connect();
    const statements = sqlScript.split(';\n'); // Split script into statements
    const companyStatements = statements.filter(s => s.trim().startsWith('COPY companies')); // Separate companies and other statements
    const otherStatements = statements.filter(s => !s.trim().startsWith('COPY companies'));
    console.log(`Found ${companyStatements.length} company statements to execute first.`);
    for (const statement of companyStatements) {if (statement.trim().length > 0) {await client.query(statement);}} // Execute company statements first
    console.log('Company statements executed successfully.');
    console.log(`Executing remaining ${otherStatements.length} statements.`);
    for (const statement of otherStatements) {if (statement.trim().length > 0) {await client.query(statement);}} // Execute the rest of the statements
    console.log('Executed script successfully.');
  } catch (error: any) {
    console.error('Error executing SQL script.');
    console.error(error.message);
    process.exit(1);
  } finally {await client.end();}
  console.log('Database seeding completed.');
}
main()
  .catch((e) => {
    console.error('An error occurred during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {await prisma.$disconnect();});