import { useEffect, useRef, useCallback } from 'react';
import { saveAutosave, addRecentProject } from './useProject';

export function useAutoSave(getProjectData, autoSaveMode) {
  const lastSavedDataRef = useRef(null);
  const timerRef = useRef(null);

  const triggerAutoSave = useCallback(() => {
    const data = getProjectData();
    if (!data) return;
    const dataToSave = { ...data, savedAt: Date.now() };
    saveAutosave(dataToSave);
    addRecentProject({ id: 'autosave', title: data.meta?.title || '未命名工程', timestamp: Date.now() });
    lastSavedDataRef.current = JSON.stringify(data);
  }, [getProjectData]);

  useEffect(() => {
    if (autoSaveMode.type === 'interval' && autoSaveMode.interval > 0) {
      timerRef.current = setInterval(triggerAutoSave, autoSaveMode.interval * 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [autoSaveMode, triggerAutoSave]);

  return { triggerAutoSave };
}
