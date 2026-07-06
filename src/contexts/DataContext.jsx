import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  initializeMockDataStore,
  resetMockDataStore,
  getAll,
  getById,
  create,
  update,
  remove,
  find,
  count,
  exists,
  createMany,
  updateMany,
  removeMany,
  apiGetAll,
  apiGetById,
  apiCreate,
  apiUpdate,
  apiDelete,
  getEntityCounts,
  getGroupedCount,
  getDistinctValues,
  isInitialized,
  getStoreStatus,
  ENTITY_TYPES,
} from '../data/mockDataStore.js';
import { logAction } from '../utils/auditLogger.js';

/**
 * @module DataContext
 * React Context provider for centralized mock data state in eQIP Quality Intelligence.
 * Wraps mockDataStore and provides data access to all components.
 * Handles data initialization, CRUD operations, and localStorage sync.
 * Provides useData() hook for consuming components.
 */

/**
 * @typedef {object} DataContextValue
 * @property {boolean} isDataReady - Whether the mock data store has been initialized.
 * @property {boolean} isLoading - Whether data initialization is in progress.
 * @property {string|null} error - Error message if initialization failed.
 * @property {object} entityTypes - The ENTITY_TYPES constants for reference.
 * @property {function} getAll - Get all entities of a given type.
 * @property {function} getById - Get a single entity by ID.
 * @property {function} createEntity - Create a new entity.
 * @property {function} updateEntity - Update an existing entity.
 * @property {function} removeEntity - Delete an entity.
 * @property {function} findEntities - Find entities matching filter criteria.
 * @property {function} countEntities - Count entities of a given type.
 * @property {function} entityExists - Check if an entity exists by ID.
 * @property {function} createManyEntities - Create multiple entities at once.
 * @property {function} updateManyEntities - Update multiple entities at once.
 * @property {function} removeManyEntities - Delete multiple entities at once.
 * @property {function} apiGetAll - Simulate API GET for a list of entities.
 * @property {function} apiGetById - Simulate API GET for a single entity.
 * @property {function} apiCreate - Simulate API POST to create an entity.
 * @property {function} apiUpdate - Simulate API PUT to update an entity.
 * @property {function} apiDelete - Simulate API DELETE to remove an entity.
 * @property {function} getEntityCounts - Get entity counts across all types.
 * @property {function} getGroupedCount - Get grouped count by a field.
 * @property {function} getDistinctValues - Get distinct values for a field.
 * @property {function} getStoreStatus - Get the current store status.
 * @property {function} resetData - Reset all data to defaults.
 * @property {function} refreshData - Force a re-render by incrementing a version counter.
 */

const DataContext = createContext(null);

/**
 * DataProvider component that wraps the application and provides centralized
 * mock data state. Initializes the mockDataStore on mount and provides
 * CRUD operations to all child components.
 *
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - Child components to render within the provider.
 * @returns {React.ReactElement} The DataContext.Provider wrapping children.
 */
