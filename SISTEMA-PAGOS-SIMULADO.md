# 💳 Sistema de Pagos Simulado - Melo Sportt

## 🎯 Resumen

Se ha implementado un sistema completo de pagos simulado que permite **probar el flujo de compra sin necesitar Stripe configurado**. El sistema:

- ✅ Reduce el stock real de productos
- ✅ Registra las órdenes en la base de datos
- ✅ Muestra las compras en el panel de admin
- ✅ Funciona automáticamente sin configuración adicional
- ✅ Se convierte a pagos reales solo configurando las claves de Stripe

---

## 🚀 Cómo Funciona

### Modo Automático

El sistema detecta automáticamente si Stripe está configurado:

**Sin Stripe (Modo Simulado):**
```bash
# No configurar o dejar vacías estas variables
STRIPE_SECRET_KEY=
VITE_STRIPE_PUBLIC_KEY=
```

**Con Stripe (Modo Real):**
```bash
# Configurar estas variables con claves reales
STRIPE_SECRET_KEY=sk_live_xxxxx
VITE_STRIPE_PUBLIC_KEY=pk_live_xxxxx
```

---

## 🧪 Usando el Modo Simulado

### 1. Backend

El servicio `stripe.service.ts` detecta si no hay `STRIPE_SECRET_KEY` y automáticamente:

- Genera IDs de pago falsos: `pi_simulated_1234567890_abc123`
- Simula pagos exitosos
- Registra logs claros: `🧪 [SIMULATED PAYMENT]`
- Funciona exactamente igual que Stripe para el resto del código

```typescript
// Ejemplo de uso (no necesitas cambiar nada)
const paymentIntent = await stripeService.createPaymentIntent(total);
// En modo simulado: retorna un payment intent fake
// En modo real: retorna un payment intent de Stripe
```

### 2. Frontend

El checkout muestra automáticamente un formulario de pago simulado cuando no hay Stripe:

**Tarjetas de Prueba Aceptadas:**
- Visa: `4242 4242 4242 4242`
- Mastercard: `5555 5555 5555 4444`
- AmEx: `3782 822463 10005`
- Cualquier tarjeta de 16 dígitos funciona

**Validaciones:**
- Número de tarjeta: 16 dígitos
- CVV: 3-4 dígitos
- Fecha de expiración: Formato MM/AA (fecha futura)

---

## 📦 Flujo Completo de Compra Simulada

1. **Usuario agrega productos al carrito**
2. **Va al checkout y completa la información de envío**
3. **En el paso de pago:**
   - Ve el formulario simulado (sin Stripe)
   - Ingresa cualquier tarjeta de 16 dígitos
   - Hace clic en "Pagar"
4. **Backend procesa el pago:**
   - Genera un ID de pago simulado
   - Crea la orden en la base de datos
   - **Reduce el stock de productos** ⚠️
   - Actualiza `total_sold` del producto
5. **Usuario ve confirmación de compra**
6. **Admin puede ver la orden en el panel**

---

## 🔍 Verificar que Funciona

### Verificar Reducción de Stock

```sql
-- Ver stock actual de un producto
SELECT id, name, quantity, total_sold
FROM products
WHERE id = 'tu-product-id';

-- Hacer una compra simulada de 2 unidades

-- Verificar que el stock se redujo
SELECT id, name, quantity, total_sold
FROM products
WHERE id = 'tu-product-id';
-- quantity debe haber bajado en 2
-- total_sold debe haber aumentado en 2
```

### Verificar Órdenes en Admin

1. Login como admin: `/admin/login`
2. Ir a "Órdenes" en el panel
3. Ver las órdenes con:
   - `payment_status: 'paid'`
   - `status: 'confirmed'`
   - `payment_id: 'sim_payment_xxxxx'`

---

## ⚙️ Configuración para Producción

Cuando estés listo para pagos reales:

### 1. Obtener Claves de Stripe

Ir a: https://dashboard.stripe.com/apikeys

**Para Testing:**
```bash
STRIPE_SECRET_KEY=sk_test_xxxxx
VITE_STRIPE_PUBLIC_KEY=pk_test_xxxxx
```

**Para Producción:**
```bash
STRIPE_SECRET_KEY=sk_live_xxxxx
VITE_STRIPE_PUBLIC_KEY=pk_live_xxxxx
```

### 2. Configurar Variables de Entorno

**Backend (Render):**
```bash
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx  # Opcional, para webhooks
```

**Frontend (Vercel):**
```bash
VITE_STRIPE_PUBLIC_KEY=pk_live_xxxxx
```

### 3. Redesplegar

El sistema detectará automáticamente las claves y cambiará a modo real.

**NO necesitas cambiar código!** 🎉

---

## 🛡️ Seguridad

### ⚠️ Importante en Producción

1. **Nunca expongas `STRIPE_SECRET_KEY` en el frontend**
2. **Usa HTTPS en producción**
3. **Configura webhooks de Stripe para confirmación de pagos**
4. **Valida pagos en el backend, no confíes solo en el frontend**

