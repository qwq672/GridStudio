import { useEffect, useRef } from 'react';
import { saveAutosave, addRecentProject } from './useProject';

export function useAutoSave(projectData, settings, onSaveComplete) {
  const { enabled, intervalType, customSeconds } = settings;
  const timerRef = useRef(null);
  const lastSavedDataRef = useRef(null);

  // 立即保存当前工程
  const saveNow = () => {
    if (!projectData) return;
    const dataToSave = {
      ...projectData,
      savedAt: Date.now(),
    };
    saveAutosave(dataToSave);
    addRecentProject({ id: 'autosave', title: dataToSave.meta?.title || '未命名工程', timestamp: Date.now() });
    if (onSaveComplete) onSaveComplete();
    lastSavedDataRef.current = JSON.stringify(projectData);
  };

  // 根据设置更新定时器
  useEffect(() => {
    if (!enabled) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    let intervalMs = 0;
    switch (intervalType) {
      case 'onChange': return; // 随改动自动保存会在下面的 useEffect 中监听变化
      case 'minute': intervalMs = 60 * 1000; break;
      case 'hour': intervalMs = 60 * 60 * 1000; break;
      case 'custom': intervalMs = Math.min(24 * 60 * 60, Math.max(1, customSeconds)) * 1000; break;
      default: intervalMs = 30 * 1000;
    }

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      saveNow();
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [enabled, intervalType, customSeconds]);

  // 随改动自动保存：监听 projectData 变化
  useEffect(() => {
    if (!enabled || intervalType !== 'onChange') return;
    const currentStr = JSON.stringify(projectData);
    if (lastSavedDataRef.current !== currentStr) {
      saveNow();
    }
  }, [projectData, enabled, intervalType]);

  return { saveNow };
}