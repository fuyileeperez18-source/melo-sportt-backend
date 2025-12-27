import { query, pool } from '../config/database.js';

async function setupTeam() {
  try {
    console.log('Configurando equipo de MELO SPORTT...\n');

    // 1. Buscar usuarios por email
    const walmerResult = await query(
      `SELECT id, email, full_name, role FROM users WHERE email ILIKE '%walmer%' OR full_name ILIKE '%walmer%' LIMIT 1`
    );

    const fuyiResult = await query(
      `SELECT id, email, full_name, role FROM users WHERE email ILIKE '%fuyi%' OR full_name ILIKE '%fuyi%' OR email ILIKE '%lee%' LIMIT 1`
    );

    if (walmerResult.rows.length === 0) {
      console.log('⚠️  No se encontró usuario Walmer. Asegúrate de que tenga una cuenta.');
    } else {
      const walmer = walmerResult.rows[0];
      console.log(`✅ Usuario Walmer encontrado: ${walmer.full_name} (${walmer.email})`);

      // Actualizar rol a super_admin
      await query(
        `UPDATE users SET role = 'super_admin' WHERE id = $1`,
        [walmer.id]
      );
      console.log('   → Rol actualizado a: super_admin (Propietario)');

      // Crear o actualizar team_member
      await query(
        `INSERT INTO team_members (
          user_id, position, commission_percentage,
          can_manage_products, can_manage_orders, can_view_analytics,
          can_manage_customers, can_manage_settings, can_manage_team, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (user_id) DO UPDATE SET
          position = EXCLUDED.position,
          can_manage_products = EXCLUDED.can_manage_products,
          can_manage_orders = EXCLUDED.can_manage_orders,
          can_view_analytics = EXCLUDED.can_view_analytics,
          can_manage_customers = EXCLUDED.can_manage_customers,
          can_manage_settings = EXCLUDED.can_manage_settings,
          can_manage_team = EXCLUDED.can_manage_team`,
        [
          walmer.id,
          'owner',
          0, // El owner no tiene comisión, recibe todo
          true,
          true,
          true,
          true,
          true,
          true,
          'Propietario de MELO SPORTT'
        ]
      );
      console.log('   → Configurado como Owner del equipo\n');
    }

    if (fuyiResult.rows.length === 0) {
      console.log('⚠️  No se encontró usuario Fuyi/Lee. Asegúrate de que tenga una cuenta.');
    } else {
      const fuyi = fuyiResult.rows[0];
      console.log(`✅ Usuario Fuyi encontrado: ${fuyi.full_name} (${fuyi.email})`);

      // Actualizar rol a developer
      await query(
        `UPDATE users SET role = 'developer' WHERE id = $1`,
        [fuyi.id]
      );
      console.log('   → Rol actualizado a: developer');

      // Crear o actualizar team_member
      await query(
        `INSERT INTO team_members (
          user_id, position, commission_percentage,
          can_manage_products, can_manage_orders, can_view_analytics,
          can_manage_customers, can_manage_settings, can_manage_team, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (user_id) DO UPDATE SET
          position = EXCLUDED.position,
          commission_percentage = EXCLUDED.commission_percentage,
          can_manage_products = EXCLUDED.can_manage_products,
          can_manage_orders = EXCLUDED.can_manage_orders,
          can_view_analytics = EXCLUDED.can_view_analytics,
          can_manage_customers = EXCLUDED.can_manage_customers,
          can_manage_settings = EXCLUDED.can_manage_settings,
          can_manage_team = EXCLUDED.can_manage_team`,
        [
          fuyi.id,
          'developer',
          12, // 12% de comisión
          false, // No puede gestionar productos
          false, // No puede gestionar pedidos
          true,  // Puede ver analytics (para ver sus comisiones)
          false, // No puede gestionar clientes
          false, // No puede gestionar configuración
          false, // No puede gestionar equipo
          'Desarrollador del proyecto - 12% de comisión por ventas'
        ]
      );
      console.log('   → Configurado como Developer con 12% de comisión\n');
    }

    console.log('✅ Configuración del equipo completada!');
    console.log('\nPermisos:');
    console.log('  Walmer (Owner): Control total de la tienda');
    console.log('  Fuyi (Developer): Ver analytics y comisiones (12%)');

  } catch (error: any) {
    console.error('❌ Error configurando equipo:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupTeam();
