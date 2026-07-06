import { v4 as uuidv4 } from 'uuid';

/**
 * @module aiInsights
 * Mock AI insights data seed for eQIP Quality Intelligence.
 * Simulated AI recommendations, risk predictions, natural language search results,
 * and Ask EQIP responses with confidence scores, data sources, and graceful
 * degradation states.
 */

/**
 * Helper to generate a relative ISO date string.
 * @param {number} days - Number of days in the past (positive) or future (negative).
 * @returns {string} ISO8601 date string.
 */
function daysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

/**
 * Helper to generate a relative ISO date string with hour offset.
 * @param {number} days - Number of days in the past.
 * @param {number} hours - Additional hours offset.
 * @returns {string} ISO8601 date string.
 */
function daysAndHoursAgo(days, hours) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}

/**
 * Mock AI insights data array.
 * Each insight includes id, type, query, result, confidence, dataSources,
 * aiAvailable, entityType, entityId, userId, tags, version, and audit fields.
 * @type {Array<object>}
 */
const aiInsights = [
  {
    id: 'ai-001',
    type: 'risk_prediction',
    query: 'What is the risk level for Release 2024.06?',
    result: {
      risk_score: 0.12,
      risk_level: 'low',
      summary: 'Release 2024.06 for EQIP Core is low risk. All quality gates have passed, test pass rate is 97.78%, and zero critical defects remain open. Automation coverage at 84.44% exceeds the 80% target threshold.',
      factors: [
        { factor: 'Quality Gate Compliance', score: 0.98, impact: 'positive', detail: '15 of 16 gates passed; 1 in review (release readiness).' },
        { factor: 'Test Pass Rate', score: 0.978, impact: 'positive', detail: '440 of 450 test cases passed.' },
        { factor: 'Critical Defects', score: 1.0, impact: 'positive', detail: 'Zero critical defects open.' },
        { factor: 'Automation Coverage', score: 0.844, impact: 'positive', detail: '380 of 450 test cases automated.' },
        { factor: 'Code Coverage', score: 0.88, impact: 'positive', detail: 'Overall code coverage at 88%.' },
      ],
      recommendations: [
        'Proceed with production deployment as planned.',
        'Monitor post-deployment verification tests closely.',
      ],
      confidence: 0.95,
      data_sources: ['releases', 'quality-gates', 'test-executions', 'defects'],
      ai_available: true,
    },
    entityType: 'releases',
    entityId: 'rel-001',
    userId: 'user-001',
    status: 'completed',
    processingTimeMs: 1250,
    tags: ['risk-prediction', 'release', 'eqip-core'],
    version: 1,
    created_at: daysAndHoursAgo(0, 6),
    updated_at: daysAndHoursAgo(0, 6),
    created_by: 'user-001',
    updated_by: 'system',
  },
  {
    id: 'ai-002',
    type: 'risk_prediction',
    query: 'Predict risk for Release 2024.07 Payment Gateway',
    result: {
      risk_score: 0.68,
      risk_level: 'high',
      summary: 'Release 2024.07 for Payment Gateway is high risk. Unit test coverage gate has failed (75% vs 80% threshold), two critical defects remain open in the payment reconciliation module, and integration tests are failing intermittently. A waiver request for unit test coverage is pending approval.',
      factors: [
        { factor: 'Quality Gate Compliance', score: 0.44, impact: 'negative', detail: '7 of 16 gates passed; unit test coverage failed.' },
        { factor: 'Critical Defects', score: 0.0, impact: 'critical', detail: '2 critical defects open in payment reconciliation.' },
        { factor: 'Test Pass Rate', score: 0.75, impact: 'negative', detail: '240 of 320 test cases passed.' },
        { factor: 'Pipeline Status', score: 0.3, impact: 'negative', detail: 'Integration tests failing; deployment blocked.' },
        { factor: 'Waiver Pending', score: 0.5, impact: 'warning', detail: 'Unit test coverage waiver pending approval.' },
      ],
      recommendations: [
        'Resolve 2 critical defects in payment reconciliation module before proceeding.',
        'Address intermittent integration test failures.',
        'Improve unit test coverage for payment validation module to meet 80% threshold.',
        'Consider splitting release scope to reduce risk.',
        'Expedite waiver review for unit test coverage gate.',
      ],
      confidence: 0.91,
      data_sources: ['releases', 'quality-gates', 'test-executions', 'defects', 'demands'],
      ai_available: true,
    },
    entityType: 'releases',
    entityId: 'rel-002',
    userId: 'user-013',
    status: 'completed',
    processingTimeMs: 1480,
    tags: ['risk-prediction', 'release', 'payment-gateway', 'high-risk'],
    version: 1,
    created_at: daysAndHoursAgo(0, 3),
    updated_at: daysAndHoursAgo(0, 3),
    created_by: 'user-013',
    updated_by: 'system',
  },
  {
    id: 'ai-003',
    type: 'risk_prediction',
    query: 'What is the risk assessment for Provider Directory Release 2024.09?',
    result: {
      risk_score: 0.85,
      risk_level: 'critical',
      summary: 'Release 2024.09 for Provider Directory is at critical risk. Multiple quality gates have failed including code review, static analysis, unit test coverage, functional test, and security scan. Three critical defects and seven high severity defects remain open. Two production defects have been reported. Automation coverage is significantly below target at 45%.',
      factors: [
        { factor: 'Quality Gate Compliance', score: 0.25, impact: 'critical', detail: '5 of 16 gates failed; security scan failed.' },
        { factor: 'Critical Defects', score: 0.0, impact: 'critical', detail: '3 critical defects open; 7 high severity defects open.' },
        { factor: 'Production Defects', score: 0.0, impact: 'critical', detail: '2 defects escaped to production.' },
        { factor: 'Automation Coverage', score: 0.45, impact: 'negative', detail: 'Only 45% automation coverage vs 70% target.' },
        { factor: 'Test Pass Rate', score: 0.646, impact: 'negative', detail: '168 of 260 test cases passed.' },
        { factor: 'Data Sync Reliability', score: 0.2, impact: 'critical', detail: 'Provider data sync job timing out consistently.' },
      ],
      recommendations: [
        'Delay release until all critical and high severity defects are resolved.',
        'Address security vulnerabilities immediately — waiver was rejected.',
        'Implement batch synchronization to fix provider data sync timeout.',
        'Increase automation coverage to at least 60% before next release attempt.',
        'Complete code review for all pending changes.',
        'Re-run static analysis after code fixes.',
        'Consider splitting release scope to reduce risk.',
      ],
      confidence: 0.94,
      data_sources: ['releases', 'quality-gates', 'test-executions', 'defects', 'environments', 'demands'],
      ai_available: true,
    },
    entityType: 'releases',
    entityId: 'rel-004',
    userId: 'user-011',
    status: 'completed',
    processingTimeMs: 1820,
    tags: ['risk-prediction', 'release', 'provider-directory', 'critical-risk'],
    version: 1,
    created_at: daysAgo(1),
    updated_at: daysAgo(1),
    created_by: 'user-011',
    updated_by: 'system',
  },
  {
    id: 'ai-004',
    type: 'recommendation',
    query: 'How can we improve quality for the Provider Directory application?',
    result: {
      summary: 'Provider Directory has the lowest quality score (65) across all applications. Key improvement areas include automation coverage, defect density, governance compliance, and environment stability.',
      recommendations: [
        {
          priority: 'critical',
          area: 'Automation Coverage',
          current: '45%',
          target: '70%',
          action: 'Create automated test suite for core provider search and directory display features. Prioritize regression pack automation.',
          effort: 'high',
          impact: 'high',
          timeline: '4-6 weeks',
        },
        {
          priority: 'critical',
          area: 'Security Compliance',
          current: 'non_compliant',
          target: 'compliant',
          action: 'Apply TLS 1.3 configuration to all environments. Address outstanding security scan findings.',
          effort: 'medium',
          impact: 'high',
          timeline: '1-2 weeks',
        },
        {
          priority: 'high',
          area: 'Data Sync Reliability',
          current: 'Timeout at 1000+ records',
          target: 'Full sync within 15 minutes',
          action: 'Implement paginated batch synchronization with 100 records per batch and retry logic with exponential backoff.',
          effort: 'medium',
          impact: 'high',
          timeline: '2-3 weeks',
        },
        {
          priority: 'high',
          area: 'Defect Density',
          current: '0.95 defects/KLOC',
          target: '< 0.5 defects/KLOC',
          action: 'Implement code review standards, increase static analysis coverage, and add pre-commit hooks for quality checks.',
          effort: 'medium',
          impact: 'medium',
          timeline: '3-4 weeks',
        },
        {
          priority: 'medium',
          area: 'Environment Stability',
          current: 'UAT degraded',
          target: 'All environments healthy',
          action: 'Upgrade UAT environment to match production version. Refresh test data. Fix Elasticsearch index rebuild issues.',
          effort: 'medium',
          impact: 'medium',
          timeline: '1-2 weeks',
        },
      ],
      confidence: 0.89,
      data_sources: ['applications', 'test-cases', 'test-executions', 'defects', 'environments', 'governance-procedures'],
      ai_available: true,
    },
    entityType: 'applications',
    entityId: 'app-008',
    userId: 'user-011',
    status: 'completed',
    processingTimeMs: 2100,
    tags: ['recommendation', 'application', 'provider-directory', 'improvement'],
    version: 1,
    created_at: daysAgo(2),
    updated_at: daysAgo(2),
    created_by: 'user-011',
    updated_by: 'system',
  },
  {
    id: 'ai-005',
    type: 'recommendation',
    query: 'What are the top quality improvement opportunities across the enterprise?',
    result: {
      summary: 'Enterprise-wide quality analysis identifies 5 key improvement opportunities that would have the highest impact on the overall Enterprise Quality Score (currently 82.5, Grade B).',
      recommendations: [
        {
          priority: 'critical',
          area: 'Test Automation Standards',
          current: 'Compliance at 75% (at risk)',
          target: '90% compliance',
          action: 'Address Document Management zero automation gap, stabilize Credentialing System flaky tests (30% rate), and increase Billing Portal automation coverage from 55% to 70%.',
          effort: 'high',
          impact: 'high',
          timeline: '6-8 weeks',
        },
        {
          priority: 'high',
          area: 'Data Privacy Compliance',
          current: 'At risk (91%)',
          target: '98% compliance',
          action: 'Mask unmasked SSN in Claims Processing staging database. Remove unmasked provider NPI numbers from exports. Enforce data retention policy for Billing Portal transaction logs.',
          effort: 'medium',
          impact: 'high',
          timeline: '3-4 weeks',
        },
        {
          priority: 'high',
          area: 'Environment Parity',
          current: '78% compliance (at risk)',
          target: '95% compliance',
          action: 'Upgrade Policy Admin System UAT environment (2 versions behind). Fix Provider Directory UAT degraded status. Refresh stale test data across 3 environments.',
          effort: 'medium',
          impact: 'medium',
          timeline: '2-3 weeks',
        },
        {
          priority: 'medium',
          area: 'Accessibility Compliance',
          current: '82% compliance (at risk)',
          target: '95% compliance',
          action: 'Fix Billing Portal payment form ARIA labels. Address Provider Directory heading hierarchy. Add alternative text guidance to Insurance Claims Portal photo upload.',
          effort: 'low',
          impact: 'medium',
          timeline: '2-3 weeks',
        },
        {
          priority: 'medium',
          area: 'Vendor Risk Management',
          current: '86% compliance',
          target: '95% compliance',
          action: 'Follow up on payment processor SOC 2 Type II audit renewal. Monitor credit data provider SLA compliance.',
          effort: 'low',
          impact: 'low',
          timeline: '4-6 weeks',
        },
      ],
      confidence: 0.92,
      data_sources: ['applications', 'governance-procedures', 'environments', 'test-cases', 'integrations'],
      ai_available: true,
    },
    entityType: 'metrics',
    entityId: 'metric-enterprise_quality_score',
    userId: 'user-001',
    status: 'completed',
    processingTimeMs: 2450,
    tags: ['recommendation', 'enterprise', 'quality-improvement', 'strategic'],
    version: 1,
    created_at: daysAgo(1),
    updated_at: daysAgo(1),
    created_by: 'user-001',
    updated_by: 'system',
  },
  {
    id: 'ai-006',
    type: 'natural_language_search',
    query: 'Show me all failed test cases in the last 7 days',
    result: {
      summary: 'Found 5 failed test case executions in the last 7 days across 3 applications.',
      matches: [
        {
          entityType: 'test-executions',
          entityId: 'exec-019',
          title: 'Payment reconciliation report accuracy - Failed',
          application: 'Payment Gateway',
          segment: 'Billing',
          failureReason: '3 transactions could not be matched due to T+1 settlement date timing difference.',
          executedAt: daysAgo(1),
          relevanceScore: 0.98,
        },
        {
          entityType: 'test-executions',
          entityId: 'exec-034',
          title: 'Provider network tier display accuracy - Failed',
          application: 'Provider Directory',
          segment: 'Provider',
          failureReason: 'Tier 2 badge not displaying correctly due to CSS specificity conflict.',
          executedAt: daysAgo(1),
          relevanceScore: 0.96,
        },
        {
          entityType: 'test-executions',
          entityId: 'exec-036',
          title: 'Provider data synchronization from credentialing system - Failed',
          application: 'Provider Directory',
          segment: 'Provider',
          failureReason: 'Sync job timed out after processing 450 of 1200 provider records.',
          executedAt: daysAgo(1),
          relevanceScore: 0.95,
        },
        {
          entityType: 'test-executions',
          entityId: 'exec-041',
          title: 'Drug interaction alert triggers correctly - Failed',
          application: 'Rx Platform',
          segment: 'Pharmacy',
          failureReason: 'False positive drug interaction alert for Acetaminophen due to formulary data import column misalignment.',
          executedAt: daysAgo(2),
          relevanceScore: 0.93,
        },
        {
          entityType: 'test-executions',
          entityId: 'exec-055',
          title: 'XSS prevention in user-generated content - Failed',
          application: 'EQIP Core',
          segment: 'Enterprise',
          failureReason: 'Stored XSS vulnerability found in release notes field.',
          executedAt: daysAgo(3),
          relevanceScore: 0.90,
        },
      ],
      totalResults: 5,
      confidence: 0.97,
      data_sources: ['test-executions', 'test-cases'],
      ai_available: true,
    },
    entityType: 'test-executions',
    entityId: null,
    userId: 'user-003',
    status: 'completed',
    processingTimeMs: 850,
    tags: ['search', 'test-failures', 'recent'],
    version: 1,
    created_at: daysAndHoursAgo(0, 2),
    updated_at: daysAndHoursAgo(0, 2),
    created_by: 'user-003',
    updated_by: 'system',
  },
  {
    id: 'ai-007',
    type: 'natural_language_search',
    query: 'Which releases are at risk?',
    result: {
      summary: 'Found 2 releases currently flagged as at risk or with significant quality concerns.',
      matches: [
        {
          entityType: 'releases',
          entityId: 'rel-004',
          title: 'Release 2024.09 - Provider Directory',
          application: 'Provider Directory',
          segment: 'Provider',
          status: 'At Risk',
          readinessScore: 65,
          keyIssues: ['5 quality gates failed', '3 critical defects open', '2 production defects', 'Security scan failed'],
          relevanceScore: 0.99,
        },
        {
          entityType: 'releases',
          entityId: 'rel-002',
          title: 'Release 2024.07 - Payment Gateway',
          application: 'Payment Gateway',
          segment: 'Billing',
          status: 'In Progress',
          readinessScore: 78,
          keyIssues: ['Unit test coverage gate failed', '2 critical defects open', 'Integration tests failing', 'Waiver pending'],
          relevanceScore: 0.92,
        },
      ],
      totalResults: 2,
      confidence: 0.96,
      data_sources: ['releases', 'quality-gates', 'defects'],
      ai_available: true,
    },
    entityType: 'releases',
    entityId: null,
    userId: 'user-001',
    status: 'completed',
    processingTimeMs: 720,
    tags: ['search', 'releases', 'at-risk'],
    version: 1,
    created_at: daysAndHoursAgo(0, 4),
    updated_at: daysAndHoursAgo(0, 4),
    created_by: 'user-001',
    updated_by: 'system',
  },
  {
    id: 'ai-008',
    type: 'natural_language_search',
    query: 'Find all critical security vulnerabilities',
    result: {
      summary: 'Found 3 critical or high severity security-related items requiring attention.',
      matches: [
        {
          entityType: 'test-executions',
          entityId: 'exec-055',
          title: 'Stored XSS vulnerability in EQIP Core release notes field',
          application: 'EQIP Core',
          segment: 'Enterprise',
          severity: 'critical',
          status: 'in_progress',
          detail: 'DOMPurify sanitization being applied. CSP header added. Regression tests in progress.',
          relevanceScore: 0.99,
        },
        {
          entityType: 'demands',
          entityId: 'dem-005',
          title: 'TLS 1.3 Configuration for Provider Directory',
          application: 'Provider Directory',
          segment: 'Provider',
          severity: 'critical',
          status: 'in_progress',
          detail: 'TLS 1.3 applied to staging. Production deployment pending CAB approval.',
          relevanceScore: 0.95,
        },
        {
          entityType: 'demands',
          entityId: 'dem-028',
          title: 'Missing Content-Security-Policy header on Billing Portal',
          application: 'Billing Portal',
          segment: 'Billing',
          severity: 'medium',
          status: 'active',
          detail: 'CSP header configuration in progress. Testing for compatibility with existing scripts.',
          relevanceScore: 0.88,
        },
      ],
      totalResults: 3,
      confidence: 0.94,
      data_sources: ['test-executions', 'demands', 'governance-procedures'],
      ai_available: true,
    },
    entityType: 'demands',
    entityId: null,
    userId: 'user-010',
    status: 'completed',
    processingTimeMs: 980,
    tags: ['search', 'security', 'vulnerabilities', 'critical'],
    version: 1,
    created_at: daysAgo(1),
    updated_at: daysAgo(1),
    created_by: 'user-010',
    updated_by: 'system',
  },
  {
    id: 'ai-009',
    type: 'ask_eqip',
    query: 'What is the current Enterprise Quality Score and what does it mean?',
    result: {
      answer: 'The current Enterprise Quality Score is 82.5, which corresponds to a Grade B rating. This score is calculated as a weighted average of 10 quality metrics across all applications and segments.\n\nKey contributing factors:\n• Test Case Pass Rate: 97.78% (strong)\n• Defect Removal Efficiency: 100% (excellent - no defects escaped to production in recent releases)\n• Automation Coverage: 63.2% (needs improvement - below 80% target)\n• Quality Gate Compliance: 81.25% (acceptable but room for improvement)\n\nThe score has improved by 2.3 points over the last quarter, primarily driven by improvements in test pass rate and defect removal efficiency. The main area holding back the score is automation coverage, which is below the 80% target across several applications.',
      confidence: 0.93,
      data_sources: ['metrics', 'applications', 'test-cases', 'quality-gates'],
      relatedEntities: [
        { entityType: 'metrics', entityId: 'metric-enterprise_quality_score', label: 'Enterprise Quality Score' },
        { entityType: 'metrics', entityId: 'metric-test_case_pass_rate', label: 'Test Case Pass Rate' },
        { entityType: 'metrics', entityId: 'metric-automation_coverage', label: 'Automation Coverage' },
      ],
      suggestedFollowUps: [
        'How can we improve automation coverage?',
        'Which applications have the lowest quality scores?',
        'Show me the quality score trend over the last 12 months.',
      ],
      ai_available: true,
    },
    entityType: 'metrics',
    entityId: 'metric-enterprise_quality_score',
    userId: 'user-001',
    status: 'completed',
    processingTimeMs: 1100,
    tags: ['ask-eqip', 'quality-score', 'enterprise'],
    version: 1,
    created_at: daysAndHoursAgo(0, 5),
    updated_at: daysAndHoursAgo(0, 5),
    created_by: 'user-001',
    updated_by: 'system',
  },
  {
    id: 'ai-010',
    type: 'ask_eqip',
    query: 'Why is the Provider Directory quality score so low?',
    result: {
      answer: 'The Provider Directory has the lowest quality score of 65 across all 19 applications. This is classified as "high risk." Here are the primary contributing factors:\n\n1. **Low Automation Coverage (45%)**: Significantly below the 70% target. Only 117 of 260 test cases are automated, resulting in heavy reliance on manual testing.\n\n2. **High Defect Density (0.95 defects/KLOC)**: Nearly double the enterprise average of 0.59. This indicates code quality issues that need to be addressed through better code review and static analysis practices.\n\n3. **Data Sync Reliability Issues**: The provider data synchronization job consistently times out when processing 1000+ records, causing test failures and blocking regression testing.\n\n4. **Security Compliance Gaps**: The security compliance check (gov-002) flagged the Provider Directory as non-compliant due to outdated TLS configuration. A security scan waiver was rejected.\n\n5. **Environment Degradation**: Both staging (STG-Provider) and UAT (UAT-Provider) environments are degraded, with database schema drift and stale test data.\n\n6. **Governance Compliance at 72%**: Below the 85% enterprise target, with findings in change management, security, and data privacy.',
      confidence: 0.91,
      data_sources: ['applications', 'test-cases', 'test-executions', 'defects', 'environments', 'governance-procedures', 'demands'],
      relatedEntities: [
        { entityType: 'applications', entityId: 'app-008', label: 'Provider Directory' },
        { entityType: 'releases', entityId: 'rel-004', label: 'Release 2024.09' },
        { entityType: 'demands', entityId: 'dem-012', label: 'Paginated Batch Sync' },
        { entityType: 'demands', entityId: 'dem-005', label: 'TLS 1.3 Configuration' },
      ],
      suggestedFollowUps: [
        'What actions are being taken to improve Provider Directory quality?',
        'Show me the Provider Directory defect trend.',
        'When will the batch sync fix be deployed?',
      ],
      ai_available: true,
    },
    entityType: 'applications',
    entityId: 'app-008',
    userId: 'user-011',
    status: 'completed',
    processingTimeMs: 1650,
    tags: ['ask-eqip', 'provider-directory', 'quality-analysis'],
    version: 1,
    created_at: daysAgo(2),
    updated_at: daysAgo(2),
    created_by: 'user-011',
    updated_by: 'system',
  },
  {
    id: 'ai-011',
    type: 'ask_eqip',
    query: 'What is the status of the drug interaction false positive issue?',
    result: {
      answer: 'The drug interaction false positive issue (DEF-RX-003) is currently being actively addressed. Here is the current status:\n\n**Root Cause**: A formulary data import on ' + daysAgo(18) + ' contained a formatting error that shifted column values, creating 4 incorrect drug interaction mappings. Acetaminophen was incorrectly flagged as having a severe interaction with anticoagulants.\n\n**Current Actions**:\n1. Demand dem-017 "Add Drug Interaction Database Validation Rules" is in development (P1, Critical severity)\n2. Demand dem-009 "Integrate Rx Platform with Formulary Data Provider" is in development to enable real-time formulary updates\n3. The 4 erroneous mappings are being corrected in the database\n\n**Impact**: This is classified as a clinical safety issue. The false positive alerts could lead to unnecessary medication changes or delays in treatment.\n\n**Expected Resolution**: The validation rules fix is targeted for Release 2024.11 (rel-006). The formulary integration is also targeted for the same release.',
      confidence: 0.96,
      data_sources: ['test-executions', 'demands', 'test-cases', 'releases'],
      relatedEntities: [
        { entityType: 'test-executions', entityId: 'exec-041', label: 'Drug Interaction Test Failure' },
        { entityType: 'demands', entityId: 'dem-017', label: 'Drug Interaction Validation Rules' },
        { entityType: 'demands', entityId: 'dem-009', label: 'Formulary Data Provider Integration' },
        { entityType: 'releases', entityId: 'rel-006', label: 'Release 2024.11' },
      ],
      suggestedFollowUps: [
        'When will Release 2024.11 be ready for deployment?',
        'Are there other clinical safety issues open?',
        'Show me the Rx Platform quality metrics.',
      ],
      ai_available: true,
    },
    entityType: 'demands',
    entityId: 'dem-017',
    userId: 'user-012',
    status: 'completed',
    processingTimeMs: 1350,
    tags: ['ask-eqip', 'pharmacy', 'drug-interaction', 'clinical-safety'],
    version: 1,
    created_at: daysAndHoursAgo(1, 3),
    updated_at: daysAndHoursAgo(1, 3),
    created_by: 'user-012',
    updated_by: 'system',
  },
  {
    id: 'ai-012',
    type: 'ask_eqip',
    query: 'Compare quality metrics between Claims Processing and Payment Gateway',
    result: {
      answer: 'Here is a comparison of key quality metrics between Claims Processing and Payment Gateway:\n\n| Metric | Claims Processing | Payment Gateway |\n|--------|------------------|----------------|\n| Quality Score | 89 | 78 |\n| Automation Coverage | 72% | 60% |\n| Test Coverage | 85% | 75% |\n| Defect Density | 0.42 | 0.68 |\n| Risk Level | Low | Medium |\n| Governance Compliance | 91% | 82% |\n\n**Key Differences**:\n1. Claims Processing has a 14% higher quality score (89 vs 78)\n2. Claims Processing has significantly lower defect density (0.42 vs 0.68)\n3. Payment Gateway has lower automation coverage (60% vs 72%)\n4. Payment Gateway has a medium risk level due to the ongoing reconciliation issues\n\n**Trend**: Claims Processing quality has been improving steadily over the last 3 releases. Payment Gateway quality has been declining due to technical debt in the legacy payment validation module.',
      confidence: 0.90,
      data_sources: ['applications', 'releases', 'test-cases', 'governance-procedures'],
      relatedEntities: [
        { entityType: 'applications', entityId: 'app-002', label: 'Claims Processing' },
        { entityType: 'applications', entityId: 'app-004', label: 'Payment Gateway' },
      ],
      suggestedFollowUps: [
        'What is causing the Payment Gateway quality decline?',
        'Show me the Claims Processing quality trend.',
        'What demands are open for Payment Gateway?',
      ],
      ai_available: true,
    },
    entityType: 'applications',
    entityId: null,
    userId: 'user-001',
    status: 'completed',
    processingTimeMs: 1550,
    tags: ['ask-eqip', 'comparison', 'claims', 'payments'],
    version: 1,
    created_at: daysAgo(3),
    updated_at: daysAgo(3),
    created_by: 'user-001',
    updated_by: 'system',
  },
  {
    id: 'ai-013',
    type: 'risk_prediction',
    query: 'Predict risk for Compliance Dashboard Release 2024.14',
    result: {
      risk_score: 0.05,
      risk_level: 'minimal',
      summary: 'Release 2024.14 for Compliance Dashboard is at minimal risk. All 16 quality gates have passed including post-deployment verification. Zero critical or high severity defects. Test pass rate exceeds 99% with 85% automation coverage. This release demonstrates best-in-class quality practices.',
      factors: [
        { factor: 'Quality Gate Compliance', score: 1.0, impact: 'positive', detail: 'All 16 quality gates passed.' },
        { factor: 'Test Pass Rate', score: 0.993, impact: 'positive', detail: '278 of 280 test cases passed.' },
        { factor: 'Critical Defects', score: 1.0, impact: 'positive', detail: 'Zero critical or high severity defects.' },
        { factor: 'Automation Coverage', score: 0.85, impact: 'positive', detail: '238 of 280 test cases automated.' },
        { factor: 'Code Coverage', score: 0.93, impact: 'positive', detail: 'Overall code coverage at 93%.' },
        { factor: 'All Approvals', score: 1.0, impact: 'positive', detail: 'QA Lead, Release Manager, and VP of Quality approved.' },
      ],
      recommendations: [],
      confidence: 0.98,
      data_sources: ['releases', 'quality-gates', 'test-executions', 'defects'],
      ai_available: true,
    },
    entityType: 'releases',
    entityId: 'rel-009',
    userId: 'user-001',
    status: 'completed',
    processingTimeMs: 980,
    tags: ['risk-prediction', 'release', 'compliance-dashboard', 'minimal-risk'],
    version: 1,
    created_at: daysAgo(5),
    updated_at: daysAgo(5),
    created_by: 'user-001',
    updated_by: 'system',
  },
  {
    id: 'ai-014',
    type: 'recommendation',
    query: 'Recommend test automation priorities for the next quarter',
    result: {
      summary: 'Based on current automation coverage gaps, defect patterns, and governance compliance requirements, here are the recommended test automation priorities for Q3 2024.',
      recommendations: [
        {
          priority: 'critical',
          area: 'Document Management Automation',
          current: '0% (no automated tests)',
          target: '50%',
          action: 'Create automated test suite covering core document CRUD operations. This is the only application with zero automated tests and is flagged as a critical gap by governance procedure gov-013.',
          effort: '21 story points',
          impact: 'high',
          timeline: '4-6 weeks',
          demandId: 'dem-022',
        },
        {
          priority: 'critical',
          area: 'Credentialing System Stabilization',
          current: '30% flaky test rate',
          target: '< 5% flaky rate',
          action: 'Stabilize existing automation scripts. Root cause analysis shows timing issues and test data dependencies as primary causes. Fix 12 identified flaky tests.',
          effort: '8 story points',
          impact: 'high',
          timeline: '2-3 weeks',
          demandId: 'dem-029',
        },
        {
          priority: 'high',
          area: 'Provider Directory Automation',
          current: '45%',
          target: '70%',
          action: 'Automate provider search, network tier display, and data synchronization test cases. Focus on regression pack for provider directory features.',
          effort: '13 story points',
          impact: 'high',
          timeline: '3-4 weeks',
          demandId: null,
        },
        {
          priority: 'high',
          area: 'Billing Portal Automation',
          current: '55%',
          target: '70%',
          action: 'Automate payment form validation, reconciliation report generation, and billing statement test cases.',
          effort: '8 story points',
          impact: 'medium',
          timeline: '2-3 weeks',
          demandId: null,
        },
        {
          priority: 'medium',
          area: 'Payment Gateway Retry Mechanism',
          current: 'In development',
          target: 'Fully automated',
          action: 'Complete automation of payment retry mechanism test cases including exponential backoff verification.',
          effort: '5 story points',
          impact: 'medium',
          timeline: '1-2 weeks',
          demandId: null,
        },
      ],
      confidence: 0.88,
      data_sources: ['test-cases', 'governance-procedures', 'applications', 'demands'],
      ai_available: true,
    },
    entityType: 'governance-procedures',
    entityId: 'gov-013',
    userId: 'user-008',
    status: 'completed',
    processingTimeMs: 1900,
    tags: ['recommendation', 'automation', 'priorities', 'quarterly-planning'],
    version: 1,
    created_at: daysAgo(3),
    updated_at: daysAgo(3),
    created_by: 'user-008',
    updated_by: 'system',
  },
  {
    id: 'ai-015',
    type: 'natural_language_search',
    query: 'Show me governance procedures that are at risk',
    result: {
      summary: 'Found 4 governance procedures with at-risk or non-compliant status.',
      matches: [
        {
          entityType: 'governance-procedures',
          entityId: 'gov-013',
          title: 'Test Automation Standards',
          category: 'Testing',
          complianceRate: 75,
          complianceStatus: 'at_risk',
          openFindings: 4,
          keyIssue: 'Provider Directory at 45% automation, Document Management has zero automated tests.',
          relevanceScore: 0.98,
        },
        {
          entityType: 'governance-procedures',
          entityId: 'gov-009',
          title: 'Test Environment Management',
          category: 'Testing',
          complianceRate: 78,
          complianceStatus: 'at_risk',
          openFindings: 3,
          keyIssue: 'Provider Directory and Policy Admin UAT environments degraded. Test data refresh overdue.',
          relevanceScore: 0.96,
        },
        {
          entityType: 'governance-procedures',
          entityId: 'gov-004',
          title: 'Data Privacy Review',
          category: 'Privacy',
          complianceRate: 91,
          complianceStatus: 'at_risk',
          openFindings: 3,
          keyIssue: 'Unmasked SSN in Claims Processing staging. Unmasked NPI in Provider Directory exports.',
          relevanceScore: 0.93,
        },
        {
          entityType: 'governance-procedures',
          entityId: 'gov-005',
          title: 'Accessibility Standards Review',
          category: 'Accessibility',
          complianceRate: 82,
          complianceStatus: 'at_risk',
          openFindings: 4,
          keyIssue: 'Billing Portal missing ARIA labels. EQIP Core dashboard charts not accessible to screen readers.',
          relevanceScore: 0.91,
        },
      ],
      totalResults: 4,
      confidence: 0.95,
      data_sources: ['governance-procedures'],
      ai_available: true,
    },
    entityType: 'governance-procedures',
    entityId: null,
    userId: 'user-001',
    status: 'completed',
    processingTimeMs: 680,
    tags: ['search', 'governance', 'at-risk', 'compliance'],
    version: 1,
    created_at: daysAgo(1),
    updated_at: daysAgo(1),
    created_by: 'user-001',
    updated_by: 'system',
  },
  {
    id: 'ai-016',
    type: 'ask_eqip',
    query: 'What is the impact of the Okta integration being disconnected?',
    result: {
      answer: 'The Okta integration (int-020) has been disconnected for 5 days. Here is the impact assessment:\n\n**Current Status**: All 3 health checks (API Connectivity, Authentication, MFA Service) are failing. 12 errors recorded. Last successful sync was 5 days ago.\n\n**Impact**:\n1. **Multi-Factor Authentication**: Okta MFA policies are not being enforced for new sessions. Users authenticated via Azure Entra ID (int-019) are not affected as it remains connected.\n2. **Adaptive Access Policies**: Location-based, device-trust, and risk-based adaptive policies managed by Okta are inactive.\n3. **Identity Lifecycle**: User provisioning and deprovisioning through Okta SCIM is paused. Any user changes in the last 5 days have not been synchronized.\n\n**Affected Applications**: EQIP Core, Claims Processing, Payment Gateway, Member Portal.\n\n**Mitigation**: Azure Entra ID (int-019) provides primary SSO and RBAC, so core authentication is not impacted. However, the additional security layer provided by Okta MFA is currently unavailable.\n\n**Recommended Actions**:\n1. Investigate Okta API connectivity failure immediately.\n2. Verify Okta API token has not expired.\n3. Check Okta service status page for outages.\n4. Manually review any user provisioning changes from the last 5 days.',
      confidence: 0.92,
      data_sources: ['integrations', 'applications'],
      relatedEntities: [
        { entityType: 'integrations', entityId: 'int-020', label: 'Okta' },
        { entityType: 'integrations', entityId: 'int-019', label: 'Azure Entra ID' },
        { entityType: 'notifications', entityId: 'notif-010', label: 'Integration Disconnected Alert' },
      ],
      suggestedFollowUps: [
        'What is the status of Azure Entra ID integration?',
        'Show me all disconnected integrations.',
        'What security risks are introduced by the Okta outage?',
      ],
      ai_available: true,
    },
    entityType: 'integrations',
    entityId: 'int-020',
    userId: 'user-001',
    status: 'completed',
    processingTimeMs: 1200,
    tags: ['ask-eqip', 'integration', 'okta', 'disconnected', 'security'],
    version: 1,
    created_at: daysAgo(4),
    updated_at: daysAgo(4),
    created_by: 'user-001',
    updated_by: 'system',
  },
  {
    id: 'ai-017',
    type: 'risk_prediction',
    query: 'Predict risk for Rx Platform Release 2024.11',
    result: {
      risk_score: 0.52,
      risk_level: 'medium',
      summary: 'Release 2024.11 for Rx Platform is at medium risk. One critical defect in the drug interaction alert module requires immediate attention. Prior authorization workflow is still in progress. Functional testing and security scan are under review.',
      factors: [
        { factor: 'Quality Gate Compliance', score: 0.56, impact: 'warning', detail: '8 of 16 gates passed; functional test and security scan in review.' },
        { factor: 'Critical Defects', score: 0.3, impact: 'negative', detail: '1 critical defect in drug interaction alerts (clinical safety).' },
        { factor: 'Test Pass Rate', score: 0.794, impact: 'warning', detail: '270 of 340 test cases passed.' },
        { factor: 'In-Progress Stories', score: 0.5, impact: 'warning', detail: '2 of 4 stories still in progress.' },
        { factor: 'Automation Coverage', score: 0.70, impact: 'positive', detail: '238 of 340 test cases automated.' },
      ],
      recommendations: [
        'Resolve critical defect in drug interaction alerts immediately — clinical safety impact.',
        'Complete prior authorization workflow development before regression testing.',
        'Finish functional testing before starting regression.',
        'Schedule performance testing for pharmacy transaction throughput.',
      ],
      confidence: 0.90,
      data_sources: ['releases', 'quality-gates', 'test-executions', 'defects', 'demands'],
      ai_available: true,
    },
    entityType: 'releases',
    entityId: 'rel-006',
    userId: 'user-012',
    status: 'completed',
    processingTimeMs: 1380,
    tags: ['risk-prediction', 'release', 'rx-platform', 'medium-risk'],
    version: 1,
    created_at: daysAndHoursAgo(0, 8),
    updated_at: daysAndHoursAgo(0, 8),
    created_by: 'user-012',
    updated_by: 'system',
  },
  {
    id: 'ai-018',
    type: 'ask_eqip',
    query: 'Summarize the XSS vulnerability status and remediation progress',
    result: {
      answer: 'A stored XSS vulnerability was discovered in the EQIP Core release notes field during security scan execution (exec-055) on ' + daysAgo(3) + '.\n\n**Vulnerability Details**:\n- Type: Stored Cross-Site Scripting (XSS)\n- Location: Release notes rich text editor field\n- CVSS Score Estimate: 6.1 (Medium)\n- Attack Vector: Authenticated user with release edit permissions can inject arbitrary JavaScript\n- Potential Impact: Session hijacking, data exfiltration, privilege escalation\n\n**Root Cause**: The TinyMCE rich text editor outputs raw HTML stored directly in the database without server-side sanitization. On display, release notes were rendered using dangerouslySetInnerHTML without client-side sanitization.\n\n**Remediation Progress** (Demand dem-013, P1 Critical):\n✅ DOMPurify sanitization applied on server-side storage\n✅ Client-side rendering replaced with sanitized component\n✅ Content-Security-Policy header added to restrict inline scripts\n🔄 Automated XSS regression tests being developed (in progress)\n⏳ Security scan re-run pending after regression tests complete\n\n**Timeline**: Must be resolved before Release 2024.06 deployment. Assigned to user-019.',
      confidence: 0.97,
      data_sources: ['test-executions', 'demands', 'governance-procedures', 'notifications'],
      relatedEntities: [
        { entityType: 'test-executions', entityId: 'exec-055', label: 'XSS Scan Failure' },
        { entityType: 'demands', entityId: 'dem-013', label: 'XSS Vulnerability Fix' },
        { entityType: 'releases', entityId: 'rel-001', label: 'Release 2024.06' },
        { entityType: 'governance-procedures', entityId: 'gov-002', label: 'Security Compliance Check' },
      ],
      suggestedFollowUps: [
        'Is Release 2024.06 still on track for deployment?',
        'Are there other XSS vulnerabilities in the codebase?',
        'Show me the security compliance status across all applications.',
      ],
      ai_available: true,
    },
    entityType: 'demands',
    entityId: 'dem-013',
    userId: 'user-010',
    status: 'completed',
    processingTimeMs: 1150,
    tags: ['ask-eqip', 'security', 'xss', 'remediation'],
    version: 1,
    created_at: daysAndHoursAgo(1, 2),
    updated_at: daysAndHoursAgo(1, 2),
    created_by: 'user-010',
    updated_by: 'system',
  },
  {
    id: 'ai-019',
    type: 'natural_language_search',
    query: 'Show me all environments with degraded status',
    result: {
      summary: 'Found 3 environments with degraded status or significant issues.',
      matches: [
        {
          entityType: 'environments',
          entityId: 'env-023',
          title: 'UAT-PolicyAdmin',
          type: 'uat',
          readinessScore: 58,
          status: 'degraded',
          issues: ['Running 2 versions behind production', 'Test data refresh overdue by 15 days', 'Document Management service intermittently failing'],
          conflictCount: 3,
          relevanceScore: 0.99,
        },
        {
          entityType: 'environments',
          entityId: 'env-014',
          title: 'UAT-Provider',
          type: 'uat',
          readinessScore: 65,
          status: 'degraded',
          issues: ['Database schema 2 versions behind production', 'Test data not refreshed in 20 days'],
          conflictCount: 2,
          relevanceScore: 0.96,
        },
        {
          entityType: 'environments',
          entityId: 'env-009',
          title: 'STG-Provider',
          type: 'staging',
          readinessScore: 72,
          status: 'degraded (services)',
          issues: ['Database schema 1 migration behind development', 'Elasticsearch index rebuild causing slow responses'],
          conflictCount: 2,
          relevanceScore: 0.92,
        },
      ],
      totalResults: 3,
      confidence: 0.97,
      data_sources: ['environments'],
      ai_available: true,
    },
    entityType: 'environments',
    entityId: null,
    userId: 'user-003',
    status: 'completed',
    processingTimeMs: 620,
    tags: ['search', 'environments', 'degraded'],
    version: 1,
    created_at: daysAgo(1),
    updated_at: daysAgo(1),
    created_by: 'user-003',
    updated_by: 'system',
  },
  {
    id: 'ai-020',
    type: 'ask_eqip',
    query: 'What demands are blocking release progress?',
    result: {
      answer: 'There are 4 demands currently blocking or significantly impacting release progress:\n\n1. **dem-013 - Stored XSS Vulnerability Fix** (P1, Critical)\n   - Blocking: Release 2024.06 (EQIP Core)\n   - Status: In development, DOMPurify applied, regression tests in progress\n   - Assigned to: user-019\n\n2. **dem-017 - Drug Interaction Database Validation Rules** (P1, Critical)\n   - Blocking: Release 2024.11 (Rx Platform)\n   - Status: In development, 3 of 5 story points completed\n   - Clinical safety impact — false positive alerts affecting patient care\n   - Assigned to: user-008\n\n3. **dem-005 - TLS 1.3 Configuration for Provider Directory** (P1, Critical)\n   - Blocking: Release 2024.09 (Provider Directory)\n   - Status: In development, staging applied, production pending CAB approval\n   - Assigned to: user-011\n\n4. **dem-012 - Paginated Batch Sync for Provider Directory** (P1, High)\n   - Blocking: Release 2024.09 (Provider Directory)\n   - Status: Planning, coordinating with credentialing team\n   - Depends on: dem-010 (Research Spike - completed)\n   - Assigned to: user-007',
      confidence: 0.93,
      data_sources: ['demands', 'releases', 'quality-gates'],
      relatedEntities: [
        { entityType: 'demands', entityId: 'dem-013', label: 'XSS Vulnerability Fix' },
        { entityType: 'demands', entityId: 'dem-017', label: 'Drug Interaction Validation' },
        { entityType: 'demands', entityId: 'dem-005', label: 'TLS 1.3 Configuration' },
        { entityType: 'demands', entityId: 'dem-012', label: 'Paginated Batch Sync' },
      ],
      suggestedFollowUps: [
        'What is the timeline for resolving these blocking demands?',
        'Show me all P1 demands across the enterprise.',
        'Which releases are most impacted by these blockers?',
      ],
      ai_available: true,
    },
    entityType: 'demands',
    entityId: null,
    userId: 'user-001',
    status: 'completed',
    processingTimeMs: 1420,
    tags: ['ask-eqip', 'demands', 'blockers', 'releases'],
    version: 1,
    created_at: daysAndHoursAgo(0, 1),
    updated_at: daysAndHoursAgo(0, 1),
    created_by: 'user-001',
    updated_by: 'system',
  },
  {
    id: 'ai-021',
    type: 'risk_prediction',
    query: 'Predict risk for Member Portal Release 2024.08',
    result: {
      risk_score: 0.28,
      risk_level: 'low',
      summary: 'Release 2024.08 for Member Portal is low risk. All critical quality gates have passed. Performance testing and accessibility audit are in review but trending positively. No critical or high severity defects remain. UAT sign-off is pending.',
      factors: [
        { factor: 'Quality Gate Compliance', score: 0.75, impact: 'positive', detail: '12 of 16 gates passed; 3 in review, 1 not started.' },
        { factor: 'Test Pass Rate', score: 0.942, impact: 'positive', detail: '358 of 380 test cases passed.' },
        { factor: 'Critical Defects', score: 1.0, impact: 'positive', detail: 'Zero critical or high severity defects.' },
        { factor: 'Automation Coverage', score: 0.70, impact: 'positive', detail: '266 of 380 test cases automated.' },
        { factor: 'Accessibility', score: 0.85, impact: 'positive', detail: 'Accessibility audit in review; enrollment form passed WCAG 2.1 AA.' },
      ],
      recommendations: [
        'Complete performance tests under peak load scenarios.',
        'Validate accessibility compliance for screen readers.',
        'Obtain UAT sign-off from product owner before release approval.',
      ],
      confidence: 0.92,
      data_sources: ['releases', 'quality-gates', 'test-executions', 'defects'],
      ai_available: true,
    },
    entityType: 'releases',
    entityId: 'rel-003',
    userId: 'user-014',
    status: 'completed',
    processingTimeMs: 1180,
    tags: ['risk-prediction', 'release', 'member-portal', 'low-risk'],
    version: 1,
    created_at: daysAgo(1),
    updated_at: daysAgo(1),
    created_by: 'user-014',
    updated_by: 'system',
  },
  {
    id: 'ai-022',
    type: 'recommendation',
    query: 'What governance procedures need immediate attention?',
    result: {
      summary: 'Analysis of 15 governance procedures identifies 3 requiring immediate attention based on compliance rate, open findings, and overdue reviews.',
      recommendations: [
        {
          priority: 'critical',
          area: 'Test Automation Standards (gov-013)',
          current: '75% compliance (at risk)',
          target: '90% compliance',
          action: 'Address 4 open findings: Document Management zero automation, Credentialing System 30% flaky rate, Provider Directory 45% coverage, Billing Portal 55% coverage. Schedule immediate review — overdue by 10 days.',
          effort: 'high',
          impact: 'high',
          timeline: 'Immediate review; 6-8 weeks for remediation',
        },
        {
          priority: 'high',
          area: 'Test Environment Management (gov-009)',
          current: '78% compliance (at risk)',
          target: '90% compliance',
          action: 'Address 3 open findings: Provider Directory UAT degraded, Policy Admin UAT 2 versions behind, 3 environments with stale test data. Schedule immediate review — overdue by 5 days.',
          effort: 'medium',
          impact: 'high',
          timeline: 'Immediate review; 2-3 weeks for remediation',
        },
        {
          priority: 'high',
          area: 'Data Privacy Review (gov-004)',
          current: '91% compliance (at risk)',
          target: '98% compliance',
          action: 'Address 3 open findings: unmasked SSN in Claims Processing staging, unmasked NPI in Provider Directory exports, unenforced data retention for Billing Portal. Next review due in 14 days.',
          effort: 'medium',
          impact: 'high',
          timeline: '3-4 weeks for remediation',
        },
      ],
      confidence: 0.94,
      data_sources: ['governance-procedures'],
      ai_available: true,
    },
    entityType: 'governance-procedures',
    entityId: null,
    userId: 'user-001',
    status: 'completed',
    processingTimeMs: 1050,
    tags: ['recommendation', 'governance', 'compliance', 'immediate-attention'],
    version: 1,
    created_at: daysAgo(1),
    updated_at: daysAgo(1),
    created_by: 'user-001',
    updated_by: 'system',
  },
  {
    id: 'ai-023',
    type: 'ask_eqip',
    query: 'How is the HIPAA audit trail retention extension progressing?',
    result: {
      answer: 'The HIPAA Audit Trail Retention Extension (dem-006) has been **completed** successfully.\n\n**Summary**:\n- Audit trail retention for Claims Analytics has been extended from 5 years to 7 years\n- 2.3 million audit records were migrated to extended retention\n- Storage capacity planning was updated to account for 7-year retention\n- The regulatory compliance audit passed for HIPAA audit trail requirements\n\n**Timeline**:\n- Identified: ' + daysAgo(90) + ' (during Q1 regulatory compliance audit)\n- Completed: ' + daysAgo(45) + '\n- Verified: ' + daysAgo(45) + ' (during Q2 compliance review)\n\n**Effort**: Estimated 8 story points, actual 10 story points (25% over estimate due to data migration complexity)\n\n**Related**: This work supports the SOX Compliance Audit Trail Enhancement (dem-015) which is currently in planning phase for Q4.',
      confidence: 0.98,
      data_sources: ['demands', 'governance-procedures', 'notifications'],
      relatedEntities: [
        { entityType: 'demands', entityId: 'dem-006', label: 'HIPAA Audit Trail Retention' },
        { entityType: 'demands', entityId: 'dem-015', label: 'SOX Compliance Enhancement' },
        { entityType: 'governance-procedures', entityId: 'gov-003', label: 'Regulatory Compliance Audit' },
      ],
      suggestedFollowUps: [
        'What is the status of the SOX compliance enhancement?',
        'Are there other HIPAA compliance gaps?',
        'Show me the regulatory compliance audit results.',
      ],
      ai_available: true,
    },
    entityType: 'demands',
    entityId: 'dem-006',
    userId: 'user-001',
    status: 'completed',
    processingTimeMs: 890,
    tags: ['ask-eqip', 'hipaa', 'compliance', 'audit-trail'],
    version: 1,
    created_at: daysAgo(2),
    updated_at: daysAgo(2),
    created_by: 'user-001',
    updated_by: 'system',
  },
  {
    id: 'ai-024',
    type: 'degraded',
    query: 'Analyze defect trends for the Claims segment',
    result: {
      summary: 'AI analysis is currently unavailable. Showing cached results from the last successful analysis.',
      cachedResult: {
        summary: 'Claims segment defect trends show improvement over the last 3 releases. Defect density decreased from 0.51 to 0.35 defects/KLOC.',
        lastUpdated: daysAgo(7),
        confidence: 0.75,
      },
      error: 'AI service temporarily unavailable. The analysis engine is undergoing scheduled maintenance.',
      retryAfter: 300,
      confidence: 0,
      data_sources: [],
      ai_available: false,
    },
    entityType: 'applications',
    entityId: null,
    userId: 'user-003',
    status: 'degraded',
    processingTimeMs: 0,
    tags: ['degraded', 'ai-unavailable', 'claims', 'defect-trends'],
    version: 1,
    created_at: daysAndHoursAgo(0, 1),
    updated_at: daysAndHoursAgo(0, 1),
    created_by: 'user-003',
    updated_by: 'system',
  },
  {
    id: 'ai-025',
    type: 'error',
    query: 'Predict quality score for next quarter',
    result: {
      summary: 'AI prediction service encountered an error and could not complete the request.',
      error: 'Insufficient historical data for quarterly prediction. At least 4 quarters of data are required for trend-based prediction. Current data spans 2 quarters.',
      fallbackRecommendations: [
        'Continue monitoring current quality metrics trends.',
        'Focus on improving automation coverage which has the largest gap to target.',
        'Address the 4 at-risk governance procedures to improve overall compliance.',
      ],
      confidence: 0,
      data_sources: [],
      ai_available: true,
    },
    entityType: 'metrics',
    entityId: null,
    userId: 'user-001',
    status: 'error',
    processingTimeMs: 450,
    tags: ['error', 'prediction', 'insufficient-data'],
    version: 1,
    created_at: daysAgo(3),
    updated_at: daysAgo(3),
    created_by: 'user-001',
    updated_by: 'system',
  },
  {
    id: 'ai-026',
    type: 'natural_language_search',
    query: 'Find all unassigned demands',
    result: {
      summary: 'Found 2 demands that are currently unassigned.',
      matches: [
        {
          entityType: 'demands',
          entityId: 'dem-022',
          title: 'Automate Document Management Test Suite',
          type: 'Technical Debt',
          priority: 'p2',
          severity: 'high',
          status: 'draft',
          approvalStatus: 'pending',
          estimatedEffort: 21,
          segment: 'Policy Administration',
          relevanceScore: 0.98,
        },
        {
          entityType: 'demands',
          entityId: 'dem-024',
          title: 'Actuarial Platform Data Export Enhancement',
          type: 'Enhancement',
          priority: 'p3',
          severity: 'low',
          status: 'draft',
          approvalStatus: 'pending',
          estimatedEffort: 8,
          segment: 'Actuarial',
          relevanceScore: 0.95,
        },
      ],
      totalResults: 2,
      confidence: 0.99,
      data_sources: ['demands'],
      ai_available: true,
    },
    entityType: 'demands',
    entityId: null,
    userId: 'user-003',
    status: 'completed',
    processingTimeMs: 520,
    tags: ['search', 'demands', 'unassigned'],
    version: 1,
    created_at: daysAgo(1),
    updated_at: daysAgo(1),
    created_by: 'user-003',
    updated_by: 'system',
  },
  {
    id: 'ai-027',
    type: 'recommendation',
    query: 'Recommend actions to improve Release 2024.07 readiness',
    result: {
      summary: 'Release 2024.07 for Payment Gateway has a readiness score of 78 (In Progress). Here are prioritized actions to improve readiness.',
      recommendations: [
        {
          priority: 'critical',
          area: 'Critical Defect Resolution',
          current: '2 critical defects open',
          target: '0 critical defects',
          action: 'Resolve DEF-PAY-003 (T+1 settlement date mismatch) and DEF-PAY-004 (reconciliation false discrepancies). Implement settlement date normalization layer.',
          effort: '8 story points',
          impact: 'high',
          timeline: '1-2 weeks',
        },
        {
          priority: 'critical',
          area: 'Integration Test Stability',
          current: 'Failing intermittently',
          target: 'Stable pass rate > 95%',
          action: 'Investigate and fix intermittent integration test failures. Update sandbox test card configurations. Add pre-flight checks for sandbox health.',
          effort: '3 story points',
          impact: 'high',
          timeline: '3-5 days',
        },
        {
          priority: 'high',
          area: 'Unit Test Coverage',
          current: '75%',
          target: '80%',
          action: 'Add unit tests for payment validation module. Refactor legacy code to improve testability (dem-004). If waiver is approved, document remediation plan.',
          effort: '13 story points',
          impact: 'medium',
          timeline: '2-3 weeks',
        },
        {
          priority: 'medium',
          area: 'Remaining Quality Gates',
          current: '7 of 16 passed',
          target: '14+ of 16 passed',
          action: 'Complete functional testing, regression testing, performance testing, and security scan. Schedule UAT after all testing gates pass.',
          effort: 'Ongoing',
          impact: 'high',
          timeline: '2-4 weeks',
        },
      ],
      confidence: 0.91,
      data_sources: ['releases', 'quality-gates', 'test-executions', 'defects', 'demands'],
      ai_available: true,
    },
    entityType: 'releases',
    entityId: 'rel-002',
    userId: 'user-013',
    status: 'completed',
    processingTimeMs: 1680,
    tags: ['recommendation', 'release', 'payment-gateway', 'readiness'],
    version: 1,
    created_at: daysAndHoursAgo(0, 2),
    updated_at: daysAndHoursAgo(0, 2),
    created_by: 'user-013',
    updated_by: 'system',
  },
  {
    id: 'ai-028',
    type: 'ask_eqip',
    query: 'What is the test data health status across all environments?',
    result: {
      answer: 'Here is the test data health status across all environments:\n\n**Overall Status**: 19 of 20 test data sets are active. 1 is stale (Document Management Test Files).\n\n**Key Metrics**:\n- Total Records: ~189,750 across all data sets\n- Total Size: ~2.6 GB\n- Fully Masked: 11 data sets\n- Partially Masked: 3 data sets (Provider Network, Credentialing, Document Management)\n- Not Applicable: 6 data sets (reference/crafted data)\n\n**Issues Requiring Attention**:\n1. **td-020 (Document Management Test Files)**: Stale — last refreshed 45 days ago, exceeding 30-day threshold. PII masking warning: some PDFs may contain unmasked PII in embedded images.\n2. **td-006 (Formulary Drug Reference Data)**: 4 drug interaction mappings flagged for review after last import.\n3. **td-005 (Provider Network Directory Data)**: NPI numbers only partially masked. Full masking pending next refresh.\n4. **td-008 (Policy Administration Test Policies)**: 3 policies have effective dates after expiration dates.\n\n**Refresh Schedule Compliance**: 17 of 20 data sets are on schedule. 3 have overdue or upcoming refreshes.',
      confidence: 0.94,
      data_sources: ['test-data', 'environments'],
      relatedEntities: [
        { entityType: 'test-data', entityId: 'td-020', label: 'Document Management Test Files (Stale)' },
        { entityType: 'test-data', entityId: 'td-006', label: 'Formulary Drug Reference Data' },
        { entityType: 'test-data', entityId: 'td-005', label: 'Provider Network Directory Data' },
      ],
      suggestedFollowUps: [
        'Refresh the Document Management test data.',
        'Show me test data sets with PII masking issues.',
        'What is the test data refresh schedule for next week?',
      ],
      ai_available: true,
    },
    entityType: 'test-data',
    entityId: null,
    userId: 'user-008',
    status: 'completed',
    processingTimeMs: 1320,
    tags: ['ask-eqip', 'test-data', 'health-status', 'environments'],
    version: 1,
    created_at: daysAgo(1),
    updated_at: daysAgo(1),
    created_by: 'user-008',
    updated_by: 'system',
  },
  {
    id: 'ai-029',
    type: 'degraded',
    query: 'Generate comprehensive quality report for Q2 2024',
    result: {
      summary: 'AI report generation is currently operating in degraded mode. A simplified report is available.',
      cachedResult: {
        summary: 'Q2 2024 Quality Summary: Enterprise Quality Score improved from 80.2 to 82.5. 10 releases completed, 3 in progress. Average test pass rate: 92.4%. Key achievement: Compliance Dashboard achieved 97 quality score.',
        highlights: [
          'Enterprise Quality Score: 82.5 (Grade B, +2.3 from Q1)',
          'Releases Completed: 10 (8 on schedule, 2 delayed)',
          'Average Test Pass Rate: 92.4%',
          'Automation Coverage: 63.2% (target: 80%)',
          'Governance Compliance: 87.5% average',
        ],
        lastUpdated: daysAgo(3),
        confidence: 0.70,
      },
      error: 'Full AI-powered report generation is temporarily unavailable. Detailed trend analysis, predictive insights, and cross-segment correlations are not included in this simplified report.',
      retryAfter: 600,
      confidence: 0,
      data_sources: [],
      ai_available: false,
    },
    entityType: 'reports',
    entityId: null,
    userId: 'user-001',
    status: 'degraded',
    processingTimeMs: 0,
    tags: ['degraded', 'ai-unavailable', 'report', 'quarterly'],
    version: 1,
    created_at: daysAgo(2),
    updated_at: daysAgo(2),
    created_by: 'user-001',
    updated_by: 'system',
  },
  {
    id: 'ai-030',
    type: 'natural_language_search',
    query: 'Show me integration health across all connected systems',
    result: {
      summary: 'Of 20 configured integrations, 19 are connected and 1 is disconnected. Overall average uptime is 99.52%.',
      matches: [
        {
          entityType: 'integrations',
          entityId: 'int-020',
          title: 'Okta - DISCONNECTED',
          status: 'disconnected',
          errorCount: 12,
          uptime: 95.45,
          lastSync: daysAgo(5),
          severity: 'critical',
          relevanceScore: 0.99,
        },
        {
          entityType: 'integrations',
          entityId: 'int-015',
          title: 'ServiceNow - Warning',
          status: 'connected',
          errorCount: 2,
          uptime: 99.17,
          lastSync: daysAndHoursAgo(0, 0),
          severity: 'warning',
          relevanceScore: 0.85,
        },
        {
          entityType: 'integrations',
          entityId: 'int-004',
          title: 'Jira Align - Warning',
          status: 'connected',
          errorCount: 1,
          uptime: 98.71,
          lastSync: daysAndHoursAgo(0, 1),
          severity: 'warning',
          relevanceScore: 0.80,
        },
      ],
      healthSummary: {
        total: 20,
        connected: 19,
        disconnected: 1,
        withErrors: 3,
        averageUptime: 99.52,
        totalRecordsSynced: 12500000,
      },
      totalResults: 3,
      confidence: 0.97,
      data_sources: ['integrations'],
      ai_available: true,
    },
    entityType: 'integrations',
    entityId: null,
    userId: 'user-017',
    status: 'completed',
    processingTimeMs: 750,
    tags: ['search', 'integrations', 'health', 'status'],
    version: 1,
    created_at: daysAndHoursAgo(0, 1),
    updated_at: daysAndHoursAgo(0, 1),
    created_by: 'user-017',
    updated_by: 'system',
  },
];

