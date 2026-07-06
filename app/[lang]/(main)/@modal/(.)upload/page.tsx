import { UploadPickerModal } from "@/features/create/components/UploadPickerModal";

type Props = { params: Promise<{ lang: string }> };

// Intercepted upload picker. On a soft navigation to /upload (e.g. tapping the
// nav "Create" button) this renders over whatever page the user was on — the
// background stays put behind the dialog instead of a full page swap. A direct
// visit / refresh of /upload falls through to the real page.
export default async function UploadPickerModalPage({ params }: Props) {
  const { lang } = await params;
  return <UploadPickerModal lang={lang} />;
}
