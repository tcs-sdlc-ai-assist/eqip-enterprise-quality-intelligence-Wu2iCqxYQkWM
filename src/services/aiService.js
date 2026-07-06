import { v4 as uuidv4 } from 'uuid';
import {
  getAll,
  getById,
  create,
  find,
  count,
  apiGetAll,
  apiGetById,
  ENTITY_TYPES,
} from '../data/mockDataStore.js';
import { maskEntity } from '../utils/piiMasker.js';
import { logAction } from '../utils/auditLogger.js';
import { applyFilters, searchByText, sortData, paginateData, processData } from '../utils/filterUtils.js';
import { ROLES } from '../constants.js';
import {
  getAllAIInsights,
  getAIInsightById as getStaticAIInsightById,
  getAIInsightsByType,
  getAIInsightsByStatus,
  getAIInsightsByEntity,
  getAIInsightsByUser,
  getRiskPredictions,
  getRecommendations as getStaticRecommendations,
  getNaturalLanguageSearchResults,
  getAskEqipResponses,
  getDegradedInsights,
  getAvailableInsights,
  getUnavailableInsights,
  getAIInsightsSummary,
  getAIInsightCountByType,
  getAIInsightCountByStatus,
  getAverageConfidenceScore,
  getAverageProcessingTime,
  getRecentInsights,
  searchInsightsByQuery,
  getHighestRiskPredictions,
  simulateSearch,
  simulateRiskPrediction,
  simulateRecommendations,
} from '../data/aiInsights.js';

/**
 * @module aiService
 * AIInsights service for eQIP Quality Intelligence.
 * Provides search, risk prediction, recommendations, and Ask EQIP functionality
 * with simulated AI results, confidence scores, data sources, and graceful
 * degradation when AI is 'unavailable'.
 * Reads from mockDataStore and aiInsights data module.
 */

/**
 * The entity type key for AI insights.
 * @type {string}
 */
const AI_INSIGHTS_ENTITY_TYPE = ENTITY_TYPES.AI_INSIGHTS;

/**
 * Roles that can view AI insights.
 * @type {Set<string>}
 */
const VIEW_ROLES = new Set([
  ROLES.ADMIN,
  ROLES.PROGRAM_MANAGER,
  ROLES.PROJECT_MANAGER,
  ROLES.QA_LEAD,
  ROLES.QA_ENGINEER,
  ROLES.DEVELOPER,
  ROLES.BUSINESS_ANALYST,
  ROLES.RELEASE_MANAGER,
  ROLES.SCRUM_MASTER,
  ROLES.VIEWER,
]);

/**
 * Roles that can trigger AI queries (search, predict, recommend).
 * @type {Set<string>}
 */
