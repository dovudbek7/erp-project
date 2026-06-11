import { useEffect, useState } from "react";

// Returns true only once `active` has stayed true for `delayMs`. Lets us
// avoid flashing a skeleton/spinner for requests that resolve almost instantly.
export function useDelayedFlag(active: boolean, delayMs = 200) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!active) {
      setShow(false);
      return;
    }
    const id = setTimeout(() => setShow(true), delayMs);
    return () => clearTimeout(id);
  }, [active, delayMs]);
  return show;
}

export default useDelayedFlag;
