import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className="flex flex-col gap-6">
      <Card className={className} {...props}>
        <CardHeader className="gap-3">
          <CardTitle className="text-2xl text-white">Sign in to Instroom</CardTitle>
          <CardDescription className="text-zinc-300">
            Choose your preferred login method
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <FieldGroup>
              <Field>
                <Button
                  variant="outline"
                  type="button"
                  className="h-10 w-full border-emerald-300/30 bg-black/20 text-zinc-100 hover:bg-emerald-500/10 hover:text-zinc-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Login with Google
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-zinc-800">
                <span className="text-zinc-400 text-xs font-semibold">Or continue with email</span>
              </FieldSeparator>
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
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password" className="text-zinc-100">
                    Password
                  </FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-xs text-emerald-500 underline-offset-4 hover:text-emerald-400 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  className="border-emerald-300/20 bg-black/30 text-white placeholder:text-zinc-400 focus-visible:border-emerald-300 focus-visible:ring-emerald-400/25"
                />
              </Field>
              <Field>
                <Button
                  type="submit"
                  className="h-10 w-full bg-gradient-to-r from-emerald-500 to-lime-400 text-black hover:from-emerald-400 hover:to-lime-300"
                >
                  Sign in
                </Button>
                <FieldDescription className="text-center text-zinc-400">
                  Don&apos;t have an account?{" "}
                  <a href="/signup" className="text-emerald-400 hover:text-lime-300">
                    Sign up
                  </a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center text-zinc-400">
        By clicking continue, you agree to our{" "}
        <a href="#" className="text-emerald-400 hover:text-lime-300">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="text-emerald-400 hover:text-lime-300">
          Privacy Policy
        </a>
        .
      </FieldDescription>
    </div>
  )
}
