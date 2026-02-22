import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createRegistrationPayment } from "@/lib/actions/subscription-actions";

const paySchema = z.object({
  tournament_id: z.string().uuid(),
  school_id: z.string().uuid(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const parsed = paySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const result = await createRegistrationPayment(
      parsed.data.tournament_id,
      parsed.data.school_id
    );

    if ("error" in result && result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Tournament payment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
