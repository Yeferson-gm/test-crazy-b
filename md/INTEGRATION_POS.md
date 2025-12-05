# Integración con POS Físico - Guía Futura

Este documento contiene información para cuando decidas integrar POS físico (terminales de pago).

## 🏦 Proveedores en Perú

### 1. Niubiz (antes VisaNet)

**Productos:**
- Terminal POS física
- Pasarela de pagos online
- API de integración

**Documentación:**
- API Docs: https://developer.niubiz.com.pe/
- Sandbox: https://apitestenv.vnforapps.com

**Tipos de integración:**
- Point of Sale (Terminal física)
- eCommerce (Web)
- SDK Mobile

**Ejemplo de flujo:**
```javascript
// Endpoint a crear en el futuro: /api/v1/payments/niubiz
import { Niubiz } from '@niubiz/sdk'; // Instalar cuando lo necesites

const niubiz = new Niubiz({
  merchantId: process.env.NIUBIZ_MERCHANT_ID,
  apiKey: process.env.NIUBIZ_API_KEY,
  environment: 'production', // o 'sandbox'
});

// Procesar pago
const transaction = await niubiz.authorize({
  amount: total,
  currency: 'PEN',
  orderId: saleId,
  // ... otros datos
});
```

### 2. Izipay (Grupo BCP)

**Productos:**
- Terminal móvil
- Terminal fija
- API REST

**Documentación:**
- Docs: https://secure.micuentaweb.pe/doc/
- API REST: https://api.micuentaweb.pe/doc

**Características:**
- Menor comisión que Niubiz
- Integración con BCP directa
- Soporte Yape/Plin

### 3. Mercado Pago

**Productos:**
- Point (Terminal móvil)
- Point Smart (Terminal con impresora)
- Point Plus (Terminal completa)

**Documentación:**
- Docs: https://www.mercadopago.com.pe/developers
- API: https://api.mercadopago.com

**SDK:**
```bash
bun add mercadopago
```

**Ejemplo:**
```javascript
import mercadopago from 'mercadopago';

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN
});

const payment = await mercadopago.payment.create({
  transaction_amount: total,
  description: saleNumber,
  payment_method_id: 'visa',
  payer: {
    email: customer.email
  }
});
```

## 🔌 Cómo Integrar en el Backend

### Paso 1: Crear módulo de payments

```bash
mkdir src/modules/payments
touch src/modules/payments/payments.service.ts
touch src/modules/payments/payments.routes.ts
touch src/modules/payments/providers/niubiz.ts
touch src/modules/payments/providers/izipay.ts
touch src/modules/payments/providers/mercadopago.ts
```

### Paso 2: Estructura del servicio

```typescript
// src/modules/payments/payments.service.ts
export class PaymentsService {
  async processCardPayment(data: {
    amount: number;
    saleId: string;
    provider: 'niubiz' | 'izipay' | 'mercadopago';
    terminalId?: string;
  }) {
    // Lógica de procesamiento
    switch(data.provider) {
      case 'niubiz':
        return await this.processNiubiz(data);
      case 'izipay':
        return await this.processIzipay(data);
      case 'mercadopago':
        return await this.processMercadoPago(data);
    }
  }

  async processNiubiz(data) {
    // Implementar cuando sea necesario
  }
}
```

### Paso 3: Agregar tabla de transacciones POS

```typescript
// Agregar a schema.ts
export const posTransactions = pgTable('pos_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  saleId: uuid('sale_id').references(() => sales.id).notNull(),
  provider: text('provider').notNull(), // niubiz, izipay, mercadopago
  transactionId: text('transaction_id').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  status: text('status').notNull(), // pending, approved, rejected
  terminalId: text('terminal_id'),
  cardType: text('card_type'), // visa, mastercard, etc
  last4Digits: text('last4_digits'),
  authorizationCode: text('authorization_code'),
  providerResponse: jsonb('provider_response'),
  createdAt: timestamp('created_at').defaultNow(),
});
```

### Paso 4: Actualizar .env

```env
# POS Físico - Niubiz
NIUBIZ_MERCHANT_ID=your_merchant_id
NIUBIZ_API_KEY=your_api_key
NIUBIZ_API_SECRET=your_api_secret
NIUBIZ_ENVIRONMENT=sandbox # o production

# POS Físico - Izipay
IZIPAY_SHOP_ID=your_shop_id
IZIPAY_API_KEY=your_api_key
IZIPAY_HMAC_KEY=your_hmac_key

# POS Físico - Mercado Pago
MP_ACCESS_TOKEN=your_access_token
MP_PUBLIC_KEY=your_public_key
```

### Paso 5: Endpoint de procesamiento

```typescript
// src/modules/payments/payments.routes.ts
export const paymentsRoutes = new Elysia({ prefix: '/payments' })
  .use(requireAuth())

  .post('/process', async ({ body, user, set }) => {
    try {
      const transaction = await paymentsService.processCardPayment({
        ...body,
        userId: user.id,
      });

      // Si el pago es aprobado, actualizar la venta
      if (transaction.status === 'approved') {
        await salesService.updatePaymentStatus(body.saleId, 'paid');
      }

      return successResponse(transaction);
    } catch (error: any) {
      set.status = 400;
      return errorResponse(error.message);
    }
  }, {
    body: t.Object({
      saleId: t.String(),
      amount: t.Number(),
      provider: t.Union([
        t.Literal('niubiz'),
        t.Literal('izipay'),
        t.Literal('mercadopago'),
      ]),
      terminalId: t.Optional(t.String()),
    })
  });
```

## 📱 Integración con Frontend

### Para terminal física conectada:

1. **USB/Serial**: Leer desde el puerto serial
2. **Bluetooth**: Conectar vía Bluetooth Web API
3. **Red local**: HTTP requests al terminal en la red

### Para procesamiento online:

```typescript
// Ejemplo desde el frontend
const response = await fetch('/api/v1/payments/process', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    saleId: '...',
    amount: 118.00,
    provider: 'mercadopago',
  })
});

const { data } = await response.json();

if (data.status === 'approved') {
  // Mostrar comprobante
  // Imprimir ticket
}
```

## 💰 Comparación de Costos (aprox.)

| Proveedor | Comisión | Terminal | Ventajas |
|-----------|----------|----------|----------|
| Niubiz | 3.5% - 4% | S/. 80/mes | Mayor aceptación, soporte 24/7 |
| Izipay | 2.8% - 3.5% | S/. 50/mes | Menor comisión, integración BCP |
| Mercado Pago | 3.99% | Compra S/. 299 | Sin alquiler, fácil integración |

## 🚀 Cuando Estés Listo

1. Contacta al proveedor elegido
2. Solicita credenciales de sandbox
3. Implementa el módulo de payments
4. Prueba en sandbox
5. Solicita credenciales de producción
6. Deploy a producción

## 📚 Referencias

- Niubiz: https://developer.niubiz.com.pe/
- Izipay: https://secure.micuentaweb.pe/doc/
- Mercado Pago: https://www.mercadopago.com.pe/developers
- POS Protocol Standards: https://www.emvco.com/

---

**Nota:** Este archivo es solo una guía. La implementación real dependerá del proveedor que elijas y tus necesidades específicas.