const QUERY_ROLES = new Set([
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
 * Simulated AI availability state.
 * Can be toggled to simulate AI service outages.
 * @type {boolean}
 */
let _aiAvailable = true;

/**
 * Simulated AI degraded state.
 * When true, AI returns cached/simplified results.
 * @type {boolean}
 */
let _aiDegraded = false;

/**
 * Check if a user role has permission for a given action.
 * @param {string} role - The user role.
 * @param {string} action - The action ('view', 'query').
 * @returns {boolean} True if the role has permission.
 */
function hasPermission(role, action) {
  switch (action) {
    case 'view':
      return VIEW_ROLES.has(role);
    case 'query':
      return QUERY_ROLES.has(role);
    default:
      return false;
  }
}

/**
 * Generate a simulated processing time in milliseconds.
 * @returns {number} Processing time in milliseconds.
 */
function generateProcessingTime() {
  return Math.floor(Math.random() * 2000) + 500;
}

/**
 * Create a degraded response when AI is unavailable.
 * @param {string} query - The original query.
 * @param {string} type - The insight type.
 * @param {string} userId - The user ID.
 * @returns {object} A degraded AI response object.
 */
function createDegradedResponse(query, type, userId) {
  const now = new Date().toISOString();

  return {
    id: uuidv4(),
    type: 'degraded',
    query: query || '',
    result: {
      summary: 'AI analysis is currently unavailable. Please try again later.',
      cachedResult: null,
      error: 'AI service temporarily unavailable. The analysis engine is undergoing maintenance or experiencing high load.',
      retryAfter: 300,
      confidence: 0,
      data_sources: [],
      ai_available: false,
    },
    entityType: null,
    entityId: null,
    userId: userId || 'system',
    status: 'degraded',
    processingTimeMs: 0,
    tags: ['degraded', 'ai-unavailable'],
    version: 1,
    created_at: now,
    updated_at: now,
    created_by: userId || 'system',
    updated_by: 'system',
  };
}

/**
 * Create an error response for invalid queries or parameters.
 * @param {string} query - The original query.
 * @param {string} errorMessage - The error message.
 * @param {string} userId - The user ID.
 * @returns {object} An error AI response object.
 */
function createErrorResponse(query, errorMessage, userId) {
  const now = new Date().toISOString();

  return {
    id: uuidv4(),
    type: 'error',
    query: query || '',
    result: {
      summary: 'AI request could not be processed.',
      error: errorMessage || 'An unknown error occurred.',
      fallbackRecommendations: [
        'Continue monitoring current quality metrics trends.',
        'Focus on improving automation coverage which has the largest gap to target.',
        'Address at-risk governance procedures to improve overall compliance.',
      ],
      confidence: 0,
      data_sources: [],
      ai_available: _aiAvailable,
    },
    entityType: null,
    entityId: null,
    userId: userId || 'system',
    status: 'error',
    processingTimeMs: Math.floor(Math.random() * 200) + 50,
    tags: ['error'],
    version: 1,
    created_at: now,
    updated_at: now,
    created_by: userId || 'system',
    updated_by: 'system',
  };
}

/**
 * Create a degraded response with cached data when AI is in degraded mode.
 * @param {string} query - The original query.
 * @param {string} type - The insight type.
 * @param {string} userId - The user ID.
 * @returns {object} A degraded AI response with cached data.
 */
function createDegradedWithCacheResponse(query, type, userId) {
  const now = new Date().toISOString();

  const cachedInsights = getRecentInsights(5);
  let cachedResult = null;

  if (cachedInsights.length > 0) {
    const relevantInsight = cachedInsights.find(
      (insight) => insight.status === 'completed' && insight.result && insight.result.ai_available === true,
    );

    if (relevantInsight) {
      cachedResult = {
        summary: relevantInsight.result.summary || 'Cached result from previous analysis.',
        lastUpdated: relevantInsight.created_at,
        confidence: 0.70,
      };
    }
  }

  return {
    id: uuidv4(),
    type: 'degraded',
    query: query || '',
    result: {
      summary: 'AI analysis is operating in degraded mode. Showing cached results from the last successful analysis.',
      cachedResult,
      error: 'AI service is operating in degraded mode. Full analysis capabilities are temporarily limited.',
      retryAfter: 600,
      confidence: 0,
      data_sources: [],
      ai_available: false,
    },
    entityType: null,
    entityId: null,
    userId: userId || 'system',
    status: 'degraded',
    processingTimeMs: 0,
    tags: ['degraded', 'ai-degraded', 'cached'],
    version: 1,
    created_at: now,
    updated_at: now,
    created_by: userId || 'system',
    updated_by: 'system',
  };
}

// ---------------------------------------------------------------------------
// AI Availability Management
// ---------------------------------------------------------------------------

/**
 * Get the current AI availability status.
 * @returns {object} AI availability status object.
 */
export function getAIAvailabilityStatus() {
  return {
    available: _aiAvailable,
    degraded: _aiDegraded,
    status: _aiAvailable ? (_aiDegraded ? 'degraded' : 'available') : 'unavailable',
    message: _aiAvailable
      ? (_aiDegraded ? 'AI service is operating in degraded mode. Some features may be limited.' : 'AI service is fully operational.')
      : 'AI service is currently unavailable. Please try again later.',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Set the AI availability state (for simulation purposes).
 * @param {boolean} available - Whether AI is available.
 * @param {boolean} [degraded=false] - Whether AI is in degraded mode.
 * @returns {object} Updated AI availability status.
 */
export function setAIAvailability(available, degraded = false) {
  _aiAvailable = available !== false;
  _aiDegraded = degraded === true;
  return getAIAvailabilityStatus();
}

// ---------------------------------------------------------------------------
// Core AI Operations
// ---------------------------------------------------------------------------

/**
 * Perform a natural language search query.
 * Returns simulated AI search results with confidence scores and data sources.
 * Supports graceful degradation when AI is unavailable.
 *
 * @param {string} query - The natural language search query.
 * @param {string} [userId='user-001'] - The user ID performing the search.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} The search result object with matches, confidence, and data sources.
 */
export function search(query, userId = 'user-001', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'query')) {
    return createErrorResponse(query, 'You do not have permission to perform AI searches.', userId);
  }

  if (!query || typeof query !== 'string' || query.trim() === '') {
    return createErrorResponse(query, 'Search query is required. Please provide a valid search query.', userId);
  }

  if (!_aiAvailable) {
    logAction(userId, 'AI Search (Unavailable)', AI_INSIGHTS_ENTITY_TYPE, 'search', `AI search attempted but unavailable. Query: "${query}"`);
    return createDegradedResponse(query, 'natural_language_search', userId);
  }

  if (_aiDegraded) {
    logAction(userId, 'AI Search (Degraded)', AI_INSIGHTS_ENTITY_TYPE, 'search', `AI search in degraded mode. Query: "${query}"`);
    return createDegradedWithCacheResponse(query, 'natural_language_search', userId);
  }

  const result = simulateSearch(query, userId);

  const maskedResult = maskEntity(result, role);

  logAction(userId, 'AI Search', AI_INSIGHTS_ENTITY_TYPE, maskedResult.id || 'search', `AI search completed. Query: "${query}". Results: ${maskedResult.result && maskedResult.result.totalResults !== undefined ? maskedResult.result.totalResults : 'N/A'}`);

  return maskedResult;
}

/**
 * Predict risk for a given entity (e.g., release, application).
 * Returns simulated risk prediction with risk score, risk level, factors,
 * recommendations, confidence, and data sources.
 * Supports graceful degradation when AI is unavailable.
 *
 * @param {object} params - Risk prediction parameters.
 * @param {string} params.entityType - The entity type (e.g., 'releases', 'applications').
 * @param {string} params.entityId - The entity ID to predict risk for.
 * @param {string} [params.userId='user-001'] - The user ID performing the prediction.
 * @param {string} [params.role='viewer'] - The current user's role.
 * @returns {object} The risk prediction result with score, level, factors, and recommendations.
 */
export function predictRisk(params = {}) {
  const userId = params.userId || 'user-001';
  const role = params.role || ROLES.VIEWER;
  const entityType = params.entityType;
  const entityId = params.entityId;

  if (!hasPermission(role, 'query')) {
    return createErrorResponse(
      `Risk prediction for ${entityType}/${entityId}`,
      'You do not have permission to perform risk predictions.',
      userId,
    );
  }

  if (!entityType || typeof entityType !== 'string') {
    return createErrorResponse(
      'Risk prediction',
      'Entity type is required for risk prediction.',
      userId,
    );
  }

  if (!entityId || typeof entityId !== 'string') {
    return createErrorResponse(
      `Risk prediction for ${entityType}`,
      'Entity ID is required for risk prediction.',
      userId,
    );
  }

  if (!_aiAvailable) {
    logAction(userId, 'AI Risk Prediction (Unavailable)', AI_INSIGHTS_ENTITY_TYPE, entityId, `Risk prediction attempted but AI unavailable. Entity: ${entityType}/${entityId}`);
    return createDegradedResponse(`Risk prediction for ${entityType}/${entityId}`, 'risk_prediction', userId);
  }

  if (_aiDegraded) {
    logAction(userId, 'AI Risk Prediction (Degraded)', AI_INSIGHTS_ENTITY_TYPE, entityId, `Risk prediction in degraded mode. Entity: ${entityType}/${entityId}`);
    return createDegradedWithCacheResponse(`Risk prediction for ${entityType}/${entityId}`, 'risk_prediction', userId);
  }

  const result = simulateRiskPrediction(entityType, entityId, userId);

  const maskedResult = maskEntity(result, role);

  const riskLevel = maskedResult.result && maskedResult.result.risk_level ? maskedResult.result.risk_level : 'unknown';
  const riskScore = maskedResult.result && maskedResult.result.risk_score !== undefined ? maskedResult.result.risk_score : 'N/A';

  logAction(userId, 'AI Risk Prediction', AI_INSIGHTS_ENTITY_TYPE, maskedResult.id || entityId, `Risk prediction completed for ${entityType}/${entityId}. Risk level: ${riskLevel}, Score: ${riskScore}`);

  return maskedResult;
}

/**
 * Get AI-generated recommendations for a given context.
 * Returns simulated recommendations with priority, area, action, effort,
 * impact, timeline, confidence, and data sources.
 * Supports graceful degradation when AI is unavailable.
 *
 * @param {object} context - Recommendation context.
 * @param {string} [context.entityType] - The entity type to get recommendations for.
 * @param {string} [context.entityId] - The entity ID to get recommendations for.
 * @param {string} [context.query] - Optional query describing what recommendations are needed.
 * @param {string} [context.userId='user-001'] - The user ID requesting recommendations.
 * @param {string} [context.role='viewer'] - The current user's role.
 * @returns {object} The recommendations result with prioritized actions.
 */
export function getRecommendations(context = {}) {
  const userId = context.userId || 'user-001';
  const role = context.role || ROLES.VIEWER;
  const entityType = context.entityType || null;
  const entityId = context.entityId || null;
  const query = context.query || null;

  if (!hasPermission(role, 'query')) {
    return createErrorResponse(
      query || `Recommendations for ${entityType}/${entityId}`,
      'You do not have permission to request AI recommendations.',
      userId,
    );
  }

  if (!_aiAvailable) {
    logAction(userId, 'AI Recommendations (Unavailable)', AI_INSIGHTS_ENTITY_TYPE, entityId || 'recommendations', `Recommendations attempted but AI unavailable. Entity: ${entityType || 'N/A'}/${entityId || 'N/A'}`);
    return createDegradedResponse(query || `Recommendations for ${entityType}/${entityId}`, 'recommendation', userId);
  }

  if (_aiDegraded) {
    logAction(userId, 'AI Recommendations (Degraded)', AI_INSIGHTS_ENTITY_TYPE, entityId || 'recommendations', `Recommendations in degraded mode. Entity: ${entityType || 'N/A'}/${entityId || 'N/A'}`);
    return createDegradedWithCacheResponse(query || `Recommendations for ${entityType}/${entityId}`, 'recommendation', userId);
  }

  const result = simulateRecommendations(entityType, entityId, userId);

  const maskedResult = maskEntity(result, role);

  const recCount = maskedResult.result && Array.isArray(maskedResult.result.recommendations) ? maskedResult.result.recommendations.length : 0;

  logAction(userId, 'AI Recommendations', AI_INSIGHTS_ENTITY_TYPE, maskedResult.id || entityId || 'recommendations', `Recommendations generated. Entity: ${entityType || 'N/A'}/${entityId || 'N/A'}. Count: ${recCount}`);

  return maskedResult;
}

/**
 * Ask EQIP a natural language question.
 * Returns a simulated conversational AI response with answer, confidence,
 * related entities, and suggested follow-up questions.
 * Supports graceful degradation when AI is unavailable.
 *
 * @param {string} question - The natural language question.
 * @param {string} [userId='user-001'] - The user ID asking the question.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} The Ask EQIP response with answer and related context.
 */
export function askEqip(question, userId = 'user-001', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'query')) {
    return createErrorResponse(question, 'You do not have permission to use Ask EQIP.', userId);
  }

  if (!question || typeof question !== 'string' || question.trim() === '') {
    return createErrorResponse(question, 'A question is required. Please provide a valid question.', userId);
  }

  if (!_aiAvailable) {
    logAction(userId, 'Ask EQIP (Unavailable)', AI_INSIGHTS_ENTITY_TYPE, 'ask-eqip', `Ask EQIP attempted but AI unavailable. Question: "${question}"`);
    return createDegradedResponse(question, 'ask_eqip', userId);
  }

  if (_aiDegraded) {
    logAction(userId, 'Ask EQIP (Degraded)', AI_INSIGHTS_ENTITY_TYPE, 'ask-eqip', `Ask EQIP in degraded mode. Question: "${question}"`);
    return createDegradedWithCacheResponse(question, 'ask_eqip', userId);
  }

  const existingInsights = getAllAIInsights();
  const questionLower = question.trim().toLowerCase();

  const matchingInsight = existingInsights.find(
    (insight) =>
      insight.type === 'ask_eqip' &&
      insight.query &&
      insight.query.toLowerCase() === questionLower,
  );

  if (matchingInsight) {
    const maskedResult = maskEntity({ ...matchingInsight }, role);

    logAction(userId, 'Ask EQIP', AI_INSIGHTS_ENTITY_TYPE, maskedResult.id, `Ask EQIP answered (cached). Question: "${question}"`);

    return maskedResult;
  }

  const searchResult = simulateSearch(question, userId);

  const now = new Date().toISOString();
  const processingTime = generateProcessingTime();

  const askEqipResponse = {
    id: uuidv4(),
    type: 'ask_eqip',
    query: question.trim(),
    result: {
      answer: `Based on the available data, here is what I found regarding your question: "${question.trim()}"\n\nThe eQIP Quality Intelligence platform currently tracks quality metrics across 19 applications and 11 segments. The Enterprise Quality Score is 82.5 (Grade B), showing an improving trend of +2.3% over the last quarter.\n\nFor more specific information, please try refining your question or use the natural language search feature.`,
      confidence: Math.round((0.65 + Math.random() * 0.25) * 100) / 100,
      data_sources: ['metrics', 'applications', 'releases', 'quality-gates'],
      relatedEntities: [],
      suggestedFollowUps: [
        'What is the current Enterprise Quality Score?',
        'Which releases are at risk?',
        'Show me all failed test cases in the last 7 days',
        'What governance procedures need attention?',
      ],
      ai_available: true,
    },
    entityType: null,
    entityId: null,
    userId,
    status: 'completed',
    processingTimeMs: processingTime,
    tags: ['ask-eqip', 'simulated'],
    version: 1,
    created_at: now,
    updated_at: now,
    created_by: userId,
    updated_by: 'system',
  };

  if (searchResult && searchResult.result && Array.isArray(searchResult.result.matches) && searchResult.result.matches.length > 0) {
    askEqipResponse.result.relatedEntities = searchResult.result.matches.slice(0, 3).map((match) => ({
      entityType: match.entityType || 'unknown',
      entityId: match.entityId || 'unknown',
      label: match.title || match.entityId || 'Related entity',
    }));

    if (searchResult.result.confidence && searchResult.result.confidence > askEqipResponse.result.confidence) {
      askEqipResponse.result.confidence = searchResult.result.confidence;
    }
  }

  const maskedResult = maskEntity(askEqipResponse, role);

  logAction(userId, 'Ask EQIP', AI_INSIGHTS_ENTITY_TYPE, maskedResult.id, `Ask EQIP answered. Question: "${question}". Confidence: ${maskedResult.result.confidence}`);

  return maskedResult;
}

