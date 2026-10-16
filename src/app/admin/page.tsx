import { redirect } from "next/navigation";
// The admin tools now live on /dashboard and appear according to the signed-in role.
export default function Legacy() { redirect("/dashboard"); }
