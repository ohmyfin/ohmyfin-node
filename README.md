# Ohmyfin Node.js SDK

[![npm version](https://img.shields.io/npm/v/ohmyfin.svg)](https://www.npmjs.com/package/ohmyfin)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Official Node.js SDK for the [Ohmyfin API](https://ohmyfin.ai) - SWIFT transaction tracking, validation, and correspondent banking data.

**Ohmyfin** (previously known as TrackMySwift) provides real-time SWIFT payment tracking, transaction validation, and Standard Settlement Instructions (SSI) data for financial institutions and businesses.

## Features

- **Transaction Tracking** - Track SWIFT payments in real-time using UETR or reference
- **Payment Validation** - Validate transactions before sending (BIC, IBAN, sanctions)
- **SSI Data** - Access Standard Settlement Instructions and correspondent banking data
- **Status Updates** - Report transaction status (for financial institutions)

## Installation

```bash
npm install ohmyfin
```

## Quick Start

Get your API key at [https://ohmyfin.ai](https://ohmyfin.ai)

```javascript
const Ohmyfin = require('ohmyfin');

const client = new Ohmyfin({
  apiKey: 'your-api-key'
});

// Track a transaction
const result = await client.track({
  uetr: '97ed4827-7b6f-4491-a06f-b548d5a7512d',
  amount: 10000,
  date: '2024-01-15',
  currency: 'USD'
});

console.log(result.status); // 'success', 'in progress', 'rejected', etc.
```

## API Reference

### Constructor

```javascript
const client = new Ohmyfin({
  apiKey: 'your-api-key',     // Required - get yours at https://ohmyfin.ai
  baseUrl: 'https://ohmyfin.ai', // Optional
  timeout: 30000              // Optional - request timeout in ms
});
```

### track(params)

Track a SWIFT transaction by UETR or reference.

```javascript
const result = await client.track({
  uetr: '97ed4827-7b6f-4491-a06f-b548d5a7512d', // or use 'ref'
  amount: 10000,
  date: '2024-01-15',
  currency: 'USD'
});
```

**Response:**
```javascript
{
  status: 'in progress',  // 'success', 'rejected', 'on hold', 'unknown'
  lastupdate: '2024-01-15',
  details: [
    {
      id: 0,
      bank: 'JP MORGAN CHASE',
      swift: 'CHASUS33',
      status: 'success',
      reason: '',
      route: 'confirmed'
    }
  ],
  limits: { daily: 100, monthly: 1000, annual: 10000 }
}
```

### validate(params)

Validate a transaction before sending.

```javascript
const result = await client.validate({
  beneficiary_bic: 'DEUTDEFF',
  currency: 'EUR',
  beneficiary_iban: 'DE89370400440532013000',
  correspondent_bic: 'COBADEFF',  // Optional
  sender_bic: 'CHASUS33'          // Optional
});
```

**Response:**
```javascript
{
  beneficiary_bic: { status: 'ok' },
  beneficiary_iban: { status: 'ok' },
  correspondent_bic: {
    status: 'warning',
    details: 'Not the preferred correspondent'
  },
  avg_business_days: 1,
  available_correspondents: [
    { corresBIC: 'COBADEFF', is_preferred: true }
  ]
}
```

### getSSI(params)

Get Standard Settlement Instructions for a bank.

```javascript
const ssi = await client.getSSI({
  swift: 'DEUTDEFF',
  currency: 'EUR'
});
```

**Response:**
```javascript
{
  correspondents: [
    {
      id: 1,
      bank: 'COMMERZBANK AG',
      swift: 'COBADEFF',
      currency: 'EUR',
      account: '400886700401',
      is_preferred: true
    }
  ],
  currencies: ['EUR', 'USD', 'GBP']
}
```

### change(params)

Report transaction status updates (for financial institutions).

```javascript
await client.change({
  uetr: '97ed4827-7b6f-4491-a06f-b548d5a7512d',
  amount: 10000,
  date: '2024-01-15',
  currency: 'USD',
  status: 'success',     // 'in process', 'success', 'rejected', 'on hold'
  role: 'correspondent'  // 'originator', 'beneficiary', 'intermediary', 'correspondent', 'other'
});
```

## Error Handling

```javascript
const { OhmyfinError } = require('ohmyfin');

try {
  await client.track({ ... });
} catch (error) {
  if (error instanceof OhmyfinError) {
    console.log(error.statusCode);  // HTTP status code
    console.log(error.errors);      // Validation errors
  }
}
```

## TypeScript Support

This package includes TypeScript definitions.

```typescript
import Ohmyfin, { TrackResult, ValidateResult } from 'ohmyfin';

const client = new Ohmyfin({ apiKey: 'your-key' });
const result: TrackResult = await client.track({ ... });
```

## Links

- **Website:** [https://ohmyfin.ai](https://ohmyfin.ai)
- **API Documentation:** [https://ohmyfin.ai/api-documentation](https://ohmyfin.ai/api-documentation)
- **Get API Key:** [https://ohmyfin.ai](https://ohmyfin.ai)
- **Support:** support@ohmyfin.ai

## About Ohmyfin

[Ohmyfin](https://ohmyfin.ai) (previously known as TrackMySwift) is a software platform providing transaction tracking, validation, and correspondent banking reference data. We serve individuals, businesses, and financial institutions worldwide.

**We do not provide any financial services.**

## Trademarks

SWIFT, BIC, UETR, and related terms are trademarks owned by S.W.I.F.T. SC, headquartered at Avenue Adele 1, 1310 La Hulpe, Belgium. Ohmyfin is not affiliated with S.W.I.F.T. SC. Other product and company names mentioned herein may be trademarks of their respective owners.

## License

MIT License - see [LICENSE](LICENSE) file.
