import { CustomerPortal } from "@polar-sh/nextjs";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { polarConfig } from "@/lib/billing/polar";
import { getOrigin } from "@/lib/site";
import { getCurrentAccount } from "@/lib/workspace/server";

// Polar's customer portal (#17): change the card, cancel, see invoices. Always the session
// account's customer (#65). Without one there is nothing to manage, so back to billing.
// What changes there reaches us through the webhook (#15), not on the way back.
export async function GET(request: NextRequest) {
  const customerId = (await getCurrentAccount())?.polarCustomerId;
  if (!customerId) redirect("/app/billing");

  const { accessToken, environment } = polarConfig();
  return CustomerPortal({
    accessToken,
    environment,
    returnUrl: `${await getOrigin()}/app/billing`,
    getCustomerId: async () => customerId,
  })(request);
}