// ---------------------------------------------------------------------------
// AI Insights CRUD & Query Operations
// ---------------------------------------------------------------------------

/**
 * Get all AI insights with optional filtering, searching, sorting, and pagination.
 * Applies PII masking.
 *
 * @param {object} [options={}] - Query options.
 * @param {object} [options.filters] - Filter criteria (e.g., { type: 'risk_prediction', status: 'completed' }).
 * @param {string} [options.query] - Search query string.
 * @param {Array<string>} [options.searchFields] - Fields to search within.
 * @param {string} [options.sortKey] - Field to sort by.
 * @param {string} [options.sortDirection='asc'] - Sort direction.
 * @param {number} [options.page=1] - Page number.
 * @param {number} [options.pageSize=25] - Items per page.
 * @param {string} [options.role='viewer'] - The current user's role for RBAC and PII masking.
 * @param {string} [options.userId] - The user ID for audit logging.
 * @returns {object} Result object with items, pagination, and filteredTotal.
 */
export function getInsights(options = {}) {
  const role = options.role || ROLES.VIEWER;

  if (!hasPermission(role, 'view')) {
    return {
      items: [],
      page: 1,
      pageSize: options.pageSize || 25,
      totalItems: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
      filteredTotal: 0,
    };
  }

  let insights = getAll(AI_INSIGHTS_ENTITY_TYPE);

  if (insights.length === 0) {
    insights = getAllAIInsights();
  }

  const result = processData(insights, {
    filters: options.filters,
    query: options.query,
    searchFields: options.searchFields || ['type', 'query', 'status', 'entityType'],
    sortKey: options.sortKey,
    sortDirection: options.sortDirection,
    page: options.page,
    pageSize: options.pageSize,
  });

  result.items = result.items.map((insight) => maskEntity(insight, role));

  return result;
}