export default aiInsights;

/**
 * Get all mock AI insights.
 * @returns {Array<object>} Array of AI insight objects.
 */
export function getAllAIInsights() {
  return [...aiInsights];
}

/**
 * Find an AI insight by ID.
 * @param {string} id - The AI insight ID to find.
 * @returns {object|null} The AI insight object, or null if not found.
 */
export function getAIInsightById(id) {
  if (!id || typeof id !== 'string') {
    return null;
  }
  return aiInsights.find((insight) => insight.id === id) || null;
}

/**
 * Get all AI insights with a specific type.
 * @param {string} type - The type to filter by (e.g., 'risk_prediction', 'recommendation', 'natural_language_search', 'ask_eqip', 'degraded', 'error').
 * @returns {Array<object>} Array of AI insights with the specified type.
 */
export function getAIInsightsByType(type) {
  if (!type || typeof type !== 'string') {
    return [];
  }
  return aiInsights.filter((insight) => insight.type === type);
}

/**
 * Get all AI insights with a specific status.
 * @param {string} status - The status to filter by (e.g., 'completed', 'degraded', 'error').
 * @returns {Array<object>} Array of AI insights with the specified status.
 */
export function getAIInsightsByStatus(status) {
  if (!status || typeof status !== 'string') {
    return [];
  }
  return aiInsights.filter((insight) => insight.status === status);
}

