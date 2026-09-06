import type { Squishy, SquishDeformationResult } from '../domain/squishy/model/Squishy'

export class InspectSquishyUseCase {
  press(squishy: Squishy, force: number): SquishDeformationResult {
    return squishy.press(force)
  }

  recover(squishy: Squishy, elapsedSeconds: number, currentDeformation: number): number {
    return squishy.calculateRemainingDeformation(elapsedSeconds, currentDeformation)
  }
}