export function DataProvider({ children }) {
  const [isDataReady, setIsDataReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataVersion, setDataVersion] = useState(0);

  /**
   * Initialize the mock data store on mount.
   */
  useEffect(() => {
    try {
      if (!isInitialized()) {
        initializeMockDataStore();
      }
      setIsDataReady(true);
      setError(null);
    } catch (err) {
      console.error('[DataContext] Error initializing mock data store:', err);
      setError('Failed to initialize data store.');
      setIsDataReady(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get all entities of a given type.
   *
   * @param {string} entityType - The entity type key (use ENTITY_TYPES constants).
   * @returns {Array<object>} Array of entity objects.
   */
  const getAllEntities = useCallback((entityType) => {
    if (!isDataReady) {
      return [];
    }
    return getAll(entityType);
  }, [isDataReady]);

  /**
   * Get a single entity by ID from a given entity type.
   *
   * @param {string} entityType - The entity type key.
   * @param {string} id - The entity ID.
   * @returns {object|null} The entity object, or null if not found.
   */
  const getEntityById = useCallback((entityType, id) => {
    if (!isDataReady) {
      return null;
    }
    return getById(entityType, id);
  }, [isDataReady]);

  /**
   * Create a new entity of a given type.
   * Increments the data version to trigger re-renders in consuming components.
   *
   * @param {string} entityType - The entity type key.
   * @param {object} entity - The entity data to create.
   * @param {string} [userId='system'] - The user ID performing the action.
   * @returns {object|null} The created entity with generated fields, or null on failure.
   */
  const createEntity = useCallback((entityType, entity, userId = 'system') => {
    if (!isDataReady) {
      console.warn('[DataContext] Data store not ready. Cannot create entity.');
      return null;
    }

    try {
      const created = create(entityType, entity, userId);

      if (created) {
        setDataVersion((prev) => prev + 1);
        logAction(
          userId,
          'Create',
          entityType,
          created.id,
          `Created ${entityType} entity: ${created.id}`,
        );
      }

      return created;
    } catch (err) {
      console.error(`[DataContext] Error creating ${entityType} entity:`, err);
      return null;
    }
  }, [isDataReady]);

  /**
   * Update an existing entity by ID within a given entity type.
   * Increments the data version to trigger re-renders in consuming components.
   *
   * @param {string} entityType - The entity type key.
   * @param {string} id - The entity ID to update.
   * @param {object} updates - The fields to update.
   * @param {string} [userId='system'] - The user ID performing the action.
   * @returns {object|null} The updated entity, or null if not found.
   */
  const updateEntityData = useCallback((entityType, id, updates, userId = 'system') => {
    if (!isDataReady) {
      console.warn('[DataContext] Data store not ready. Cannot update entity.');
      return null;
    }

    try {
      const updated = update(entityType, id, updates, userId);

      if (updated) {
        setDataVersion((prev) => prev + 1);
        logAction(
          userId,
          'Update',
          entityType,
          id,
          `Updated ${entityType} entity: ${id}`,
        );
      }

      return updated;
    } catch (err) {
      console.error(`[DataContext] Error updating ${entityType}/${id}:`, err);
      return null;
    }
  }, [isDataReady]);

  /**
   * Delete an entity by ID from a given entity type.
   * Increments the data version to trigger re-renders in consuming components.
   *
   * @param {string} entityType - The entity type key.
   * @param {string} id - The entity ID to delete.
   * @param {string} [userId='system'] - The user ID performing the action.
   * @returns {boolean} True if the entity was found and deleted.
   */
  const removeEntityData = useCallback((entityType, id, userId = 'system') => {
    if (!isDataReady) {
      console.warn('[DataContext] Data store not ready. Cannot remove entity.');
      return false;
    }

    try {
      const deleted = remove(entityType, id);

      if (deleted) {
        setDataVersion((prev) => prev + 1);
        logAction(
          userId,
          'Delete',
          entityType,
          id,
          `Deleted ${entityType} entity: ${id}`,
        );
      }

      return deleted;
    } catch (err) {
      console.error(`[DataContext] Error removing ${entityType}/${id}:`, err);
      return false;
    }
  }, [isDataReady]);

  /**
   * Find entities matching a set of filter criteria.
   *
   * @param {string} entityType - The entity type key.
   * @param {object} [filters={}] - Filter criteria.
   * @returns {Array<object>} Array of matching entities.
   */
  const findEntities = useCallback((entityType, filters = {}) => {
    if (!isDataReady) {
      return [];
    }
    return find(entityType, filters);
  }, [isDataReady]);

  /**
   * Count entities of a given type, optionally filtered.
   *
   * @param {string} entityType - The entity type key.
   * @param {object} [filters={}] - Optional filter criteria.
   * @returns {number} The count of matching entities.
   */
  const countEntities = useCallback((entityType, filters = {}) => {
    if (!isDataReady) {
      return 0;
    }
    return count(entityType, filters);
  }, [isDataReady]);

  /**
   * Check if an entity exists by ID.
   *
   * @param {string} entityType - The entity type key.
   * @param {string} id - The entity ID.
   * @returns {boolean} True if the entity exists.
   */
  const entityExists = useCallback((entityType, id) => {
    if (!isDataReady) {
      return false;
    }
    return exists(entityType, id);
  }, [isDataReady]);

  /**
   * Create multiple entities at once.
   * Increments the data version to trigger re-renders.
   *
   * @param {string} entityType - The entity type key.
   * @param {Array<object>} entities - Array of entity data to create.
   * @param {string} [userId='system'] - The user ID performing the action.
   * @returns {Array<object>} Array of created entities.
   */
  const createManyEntities = useCallback((entityType, entities, userId = 'system') => {
    if (!isDataReady) {
      console.warn('[DataContext] Data store not ready. Cannot create entities.');
      return [];
    }

    try {
      const created = createMany(entityType, entities, userId);

      if (created.length > 0) {
        setDataVersion((prev) => prev + 1);
        logAction(
          userId,
          'Create Many',
          entityType,
          'bulk',
          `Created ${created.length} ${entityType} entities`,
        );
      }

      return created;
    } catch (err) {
      console.error(`[DataContext] Error creating multiple ${entityType} entities:`, err);
      return [];
    }
  }, [isDataReady]);

  /**
   * Update multiple entities by their IDs.
   * Increments the data version to trigger re-renders.
   *
   * @param {string} entityType - The entity type key.
   * @param {Array<{id: string, updates: object}>} updateList - Array of {id, updates} objects.
   * @param {string} [userId='system'] - The user ID performing the action.
   * @returns {Array<object>} Array of updated entities.
   */
  const updateManyEntities = useCallback((entityType, updateList, userId = 'system') => {
    if (!isDataReady) {
      console.warn('[DataContext] Data store not ready. Cannot update entities.');
      return [];
    }

    try {
      const updated = updateMany(entityType, updateList, userId);

      if (updated.length > 0) {
        setDataVersion((prev) => prev + 1);
        logAction(
          userId,
          'Update Many',
          entityType,
          'bulk',
          `Updated ${updated.length} ${entityType} entities`,
        );
      }

      return updated;
    } catch (err) {
      console.error(`[DataContext] Error updating multiple ${entityType} entities:`, err);
      return [];
    }
  }, [isDataReady]);

  /**
   * Delete multiple entities by their IDs.
   * Increments the data version to trigger re-renders.
   *
   * @param {string} entityType - The entity type key.
   * @param {Array<string>} ids - Array of entity IDs to delete.
   * @param {string} [userId='system'] - The user ID performing the action.
   * @returns {number} The number of entities deleted.
   */
  const removeManyEntities = useCallback((entityType, ids, userId = 'system') => {
    if (!isDataReady) {
      console.warn('[DataContext] Data store not ready. Cannot remove entities.');
      return 0;
    }

    try {
      const deletedCount = removeMany(entityType, ids);

      if (deletedCount > 0) {
        setDataVersion((prev) => prev + 1);
        logAction(
          userId,
          'Delete Many',
          entityType,
          'bulk',
          `Deleted ${deletedCount} ${entityType} entities`,
        );
      }

      return deletedCount;
    } catch (err) {
      console.error(`[DataContext] Error removing multiple ${entityType} entities:`, err);
      return 0;
    }
  }, [isDataReady]);

  /**
   * Simulate an API GET request for a list of entities.
   *
   * @param {string} entityType - The entity type key.
   * @param {object} [params={}] - Query parameters.
   * @returns {object} Simulated API response.
   */
  const apiGetAllEntities = useCallback((entityType, params = {}) => {
    if (!isDataReady) {
      return {
        status: 503,
        error: 'Data store not initialized',
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
    return apiGetAll(entityType, params);
  }, [isDataReady]);

  /**
   * Simulate an API GET request for a single entity by ID.
   *
   * @param {string} entityType - The entity type key.
   * @param {string} id - The entity ID.
   * @returns {object} Simulated API response.
   */
  const apiGetEntityById = useCallback((entityType, id) => {
    if (!isDataReady) {
      return {
        status: 503,
        error: 'Data store not initialized',
        data: null,
      };
    }
    return apiGetById(entityType, id);
  }, [isDataReady]);

  /**
   * Simulate an API POST request to create a new entity.
   *
   * @param {string} entityType - The entity type key.
   * @param {object} entity - The entity data to create.
   * @param {string} [userId='system'] - The user ID performing the action.
   * @returns {object} Simulated API response.
   */
  const apiCreateEntity = useCallback((entityType, entity, userId = 'system') => {
    if (!isDataReady) {
      return {
        status: 503,
        error: 'Data store not initialized',
        data: null,
      };
    }

    const response = apiCreate(entityType, entity, userId);

    if (response.status === 201) {
      setDataVersion((prev) => prev + 1);
    }

    return response;
  }, [isDataReady]);

  /**
   * Simulate an API PUT/PATCH request to update an entity.
   *
   * @param {string} entityType - The entity type key.
   * @param {string} id - The entity ID to update.
   * @param {object} updates - The fields to update.
   * @param {string} [userId='system'] - The user ID performing the action.
   * @returns {object} Simulated API response.
   */
  const apiUpdateEntity = useCallback((entityType, id, updates, userId = 'system') => {
    if (!isDataReady) {
      return {
        status: 503,
        error: 'Data store not initialized',
        data: null,
      };
    }

    const response = apiUpdate(entityType, id, updates, userId);

    if (response.status === 200) {
      setDataVersion((prev) => prev + 1);
    }

    return response;
  }, [isDataReady]);

  /**
   * Simulate an API DELETE request to remove an entity.
   *
   * @param {string} entityType - The entity type key.
   * @param {string} id - The entity ID to delete.
   * @returns {object} Simulated API response.
   */
  const apiDeleteEntity = useCallback((entityType, id) => {
    if (!isDataReady) {
      return {
        status: 503,
        error: 'Data store not initialized',
      };
    }

    const response = apiDelete(entityType, id);

    if (response.status === 200) {
      setDataVersion((prev) => prev + 1);
    }

    return response;
  }, [isDataReady]);

  /**
   * Get entity counts across all entity types.
   *
   * @returns {object} Object with entity type keys and count values.
   */
  const getEntityCountsData = useCallback(() => {
    if (!isDataReady) {
      return {};
    }
    return getEntityCounts();
  }, [isDataReady, dataVersion]);

  /**
   * Get a grouped count of entities by a specific field.
   *
   * @param {string} entityType - The entity type key.
   * @param {string} field - The field to group by.
   * @returns {object} Object with field value keys and count values.
   */
  const getGroupedCountData = useCallback((entityType, field) => {
    if (!isDataReady) {
      return {};
    }
    return getGroupedCount(entityType, field);
  }, [isDataReady, dataVersion]);

  /**
   * Get distinct values for a specific field across all entities of a type.
   *
   * @param {string} entityType - The entity type key.
   * @param {string} field - The field to extract distinct values from.
   * @returns {Array<*>} Array of distinct values, sorted.
   */
  const getDistinctValuesData = useCallback((entityType, field) => {
    if (!isDataReady) {
      return [];
    }
    return getDistinctValues(entityType, field);
  }, [isDataReady, dataVersion]);

  /**
   * Get the current store status including entity counts and initialization state.
   *
   * @returns {object} Store status object.
   */
  const getStoreStatusData = useCallback(() => {
    if (!isDataReady) {
      return {
        initialized: false,
        storageAvailable: false,
        entityCounts: {},
        timestamp: new Date().toISOString(),
      };
    }
    return getStoreStatus();
  }, [isDataReady, dataVersion]);

  /**
   * Reset all data to defaults by clearing and re-seeding the mock data store.
   * Increments the data version to trigger re-renders.
   *
   * @param {string} [userId='system'] - The user ID performing the action.
   * @returns {boolean} True if successful.
   */
  const resetData = useCallback((userId = 'system') => {
    try {
      const result = resetMockDataStore();

      if (result) {
        setDataVersion((prev) => prev + 1);
        logAction(
          userId,
          'Reset Data Store',
          'system',
          'data-store',
          'Reset all data to defaults',
        );
      }

      return result;
    } catch (err) {
      console.error('[DataContext] Error resetting data store:', err);
      return false;
    }
  }, []);

  /**
   * Force a re-render by incrementing the data version counter.
   * Useful when external operations modify localStorage directly.
   */
  const refreshData = useCallback(() => {
    setDataVersion((prev) => prev + 1);
  }, []);

  /**
   * Memoized context value to prevent unnecessary re-renders.
   */
  const contextValue = useMemo(() => ({
    isDataReady,
    isLoading,
    error,
    dataVersion,
    entityTypes: ENTITY_TYPES,
    getAll: getAllEntities,
    getById: getEntityById,
    createEntity,
    updateEntity: updateEntityData,
    removeEntity: removeEntityData,
    findEntities,
    countEntities,
    entityExists,
    createManyEntities,
    updateManyEntities,
    removeManyEntities,
    apiGetAll: apiGetAllEntities,
    apiGetById: apiGetEntityById,
    apiCreate: apiCreateEntity,
    apiUpdate: apiUpdateEntity,
    apiDelete: apiDeleteEntity,
    getEntityCounts: getEntityCountsData,
    getGroupedCount: getGroupedCountData,
    getDistinctValues: getDistinctValuesData,
    getStoreStatus: getStoreStatusData,
    resetData,
    refreshData,
  }), [
    isDataReady,
    isLoading,
    error,
    dataVersion,
    getAllEntities,
    getEntityById,
    createEntity,
    updateEntityData,
    removeEntityData,
    findEntities,
    countEntities,
    entityExists,
    createManyEntities,
    updateManyEntities,
    removeManyEntities,
    apiGetAllEntities,
    apiGetEntityById,
    apiCreateEntity,
    apiUpdateEntity,
    apiDeleteEntity,
    getEntityCountsData,
    getGroupedCountData,
    getDistinctValuesData,
    getStoreStatusData,
    resetData,
    refreshData,
  ]);

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
}

DataProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Custom hook to access the data context.
 * Must be used within a DataProvider.
 *
 * @returns {DataContextValue} The data context value.
 * @throws {Error} If used outside of a DataProvider.
 */
export function useData() {
  const context = useContext(DataContext);

  if (context === null) {
    throw new Error('useData must be used within a DataProvider. Wrap your component tree with <DataProvider>.');
  }

  return context;
}

export default DataContext;