/**
 * Get all AI insights without pagination (simple list).
 * Applies PII masking.
 *
 * @param {object} [filters={}] - Filter criteria.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>} Array of masked AI insight objects.
 */
export function getInsightsList(filters = {}, role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return [];
  }

  let insights = getAll(AI_INSIGHTS_ENTITY_TYPE);

  if (insights.length === 0) {
    insights = getAllAIInsights();
  }

  if (filters && Object.keys(filters).length > 0) {
    insights = applyFilters(insights, filters);
  }

  return insights.map((insight) => maskEntity(insight, role));
}

/**
 * Get a single AI insight by ID.
 * Applies PII masking based on role.
 *
 * @param {string} id - The AI insight ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object|null} The masked AI insight object, or null if not found.
 */
export function getInsightDetail(id, role = ROLES.VIEWER) {
  if (!id || typeof id !== 'string') {
    return null;
  }

  if (!hasPermission(role, 'view')) {
    return null;
  }

  let insight = getById(AI_INSIGHTS_ENTITY_TYPE, id);

  if (!insight) {
    insight = getStaticAIInsightById(id);
  }

  if (!insight) {
    return null;
  }

  return maskEntity(insight, role);
}

/**
 * Get a single AI insight by ID (alias for getInsightDetail).
 *
 * @param {string} id - The AI insight ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object|null} The masked AI insight object, or null if not found.
 */
