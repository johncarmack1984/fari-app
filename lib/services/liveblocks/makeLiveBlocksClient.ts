import { createClient } from "@liveblocks/client";

export function makeLiveBlocksClient() {
  return createClient({
    publicApiKey: true
      ? "pk_live_ISxaaHYdI1hvkYEewqHPhFWO"
      : "pk_live_ISxaaHYdI1hvkYEewqHPhFWO",
  });
}
