/**
 * Ohmyfin Node.js SDK
 * Official SDK for Ohmyfin API - SWIFT transaction tracking and validation
 *
 * @see https://ohmyfin.ai for documentation and API keys
 * @license MIT
 */

const https = require('https');
const http = require('http');

class OhmyfinError extends Error {
  constructor(message, statusCode, errors) {
    super(message);
    this.name = 'OhmyfinError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

class Ohmyfin {
  /**
   * Create an Ohmyfin client
   * @param {Object} config - Configuration options
   * @param {string} config.apiKey - Your Ohmyfin API key (get one at https://ohmyfin.ai)
   * @param {string} [config.baseUrl='https://ohmyfin.ai'] - API base URL
   * @param {number} [config.timeout=30000] - Request timeout in milliseconds
   */
  constructor(config) {
    if (!config || !config.apiKey) {
      throw new Error('API key is required. Get your API key at https://ohmyfin.ai');
    }

    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://ohmyfin.ai';
    this.timeout = config.timeout || 30000;
  }

  /**
   * Make an API request
   * @private
   */
  _request(method, path, data = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseUrl);
      const isHttps = url.protocol === 'https:';
      const lib = isHttps ? https : http;

      const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: method,
        headers: {
          'KEY': this.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'ohmyfin-node/1.0.0'
        },
        timeout: this.timeout
      };

      const req = lib.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(body);
            if (res.statusCode >= 400) {
              reject(new OhmyfinError(
                json.message || 'API request failed',
                res.statusCode,
                json.errors
              ));
            } else {
              resolve(json);
            }
          } catch (e) {
            reject(new OhmyfinError('Invalid JSON response', res.statusCode));
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new OhmyfinError('Request timeout', 408));
      });

      if (data) {
        req.write(JSON.stringify(data));
      }
      req.end();
    });
  }

  /**
   * Track a SWIFT transaction
   *
   * @param {Object} params - Tracking parameters
   * @param {string} [params.uetr] - UETR (Universal End-to-End Transaction Reference)
   * @param {string} [params.ref] - Transaction reference (required if uetr not provided)
   * @param {number} params.amount - Transaction amount
   * @param {string} params.date - Transaction date (YYYY-MM-DD format)
   * @param {string} params.currency - Currency code (e.g., 'USD', 'EUR')
   * @returns {Promise<Object>} Transaction tracking result
   *
   * @example
   * const result = await client.track({
   *   uetr: '97ed4827-7b6f-4491-a06f-b548d5a7512d',
   *   amount: 10000,
   *   date: '2024-01-15',
   *   currency: 'USD'
   * });
   */
  async track(params) {
    if (!params.uetr && !params.ref) {
      throw new Error('Either uetr or ref is required');
    }
    if (!params.amount || !params.date || !params.currency) {
      throw new Error('amount, date, and currency are required');
    }
    return this._request('POST', '/api/track', params);
  }

  /**
   * Update/report transaction status (for financial institutions)
   *
   * @param {Object} params - Transaction update parameters
   * @param {string} [params.uetr] - UETR
   * @param {string} [params.ref] - Transaction reference
   * @param {number} params.amount - Transaction amount
   * @param {string} params.date - Transaction date (YYYY-MM-DD)
   * @param {string} params.currency - Currency code
   * @param {string} params.status - Status: 'in process', 'success', 'rejected', 'on hold'
   * @param {string} params.role - Role: 'originator', 'beneficiary', 'intermediary', 'correspondent', 'other'
   * @param {string} [params.swift] - Your SWIFT/BIC code
   * @param {string} [params.nextName] - Next bank name in chain
   * @param {string} [params.nextSwift] - Next bank SWIFT code
   * @param {string} [params.message] - Additional message
   * @param {string} [params.details] - Additional details
   * @returns {Promise<Object>} Update confirmation
   *
   * @example
   * await client.change({
   *   uetr: '97ed4827-7b6f-4491-a06f-b548d5a7512d',
   *   amount: 10000,
   *   date: '2024-01-15',
   *   currency: 'USD',
   *   status: 'success',
   *   role: 'correspondent'
   * });
   */
  async change(params) {
    if (!params.uetr && !params.ref) {
      throw new Error('Either uetr or ref is required');
    }
    if (!params.status || !params.role) {
      throw new Error('status and role are required');
    }
    return this._request('POST', '/api/change', params);
  }

  /**
   * Validate a transaction before sending
   *
   * @param {Object} params - Validation parameters
   * @param {string} params.beneficiary_bic - Beneficiary bank SWIFT/BIC
   * @param {string} params.currency - Currency code
   * @param {string} [params.correspondent_bic] - Correspondent bank BIC
   * @param {string} [params.correspondent_account] - Correspondent account
   * @param {string} [params.beneficiary_iban] - Beneficiary IBAN
   * @param {string} [params.beneficiary_owner] - Beneficiary name
   * @param {string} [params.beneficiary_country] - Beneficiary country
   * @param {string} [params.beneficiary_region] - Beneficiary region
   * @param {string} [params.sender_bic] - Sender bank BIC
   * @param {string} [params.sender_correspondent_bic] - Sender correspondent BIC
   * @returns {Promise<Object>} Validation result with status for each field
   *
   * @example
   * const result = await client.validate({
   *   beneficiary_bic: 'DEUTDEFF',
   *   currency: 'EUR',
   *   beneficiary_iban: 'DE89370400440532013000'
   * });
   */
  async validate(params) {
    if (!params.beneficiary_bic || !params.currency) {
      throw new Error('beneficiary_bic and currency are required');
    }
    return this._request('POST', '/api/validate', params);
  }

  /**
   * Get Standard Settlement Instructions (SSI) for a bank
   *
   * @param {Object} params - SSI query parameters
   * @param {string} params.swift - Bank SWIFT/BIC code
   * @param {string} params.currency - Currency code
   * @returns {Promise<Object>} SSI data with correspondent banks
   *
   * @example
   * const ssi = await client.getSSI({
   *   swift: 'DEUTDEFF',
   *   currency: 'EUR'
   * });
   * console.log(ssi.correspondents);
   */
  async getSSI(params) {
    if (!params.swift || !params.currency) {
      throw new Error('swift and currency are required');
    }
    return this._request('POST', '/api/getssi', params);
  }
}

module.exports = Ohmyfin;
module.exports.OhmyfinError = OhmyfinError;
module.exports.default = Ohmyfin;
