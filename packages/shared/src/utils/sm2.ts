export interface SM2Result {
  easeFactor: number
  interval: number
  repetitions: number
}

export function sm2(
  quality: number,
  prevEaseFactor: number,
  prevInterval: number,
  prevRepetitions: number
): SM2Result {
  let easeFactor = prevEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  if (easeFactor < 1.3) easeFactor = 1.3

  let interval: number
  let repetitions: number

  if (quality < 3) {
    repetitions = 0
    interval = 1
  } else {
    repetitions = prevRepetitions + 1
    if (repetitions === 1) interval = 1
    else if (repetitions === 2) interval = 6
    else interval = Math.round(prevInterval * easeFactor)
  }

  return { easeFactor, interval, repetitions }
}

export function qualityFromButtons(button: 'forgot' | 'hard' | 'good' | 'easy'): number {
  const map = { forgot: 1, hard: 3, good: 4, easy: 5 }
  return map[button]
}
