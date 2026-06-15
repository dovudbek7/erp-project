import { type ReactNode } from "react";
import { Skeleton } from "@mui/material";
import { useDelayedFlag } from "../../hooks/useDelayedFlag";

interface Props {
  loading: boolean;
  children: ReactNode;
  skeleton?: ReactNode;
  delayMs?: number;
}

// While `loading`, renders the skeleton — but only after `delayMs`, so a
// fast response never flashes a placeholder. Otherwise renders children.
function DelayedSkeleton({ loading, children, skeleton, delayMs = 200 }: Props) {
  const showSkeleton = useDelayedFlag(loading, delayMs);
  if (loading) {
    return showSkeleton ? (
      <>{skeleton ?? <Skeleton variant="rounded" height={120} />}</>
    ) : null;
  }
  return <>{children}</>;
}

export default DelayedSkeleton;
