// FILE: components/system/useTubesScrollState.ts
'use client';

import { useMemo } from 'react';
import { useScrollSteps } from './ScrollProgressProvider';
import type { ScrollStep } from './scrollTimeline';

export type TubesMode = 'hero' | 'about' | 'what' | 'work';

export type TubesScrollState = {
  step: ScrollStep;
  mode: TubesMode;
};

/**
 * Map the global scroll step into a simpler tubes "mode"
 * so the Three.js system can switch colors / uniforms.
 */
export function useTubesScrollState(): TubesScrollState {
  const { step } = useScrollSteps();

  const mode: TubesMode = useMemo(() => {
    if (
      step === 'about_intro' ||
      step === 'about_p1' ||
      step === 'about_p2' ||
      step === 'about_p3'
    ) {
      return 'about';
    }

    if (
      step === 'what_intro' ||
      step === 'what_p1' ||
      step === 'what_p2' ||
      step === 'what_p3'
    ) {
      return 'what';
    }

    if (step === 'work_intro') {
      return 'work';
    }

    // default: hero
    return 'hero';
  }, [step]);

  return { step, mode };
}