/**
 * Get all AI insights for a specific entity.
 * @param {string} entityType - The entity type to filter by.
 * @param {string} entityId - The entity ID to filter by.
 * @returns {Array<object>} Array of AI insights for the specified entity.
 */
export function getAIInsightsByEntity(entityType, entityId) {
  if (!entityType || typeof entityType !== 'string') {
    return [];
  }
  if (!entityId || typeof entityId !== 'string') {
    return aiInsights.filter((insight) => insight.entityType === entityType);
  }
  return aiInsights.filter(
    (insight) => insight.entityType === entityType && insight.entityId === entityId,
  );
}

/**
 * Get all AI insights created by a specific user.
 * @param {string} userId - The user ID to filter by.
 * @returns {Array<object>} Array of AI insights created by the specified user.
 */
export function getAIInsightsByUser(userId) {
  if (!userId || typeof userId !== 'string') {
    return [];
  }
  return aiInsights.filter((insight) => insight.userId === userId);
}

/**
 * Get all risk predictions.
 * @returns {Array<object>} Array of risk prediction AI insights.
 */
export function getRiskPredictions() {
  return aiInsights.filter((insight) => insight.type === 'risk_prediction');
}

/**
 * Get all recommendations.
 * @returns {Array<object>} Array of recommendation AI insights.
 */
