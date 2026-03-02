// add delayed functionality here

// Initialize Annotation Panel
import { initializeAnnotationPanel } from './AnnotationPanel.js';

(async () => {
  try {
    await initializeAnnotationPanel();
  } catch (error) {
    console.error('Failed to initialize annotation panel:', error);
  }
})();
