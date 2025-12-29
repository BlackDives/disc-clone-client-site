import { useContext } from 'react'
import { Link } from 'react-router'
import { useForm, Controller } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field'
import { AuthenticationContext } from '@/providers/auth/AuthProvider'
import { Button } from '@/components/ui/button'

const loginSchema = z.object({
    email: z.email('Not a valid email.'),
    password: z
        .string()
        .min(5, 'Password must be atleast 5 characters.')
        .max(20, 'Password can be no more than 20 characters long.'),
})

const LoginPage = () => {
    const { login } = useContext(AuthenticationContext)
    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    })

    const onFormSubmit = (data: z.infer<typeof loginSchema>) => {
        const { email, password } = data
        login(email, password)
    }

    return (
        <div className="w-screen h-screen flex flex-col items-center justify-center">
            <div className="flex col mb-4">
                <p className="text-6xl">Disclone</p>
            </div>
            <div className="flex flex-col w-[50%]">
                <form onSubmit={form.handleSubmit(onFormSubmit)}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Login</CardTitle>
                            <CardDescription>
                                Log into your Disclone account
                            </CardDescription>
                            <CardAction>
                                <Link to="/auth/signup">Sign Up</Link>
                            </CardAction>
                        </CardHeader>
                        <CardContent>
                            <FieldGroup>
                                <Controller
                                    name="email"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field>
                                            <FieldLabel>Username</FieldLabel>
                                            <Input
                                                {...field}
                                                aria-invalid={
                                                    fieldState.invalid
                                                }
                                                placeholder="Enter username..."
                                                autoComplete="off"
                                            />
                                            {fieldState.invalid && (
                                                <FieldError
                                                    errors={[fieldState.error]}
                                                />
                                            )}
                                        </Field>
                                    )}
                                />
                                <Controller
                                    name="password"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field>
                                            <FieldLabel>Password</FieldLabel>
                                            <Input
                                                type="password"
                                                {...field}
                                                aria-invalid={
                                                    fieldState.invalid
                                                }
                                                placeholder="Enter password..."
                                                autoComplete="off"
                                            />
                                            {fieldState.invalid && (
                                                <FieldError
                                                    errors={[fieldState.error]}
                                                />
                                            )}
                                        </Field>
                                    )}
                                />
                            </FieldGroup>
                            <div>
                                <div className="mt-2">
                                    <Button>Login</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </div>
    )
}

export default LoginPage