export function getRecommendations() {
  return aiInsights.filter((insight) => insight.type === 'recommendation');
}

/**
 * Get all natural language search results.
 * @returns {Array<object>} Array of natural language search AI insights.
 */
export function getNaturalLanguageSearchResults() {
  return aiInsights.filter((insight) => insight.type === 'natural_language_search');
}

/**
 * Get all Ask EQIP responses.
 * @returns {Array<object>} Array of Ask EQIP AI insights.
 */
export function getAskEqipResponses() {
  return aiInsights.filter((insight) => insight.type === 'ask_eqip');
}

/**
 * Get all degraded or error AI insights.
 * @returns {Array<object>} Array of degraded or error AI insights.
 */
export function getDegradedInsights() {
  return aiInsights.filter(
    (insight) => insight.type === 'degraded' || insight.type === 'error' || insight.status === 'degraded' || insight.status === 'error',
  );
}

/**
 * Get all AI insights where AI is available.
 * @returns {Array<object>} Array of AI insights where AI service was available.
 */
export function getAvailableInsights() {
  return aiInsights.filter(
    (insight) => insight.result && insight.result.ai_available === true,
  );
}

/**
 * Get all AI insights where AI is unavailable.
 * @returns {Array<object>} Array of AI insights where AI service was unavailable.
 */
