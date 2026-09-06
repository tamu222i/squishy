/**
 * Calculates deformation state progression over time.
 * When pressing (targetForce > 0), squish deepens based on softness.
 * When releasing (targetForce === 0), squish recovers based on slowRisingRate.
 */
export function calculateSquishDeformationProgress(
  currentDeformation: number,
  targetForce: number,
  deltaTimeSeconds: number,
  softness: number = 0.5,
  slowRisingRate: number = 0.5
): number {
  if (targetForce > 0) {
    // Pressing down: transition towards target deformation
    const targetDeformation = Math.min(1.0, targetForce * (0.6 + softness * 0.4))
    const pressSpeed = 8.0 // fast response to fingers
    const step = (targetDeformation - currentDeformation) * Math.min(1.0, deltaTimeSeconds * pressSpeed)
    return Math.min(1.0, Math.max(0, currentDeformation + step))
  } else {
    // Slow-rising recovery:
    // slowRisingRate = 1.0 -> slow recovery (takes ~4s)
    // slowRisingRate = 0.0 -> fast recovery (takes ~0.3s)
    const recoveryRate = Math.max(0.2, (1.05 - slowRisingRate) * 2.0)
    const step = deltaTimeSeconds * recoveryRate
    return Math.max(0, currentDeformation - step)
  }
}
