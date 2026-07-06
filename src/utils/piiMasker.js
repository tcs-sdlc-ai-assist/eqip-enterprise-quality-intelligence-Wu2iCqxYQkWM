import { ROLES } from '../constants.js';

/**
 * @module piiMasker
 * PII masking utility for eQIP Quality Intelligence.
 * Provides field-level and entity-level masking based on user role.
 */

/**
 * Set of field names considered PII-sensitive.
 * @type {Set<string>}
 */
const PII_FIELDS = new Set([
  'name',
  'email',
  'phone',
  'userId',
  'user_id',
  'owner',
  'created_by',
  'updated_by',
  'requested_by',
  'assigned_to',
  'assignee',
  'reporter',
  'approver',
  'reviewer',
  'avatar',
]);

/**
 * Set of field names considered sensitive data fields.
 * @type {Set<string>}
 */
const SENSITIVE_FIELDS = new Set([
  'testData',
  'test_data',
  'authSource',
  'auth_source',
  'auth_token',
  'token',
  'password',
  'secret',
  'credentials',
  'api_key',
  'apiKey',
]);

/**
 * Set of field names considered contextual/business-sensitive for restricted roles.
 * @type {Set<string>}
 */
const CONTEXTUAL_FIELDS = new Set([
  'segment',
  'application',
]);

/**
 * Roles that are allowed to see full PII data without masking.
 * @type {Set<string>}
 */
const PII_EXEMPT_ROLES = new Set([
  ROLES.ADMIN,
  ROLES.PROGRAM_MANAGER,
  ROLES.QA_LEAD,
]);

/**
 * Roles that can see contextual fields (segment, application) unmasked.
 * @type {Set<string>}
 */
const CONTEXTUAL_EXEMPT_ROLES = new Set([
  ROLES.ADMIN,
  ROLES.PROGRAM_MANAGER,
  ROLES.PROJECT_MANAGER,
  ROLES.QA_LEAD,
  ROLES.QA_ENGINEER,
  ROLES.DEVELOPER,
  ROLES.BUSINESS_ANALYST,
  ROLES.RELEASE_MANAGER,
  ROLES.SCRUM_MASTER,
]);

/**
 * Mask a string value by replacing characters with asterisks,
 * preserving a hint of the original value.
 * @param {string} value - The value to mask.
 * @returns {string} The masked value.
 */
function maskString(value) {
  if (value === null || value === undefined) {
    return '***';
  }
  const str = String(value);
  if (str.length === 0) {
    return '***';
  }
  if (str.length <= 3) {
    return '***';
  }
  return str.charAt(0) + '*'.repeat(Math.min(str.length - 1, 7)) + str.charAt(str.length - 1);
}

/**
 * Mask an email address, preserving domain hint.
 * @param {string} email - The email to mask.
 * @returns {string} The masked email.
 */
function maskEmail(email) {
  if (email === null || email === undefined) {
    return '***@***.***';
  }
  const str = String(email);
  const atIndex = str.indexOf('@');
  if (atIndex === -1) {
    return maskString(str);
  }
  const localPart = str.substring(0, atIndex);
  const domainPart = str.substring(atIndex + 1);
  const maskedLocal = localPart.length > 1
    ? localPart.charAt(0) + '*'.repeat(Math.min(localPart.length - 1, 5))
    : '*';
  const dotIndex = domainPart.lastIndexOf('.');
  if (dotIndex === -1) {
    return maskedLocal + '@' + maskString(domainPart);
  }
  const domainName = domainPart.substring(0, dotIndex);
  const tld = domainPart.substring(dotIndex);
  const maskedDomain = domainName.length > 1
    ? domainName.charAt(0) + '*'.repeat(Math.min(domainName.length - 1, 4))
    : '*';
  return maskedLocal + '@' + maskedDomain + tld;
}

/**
 * Mask a phone number, preserving last 4 digits.
 * @param {string} phone - The phone number to mask.
 * @returns {string} The masked phone number.
 */
function maskPhone(phone) {
  if (phone === null || phone === undefined) {
    return '***-***-****';
  }
  const str = String(phone);
  const digits = str.replace(/\D/g, '');
  if (digits.length <= 4) {
    return '***-' + digits;
  }
  const lastFour = digits.slice(-4);
  return '***-***-' + lastFour;
}

/**
 * Determine the masking strategy for a given field name.
 * @param {string} fieldName - The field name to check.
 * @returns {'pii'|'sensitive'|'contextual'|'none'} The masking category.
 */
function getFieldCategory(fieldName) {
  if (!fieldName) {
    return 'none';
  }
  const lower = fieldName.toLowerCase();
  if (PII_FIELDS.has(fieldName) || PII_FIELDS.has(lower)) {
    return 'pii';
  }
  if (SENSITIVE_FIELDS.has(fieldName) || SENSITIVE_FIELDS.has(lower)) {
    return 'sensitive';
  }
  if (CONTEXTUAL_FIELDS.has(fieldName) || CONTEXTUAL_FIELDS.has(lower)) {
    return 'contextual';
  }
  if (lower.includes('email')) {
    return 'pii';
  }
  if (lower.includes('phone') || lower.includes('mobile') || lower.includes('fax')) {
    return 'pii';
  }
  if (lower.includes('password') || lower.includes('secret') || lower.includes('token') || lower.includes('credential')) {
    return 'sensitive';
  }
  return 'none';
}