export function getUnavailableInsights() {
  return aiInsights.filter(
    (insight) => insight.result && insight.result.ai_available === false,
  );
}

/**
 * Get distinct types from the AI insights data.
 * @returns {string[]} Array of unique type strings.
 */
export function getDistinctTypes() {
  const types = new Set();
  for (let i = 0; i < aiInsights.length; i++) {
    if (aiInsights[i].type) {
      types.add(aiInsights[i].type);
    }
  }
  return [...types].sort();
}

/**
 * Get distinct statuses from the AI insights data.
 * @returns {string[]} Array of unique status strings.
 */
export function getDistinctStatuses() {
  const statuses = new Set();
  for (let i = 0; i < aiInsights.length; i++) {
    if (aiInsights[i].status) {
      statuses.add(aiInsights[i].status);
    }
  }
  return [...statuses].sort();
}

/**
 * Get distinct entity types from the AI insights data.
 * @returns {string[]} Array of unique entity type strings.
 */
export function getDistinctEntityTypes() {
  const entityTypes = new Set();
  for (let i = 0; i < aiInsights.length; i++) {
    if (aiInsights[i].entityType) {
      entityTypes.add(aiInsights[i].entityType);
    }
  }
  return [...entityTypes].sort();
}

/**
 * Get a count of AI insights grouped by type.
 * @returns {object} Object with type keys and count values.
 */
