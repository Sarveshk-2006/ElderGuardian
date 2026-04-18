import { useState, useEffect } from 'react';
import { Accelerometer } from 'expo-sensors';

export function useFallDetection(onFallDetected) {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let subscription = null;

    if (isActive) {
      // Set the update interval roughly to 50ms for high resolution detection
      Accelerometer.setUpdateInterval(50);
      
      let lastTriggerTime = 0;
      let fallPhase = 'normal';
      let freefallTimer = null;
      const COOLDOWN_MS = 3000;

      const triggerFall = (magnitude, type = 'impact') => {
        const now = Date.now();
        if (now - lastTriggerTime < COOLDOWN_MS) return;
        lastTriggerTime = now;

        if (onFallDetected) {
          onFallDetected({
            magnitude,
            timestamp: new Date().toISOString(),
            type
          });
        }
      };

      subscription = Accelerometer.addListener(accelerometerData => {
        const { x, y, z } = accelerometerData;
        const magnitude = Math.sqrt(x * x + y * y + z * z);

        // Phase 1: Detect free-fall (close to 0g)
        if (magnitude < 0.4 && fallPhase === 'normal') {
          fallPhase = 'freefall';
          freefallTimer = setTimeout(() => {
            if (fallPhase === 'freefall') fallPhase = 'normal';
          }, 1500);
        }

        // Phase 2: Detect Heavy Impact (Spike in G-forces after freefall)
        if (magnitude > 2.8 && fallPhase === 'freefall') {
          fallPhase = 'normal';
          if (freefallTimer) clearTimeout(freefallTimer);
          triggerFall(magnitude, 'physical_fall');
        }

        // --- Shake-to-Detect (Simulation/Emergency Override) ---
        // If the user shakes the phone violently (magnitude > 4.5), trigger immediately.
        if (magnitude > 4.8) {
          triggerFall(magnitude, 'shake_simulated');
        }
      });
    }

    return () => {
      if (subscription) subscription.remove();
    };
  }, [isActive, onFallDetected]);

  return {
    isMonitoring: isActive,
    startMonitoring: () => setIsActive(true),
    stopMonitoring: () => setIsActive(false),
  };
}
