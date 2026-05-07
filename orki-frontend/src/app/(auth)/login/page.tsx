import { AuthShell } from "@/widgets/auth/auth-shell";

type Tab = "signin" | "signup";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const initialTab: Tab = params.tab === "signup" ? "signup" : "signin";

  return <AuthShell initialTab={initialTab} />;
}
