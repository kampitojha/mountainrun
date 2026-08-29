import { redirect } from "next/navigation";

export default function AdminSubscribersRedirectPage() {
  redirect("/admin/newsletter");
}