### Webhooks de Stripe (Opcional pero Recomendado)

Para mayor seguridad, configura webhooks:

1. En Stripe Dashboard → Webhooks
2. Agregar endpoint: `https://tu-api.com/webhooks/stripe`
3. Eventos a escuchar:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`

---

## 📊 Logs y Debugging

### Modo Simulado

Los logs del backend mostrarán:

```bash
🧪 [SIMULATED PAYMENT] Creating payment intent for: 150000 cop
🧪 [SIMULATED PAYMENT] Confirming payment: pi_simulated_1234567890_abc123
✅ [SIMULATED PAYMENT] Payment succeeded: { id: 'pi_simulated_...', amount: 1500, currency: 'cop' }
```

### Modo Real

Los logs mostrarán las respuestas reales de Stripe sin el prefijo `🧪`.

---

## 🧾 Características del Sistema

### ✅ Lo que SÍ hace en modo simulado:

- Reduce stock de productos
- Registra órdenes en la base de datos
- Actualiza `total_sold`
- Muestra órdenes en el admin
- Simula pagos exitosos
- Valida formato de tarjetas
- Genera IDs únicos de pago

### ❌ Lo que NO hace en modo simulado:

- Procesar dinero real
- Cobrar a tarjetas reales
- Conectarse con bancos
- Validar si las tarjetas existen
- Verificar fondos disponibles

---

## 🔄 Migración a Pagos Reales

Pasos para migrar cuando estés listo:

1. **Obtener claves de Stripe** (test o live)
2. **Configurar en Render y Vercel**
3. **Redesplegar aplicación**
4. **Probar con tarjetas de prueba de Stripe:**
   - `4242 4242 4242 4242` - Éxito
   - `4000 0000 0000 9995` - Tarjeta declinada
5. **Configurar webhooks** (recomendado)
6. **Activar claves de producción** cuando todo funcione

---

## 💡 Tips de Desarrollo

### Para Testing Local

```bash
# Desactivar Stripe temporalmente
STRIPE_SECRET_KEY=
VITE_STRIPE_PUBLIC_KEY=

# Reiniciar servidores
npm run dev  # En ambos: frontend y backend
```

### Tarjetas de Prueba Stripe (Modo Real Test)

Cuando uses claves `sk_test_` y `pk_test_`:

- `4242 4242 4242 4242` - Pago exitoso
- `4000 0000 0000 9995` - Tarjeta insuficientes fondos
- `4000 0000 0000 0069` - Tarjeta expirada
- `4000 0000 0000 0127` - CVC incorrecto

Documentación: https://stripe.com/docs/testing

---

## 🐛 Troubleshooting

### El formulario de Stripe no carga

**Problema:** Ve el formulario simulado cuando debería ver Stripe

**Solución:**
1. Verificar que `VITE_STRIPE_PUBLIC_KEY` esté configurada
2. Verificar que no sea `pk_test_51Demo123456789` (valor por defecto)
3. Limpiar caché del navegador
4. Verificar en DevTools → Network que se carga `stripe.com/v3/`

### Pagos simulados no reducen stock

**Problema:** Stock no baja después de compra

**Solución:**
1. Verificar que `track_quantity = true` en el producto
2. Verificar logs del backend para errores
3. Revisar transacción en base de datos
4. Verificar que la orden se creó con `payment_status: 'paid'`

### Admin no muestra órdenes

**Problema:** Panel de admin no muestra compras

**Solución:**
1. Verificar que el usuario sea admin (`role = 'admin'`)
2. Verificar que las órdenes existan: `SELECT * FROM orders;`
3. Revisar console del navegador para errores de API
4. Verificar permisos de CORS en el backend

---

## 📚 Archivos Modificados

```
backend/
├── services/stripe.service.ts       # Lógica de pagos simulados
├── routes/order.routes.ts           # Fix de tipos
└── types/index.ts                   # Agregado stripe_payment_intent_id

frontend/
├── components/checkout/
│   └── SimulatedPaymentForm.tsx     # Formulario de pago simulado
└── pages/CheckoutPage.tsx           # Detección automática de modo
```

---

## 🎓 Próximos Pasos

1. ✅ **Probar flujo completo en desarrollo** (simulado)
2. ✅ **Verificar reducción de stock**
3. ✅ **Confirmar órdenes en admin**
4. 🔜 **Configurar Stripe test keys**
5. 🔜 **Probar con tarjetas de prueba reales**
6. 🔜 **Configurar webhooks**
7. 🔜 **Activar claves de producción**

---

## 📞 Soporte

Si tienes problemas:

1. Revisa los logs del backend (Render)
2. Revisa la consola del frontend (DevTools)
3. Verifica las variables de entorno
4. Consulta la documentación de Stripe: https://stripe.com/docs

---

**¡El sistema está listo para probar compras simuladas! 🚀**

Puedes hacer compras de prueba y todo funcionará como si fueran pagos reales, excepto que no se cobra dinero. Cuando estés listo, solo configura las claves de Stripe y todo seguirá funcionando igual.
