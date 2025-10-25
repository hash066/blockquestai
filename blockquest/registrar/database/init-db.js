const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = process.env.DATABASE_URL || 
  'postgresql://registrar:registrar123@localhost:5432/registrar';

async function initializeDatabase() {
  console.log('🔧 Initializing database...\n');

  const pool = new Pool({
    connectionString: DATABASE_URL
  });

  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful\n');

    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute schema
    console.log('📋 Creating tables...');
    await pool.query(schema);
    console.log('✅ Tables created\n');

    // Verify tables
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log('📊 Created tables:');
    tables.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

    // Test insert
    console.log('\n🧪 Testing database...');
    await pool.query(`
      INSERT INTO dids (did, wallet_address, reputation_score)
      VALUES ('did:ethr:0xTest', '0xTestWallet', 500)
      ON CONFLICT (did) DO NOTHING
    `);

    const testResult = await pool.query('SELECT COUNT(*) FROM dids');
    console.log(`✅ Database test successful (${testResult.rows[0].count} DIDs)\n`);

    console.log('🎉 Database initialization complete!\n');

  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check if PostgreSQL is running: docker ps | findstr postgres');
    console.error('2. Verify DATABASE_URL in .env');
    console.error('3. Check credentials: registrar/registrar123');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };
