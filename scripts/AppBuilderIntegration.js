/*
 * AppBuilderIntegration.js
 * Handles communication with Adobe App Builder Annotation Service
 * Configured URL: https://27203-annotations-stage.adobeio-static.ne
 */

/**
 * AppBuilder Service Handler
 * Manages API calls and state synchronization with the annotation service
 */
class AppBuilderServiceHandler {
  constructor(config = {}) {
    this.appUrl = config.appUrl || 'https://27203-annotations-stage.adobeio-static.ne';
    this.apiEndpoint = config.apiEndpoint || `${this.appUrl}/api`;
    this.timeout = config.timeout || 5000;
    this.retryAttempts = config.retryAttempts || 3;
    this.retryDelay = config.retryDelay || 1000;
    this.annotationState = {};
    this.isInitialized = false;
  }

  /**
   * Initializes the service connection
   * @returns {Promise<boolean>} True if initialization successful
   */
  async initialize() {
    try {
      const response = await this.makeRequest('POST', '/initialize', {
        clientId: this.getClientId(),
        timestamp: new Date().toISOString()
      });
      this.isInitialized = true;
      console.log('AppBuilder service initialized:', response);
      return true;
    } catch (error) {
      console.error('Failed to initialize AppBuilder service:', error);
      return false;
    }
  }

  /**
   * Makes an API request to the App Builder service with retry logic
   * @param {string} method - HTTP method
   * @param {string} endpoint - API endpoint path
   * @param {Object} data - Request data
   * @param {number} attempt - Current retry attempt
   * @returns {Promise<Object>} Response data
   */
  async makeRequest(method, endpoint, data = {}, attempt = 1) {
    try {
      const url = `${this.apiEndpoint}${endpoint}`;
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthToken(),
          'X-Client-ID': this.getClientId(),
          'X-Request-ID': this.generateRequestId()
        },
        timeout: this.timeout
      };

      if (method !== 'GET' && Object.keys(data).length > 0) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (attempt < this.retryAttempts) {
        console.warn(`Request failed (attempt ${attempt}/${this.retryAttempts}), retrying...`);
        await this.delay(this.retryDelay);
        return this.makeRequest(method, endpoint, data, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Updates annotation state in the App Builder service
   * @param {Object} annotationData - Annotation data to update
   * @returns {Promise<Object>} Updated annotation response
   */
  async updateAnnotation(annotationData) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const payload = {
      annotationId: this.generateAnnotationId(),
      data: annotationData,
      timestamp: new Date().toISOString(),
      userId: this.getUserId()
    };

    try {
      const response = await this.makeRequest('PUT', '/annotations', payload);
      this.annotationState = { ...this.annotationState, ...annotationData };
      console.log('Annotation updated successfully:', response);
      return response;
    } catch (error) {
      console.error('Failed to update annotation:', error);
      throw error;
    }
  }

  /**
   * Retrieves annotation state from the service
   * @param {string} annotationId - ID of annotation to retrieve
   * @returns {Promise<Object>} Annotation data
   */
  async getAnnotation(annotationId) {
    try {
      const response = await this.makeRequest('GET', `/annotations/${annotationId}`);
      return response;
    } catch (error) {
      console.error('Failed to retrieve annotation:', error);
      return null;
    }
  }

  /**
   * Syncs local state with remote service
   * @returns {Promise<void>}
   */
  async syncState() {
    try {
      const response = await this.updateAnnotation(this.annotationState);
      console.log('State synced with remote service:', response);
    } catch (error) {
      console.error('Failed to sync state:', error);
    }
  }

  /**
   * Gets the authorization token (mock implementation)
   * @returns {string} Auth token
   */
  getAuthToken() {
    return localStorage.getItem('appbuilder_token') || 'Bearer mock-token';
  }

  /**
   * Gets unique client ID
   * @returns {string} Client ID
   */
  getClientId() {
    if (!window.__CLIENT_ID__) {
      window.__CLIENT_ID__ = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    return window.__CLIENT_ID__;
  }

  /**
   * Gets current user ID
   * @returns {string} User ID
   */
  getUserId() {
    return sessionStorage.getItem('userId') || this.getClientId();
  }

  /**
   * Generates unique annotation ID
   * @returns {string} Annotation ID
   */
  generateAnnotationId() {
    return `annotation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generates unique request ID for tracking
   * @returns {string} Request ID
   */
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Utility delay function for retry logic
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise<void>}
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Global singleton instance
let appBuilderInstance = null;

/**
 * Gets or creates the AppBuilder service instance
 * @param {Object} config - Configuration options
 * @returns {AppBuilderServiceHandler} Service handler instance
 */
export function getAppBuilderService(config = {}) {
  if (!appBuilderInstance) {
    appBuilderInstance = new AppBuilderServiceHandler(config);
  }
  return appBuilderInstance;
}

/**
 * Initializes and returns the AppBuilder service
 * @returns {Promise<AppBuilderServiceHandler>} Initialized service handler
 */
export async function initializeAppBuilderService() {
  const service = getAppBuilderService();
  await service.initialize();
  return service;
}

export default AppBuilderServiceHandler;
