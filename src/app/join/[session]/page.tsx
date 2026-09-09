import { JoinForm } from "./JoinForm";
import { dictionaryFor } from "@/lib/i18n/dictionaries";
import { localeDir } from "@/lib/i18n/locales";
import { envText } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BOOTH = envText("BOOTH_LOCATION") ?? "Booth E321";

export default async function JoinPage({
  params,
  searchParams,
}: {
  params: Promise<{ session: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { session } = await params;
  const query = await searchParams;
  const raw = typeof query.lang === "string" ? query.lang : "en";
  const { locale, dictionary } = dictionaryFor(raw);

  return (
    <div className="h-full overflow-auto" dir={localeDir(locale)} lang={locale}>
      <div className="mx-auto flex min-h-full w-full max-w-md flex-col gap-6 px-5 py-10">
        <div className="text-center">
          <div className="font-[family-name:var(--font-display)] text-5xl leading-none">
            <span className="text-white">cb</span>
            <span className="text-cb-red">911</span>
          </div>
          <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.4em] text-white/30">
            reclaim <span className="text-cb-red/70">your</span> revenue
          </div>
        </div>

        <div className="text-center">
          <h1 className="font-[family-name:var(--font-display)] text-4xl uppercase leading-none text-white">
            {dictionary.flow.captureTitle}
          </h1>
          <p className="mt-2 text-sm text-white/50">{dictionary.flow.captureSubtitle}</p>
        </div>

        <JoinForm
          session={session}
          locale={locale}
          t={dictionary}
          booth={BOOTH}
          googleAvailable={Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)}
        />
      </div>
    </div>
  );
}