export function getAIInsightCountByType() {
  const counts = {};
  for (let i = 0; i < aiInsights.length; i++) {
    const type = aiInsights[i].type;
    counts[type] = (counts[type] || 0) + 1;
  }
  return counts;
}

/**
 * Get a count of AI insights grouped by status.
 * @returns {object} Object with status keys and count values.
 */
export function getAIInsightCountByStatus() {
  const counts = {};
  for (let i = 0; i < aiInsights.length; i++) {
    const status = aiInsights[i].status;
    counts[status] = (counts[status] || 0) + 1;
  }
  return counts;
}

/**
 * Get a count of AI insights grouped by entity type.
 * @returns {object} Object with entity type keys and count values.
 */
export function getAIInsightCountByEntityType() {
  const counts = {};
  for (let i = 0; i < aiInsights.length; i++) {
    const entityType = aiInsights[i].entityType;
    counts[entityType] = (counts[entityType] || 0) + 1;
  }
  return counts;
}

/**
 * Calculate the average confidence score across all completed AI insights.
 * @returns {number} The average confidence score, or 0 if no completed insights exist.
 */
export function getAverageConfidenceScore() {
  const completed = aiInsights.filter(
    (insight) => insight.status === 'completed' && insight.result && typeof insight.result.confidence === 'number',
  );
  if (completed.length === 0) {
    return 0;
  }
  let total = 0;
  for (let i = 0; i < completed.length; i++) {
    total += completed[i].result.confidence;
  }
  return Math.round((total / completed.length) * 100) / 100;
}

