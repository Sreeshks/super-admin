import { redirect } from "next/navigation";

export default function RootPlatformPage() {
  const defaultSlug =
    process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG || "luxe-salon";
  redirect(`/${defaultSlug}`);
}
