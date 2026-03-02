/*
 * AnnotationPanel.js
 * Integrates with Adobe App Builder Annotation Service
 * App URL: https://27203-annotations-stage.adobeio-static.ne
 * This module loads custom annotation components with checkboxes
 */

import { loadScript } from './aem.js';
import { initializeAppBuilderService } from './AppBuilderIntegration.js';

const APP_BUILDER_URL = 'https://27203-annotations-stage.adobeio-static.ne';

/**
 * Annotation Panel Configuration
 * Defines the two custom checkbox components for annotations
 */
const annotationConfig = {
  components: [
    {
      id: 'annotation-checkbox-1',
      type: 'checkbox',
      label: 'Mark as Important',
      description: 'Flag this annotation as important',
      defaultValue: false,
      name: 'isImportant'
    },
    {
      id: 'annotation-checkbox-2',
      type: 'checkbox',
      label: 'Request Review',
      description: 'Request review for this annotation',
      defaultValue: false,
      name: 'needsReview'
    }
  ]
};

let appBuilderService = null;

/**
 * Loads the App Builder annotation service
 * @returns {Promise<void>}
 */
async function loadAnnotationService() {
  try {
    appBuilderService = await initializeAppBuilderService({
      appUrl: APP_BUILDER_URL,
      apiEndpoint: `${APP_BUILDER_URL}/api`,
      timeout: 5000,
      retryAttempts: 3
    });
    console.log('Annotation service loaded and initialized successfully');
  } catch (error) {
    console.error('Failed to load annotation service:', error);
  }
}

/**
 * Initializes the AnnotationPanel with custom components
 * Sets up the checkbox components for annotation management
 */
export async function initializeAnnotationPanel() {
  try {
    // Load the App Builder annotation service
    await loadAnnotationService();

    // Initialize the annotation panel container
    const panelContainer = document.getElementById('annotation-panel') || createPanelContainer();
    
    // Render the checkbox components
    annotationConfig.components.forEach((component) => {
      renderCheckboxComponent(panelContainer, component);
    });

    console.log('AnnotationPanel initialized with custom components');
    return panelContainer;
  } catch (error) {
    console.error('Error initializing AnnotationPanel:', error);
  }
}

/**
 * Creates the main annotation panel container
 * @returns {HTMLElement} The panel container element
 */
function createPanelContainer() {
  const container = document.createElement('div');
  container.id = 'annotation-panel';
  container.className = 'annotation-panel';
  container.setAttribute('data-aue-type', 'annotation-panel');
  document.body.appendChild(container);
  return container;
}

/**
 * Renders a checkbox component within the annotation panel
 * @param {HTMLElement} container - The parent container
 * @param {Object} component - Component configuration object
 */
function renderCheckboxComponent(container, component) {
  const componentWrapper = document.createElement('div');
  componentWrapper.className = 'annotation-component';
  componentWrapper.setAttribute('data-component-id', component.id);

  // Create label
  const label = document.createElement('label');
  label.htmlFor = component.id;
  label.className = 'annotation-label';
  label.textContent = component.label;

  // Create checkbox input
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = component.id;
  checkbox.name = component.name;
  checkbox.className = 'annotation-checkbox';
  checkbox.checked = component.defaultValue;
  checkbox.addEventListener('change', (e) => {
    handleCheckboxChange(component.name, e.target.checked);
  });

  // Create description
  const description = document.createElement('span');
  description.className = 'annotation-description';
  description.textContent = component.description;

  // Append elements
  componentWrapper.appendChild(checkbox);
  componentWrapper.appendChild(label);
  componentWrapper.appendChild(description);

  container.appendChild(componentWrapper);
}

/**
 * Handles checkbox change events
 * Syncs the annotation state with the App Builder service
 * @param {string} componentName - The name of the component
 * @param {boolean} value - The new checkbox value
 */
async function handleCheckboxChange(componentName, value) {
  const annotationState = {
    [componentName]: value,
    timestamp: new Date().toISOString()
  };

  // Send to App Builder annotation service
  if (appBuilderService) {
    try {
      const response = await appBuilderService.updateAnnotation(annotationState);
      console.log('Annotation updated via App Builder:', response);
      // Add success animation
      const panel = document.getElementById('annotation-panel');
      if (panel) {
        panel.classList.add('success');
        setTimeout(() => panel.classList.remove('success'), 500);
      }
    } catch (error) {
      console.error('Failed to update annotation via App Builder:', error);
      // Fallback to session storage
      saveAnnotationStateLocally(annotationState);
    }
  } else {
    // Fallback: store in session storage if service not available
    saveAnnotationStateLocally(annotationState);
  }
}

/**
 * Saves annotation state to local storage
 * @param {Object} annotationState - State to save
 */
function saveAnnotationStateLocally(annotationState) {
  const existingState = JSON.parse(sessionStorage.getItem('annotationState') || '{}');
  const newState = { ...existingState, ...annotationState };
  sessionStorage.setItem('annotationState', JSON.stringify(newState));
  console.log('Annotation state saved to session:', newState);
}

/**
 * Retrieves current annotation state
 * @returns {Object} Current annotation state
 */
export function getAnnotationState() {
  if (appBuilderService) {
    return appBuilderService.annotationState;
  }
  return JSON.parse(sessionStorage.getItem('annotationState') || '{}');
}

/**
 * Resets the annotation panel checkboxes to default values
 */
export function resetAnnotationPanel() {
  annotationConfig.components.forEach((component) => {
    const checkbox = document.getElementById(component.id);
    if (checkbox) {
      checkbox.checked = component.defaultValue;
    }
  });
  sessionStorage.removeItem('annotationState');
  if (appBuilderService) {
    appBuilderService.annotationState = {};
  }
  console.log('AnnotationPanel reset to default state');
}

/**
 * Gets the App Builder URL configuration
 * @returns {string} The App Builder URL
 */
export function getAppBuilderURL() {
  return APP_BUILDER_URL;
}

/**
 * Gets the AppBuilder service instance
 * @returns {Object} AppBuilder service
 */
export function getAppBuilderService() {
  return appBuilderService;
}

export default {
  initializeAnnotationPanel,
  getAnnotationState,
  resetAnnotationPanel,
  getAppBuilderURL,
  getAppBuilderService
};
