import React, { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useContext } from 'react'
import { AuthenticationContext } from '@/providers/auth/AuthProvider'
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link, useNavigate } from 'react-router'
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field'

const SignupSchema = z.object({
    username: z.string().min(5, 'Username should be at least 5 characters.'),
    firstName: z
        .string('First name is a required field.')
        .min(1, 'First name is a required field.'),
    lastName: z.string().min(1, 'Last name is a required field.'),
    email: z.email('Email is a required field'),
    password: z
        .string('Password is required')
        .min(8, 'Password must be at least 8 characters.')
        .max(20, 'Password can be at most 20 characters.'),
    confirmPassword: z.string(),
})

type SignupSchemaType = z.infer<typeof SignupSchema>

const SignupPage = () => {
    const { register } = useContext(AuthenticationContext)
    const registerSubmitForm = useForm<SignupSchemaType>({
        resolver: zodResolver(SignupSchema),
        defaultValues: {},
    })

    const onSubmit = async (data: SignupSchemaType) => {
        console.log(data)
        const finalData: {
            firstName: string
            lastName: string
            username: string
            email: string
            password: string
            confirmPassword?: string
        } = data
        delete finalData['confirmPassword']

        const { firstName, lastName, username, email, password } = finalData

        register(username, firstName, lastName, email, password)
    }

    return (
        <div className="w-screen h-screen flex flex-col items-center justify-center">
            <div className="flex flex col mb-4">
                <p className="text-6xl">Disclone</p>
            </div>
            <div className="flex flex-col w-[50%]">
                <Card>
                    <CardHeader>
                        <CardTitle>Create an account</CardTitle>
                        <CardDescription>
                            Create a new Disclone account
                        </CardDescription>
                        <CardAction>
                            <Link to="/auth/login">Login</Link>
                        </CardAction>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={registerSubmitForm.handleSubmit(onSubmit)}
                            noValidate
                        >
                            <FieldGroup>
                                <Controller
                                    name="username"
                                    control={registerSubmitForm.control}
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
                                    name="firstName"
                                    control={registerSubmitForm.control}
                                    render={({ field, fieldState }) => (
                                        <Field>
                                            <FieldLabel>First Name</FieldLabel>
                                            <Input
                                                {...field}
                                                aria-invalid={
                                                    fieldState.invalid
                                                }
                                                placeholder="Enter first name..."
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
                                    name="lastName"
                                    control={registerSubmitForm.control}
                                    render={({ field, fieldState }) => (
                                        <Field>
                                            <FieldLabel>Last Name</FieldLabel>
                                            <Input
                                                {...field}
                                                aria-invalid={
                                                    fieldState.invalid
                                                }
                                                placeholder="Enter last name..."
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
                                    name="email"
                                    control={registerSubmitForm.control}
                                    render={({ field, fieldState }) => (
                                        <Field>
                                            <FieldLabel>Email</FieldLabel>
                                            <Input
                                                {...field}
                                                aria-invalid={
                                                    fieldState.invalid
                                                }
                                                placeholder="Enter email..."
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
                                    control={registerSubmitForm.control}
                                    render={({ field, fieldState }) => (
                                        <Field>
                                            <FieldLabel>Password</FieldLabel>
                                            <Input
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
                                <Controller
                                    name="confirmPassword"
                                    control={registerSubmitForm.control}
                                    render={({ field, fieldState }) => (
                                        <Field>
                                            <FieldLabel>
                                                Confirm Password
                                            </FieldLabel>
                                            <Input
                                                {...field}
                                                aria-invalid={
                                                    fieldState.invalid
                                                }
                                                placeholder="Confirm password..."
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
                                    <Button>Signup</Button>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default SignupPage
