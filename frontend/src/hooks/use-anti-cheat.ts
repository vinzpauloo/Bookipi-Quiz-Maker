// ** Anti-cheat tracking hook with focus and paste detection **

// ** React Imports **
import { useEffect, useReducer, useCallback } from 'react';

// ** Type Definitions **
import type { AntiCheatEvent, AntiCheatSummary } from '../types/quiz';

// ** Custom Hooks **
import { useRecordEvent } from './use-attempts';

type AntiCheatState = {
  events: AntiCheatEvent[];
  isWindowFocused: boolean;
};

type AntiCheatAction =
  | { type: 'BLUR' }
  | { type: 'FOCUS' }
  | { type: 'PASTE' }
  | { type: 'RESET' };

function antiCheatReducer(state: AntiCheatState, action: AntiCheatAction): AntiCheatState {
  const timestamp = Date.now();

  switch (action.type) {
    case 'BLUR':
      return {
        ...state,
        isWindowFocused: false,
        events: [...state.events, { type: 'blur', timestamp }],
      };
    
    case 'FOCUS':
      return {
        ...state,
        isWindowFocused: true,
        events: [...state.events, { type: 'focus', timestamp }],
      };
    
    case 'PASTE':
      return {
        ...state,
        events: [...state.events, { type: 'paste', timestamp }],
      };
    
    case 'RESET':
      return {
        events: [],
        isWindowFocused: true,
      };
    
    default:
      return state;
  }
}

const initialState: AntiCheatState = {
  events: [],
  isWindowFocused: true,
};

export function useAntiCheat(attemptId: number | null, enabled = true) {
  const [state, dispatch] = useReducer(antiCheatReducer, initialState);
  const recordEvent = useRecordEvent();

  const trackEvent = useCallback((eventType: string) => {
    if (attemptId) {
      recordEvent.mutate({ attemptId, event: eventType });
    }
  }, [attemptId, recordEvent]);

  useEffect(() => {
    if (!enabled || !attemptId) return;

    const handleBlur = () => {
      dispatch({ type: 'BLUR' });
      trackEvent('window blur');
    };

    const handleFocus = () => {
      dispatch({ type: 'FOCUS' });
      trackEvent('window focus');
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [enabled, attemptId, trackEvent]);

  const handlePaste = useCallback(() => {
    if (!enabled || !attemptId) return;
    
    dispatch({ type: 'PASTE' });
    trackEvent('text pasted');
  }, [enabled, attemptId, trackEvent]);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const getSummary = useCallback((): AntiCheatSummary => {
    const pasteEvents = state.events.filter(e => e.type === 'paste').length;
    
    // Count tab switches (blur events, excluding initial state)
    const blurEvents = state.events.filter(e => e.type === 'blur').length;

    return {
      tabSwitches: blurEvents,
      pasteEvents,
      events: state.events,
    };
  }, [state.events]);

  return {
    events: state.events,
    isWindowFocused: state.isWindowFocused,
    handlePaste,
    getSummary,
    reset,
  };
}

