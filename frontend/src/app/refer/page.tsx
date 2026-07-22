import { PageShell } from "../components/app-shell";
import { ReferClient } from "./refer-client";

export const metadata = {
  title: "Refer & Earn — Mountain Run",
  description: "Invite your running buddies to Mountain Run and earn rewards for every friend who signs up and registers.",
};

export default function ReferPage() {
  return (
    <PageShell>
      <ReferClient />
    </PageShell>
  );
}
