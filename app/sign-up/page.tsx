import { AuthForm } from "@/components/auth-form";
import { getServerSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function SignUpPage() {
  const session = await getServerSession();

  if (session?.user) {
    redirect("/home");
  }

  return <AuthForm mode="sign-up" />;
}
