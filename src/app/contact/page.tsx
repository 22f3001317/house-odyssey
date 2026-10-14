import ApiForm from "@/components/ApiForm";
export const metadata = { title: "Contact Us | House Odyssey" };
export default function Contact() {
  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="font-display text-4xl font-bold">Contact us</h1>
      <p className="mb-6 mt-2">Questions about houses, events or your account? Leave a message for the organizers. Office address and phone: to be supplied.</p>
      <ApiForm endpoint="/api/contact" submitLabel="Send message" honeypot fields={[{ name: "name", label: "Name", autoComplete: "name" }, { name: "email", label: "Email", type: "email", autoComplete: "email" }, { name: "subject", label: "Subject" }, { name: "message", label: "Message", multiline: true }]} />
    </div>
  );
}
