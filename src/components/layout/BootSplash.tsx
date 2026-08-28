import { useEffect } from "react";
import { dismissBootSplash } from "@/lib/bootSplash";

/** Fades out the static boot splash once the app shell has mounted. */
export default function BootSplash() {
  useEffect(() => {
    dismissBootSplash();
  }, []);

  return null;
}
