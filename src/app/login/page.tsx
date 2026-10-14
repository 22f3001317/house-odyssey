import { redirect } from "next/navigation";
import AuthPanel from "@/components/AuthPanel";
import { getUser } from "@/lib/auth";
export const metadata = { title: "Student Login / Sign Up | House Odyssey" };
export default async function Login() {
  if (await getUser()) redirect("/dashboard");
  return <div className="mx-auto max-w-md px-4 py-12"><h1 className="mb-6 font-display text-4xl font-bold">Student access</h1><AuthPanel /></div>;
}
