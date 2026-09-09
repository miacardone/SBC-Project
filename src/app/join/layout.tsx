import { ClerkProvider } from "@clerk/nextjs";

/**
 * Only the phone flow is wrapped; the kiosk bundle never loads any of this.
 *
 * If no Clerk key is configured the provider is skipped entirely, so the booth
 * degrades to the email lane on its own rather than rendering a sign-in button
 * that cannot work.
 */
export default function JoinLayout({ children }: { children: React.ReactNode }) {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) return <>{children}</>;
  return <ClerkProvider>{children}</ClerkProvider>;
}
