/**
 * Ohmyfin Node.js SDK TypeScript Definitions
 * @see https://ohmyfin.ai
 */

declare class OhmyfinError extends Error {
  statusCode: number;
  errors?: Record<string, string[]>;
  constructor(message: string, statusCode: number, errors?: Record<string, string[]>);
}

interface OhmyfinConfig {
  /** Your Ohmyfin API key (get one at https://ohmyfin.ai) */
  apiKey: string;
  /** API base URL (default: https://ohmyfin.ai) */
  baseUrl?: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
}

interface TrackParams {
  /** UETR (Universal End-to-End Transaction Reference) */
  uetr?: string;
  /** Transaction reference */
  ref?: string;
  /** Transaction amount */
  amount: number;
  /** Transaction date (YYYY-MM-DD) */
  date: string;
  /** Currency code (e.g., 'USD', 'EUR') */
  currency: string;
}

interface TrackResult {
  status: 'in progress' | 'success' | 'rejected' | 'on hold' | 'unknown' | 'future';
  lastupdate: string;
  details: Array<{
    id: number;
    bank: string;
    swift: string;
    status: string;
    reason: string;
    route: string;
  }>;
  limits: {
    daily: number;
    monthly: number;
    annual: number;
  };
}

interface ChangeParams {
  uetr?: string;
  ref?: string;
  amount: number;
  date: string;
  currency: string;
  status: 'in process' | 'success' | 'rejected' | 'on hold';
  role: 'originator' | 'beneficiary' | 'intermediary' | 'correspondent' | 'other';
  swift?: string;
  nextName?: string;
  nextSwift?: string;
  message?: string;
  details?: string;
}

interface ValidateParams {
  beneficiary_bic: string;
  currency: string;
  correspondent_bic?: string;
  correspondent_account?: string;
  beneficiary_iban?: string;
  beneficiary_owner?: string;
  beneficiary_country?: string;
  beneficiary_region?: string;
  sender_bic?: string;
  sender_correspondent_bic?: string;
}

interface ValidationStatus {
  status: 'ok' | 'invalid' | 'warning';
  recommendation?: string;
  details?: string;
  options?: string[];
}

interface ValidateResult {
  beneficiary_bic: ValidationStatus;
  correspondent_bic?: ValidationStatus;
  sender_bic?: ValidationStatus;
  sender_correspondent_bic?: ValidationStatus;
  beneficiary_iban?: ValidationStatus;
  beneficiary_address?: ValidationStatus;
  avg_business_days: number;
  available_correspondents?: Array<{
    corresBIC: string;
    is_preferred?: boolean;
  }>;
}

interface SSIParams {
  swift: string;
  currency: string;
}

interface SSIResult {
  correspondents: Array<{
    id: number;
    bank: string;
    swift: string;
    currency: string;
    account: string;
    is_preferred: boolean;
  }>;
  currencies: string[];
  limits: {
    daily: number;
    monthly: number;
    annual: number;
  };
}

declare class Ohmyfin {
  constructor(config: OhmyfinConfig);

  /** Track a SWIFT transaction */
  track(params: TrackParams): Promise<TrackResult>;

  /** Update/report transaction status */
  change(params: ChangeParams): Promise<{ message: string }>;

  /** Validate a transaction before sending */
  validate(params: ValidateParams): Promise<ValidateResult>;

  /** Get Standard Settlement Instructions */
  getSSI(params: SSIParams): Promise<SSIResult>;
}

export = Ohmyfin;
export { OhmyfinError, OhmyfinConfig, TrackParams, TrackResult, ChangeParams, ValidateParams, ValidateResult, SSIParams, SSIResult };
