"use client";

import type { ComponentProps, Ref } from "react";

import { trackEvent, type AnalyticsEventParams } from "./track";

type Props = ComponentProps<"a"> & {
  event: string;
  params?: AnalyticsEventParams;
  ref?: Ref<HTMLAnchorElement>;
};

/**
 * A plain anchor that fires a GA event before behaving as a normal link.
 * Usable inside Server Components (unlike an inline `onClick`), so contact and
 * outbound links can be tracked without turning whole pages into client trees.
 */
export function TrackedLink({
  event,
  params,
  onClick,
  children,
  ...rest
}: Props) {
  return (
    <a
      {...rest}
      onClick={(e) => {
        trackEvent(event, params);
        onClick?.(e);
      }}
    >
      {children}
    </a>
  );
}
