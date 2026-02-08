import SignIn from "./_components/login-form";

export default function Login() {
  return (
    <main className="flex h-screen items-center justify-center">
      <section className="w-full max-w-md">
        <SignIn />
      </section>
    </main>
  );
}
