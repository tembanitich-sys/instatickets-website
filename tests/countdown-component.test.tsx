import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Countdown } from "@/components/Countdown";
import { LAUNCH_AT_MS } from "@/lib/countdown";

const url = "https://example.com/start";

describe("Countdown (server-rendered first value)", () => {
  it("shows the four units before launch", () => {
    const html = renderToString(<Countdown initialNowMs={LAUNCH_AT_MS - 1000} getStartedUrl={url} />);
    for (const label of ["DAYS", "HOURS", "MINUTES", "SECONDS"]) expect(html).toContain(label);
    expect(html).not.toContain("INSTATICKETS IS NOW LIVE");
  });

  it("shows INSTATICKETS IS NOW LIVE and a GET STARTED link from the launch instant", () => {
    const html = renderToString(<Countdown initialNowMs={LAUNCH_AT_MS} getStartedUrl={url} />);
    expect(html).toContain("INSTATICKETS IS NOW LIVE");
    expect(html).toContain("GET STARTED");
    expect(html).toContain(`href="${url}"`);
    expect(html).not.toContain("SECONDS");
  });

  it("still shows the countdown one millisecond before launch", () => {
    const html = renderToString(<Countdown initialNowMs={LAUNCH_AT_MS - 1} getStartedUrl={url} />);
    expect(html).toContain("SECONDS");
    expect(html).not.toContain("GET STARTED");
  });
});
