import 'dotenv/config.js';
import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  await client.connect();
  console.log('✅ Connected to database');

  try {
    // Create a company
    const companyRes = await client.query(
      `INSERT INTO companies (id, name, created_at) 
       VALUES (gen_random_uuid(), $1, NOW()) 
       RETURNING id`,
      ['Shiv Furniture']
    );
    const companyId = companyRes.rows[0].id;
    console.log('✅ Created company: Shiv Furniture');

    // Create GL Accounts
    await client.query(
      `INSERT INTO gl_accounts (id, company_id, code, name, account_type, is_active) 
       VALUES (gen_random_uuid(), $1, $2, $3, $4, true),
              (gen_random_uuid(), $1, $5, $6, $7, true)`,
      [companyId, 'ACC001', 'Sales Revenue', 'income', 'ACC002', 'Cost of Goods', 'expense']
    );
    console.log('✅ Created GL Accounts');

    // Create Product Category
    const categoryRes = await client.query(
      `INSERT INTO product_categories (id, company_id, name) 
       VALUES (gen_random_uuid(), $1, $2) 
       RETURNING id`,
      [companyId, 'Wooden Furniture']
    );
    const categoryId = categoryRes.rows[0].id;
    console.log('✅ Created category: Wooden Furniture');

    // Create Product
    await client.query(
      `INSERT INTO products (id, company_id, category_id, sku, name, cost_price, sale_price) 
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6)`,
      [companyId, categoryId, 'WF001', 'Wooden Chair', 500, 1000]
    );
    console.log('✅ Created product: Wooden Chair');

    // Create Contacts
    await client.query(
      `INSERT INTO contacts (id, company_id, contact_type, display_name, email) 
       VALUES (gen_random_uuid(), $1, $2, $3, $4),
              (gen_random_uuid(), $1, $5, $6, $7)`,
      [companyId, 'vendor', 'Wood Supplier Ltd', 'vendor@example.com', 'customer', 'John Doe', 'customer@example.com']
    );
    console.log('✅ Created vendor and customer');

    // Create Analytic Account
    await client.query(
      `INSERT INTO analytic_accounts (id, company_id, code, name) 
       VALUES (gen_random_uuid(), $1, $2, $3)`,
      [companyId, 'AA001', 'Department A']
    );
    console.log('✅ Created analytic account: Department A');

    console.log('\n✅ All data seeded successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

main();