export function getInsightById(id, role = ROLES.VIEWER) {
  return getInsightDetail(id, role);
}

// ---------------------------------------------------------------------------
// AI Insights Grouped & Filtered Accessors
// ---------------------------------------------------------------------------

/**
 * Get AI insights grouped by type.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Object with type keys and arrays of masked AI insights.
 */
export function getInsightsByType(role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return {};
  }

  let insights = getAll(AI_INSIGHTS_ENTITY_TYPE);

  if (insights.length === 0) {
    insights = getAllAIInsights();
  }

  const grouped = {};

  for (let i = 0; i < insights.length; i++) {
    const insight = insights[i];
    const type = insight.type || 'unknown';

    if (!grouped[type]) {
      grouped[type] = [];
    }

    grouped[type].push(maskEntity(insight, role));
  }

  return grouped;
}

/**
 * Get AI insights grouped by status.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Object with status keys and arrays of masked AI insights.
 */
export function getInsightsByStatus(role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return {};
  }

  let insights = getAll(AI_INSIGHTS_ENTITY_TYPE);

  if (insights.length === 0) {
    insights = getAllAIInsights();
  }

  const grouped = {};

  for (let i = 0; i < insights.length; i++) {
    const insight = insights[i];
    const status = insight.status || 'unknown';

    if (!grouped[status]) {
      grouped[status] = [];
    }

    grouped[status].push(maskEntity(insight, role));
  }

  return grouped;
}

