import Image from "next/image";
import { Button } from '@/components/ui/button'
import { requireAuth } from "@/module/auth/utils/auth-utils";
import  Logout  from '@/module/auth/components/logout';
import { redirect } from "next/navigation";

export default async function Home() {
  await requireAuth();

  return redirect('/dashboard');
}