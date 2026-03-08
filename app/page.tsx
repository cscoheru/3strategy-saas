// This page redirects to the default locale
import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/zh');
}
