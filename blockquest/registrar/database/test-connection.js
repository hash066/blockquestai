const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || 
  'postgresql://registrar:registrar123@postgres-registrar-1:5432/registrar';

async function testConnection() {
  console.log('🔍 Testing database connection...\n');
  console.log('Connection string:', DATABASE_URL.replace(/:[^:]*@/, ':***@'), '\n');

  const pool = new Pool({ connectionString: DATABASE_URL });

  try {
    // Test basic query
    const now = await pool.query('SELECT NOW()');
    console.log('✅ Connection successful!');
    console.log('   Server time:', now.rows[0].now, '\n');

    // Count records
    const counts = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM dids) as dids,
        (SELECT COUNT(*) FROM commits) as commits,
        (SELECT COUNT(*) FROM batches) as batches,
        (SELECT COUNT(*) FROM anchors) as anchors
    `);
    
    console.log('📊 Record counts:');
    console.log('   DIDs:', counts.rows[0].dids);
    console.log('   Commits:', counts.rows[0].commits);
    console.log('   Batches:', counts.rows[0].batches);
    console.log('   Anchors:', counts.rows[0].anchors);
    console.log('\n✅ Database is ready!\n');

  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('\nCheck:');
    console.error('1. PostgreSQL is running: docker ps | findstr postgres');
    console.error('2. DATABASE_URL is correct');
    console.error('3. Database was initialized: npm run init-db\n');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testConnection();
