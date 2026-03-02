/*
 * AnnotationPanelExamples.js
 * Usage examples for the Annotation Panel integration
 * 
 * This file demonstrates various ways to interact with the annotation panel
 * and the App Builder service.
 */

// Example 1: Basic initialization and state retrieval
export async function example1_basicUsage() {
  const { initializeAnnotationPanel, getAnnotationState } = await import('./AnnotationPanel.js');
  
  // Initialize the panel
  const panel = await initializeAnnotationPanel();
  console.log('Panel initialized:', panel);
  
  // Get current state after some interaction
  setTimeout(() => {
    const state = getAnnotationState();
    console.log('Current annotation state:', state);
  }, 2000);
}

// Example 2: Working with the App Builder service directly
export async function example2_appBuilderService() {
  const { getAppBuilderService } = await import('./AnnotationPanel.js');
  
  const service = getAppBuilderService();
  
  if (service) {
    try {
      // Update annotation with custom data
      const response = await service.updateAnnotation({
        isImportant: true,
        needsReview: false,
        priority: 'high',
        assignedTo: 'john.doe@example.com'
      });
      console.log('Annotation updated:', response);
    } catch (error) {
      console.error('Failed to update:', error);
    }
  }
}

// Example 3: Listening to checkbox changes
export function example3_changeListener() {
  const importantCheckbox = document.getElementById('annotation-checkbox-1');
  const reviewCheckbox = document.getElementById('annotation-checkbox-2');
  
  if (importantCheckbox) {
    importantCheckbox.addEventListener('change', (e) => {
      console.log('Important flag changed to:', e.target.checked);
      
      // Perform custom action when checkbox changes
      if (e.target.checked) {
        console.log('This item has been marked as important');
        // Example: Save to external system, send notification, etc.
      }
    });
  }
  
  if (reviewCheckbox) {
    reviewCheckbox.addEventListener('change', (e) => {
      console.log('Review request changed to:', e.target.checked);
      
      if (e.target.checked) {
        console.log('Review has been requested');
        // Example: Send notification to team, create ticket, etc.
      }
    });
  }
}

// Example 4: Resetting and managing panel state
export async function example4_stateManagement() {
  const { resetAnnotationPanel, getAnnotationState } = await import('./AnnotationPanel.js');
  
  console.log('Before reset:', getAnnotationState());
  
  // Reset the panel after some operation
  resetAnnotationPanel();
  
  console.log('After reset:', getAnnotationState());
}

// Example 5: Conditional logic based on annotation state
export async function example5_conditionalLogic() {
  const { getAnnotationState } = await import('./AnnotationPanel.js');
  
  // Check annotation state and perform different actions
  const state = getAnnotationState();
  
  if (state.isImportant && state.needsReview) {
    console.log('Item is important AND needs review - high priority!');
    // High priority workflow
  } else if (state.isImportant) {
    console.log('Item is important but does not need review');
    // Standard priority workflow
  } else if (state.needsReview) {
    console.log('Item needs review but is not important');
    // Review workflow
  } else {
    console.log('Item is normal priority');
    // Standard workflow
  }
}

// Example 6: Bulk annotation updates
export async function example6_bulkUpdate() {
  const { getAppBuilderService } = await import('./AnnotationPanel.js');
  
  const service = getAppBuilderService();
  
  if (service) {
    const items = [
      { id: 1, isImportant: true, needsReview: false },
      { id: 2, isImportant: false, needsReview: true },
      { id: 3, isImportant: true, needsReview: true }
    ];
    
    try {
      for (const item of items) {
        await service.updateAnnotation({
          itemId: item.id,
          isImportant: item.isImportant,
          needsReview: item.needsReview
        });
        console.log(`Updated item ${item.id}`);
      }
    } catch (error) {
      console.error('Bulk update failed:', error);
    }
  }
}

// Example 7: Syncing state with server
export async function example7_syncWithServer() {
  const { getAppBuilderService } = await import('./AnnotationPanel.js');
  
  const service = getAppBuilderService();
  
  if (service) {
    // Set up periodic sync every 30 seconds
    setInterval(async () => {
      try {
        await service.syncState();
        console.log('State synced with server');
      } catch (error) {
        console.error('Sync failed:', error);
      }
    }, 30000);
  }
}

// Example 8: Error handling and retry logic
export async function example8_errorHandling() {
  const { getAppBuilderService } = await import('./AnnotationPanel.js');
  
  const service = getAppBuilderService();
  
  if (service) {
    try {
      const response = await service.updateAnnotation({
        isImportant: true
      });
      console.log('Success:', response);
    } catch (error) {
      console.error('Error occurred:', error.message);
      console.log('Annotation was saved to local storage as fallback');
      
      // Manually retry after delay
      setTimeout(async () => {
        try {
          await service.syncState();
          console.log('Retry successful');
        } catch (retryError) {
          console.error('Retry also failed:', retryError);
        }
      }, 5000);
    }
  }
}

// Example 9: Integrating with page/document context
export async function example9_contextIntegration() {
  const { getAnnotationState } = await import('./AnnotationPanel.js');
  
  // Get current page/document context
  const pageTitle = document.title;
  const pageURL = window.location.href;
  const annotationState = getAnnotationState();
  
  // Create enriched annotation with context
  const contextualAnnotation = {
    pageTitle,
    pageURL,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    ...annotationState
  };
  
  console.log('Contextual annotation:', contextualAnnotation);
  
  // Send to server with context
  const { getAppBuilderService } = await import('./AnnotationPanel.js');
  const service = getAppBuilderService();
  
  if (service) {
    await service.updateAnnotation(contextualAnnotation);
  }
}

// Example 10: Creating custom UI based on annotation state
export async function example10_customUI() {
  const { getAnnotationState } = await import('./AnnotationPanel.js');
  
  function updateUIBasedOnAnnotations() {
    const state = getAnnotationState();
    
    // Create status badge
    const badge = document.createElement('div');
    badge.className = 'annotation-status-badge';
    
    if (state.isImportant) {
      badge.textContent = '⭐ Important';
      badge.className += ' important';
    } else if (state.needsReview) {
      badge.textContent = '👁️ Needs Review';
      badge.className += ' review';
    } else {
      badge.textContent = '✓ Standard';
      badge.className += ' standard';
    }
    
    // Update page header or widget
    const header = document.querySelector('header');
    if (header && !document.querySelector('.annotation-status-badge')) {
      header.appendChild(badge);
    }
  }
  
  // Initial update
  updateUIBasedOnAnnotations();
  
  // Listen for changes
  const important = document.getElementById('annotation-checkbox-1');
  const review = document.getElementById('annotation-checkbox-2');
  
  if (important) {
    important.addEventListener('change', updateUIBasedOnAnnotations);
  }
  if (review) {
    review.addEventListener('change', updateUIBasedOnAnnotations);
  }
}

// Export all examples for testing
export default {
  example1_basicUsage,
  example2_appBuilderService,
  example3_changeListener,
  example4_stateManagement,
  example5_conditionalLogic,
  example6_bulkUpdate,
  example7_syncWithServer,
  example8_errorHandling,
  example9_contextIntegration,
  example10_customUI
};

// Usage in console:
// import examples from './scripts/AnnotationPanelExamples.js';
// examples.example1_basicUsage();