/**
 * Get AI insights grouped by entity type.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Object with entity type keys and arrays of masked AI insights.
 */
export function getInsightsByEntityType(role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return {};
  }

  let insights = getAll(AI_INSIGHTS_ENTITY_TYPE);

  if (insights.length === 0) {
    insights = getAllAIInsights();
  }

  const grouped = {};

  for (let i = 0; i < insights.length; i++) {
    const insight = insights[i];
    const entityType = insight.entityType || 'unknown';

    if (!grouped[entityType]) {
      grouped[entityType] = [];
    }

    grouped[entityType].push(maskEntity(insight, role));
  }

  return grouped;
}

/**
 * Get AI insights for a specific entity.
 *
 * @param {string} entityType - The entity type to filter by.
 * @param {string} [entityId] - The entity ID to filter by.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>} Array of masked AI insights for the specified entity.
 */
export function getInsightsForEntity(entityType, entityId, role = ROLES.VIEWER) {
  if (!entityType || typeof entityType !== 'string') {
    return [];
  }

  if (!hasPermission(role, 'view')) {
    return [];
  }

  const insights = getAIInsightsByEntity(entityType, entityId || null);

  return insights.map((insight) => maskEntity(insight, role));
}

/**
 * Get AI insights for a specific user.
 *
 * @param {string} userId - The user ID to filter by.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>} Array of masked AI insights for the specified user.
 */
export function getInsightsForUser(userId, role = ROLES.VIEWER) {
  if (!userId || typeof userId !== 'string') {
    return [];
  }

  if (!hasPermission(role, 'view')) {
    return [];
  }

  const insights = getAIInsightsByUser(userId);

  return insights.map((insight) => maskEntity(insight, role));
}

/**
 * Get all risk predictions.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>} Array of masked risk prediction AI insights.
 */
export function getRiskPredictionInsights(role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return [];
  }

  const predictions = getRiskPredictions();

  return predictions.map((insight) => maskEntity(insight, role));
}

/**
 * Get all recommendation insights.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>} Array of masked recommendation AI insights.
 */
export function getRecommendationInsights(role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return [];
  }

  const recommendations = getStaticRecommendations();

  return recommendations.map((insight) => maskEntity(insight, role));
}

/**
 * Get all natural language search result insights.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>} Array of masked search result AI insights.
 */
export function getSearchResultInsights(role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return [];
  }

  const searchResults = getNaturalLanguageSearchResults();

  return searchResults.map((insight) => maskEntity(insight, role));
}

/**
 * Get all Ask EQIP response insights.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>} Array of masked Ask EQIP AI insights.
 */
export function getAskEqipInsights(role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return [];
  }

  const responses = getAskEqipResponses();

  return responses.map((insight) => maskEntity(insight, role));
}

/**
 * Get all degraded or error AI insights.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>} Array of masked degraded/error AI insights.
 */
export function getDegradedOrErrorInsights(role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return [];
  }

  const degraded = getDegradedInsights();

  return degraded.map((insight) => maskEntity(insight, role));
}

/**
 * Get highest risk predictions sorted by risk score descending.
 *
 * @param {number} [limit] - Maximum number of predictions to return.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>} Array of masked risk prediction insights sorted by risk score.
 */
export function getHighestRiskPredictionInsights(limit, role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return [];
  }

  const predictions = getHighestRiskPredictions(limit);

  return predictions.map((insight) => maskEntity(insight, role));
}

/**
 * Get recent AI insights sorted by creation date descending.
 *
 * @param {number} [limit=10] - Maximum number of insights to return.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>} Array of masked recent AI insights.
 */
export function getRecentAIInsights(limit = 10, role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return [];
  }

  const recent = getRecentInsights(limit);

  return recent.map((insight) => maskEntity(insight, role));
}

// ---------------------------------------------------------------------------
// AI Insights Count & Summary
// ---------------------------------------------------------------------------

/**
 * Get AI insight count grouped by type.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Object with type keys and count values.
 */
export function getInsightCountByType(role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return {};
  }

  return getAIInsightCountByType();
}

