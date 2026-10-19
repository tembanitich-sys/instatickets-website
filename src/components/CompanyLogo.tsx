import Image from "next/image";
import type { DemoCompany } from "@/lib/demoTrips";

/**
 * A bus company's own logo, supplied artwork shown unaltered. Wide logos sit on a white pill;
 * logos that carry their own background fill a rounded square. Review builds only (see /book).
 */
export function CompanyLogo({ company, height = 44, fixedWidth, className = "" }: { company: DemoCompany; height?: number; fixedWidth?: number; className?: string }) {
  const fill = company.logoFill;
  const width = fixedWidth ?? (fill ? height : Math.round(height * Math.max(1, Math.min(company.logoAr, 2.6))));
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ${fill ? "" : "p-1"} ${className}`}
      style={{ width, height, ...(fill && company.logoBg ? { backgroundColor: company.logoBg } : {}) }}
    >
      <Image
        src={company.logo}
        alt={company.name}
        width={Math.round(width * 2)}
        height={Math.round(height * 2)}
        sizes={`${width}px`}
        className={fill ? "size-full object-cover" : "max-h-full max-w-full object-contain"}
      />
    </span>
  );
}
