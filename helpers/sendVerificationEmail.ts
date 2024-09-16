import { resend } from "@/lib/resend";
import VerificationEmail from "@/emails/VerfificationEmail";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: email,
      subject: "GhostOpinion | Verification code",
      react: VerificationEmail({ username, otp: verifyCode }),
    });
    return { success: true, message: "Verfication email sent successfully" };
  } catch (emailError) {
    console.log("Error while sending verification email", emailError);
    return { success: false, message: "Failed to send verification email" };
  }
}
