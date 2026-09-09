import { ClerkProvider } from "@clerk/nextjs";

/** Only the phone flow is wrapped; the kiosk bundle never loads any of this. */
export default function JoinLayout({ children }: { children: React.ReactNode }) {
  return <ClerkProvider>{children}</ClerkProvider>;
}
