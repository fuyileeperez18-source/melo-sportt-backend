import { readFileSync } from 'fs';
import { join } from 'path';
import { query, pool } from '../config/database.js';

async function runMigration() {
  const migrationName = process.argv[2];

  if (!migrationName) {
    console.log('Migraciones disponibles:');
    console.log('  003_enhanced_user_profiles');
    console.log('\nUso: npm run migrate <nombre_migracion>');
    process.exit(1);
  }

  const migrationPath = join(process.cwd(), 'migrations', `${migrationName}.sql`);

  try {
    console.log(`Ejecutando migración: ${migrationName}`);
    const sql = readFileSync(migrationPath, 'utf8');

    // Ejecutar la migración
    await query(sql);

    console.log(`✅ Migración ${migrationName} ejecutada correctamente`);
  } catch (error: any) {
    console.error(`❌ Error ejecutando migración: ${error.message}`);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
