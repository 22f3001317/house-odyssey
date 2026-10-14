import ActionButton from "@/components/ActionButton";
export default function Verify({ searchParams }: { searchParams: { token?: string } }) {
  const token = searchParams.token;
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="font-display text-4xl font-bold">Confirm your email</h1>
      {token ? <div className="mt-6"><ActionButton endpoint="/api/auth/verify" body={{ token }} label="Confirm email" className="bg-compass" /></div>
        : <p className="mt-4">This page needs the link from your verification email.</p>}
    </div>
  );
}