/**
 * Calculate the average processing time across all completed AI insights.
 * @returns {number} The average processing time in milliseconds, or 0 if no completed insights exist.
 */
export function getAverageProcessingTime() {
  const completed = aiInsights.filter(
    (insight) => insight.status === 'completed' && typeof insight.processingTimeMs === 'number' && insight.processingTimeMs > 0,
  );
  if (completed.length === 0) {
    return 0;
  }
  let total = 0;
  for (let i = 0; i < completed.length; i++) {
    total += completed[i].processingTimeMs;
  }
  return Math.round(total / completed.length);
}

/**
 * Get AI insights sorted by created_at in descending order (newest first).
 * @param {number} [limit] - Optional maximum number of insights to return.
 * @returns {Array<object>} Array of AI insights sorted by creation date.
 */
export function getRecentInsights(limit) {
  const sorted = [...aiInsights].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    if (isNaN(dateA) && isNaN(dateB)) return 0;
    if (isNaN(dateA)) return 1;
    if (isNaN(dateB)) return -1;
    return dateB - dateA;
  });
  if (typeof limit === 'number' && limit > 0) {
    return sorted.slice(0, limit);
  }
  return sorted;
}

/**
 * Search AI insights by query text (case-insensitive partial match).
 * @param {string} query - The search query.
 * @returns {Array<object>} Array of matching AI insight objects.
 */
