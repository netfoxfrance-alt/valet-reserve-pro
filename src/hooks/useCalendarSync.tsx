import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'calendar_synced_appointments';

/**
 * Hook to track which appointments have been added to Google Calendar
 * Uses localStorage for persistence across sessions
 */
export function useCalendarSync() {
  const [syncedIds, setSyncedIds] = useState<Set<string>>(new Set());

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSyncedIds(new Set(parsed));
        }
      }
    } catch (e) {
      console.warn('Failed to load calendar sync state:', e);
    }
  }, []);

  // Save to localStorage whenever syncedIds changes
  const saveToStorage = useCallback((ids: Set<string>) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
    } catch (e) {
      console.warn('Failed to save calendar sync state:', e);
    }
  }, []);

  // Mark an appointment as synced to calendar
  const markAsSynced = useCallback((appointmentId: string) => {
    setSyncedIds(prev => {
      const next = new Set(prev);
      next.add(appointmentId);
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  // Check if an appointment has been synced
  const isSynced = useCallback((appointmentId: string) => {
    return syncedIds.has(appointmentId);
  }, [syncedIds]);

  // Remove a synced appointment (e.g., if cancelled)
  const removeSynced = useCallback((appointmentId: string) => {
    setSyncedIds(prev => {
      const next = new Set(prev);
      next.delete(appointmentId);
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  // Clean up old synced IDs (optional - remove IDs for appointments that no longer exist)
  const cleanupOldIds = useCallback((validAppointmentIds: string[]) => {
    setSyncedIds(prev => {
      const validSet = new Set(validAppointmentIds);
      const next = new Set([...prev].filter(id => validSet.has(id)));
      if (next.size !== prev.size) {
        saveToStorage(next);
      }
      return next;
    });
  }, [saveToStorage]);

  return {
    syncedIds,
    markAsSynced,
    isSynced,
    removeSynced,
    cleanupOldIds,
  };
}