/**
 * Get AI insight count grouped by status.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Object with status keys and count values.
 */
export function getInsightCountByStatus(role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return {};
  }

  return getAIInsightCountByStatus();
}

/**
 * Get the average confidence score across all completed AI insights.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {number} The average confidence score, or 0 if no completed insights exist.
 */
export function getAvgConfidenceScore(role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return 0;
  }

  return getAverageConfidenceScore();
}

/**
 * Get the average processing time across all completed AI insights.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {number} The average processing time in milliseconds, or 0 if no completed insights exist.
 */
export function getAvgProcessingTime(role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return 0;
  }

  return getAverageProcessingTime();
}

/**
 * Get a comprehensive summary of AI insights metrics.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Summary object with AI insights metrics.
 */
export function getAIInsightsSummaryData(role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return {
      total: 0,
      completed: 0,
      degraded: 0,
      error: 0,
      riskPredictions: 0,
      recommendations: 0,
      searches: 0,
      askEqip: 0,
      averageConfidence: 0,
      averageProcessingTimeMs: 0,
      aiAvailable: 0,
      aiUnavailable: 0,
      availabilityRate: 0,
    };
  }

  const summary = getAIInsightsSummary();

  return {
    ...summary,
    aiServiceStatus: getAIAvailabilityStatus(),
  };
}

// ---------------------------------------------------------------------------
// Search AI Insights
// ---------------------------------------------------------------------------

/**
 * Search AI insights by query text (case-insensitive partial match).
 *
 * @param {string} query - The search query.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>} Array of matching masked AI insight objects.
 */
export function searchAIInsights(query, role = ROLES.VIEWER) {
  if (!query || typeof query !== 'string') {
    return [];
  }

  if (!hasPermission(role, 'view')) {
    return [];
  }

  const results = searchInsightsByQuery(query);

  return results.map((insight) => maskEntity(insight, role));
}

/**
 * Get distinct values for a specific field across all AI insights.
 *
 * @param {string} field - The field name to extract distinct values from.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<*>} Array of distinct values, sorted.
 */
export function getDistinctValues(field, role = ROLES.VIEWER) {
  if (!field || typeof field !== 'string') {
    return [];
  }

  if (!hasPermission(role, 'view')) {
    return [];
  }

  let insights = getAll(AI_INSIGHTS_ENTITY_TYPE);

  if (insights.length === 0) {
    insights = getAllAIInsights();
  }

  const values = new Set();

  for (let i = 0; i < insights.length; i++) {
    const value = insights[i][field];
    if (value !== null && value !== undefined) {
      values.add(value);
    }
  }

  return [...values].sort();
}

// ---------------------------------------------------------------------------
// Simulated API Layer
// ---------------------------------------------------------------------------