export function searchInsightsByQuery(query) {
  if (!query || typeof query !== 'string') {
    return [];
  }
  const queryLower = query.toLowerCase();
  return aiInsights.filter(
    (insight) => insight.query && insight.query.toLowerCase().includes(queryLower),
  );
}

/**
 * Get risk predictions sorted by risk score in descending order (highest risk first).
 * @param {number} [limit] - Optional maximum number of predictions to return.
 * @returns {Array<object>} Array of risk prediction insights sorted by risk score.
 */
export function getHighestRiskPredictions(limit) {
  const predictions = getRiskPredictions();
  const sorted = predictions.sort((a, b) => {
    const scoreA = a.result && typeof a.result.risk_score === 'number' ? a.result.risk_score : 0;
    const scoreB = b.result && typeof b.result.risk_score === 'number' ? b.result.risk_score : 0;
    return scoreB - scoreA;
  });
  if (typeof limit === 'number' && limit > 0) {
    return sorted.slice(0, limit);
  }
  return sorted;
}

/**
 * Get a summary of AI insights metrics.
 * @returns {object} Summary object with AI insights metrics.
 */
export function getAIInsightsSummary() {
  const total = aiInsights.length;
  let completed = 0;
  let degraded = 0;
  let error = 0;
  let riskPredictions = 0;
  let recommendations = 0;
  let searches = 0;
  let askEqip = 0;
  let totalConfidence = 0;
  let confidenceCount = 0;
  let totalProcessingTime = 0;
  let processingCount = 0;
  let aiAvailable = 0;
  let aiUnavailable = 0;

  for (let i = 0; i < aiInsights.length; i++) {
    const insight = aiInsights[i];

    if (insight.status === 'completed') completed += 1;
    else if (insight.status === 'degraded') degraded += 1;
    else if (insight.status === 'error') error += 1;

    if (insight.type === 'risk_prediction') riskPredictions += 1;
    else if (insight.type === 'recommendation') recommendations += 1;
    else if (insight.type === 'natural_language_search') searches += 1;
    else if (insight.type === 'ask_eqip') askEqip += 1;

    if (insight.result && typeof insight.result.confidence === 'number' && insight.result.confidence > 0) {
      totalConfidence += insight.result.confidence;
      confidenceCount += 1;
    }

    if (typeof insight.processingTimeMs === 'number' && insight.processingTimeMs > 0) {
      totalProcessingTime += insight.processingTimeMs;
      processingCount += 1;
    }

    if (insight.result && insight.result.ai_available === true) {
      aiAvailable += 1;
    } else if (insight.result && insight.result.ai_available === false) {
      aiUnavailable += 1;
    }
  }

  return {
    total,
    completed,
    degraded,
    error,
    riskPredictions,
    recommendations,
    searches,
    askEqip,
    averageConfidence: confidenceCount > 0 ? Math.round((totalConfidence / confidenceCount) * 100) / 100 : 0,
    averageProcessingTimeMs: processingCount > 0 ? Math.round(totalProcessingTime / processingCount) : 0,
    aiAvailable,
    aiUnavailable,
    availabilityRate: total > 0 ? Math.round((aiAvailable / total) * 10000) / 100 : 0,
  };
}

/**
 * Simulate an AI search query and return a mock response.
 * @param {string} query - The search query.
 * @param {string} [userId='user-001'] - The user ID making the query.
 * @returns {object} A simulated AI response object.
 */
export function simulateSearch(query, userId = 'user-001') {
  if (!query || typeof query !== 'string') {
    return {
      id: uuidv4(),
      type: 'error',
      query: '',
      result: {
        summary: 'Invalid query. Please provide a search query.',
        error: 'Empty or invalid query string.',
        confidence: 0,
        data_sources: [],
        ai_available: true,
      },
      entityType: null,
      entityId: null,
      userId,
      status: 'error',
      processingTimeMs: 50,
      tags: ['error', 'invalid-query'],
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: userId,
      updated_by: 'system',
    };
  }

  const existingMatch = aiInsights.find(
    (insight) => insight.query && insight.query.toLowerCase() === query.toLowerCase(),
  );

  if (existingMatch) {
    return { ...existingMatch };
  }

  return {
    id: uuidv4(),
    type: 'natural_language_search',
    query,
    result: {
      summary: 'No specific results found for your query. Try refining your search or ask a more specific question.',
      matches: [],
      totalResults: 0,
      confidence: 0.5,
      data_sources: ['releases', 'demands', 'test-cases', 'applications'],
      ai_available: true,
      suggestedQueries: [
        'Show me all failed test cases in the last 7 days',
        'Which releases are at risk?',
        'What is the current Enterprise Quality Score?',
        'Find all critical security vulnerabilities',
        'Show me governance procedures that are at risk',
      ],
    },
    entityType: null,
    entityId: null,
    userId,
    status: 'completed',
    processingTimeMs: Math.floor(Math.random() * 500) + 300,
    tags: ['search', 'no-results'],
    version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: userId,
    updated_by: 'system',
  };
}

/**
 * Simulate a risk prediction for a given entity.
 * @param {string} entityType - The entity type (e.g., 'releases').
 * @param {string} entityId - The entity ID.
 * @param {string} [userId='user-001'] - The user ID making the request.
 * @returns {object} A simulated risk prediction response.
 */
export function simulateRiskPrediction(entityType, entityId, userId = 'user-001') {
  if (!entityType || !entityId) {
    return {
      id: uuidv4(),
      type: 'error',
      query: 'Risk prediction',
      result: {
        summary: 'Unable to generate risk prediction. Entity type and ID are required.',
        error: 'Missing entityType or entityId.',
        confidence: 0,
        data_sources: [],
        ai_available: true,
      },
      entityType,
      entityId,
      userId,
      status: 'error',
      processingTimeMs: 100,
      tags: ['error', 'risk-prediction'],
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: userId,
      updated_by: 'system',
    };
  }

  const existingPrediction = aiInsights.find(
    (insight) =>
      insight.type === 'risk_prediction' &&
      insight.entityType === entityType &&
      insight.entityId === entityId,
  );

  if (existingPrediction) {
    return { ...existingPrediction };
  }

  const riskScore = Math.round(Math.random() * 100) / 100;
  let riskLevel = 'low';
  if (riskScore >= 0.8) riskLevel = 'critical';
  else if (riskScore >= 0.6) riskLevel = 'high';
  else if (riskScore >= 0.4) riskLevel = 'medium';
  else if (riskScore >= 0.2) riskLevel = 'low';
  else riskLevel = 'minimal';

  return {
    id: uuidv4(),
    type: 'risk_prediction',
    query: `Risk prediction for ${entityType}/${entityId}`,
    result: {
      risk_score: riskScore,
      risk_level: riskLevel,
      summary: `Simulated risk prediction for ${entityType} ${entityId}. Risk level: ${riskLevel}.`,
      factors: [
        { factor: 'Quality Gate Compliance', score: Math.random(), impact: riskScore > 0.5 ? 'negative' : 'positive', detail: 'Simulated factor.' },
        { factor: 'Test Pass Rate', score: Math.random(), impact: riskScore > 0.5 ? 'warning' : 'positive', detail: 'Simulated factor.' },
      ],
      recommendations: riskScore > 0.5
        ? ['Review and address quality gate failures.', 'Increase test coverage.']
        : ['Continue monitoring quality metrics.'],
      confidence: Math.round((0.7 + Math.random() * 0.25) * 100) / 100,
      data_sources: ['releases', 'quality-gates', 'test-executions'],
      ai_available: true,
    },
    entityType,
    entityId,
    userId,
    status: 'completed',
    processingTimeMs: Math.floor(Math.random() * 1000) + 500,
    tags: ['risk-prediction', 'simulated'],
    version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: userId,
    updated_by: 'system',
  };
}

/**
 * Simulate AI recommendations for a given entity.
 * @param {string} entityType - The entity type (e.g., 'applications').
 * @param {string} entityId - The entity ID.
 * @param {string} [userId='user-001'] - The user ID making the request.
 * @returns {object} A simulated recommendations response.
 */
export function simulateRecommendations(entityType, entityId, userId = 'user-001') {
  const existingRec = aiInsights.find(
    (insight) =>
      insight.type === 'recommendation' &&
      insight.entityType === entityType &&
      insight.entityId === entityId,
  );

  if (existingRec) {
    return { ...existingRec };
  }

  return {
    id: uuidv4(),
    type: 'recommendation',
    query: `Recommendations for ${entityType}/${entityId || 'all'}`,
    result: {
      summary: `Simulated recommendations for ${entityType} ${entityId || '(all)'}.`,
      recommendations: [
        {
          priority: 'high',
          area: 'Test Coverage',
          current: 'Below target',
          target: 'Meet or exceed target',
          action: 'Increase test automation coverage and add missing test cases for critical paths.',
          effort: 'medium',
          impact: 'high',
          timeline: '2-4 weeks',
        },
        {
          priority: 'medium',
          area: 'Code Quality',
          current: 'Acceptable',
          target: 'Excellent',
          action: 'Address static analysis findings and reduce technical debt.',
          effort: 'medium',
          impact: 'medium',
          timeline: '4-6 weeks',
        },
      ],
      confidence: Math.round((0.75 + Math.random() * 0.2) * 100) / 100,
      data_sources: ['applications', 'test-cases', 'governance-procedures'],
      ai_available: true,
    },
    entityType,
    entityId,
    userId,
    status: 'completed',
    processingTimeMs: Math.floor(Math.random() * 1500) + 800,
    tags: ['recommendation', 'simulated'],
    version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: userId,
    updated_by: 'system',
  };
}