/**
 * Check if a role is exempt from PII masking.
 * @param {string} role - The user role.
 * @returns {boolean} True if the role can see PII unmasked.
 */
function isRoleExemptFromPII(role) {
  return PII_EXEMPT_ROLES.has(role);
}

/**
 * Check if a role is exempt from contextual field masking.
 * @param {string} role - The user role.
 * @returns {boolean} True if the role can see contextual fields unmasked.
 */
function isRoleExemptFromContextual(role) {
  return CONTEXTUAL_EXEMPT_ROLES.has(role);
}

/**
 * Mask a single PII value based on field name and user role.
 * @param {*} value - The value to potentially mask.
 * @param {string} fieldName - The name of the field.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {*} The original or masked value.
 */
export function maskPII(value, fieldName, role = ROLES.VIEWER) {
  if (value === null || value === undefined) {
    return value;
  }

  const category = getFieldCategory(fieldName);

  if (category === 'none') {
    return value;
  }

  if (category === 'sensitive') {
    return '***';
  }

  if (category === 'contextual') {
    if (isRoleExemptFromContextual(role)) {
      return value;
    }
    return maskString(value);
  }

  // category === 'pii'
  if (isRoleExemptFromPII(role)) {
    return value;
  }

  const lower = String(fieldName).toLowerCase();

  if (lower.includes('email')) {
    return maskEmail(value);
  }

  if (lower.includes('phone') || lower.includes('mobile') || lower.includes('fax')) {
    return maskPhone(value);
  }

  if (lower === 'avatar') {
    return null;
  }

  return maskString(value);
}

/**
 * Mask all PII fields in an entity object.
 * Returns a new object with PII fields masked based on the user's role.
 * Non-object values are returned as-is.
 * @param {object} entity - The entity to mask.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} A new object with PII fields masked.
 */
export function maskEntity(entity, role = ROLES.VIEWER) {
  if (!entity || typeof entity !== 'object') {
    return entity;
  }

  if (Array.isArray(entity)) {
    return entity.map((item) => maskEntity(item, role));
  }

  const masked = {};
  const keys = Object.keys(entity);

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = entity[key];

    if (Array.isArray(value)) {
      const category = getFieldCategory(key);
      if (category !== 'none') {
        masked[key] = value.map((item) => {
          if (typeof item === 'string') {
            return maskPII(item, key, role);
          }
          if (typeof item === 'object' && item !== null) {
            return maskEntity(item, role);
          }
          return item;
        });
      } else {
        masked[key] = value.map((item) => {
          if (typeof item === 'object' && item !== null) {
            return maskEntity(item, role);
          }
          return item;
        });
      }
    } else if (typeof value === 'object' && value !== null) {
      masked[key] = maskEntity(value, role);
    } else {
      masked[key] = maskPII(value, key, role);
    }
  }

  return masked;
}

/**
 * Mask an entity or array of entities for export purposes.
 * Export masking is stricter — all PII is masked regardless of role,
 * and sensitive fields are fully redacted.
 * @param {object|Array<object>} data - The entity or entities to mask for export.
 * @returns {object|Array<object>} The masked data suitable for export.
 */
export function maskForExport(data) {
  if (!data) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => maskForExport(item));
  }

  if (typeof data !== 'object') {
    return data;
  }

  const masked = {};
  const keys = Object.keys(data);

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = data[key];
    const category = getFieldCategory(key);

    if (category === 'sensitive') {
      masked[key] = '[REDACTED]';
    } else if (category === 'pii') {
      const lower = String(key).toLowerCase();
      if (lower.includes('email')) {
        masked[key] = maskEmail(value);
      } else if (lower.includes('phone') || lower.includes('mobile') || lower.includes('fax')) {
        masked[key] = maskPhone(value);
      } else if (lower === 'avatar') {
        masked[key] = null;
      } else {
        masked[key] = maskString(value);
      }
    } else if (Array.isArray(value)) {
      masked[key] = value.map((item) => {
        if (typeof item === 'object' && item !== null) {
          return maskForExport(item);
        }
        return item;
      });
    } else if (typeof value === 'object' && value !== null) {
      masked[key] = maskForExport(value);
    } else {
      masked[key] = value;
    }
  }

  return masked;
}

/**
 * Check if a given field name is considered a PII field.
 * @param {string} fieldName - The field name to check.
 * @returns {boolean} True if the field is a PII or sensitive field.
 */
export function isPIIField(fieldName) {
  const category = getFieldCategory(fieldName);
  return category === 'pii' || category === 'sensitive';
}

/**
 * Get the list of all known PII field names.
 * @returns {string[]} Array of PII field names.
 */
export function getPIIFieldNames() {
  return [...PII_FIELDS, ...SENSITIVE_FIELDS];
}