import Image from "next/image";
import { appStoreUrl, playStoreUrl } from "@content/facts";
import { home } from "@content/site";

/**
 * The official App Store and Google Play badges (supplied artwork, used unaltered), each shown only
 * when its link is set. The artwork is 404 x 120; both badges display at the same 40 px height.
 */
export function StoreBadges({ className = "" }: { className?: string }) {
  const s = home.channels;
  if (!appStoreUrl && !playStoreUrl) return null;
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {appStoreUrl && (
        <a href={appStoreUrl} target={appStoreUrl === "#" ? undefined : "_blank"} rel="noopener noreferrer" className="inline-flex min-h-11 items-center">
          <Image src="/brand/badges/app-store.png" alt={s.appStore} width={404} height={120} sizes="136px" className="h-10 w-auto" />
        </a>
      )}
      {playStoreUrl && (
        <a href={playStoreUrl} target={playStoreUrl === "#" ? undefined : "_blank"} rel="noopener noreferrer" className="inline-flex min-h-11 items-center">
          <Image src="/brand/badges/google-play.png" alt={s.playStore} width={404} height={120} sizes="136px" className="h-10 w-auto" />
        </a>
      )}
    </div>
  );
}
