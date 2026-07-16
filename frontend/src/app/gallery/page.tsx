import { PageShell } from "../components/app-shell";
import { GalleryClient } from "./gallery-client";

export default function GalleryPage() {
  return (
    <PageShell>
      <GalleryClient />
    </PageShell>
  );
}
