import { redirect } from 'next/navigation';

export default function Home() {
  // Directly point visitors to the dashboard
  redirect('/dashboard');
}
