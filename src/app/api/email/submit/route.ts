import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_KEY);

interface Recommendation {
  name: string;
  brand: string;
  imageUrl: string;
  mainAccords: string[];
  score: number;
  matchReason: string;
}

interface ScentProfile {
  accords: string[];
  style: {
    feminine: number;
    masculine: number;
    modern: number;
    classic: number;
  };
  reasoning: string;
}

interface SubmitEmailRequest {
  email: string;
  styleLabel: string;
  scentProfile: ScentProfile;
  recommendations: Recommendation[];
  selectedOutfits: Array<{ brand: string; season: string; imageUrl: string }>;
}

/**
 * POST /api/email/submit
 * Validates email and sends results via Resend
 */
export async function POST(request: Request) {
  try {
    const body: SubmitEmailRequest = await request.json();
    const { email, styleLabel, scentProfile, recommendations, selectedOutfits } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Generate email HTML
    const emailHtml = generateResultsEmailHtml({
      styleLabel,
      scentProfile,
      recommendations,
      selectedOutfits,
    });

    // Send email via Resend
    const { error } = await resend.emails.send({
      from: "Let Us Scent You <noreply@getstuff.city>",
      to: normalizedEmail,
      subject: `You are ${styleLabel}`,
      html: emailHtml,
    });

    if (error) {
      console.error("[Email Submit] Resend error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Email Submit] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit email" },
      { status: 500 }
    );
  }
}

function generateResultsEmailHtml({
  styleLabel,
  scentProfile,
  recommendations,
  selectedOutfits,
}: {
  styleLabel: string;
  scentProfile: ScentProfile;
  recommendations: Recommendation[];
  selectedOutfits: Array<{ brand: string; season: string; imageUrl: string }>;
}): string {
  const topPerfume = recommendations[0];
  const otherPerfumes = recommendations.slice(1);
  const topStyle = Object.entries(scentProfile.style).sort((a, b) => b[1] - a[1])[0][0];

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Scent Profile</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background-color: #000000; padding: 40px 24px; text-align: center;">
      <p style="color: #ffffff; font-size: 14px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 2px;">Your Scent Profile</p>
      <h1 style="color: #ffffff; font-size: 32px; font-family: Georgia, serif; margin: 0;">
        you are ${styleLabel.toLowerCase()}
      </h1>
    </div>

    <!-- Your Vibe Section -->
    <div style="padding: 32px 24px; border-bottom: 1px solid #eee;">
      <p style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px 0;">Your top notes</p>
      <div style="margin-bottom: 16px;">
        ${scentProfile.accords.map(accord => `
          <span style="display: inline-block; padding: 6px 12px; margin: 4px; background-color: #f5f5f5; border-radius: 20px; font-size: 14px;">${accord}</span>
        `).join('')}
      </div>
      <p style="font-size: 14px; color: #666; margin: 0; text-transform: capitalize;">
        Your top style is: ${topStyle}
      </p>
    </div>

    <!-- Top Recommendation -->
    <div style="padding: 32px 24px; text-align: center; background-color: #fafafa;">
      <p style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px 0;">Your #1 Match</p>
      ${topPerfume.imageUrl ? `
        <img src="${topPerfume.imageUrl}" alt="${topPerfume.name}" style="width: 150px; height: 150px; object-fit: contain; margin-bottom: 16px;">
      ` : ''}
      <h2 style="font-size: 24px; margin: 0 0 8px 0;">${topPerfume.name}</h2>
      <p style="color: #666; margin: 0 0 12px 0;">By ${topPerfume.brand}</p>
      <p style="font-size: 14px; color: #888; margin: 0 0 8px 0;">
        hints of: ${topPerfume.mainAccords.slice(0, 3).join(', ').toLowerCase()}
      </p>
      <div style="background-color: #000; color: #fff; display: inline-block; padding: 8px 16px; border-radius: 20px; font-size: 14px;">
        ${topPerfume.score}% match
      </div>
      ${topPerfume.matchReason ? `
        <p style="font-size: 14px; color: #666; margin: 16px 0 0 0; font-style: italic;">
          "${topPerfume.matchReason}"
        </p>
      ` : ''}
    </div>

    <!-- Other Recommendations -->
    <div style="padding: 32px 24px;">
      <p style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 24px 0;">More Matches For You</p>
      ${otherPerfumes.map((rec, index) => `
        <div style="display: flex; align-items: flex-start; margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #eee;">
          <div style="flex-shrink: 0; margin-right: 16px;">
            ${rec.imageUrl ? `
              <img src="${rec.imageUrl}" alt="${rec.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
            ` : `
              <div style="width: 80px; height: 80px; background-color: #f5f5f5; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px;">
                &#129530;
              </div>
            `}
          </div>
          <div style="flex: 1;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <p style="font-size: 16px; font-weight: 500; margin: 0 0 4px 0;">${rec.name}</p>
                <p style="font-size: 14px; color: #666; margin: 0 0 8px 0;">${rec.brand}</p>
              </div>
            </div>
            <div style="margin-bottom: 8px;">
              ${rec.mainAccords.slice(0, 3).map(accord => `
                <span style="display: inline-block; padding: 4px 8px; margin: 2px; background-color: #f5f5f5; border-radius: 12px; font-size: 12px;">${accord}</span>
              `).join('')}
            </div>
            ${rec.matchReason ? `
              <p style="font-size: 13px; color: #888; margin: 0; font-style: italic;">
                ${rec.matchReason}
              </p>
            ` : ''}
            <div style="margin-top: 8px;">
              <div style="height: 4px; background-color: #eee; border-radius: 2px; overflow: hidden;">
                <div style="height: 100%; width: ${rec.score}%; background-color: #000; border-radius: 2px;"></div>
              </div>
              <p style="font-size: 12px; color: #888; margin: 4px 0 0 0;">${rec.score}% match</p>
            </div>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- AI Reasoning -->
    ${scentProfile.reasoning ? `
      <div style="padding: 24px; margin: 0 24px 24px 24px; background-color: #f5f5f5; border-radius: 12px;">
        <p style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">Why These Scents?</p>
        <p style="font-size: 14px; color: #444; margin: 0; line-height: 1.6;">
          ${scentProfile.reasoning}
        </p>
      </div>
    ` : ''}

    <!-- Selected Outfits -->
    ${selectedOutfits.length > 0 ? `
      <div style="padding: 0 24px 32px 24px;">
        <p style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px 0;">Based On Your Picks</p>
        <div>
          ${selectedOutfits.slice(0, 6).map(outfit => `
            <img src="${outfit.imageUrl}" alt="${outfit.brand}" style="width: 60px; height: 75px; object-fit: cover; border-radius: 8px; margin-right: 8px; margin-bottom: 8px;">
          `).join('')}
        </div>
      </div>
    ` : ''}

    <!-- Footer -->
    <div style="background-color: #000; padding: 32px 24px; text-align: center;">
      <p style="color: #fff; font-size: 14px; margin: 0 0 8px 0;">
        let your taste find your next signature scent
      </p>
      <a href="https://scent.getstuff.city" style="color: #fff; font-size: 16px; font-weight: bold; margin: 0;">
        scent.getstuff.city
      </a>
    </div>
  </div>
</body>
</html>
  `.trim();
}
