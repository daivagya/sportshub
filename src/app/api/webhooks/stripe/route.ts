import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  confirmBookingFromStripeSession,
  cancelPendingBookingBySession,
} from "@/app/(user)/_userActions/booking.actions";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new NextResponse("Missing stripe-signature header", { status: 400 });
  }

  const body = await req.text(); // ✅ must use raw body
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("[Webhook] Signature verification failed:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const result = await confirmBookingFromStripeSession(session);
        if (!result.success) {
          console.error("[Webhook] Failed to confirm booking:", result.error);
        }
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const result = await cancelPendingBookingBySession(session);
        if (!result.success) {
          console.error("[Webhook] Failed to cancel booking:", result.error);
        }
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    // ✅ Always acknowledge to Stripe
    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("[Webhook] Handler error:", err);
    return new NextResponse("Webhook handler error", { status: 500 });
  }
}
