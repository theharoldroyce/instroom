import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  return (
    <Card {...props}>
      <CardHeader className="gap-3">
        <CardTitle className="text-2xl text-white">Create an account</CardTitle>
        <CardDescription className="text-zinc-300">
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name" className="text-zinc-100">
                Full Name
              </FieldLabel>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                required
                className="border-emerald-300/20 bg-black/30 text-white placeholder:text-zinc-400 focus-visible:border-emerald-300 focus-visible:ring-emerald-400/25"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="email" className="text-zinc-100">
                Email
              </FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                className="border-emerald-300/20 bg-black/30 text-white placeholder:text-zinc-400 focus-visible:border-emerald-300 focus-visible:ring-emerald-400/25"
              />
              <FieldDescription className="text-zinc-400">
                We&apos;ll use this to contact you. We will not share your email
                with anyone else.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="password" className="text-zinc-100">
                Password
              </FieldLabel>
              <Input
                id="password"
                type="password"
                required
                className="border-emerald-300/20 bg-black/30 text-white placeholder:text-zinc-400 focus-visible:border-emerald-300 focus-visible:ring-emerald-400/25"
              />
              <FieldDescription className="text-zinc-400">
                Must be at least 8 characters long.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password" className="text-zinc-100">
                Confirm Password
              </FieldLabel>
              <Input
                id="confirm-password"
                type="password"
                required
                className="border-emerald-300/20 bg-black/30 text-white placeholder:text-zinc-400 focus-visible:border-emerald-300 focus-visible:ring-emerald-400/25"
              />
              <FieldDescription className="text-zinc-400">
                Please confirm your password.
              </FieldDescription>
            </Field>
            <FieldGroup>
              <Field>
                <Button
                  type="submit"
                  className="h-10 w-full bg-gradient-to-r from-emerald-500 to-lime-400 text-black hover:from-emerald-400 hover:to-lime-300"
                >
                  Create Account
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  className="h-10 w-full border-emerald-300/30 bg-black/20 text-zinc-100 hover:bg-emerald-500/10 hover:text-zinc-100"
                >
                  Sign up with Google
                </Button>
                <FieldDescription className="px-6 text-center text-zinc-300">
                  Already have an account?{" "}
                  <Link href="/login" className="text-emerald-300 hover:text-lime-300">
                    Sign in
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
