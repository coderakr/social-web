import { AuthForm } from "@/components/auth-form";
import { getServerSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  const session = await getServerSession();

  if (session?.user) {
    redirect("/dashboard");
  }

  return <AuthForm mode="sign-in" />;
}
