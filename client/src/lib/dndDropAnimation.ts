import { defaultDropAnimation } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

/** Drop animation matching dnd-kit defaults (250ms) without scale shrink on release. */
export const taskDropAnimation = {
  ...defaultDropAnimation,
  keyframes({ transform }: Parameters<NonNullable<typeof defaultDropAnimation.keyframes>>[0]) {
    return [
      { transform: CSS.Transform.toString(transform.initial) },
      {
        transform: CSS.Transform.toString({
          x: transform.final.x,
          y: transform.final.y,
          scaleX: 1,
          scaleY: 1,
        }),
      },
    ];
  },
};
