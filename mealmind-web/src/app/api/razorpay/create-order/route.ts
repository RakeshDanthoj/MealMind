import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { OFFERINGS } from "@/services/entitlements";

type OfferingKey = keyof typeof OFFERINGS;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const offering = body.offering as OfferingKey;
    const dishId = body.dishId as string | undefined;

    if (!offering || !(offering in OFFERINGS)) {
      return NextResponse.json({ error: "Invalid offering" }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json({
        demo: true,
        offering,
        dishId: dishId || null,
        amount: OFFERINGS[offering].amountPaise,
        currency: "INR",
      });
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const order = await razorpay.orders.create({
      amount: OFFERINGS[offering].amountPaise,
      currency: "INR",
      receipt: `mm_${offering}_${Date.now()}`,
      notes: {
        offering,
        dish_id: dishId || "",
      },
    });

    return NextResponse.json({
      demo: false,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
      offering,
      dishId: dishId || null,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to create order" },
      { status: 500 }
    );
  }
}