/**
 * Simulate an API GET request for AI insights.
 *
 * @param {object} [params={}] - Query parameters.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiGetInsights(params = {}, role = ROLES.VIEWER) {
  try {
    const result = getInsights({ ...params, role });

    return {
      status: 200,
      data: result.items,
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        totalItems: result.totalItems,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPreviousPage: result.hasPreviousPage,
      },
    };
  } catch (err) {
    console.error('[AIService] apiGetInsights error:', err);
    return {
      status: 500,
      error: 'Internal server error',
      data: [],
      pagination: {
        page: 1,
        pageSize: 25,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }
}

/**
 * Simulate an API GET request for a single AI insight.
 *
 * @param {string} id - The AI insight ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiGetInsight(id, role = ROLES.VIEWER) {
  try {
    const insight = getInsightDetail(id, role);

    if (!insight) {
      return {
        status: 404,
        error: `AI insight with id '${id}' not found`,
        data: null,
      };
    }

    return {
      status: 200,
      data: insight,
    };
  } catch (err) {
    console.error(`[AIService] apiGetInsight error for ${id}:`, err);
    return {
      status: 500,
      error: 'Internal server error',
      data: null,
    };
  }
}

/**
 * Simulate an API POST request for AI search.
 *
 * @param {string} query - The search query.
 * @param {string} [userId='user-001'] - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiSearch(query, userId = 'user-001', role = ROLES.VIEWER) {
  try {
    if (!hasPermission(role, 'query')) {
      return {
        status: 403,
        error: 'You do not have permission to perform AI searches.',
        data: null,
      };
    }

    const result = search(query, userId, role);

    if (result.status === 'error') {
      return {
        status: 400,
        error: result.result ? result.result.error : 'Search failed.',
        data: result,
      };
    }

    if (result.status === 'degraded') {
      return {
        status: 503,
        error: 'AI service unavailable',
        data: result,
      };
    }

    return {
      status: 200,
      data: result,
    };
  } catch (err) {
    console.error('[AIService] apiSearch error:', err);
    return {
      status: 500,
      error: 'Internal server error',
      data: null,
    };
  }
}

/**
 * Simulate an API POST request for risk prediction.
 *
 * @param {object} params - Risk prediction parameters.
 * @param {string} params.entityType - The entity type.
 * @param {string} params.entityId - The entity ID.
 * @param {string} [params.userId='user-001'] - The user ID.
 * @param {string} [params.role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiPredictRisk(params = {}) {
  try {
    const role = params.role || ROLES.VIEWER;

    if (!hasPermission(role, 'query')) {
      return {
        status: 403,
        error: 'You do not have permission to perform risk predictions.',
        data: null,
      };
    }

    const result = predictRisk(params);

    if (result.status === 'error') {
      return {
        status: 400,
        error: result.result ? result.result.error : 'Risk prediction failed.',
        data: result,
      };
    }

    if (result.status === 'degraded') {
      return {
        status: 503,
        error: 'AI service unavailable',
        data: result,
      };
    }

    return {
      status: 200,
      data: result,
    };
  } catch (err) {
    console.error('[AIService] apiPredictRisk error:', err);
    return {
      status: 500,
      error: 'Internal server error',
      data: null,
    };
  }
}

/**
 * Simulate an API POST request for recommendations.
 *
 * @param {object} context - Recommendation context.
 * @param {string} [context.entityType] - The entity type.
 * @param {string} [context.entityId] - The entity ID.
 * @param {string} [context.query] - Optional query.
 * @param {string} [context.userId='user-001'] - The user ID.
 * @param {string} [context.role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiGetRecommendations(context = {}) {
  try {
    const role = context.role || ROLES.VIEWER;

    if (!hasPermission(role, 'query')) {
      return {
        status: 403,
        error: 'You do not have permission to request AI recommendations.',
        data: null,
      };
    }

    const result = getRecommendations(context);

    if (result.status === 'error') {
      return {
        status: 400,
        error: result.result ? result.result.error : 'Recommendations failed.',
        data: result,
      };
    }

    if (result.status === 'degraded') {
      return {
        status: 503,
        error: 'AI service unavailable',
        data: result,
      };
    }

    return {
      status: 200,
      data: result,
    };
  } catch (err) {
    console.error('[AIService] apiGetRecommendations error:', err);
    return {
      status: 500,
      error: 'Internal server error',
      data: null,
    };
  }
}

/**
 * Simulate an API POST request for Ask EQIP.
 *
 * @param {string} question - The natural language question.
 * @param {string} [userId='user-001'] - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiAskEqip(question, userId = 'user-001', role = ROLES.VIEWER) {
  try {
    if (!hasPermission(role, 'query')) {
      return {
        status: 403,
        error: 'You do not have permission to use Ask EQIP.',
        data: null,
      };
    }

    const result = askEqip(question, userId, role);

    if (result.status === 'error') {
      return {
        status: 400,
        error: result.result ? result.result.error : 'Ask EQIP failed.',
        data: result,
      };
    }

    if (result.status === 'degraded') {
      return {
        status: 503,
        error: 'AI service unavailable',
        data: result,
      };
    }

    return {
      status: 200,
      data: result,
    };
  } catch (err) {
    console.error('[AIService] apiAskEqip error:', err);
    return {
      status: 500,
      error: 'Internal server error',
      data: null,
    };
  }
}

/**
 * Simulate an API GET request for AI availability status.
 *
 * @returns {object} Simulated API response.
 */
export function apiGetAIStatus() {
  return {
    status: 200,
    data: getAIAvailabilityStatus(),
  };
}

/**
 * Simulate an API POST request to set AI availability (admin only).
 *
 * @param {boolean} available - Whether AI should be available.
 * @param {boolean} [degraded=false] - Whether AI should be in degraded mode.
 * @param {string} [userId='system'] - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiSetAIAvailability(available, degraded = false, userId = 'system', role = ROLES.VIEWER) {
  if (role !== ROLES.ADMIN) {
    return {
      status: 403,
      error: 'Only administrators can change AI availability settings.',
      data: null,
    };
  }

  const status = setAIAvailability(available, degraded);

  logAction(userId, 'Set AI Availability', AI_INSIGHTS_ENTITY_TYPE, 'ai-status', `AI availability set to: ${status.status}`);

  return {
    status: 200,
    data: status,
  };
}

/**
 * Simulate an API GET request for AI insights summary.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiGetAIInsightsSummary(role = ROLES.VIEWER) {
  try {
    const summary = getAIInsightsSummaryData(role);

    return {
      status: 200,
      data: summary,
    };
  } catch (err) {
    console.error('[AIService] apiGetAIInsightsSummary error:', err);
    return {
      status: 500,
      error: 'Internal server error',
      data: null,
    };
  }
}