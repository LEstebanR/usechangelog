import { CustomerPortal } from "@polar-sh/nextjs";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { polarConfig } from "@/lib/billing/polar";
import { requireWorkspace } from "@/lib/workspace/server";

// Polar's customer portal (#17): change the card, cancel, see invoices. Always the session
// workspace's customer. Without one there is nothing to manage, so back to billing.
// What changes there reaches us through the webhook (#15), not on the way back.
export async function GET(request: NextRequest) {
  const workspace = await requireWorkspace();
  const customerId = workspace.polarCustomerId;
  if (!customerId) redirect("/app/billing");

  const { accessToken, environment } = polarConfig();
  return CustomerPortal({
    accessToken,
    environment,
    returnUrl: `${request.nextUrl.origin}/app/billing`,
    getCustomerId: async () => customerId,
  })(request);
}
