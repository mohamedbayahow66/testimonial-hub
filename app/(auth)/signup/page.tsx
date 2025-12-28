import { SignupForm } from "@/components/auth/signup-form";

export const metadata = {
  title: "Sign Up - Testimonial Hub",
  description: "Create your Testimonial Hub account and start collecting testimonials",
};

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
        <p className="text-muted-foreground">
          Start collecting and displaying testimonials in minutes
        </p>
      </div>

      <SignupForm />
    </div>
  );
}


