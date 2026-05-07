import type { ReactNode } from "react";

import { ProtectedLayout } from "./protected-layout";

export default function MainLayout({ children }: { children: ReactNode }) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
