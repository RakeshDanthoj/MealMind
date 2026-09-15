import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

/**
 * Razorpay webhook — grants entitlements only after signature verification.
 * Persist to `entitlements` / `payments` tables when Supabase service role is configured.
 */
export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const body = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!secret) {
    return NextResponse.json(
      { error: "RAZORPAY_WEBHOOK_SECRET is not configured" },
      { status: 503 }
    );
  }

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const expected = createHmac("sha256", secret).update(body).digest("hex");
  const valid =
    expected.length === signature.length &&
    timingSafeEqual(Buffer.from(expected), Buffer.from(signature));

  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(body) as {
    event?: string;
    payload?: {
      payment?: {
        entity?: {
          id?: string;
          notes?: { offering?: string; dish_id?: string; user_id?: string };
          amount?: number;
        };
      };
    };
  };

  if (payload.event !== "payment.captured") {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const payment = payload.payload?.payment?.entity;
  const offering = payment?.notes?.offering;
  const dishId = payment?.notes?.dish_id || null;
  const userId = payment?.notes?.user_id || null;

  // Service-role persistence hook (optional until secrets are wired)
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (serviceKey && supabaseUrl && userId && offering) {
    const startsAt = new Date().toISOString();
    const ends = new Date();
    if (offering === "pro_monthly" || offering === "plan_monthly") ends.setDate(ends.getDate() + 30);
    if (offering === "plan_weekly") ends.setDate(ends.getDate() + 7);

    await fetch(`${supabaseUrl}/rest/v1/payments`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        provider_payment_id: payment?.id,
        user_id: userId,
        offering,
        amount_paise: payment?.amount,
        status: "captured",
      }),
    });

    await fetch(`${supabaseUrl}/rest/v1/entitlements`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        user_id: userId,
        kind: offering === "recipe" ? "recipe_unlock" : offering,
        dish_id: dishId,
        starts_at: startsAt,
        ends_at: offering === "recipe" ? null : ends.toISOString(),
        source: "razorpay_webhook",
      }),
    });
  }

  return NextResponse.json({
    ok: true,
    granted: Boolean(offering),
    offering,
    dishId,
    userId,
  });
}
