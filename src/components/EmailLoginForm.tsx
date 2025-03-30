'use client'

import {
  CheckmarkCircle20Filled,
  ChevronDown20Filled,
} from '@fluentui/react-icons'
import axios, { HttpStatusCode } from 'axios'
import { Loader } from 'lucide-react'
import { Select } from 'radix-ui'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { z } from 'zod'
import { cn, sleep } from '../lib/utils'

const loginFormSchema = z.object({
  email: z
    .string()
    .nonempty()
    .email({ message: 'Enter a valid email address.' }),
})

type LoginFormSchema = z.infer<typeof loginFormSchema>

const verifyFormSchema = z.object({
  verificationCode: z.string().nonempty(),
})

type VerifyFormSchema = z.infer<typeof verifyFormSchema>

const newUserFormSchema = z.object({
  verificationCode: z.string().nonempty(),
  name: z.string().nonempty().min(2, { message: 'Name is too short.' }),
  username: z
    .string()
    .nonempty()
    .min(2, { message: 'Username is too short.' })
    .max(30, { message: 'Username is too long.' })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: 'Username can only contain letters, numbers, and underscores.',
    }),
  gender: z.enum(['female', 'male', 'prefer_not_to_say'], {
    message: 'Select a gender.',
  }),
})

type NewUserFormSchema = z.infer<typeof newUserFormSchema>

export default function EmailLoginForm() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [loginToken, setLoginToken] = useState<string | null>(
    searchParams.get('token') ?? null,
  )
  const [isNewUser, setIsNewUser] = useState<boolean>(
    searchParams.get('is-new-user') === 'True',
  )

  const loginForm = useForm<LoginFormSchema>({})
  const verifyForm = useForm<VerifyFormSchema>({})
  const newUserForm = useForm<NewUserFormSchema>({})

  const [genderSelectOpen, setGenderSelectOpen] = useState(false)

  async function onLoginSubmit(values: LoginFormSchema) {
    try {
      if (!loginToken) {
        loginFormSchema.parse(values)

        const response = await axios.post('/api/auth/login/email', {
          email: values.email,
        })

        if (response.status !== HttpStatusCode.Ok) {
          throw new Error('Failed to send verification email.')
        }

        const data = response.data

        const loginToken: string = data.token
        const isNewUser: boolean = data.is_new_user

        setLoginToken(loginToken)
        setIsNewUser(isNewUser)

        toast('We have sent a code to your inbox.')
      } else {
        throw new Error('Invalid authentication flow.')
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast(error.errors[0].message)
      } else {
        console.error(error)
        toast('Request failed. Please reload and try again.')
      }
    }
  }

  async function onVerifySubmit(values: VerifyFormSchema) {
    try {
      if (loginToken && isNewUser === false) {
        verifyFormSchema.parse(values)

        const response = await axios.post('/api/auth/verify/email', {
          token: loginToken,
          verification_code: values.verificationCode,
          is_new_user: isNewUser,
        })

        if (response.status !== HttpStatusCode.Ok) {
          throw new Error('Failed to verify code.')
        }

        toast('You will be redirected to the home page soon.')

        // Simulate a 1 second delay
        await sleep(1000)

        navigate('/')
      } else {
        throw new Error('Invalid authentication flow.')
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast(error.errors[0].message)
      } else {
        console.error(error)
        toast('Request failed. Please reload and try again.')
      }
    }
  }

  async function checkUsernameAvailability(username: string) {
    try {
      const response = await axios.post('/api/auth/attempt/username', {
        username: username,
      })

      if (response.status !== HttpStatusCode.Ok) {
        throw new Error('Failed to check username availability.')
      }

      const data = response.data

      const usernameAvailable: boolean = data.available

      if (!usernameAvailable) {
        newUserForm.setError('username', {
          type: 'manual',
          message: 'Username already taken.',
        })
      } else {
        newUserForm.clearErrors('username')
      }
    } catch (error) {
      console.error(error)
    }
  }

  async function onNewUserSubmit(values: NewUserFormSchema) {
    try {
      if (loginToken && isNewUser === true) {
        checkUsernameAvailability(values.username)
        newUserFormSchema.parse(values)

        const response = await axios.post('/api/auth/verify/email', {
          token: loginToken,
          verification_code: values.verificationCode,
          is_new_user: isNewUser,
          name: values.name,
          username: values.username,
          gender: values.gender,
        })

        if (response.status !== HttpStatusCode.Ok) {
          throw new Error('Failed to verify code and create new user.')
        }

        toast('You will be redirected to the home page soon.')

        // Simulate a 1 second delay
        await sleep(1000)

        navigate('/')
      } else {
        throw new Error('Invalid authentication flow.')
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast(error.errors[0].message)
      } else {
        console.error(error)
        toast('Request failed. Please reload and try again.')
      }
    }
  }

  return (
    <>
      {/* Login Form */}
      {!loginToken && (
        <form
          onSubmit={loginForm.handleSubmit(onLoginSubmit)}
          className="flex w-full flex-col items-center gap-y-[8px]"
        >
          <input
            type="text"
            autoComplete="email"
            autoCapitalize="none"
            placeholder="Email address"
            className="focus:border-barcelona-primary-outline bg-barcelona-tertiary-background w-full touch-manipulation rounded-[12px] border-[1px] border-transparent p-[16px] text-start leading-[140%] outline-none"
            {...loginForm.register('email', { required: true })}
          />

          <button
            type="submit"
            disabled={
              loginForm.formState.isLoading ||
              loginForm.formState.isValidating ||
              !loginForm.formState.isValid ||
              loginForm.formState.isSubmitting
            }
            className={cn(
              'text-barcelona-secondary-button bg-barcelona-primary-button relative flex h-[56px] min-h-0 w-full min-w-0 shrink-0 basis-auto touch-manipulation flex-row items-stretch justify-between rounded-[12px] p-[16px] transition-transform duration-200 ease-in-out outline-none select-none',
              loginForm.formState.isLoading ||
                loginForm.formState.isValidating ||
                !loginForm.formState.isValid
                ? 'cursor-not-allowed'
                : !loginForm.formState.isSubmitting &&
                    'cursor-pointer active:scale-90',
            )}
          >
            <div
              className={cn(
                'flex h-full w-full items-center justify-center',
                (loginForm.formState.isLoading ||
                  loginForm.formState.isValidating ||
                  !loginForm.formState.isValid ||
                  loginForm.formState.isSubmitting) &&
                  'opacity-40',
              )}
            >
              {loginForm.formState.isSubmitting ? (
                <div className="text-barcelona-secondary-button inline-block size-[18px]">
                  <Loader className="size-[18px] animate-[spin_1.5s_linear_infinite]" />
                </div>
              ) : (
                <div className="grid w-full grid-cols-[24px_1fr_24px] items-center justify-center">
                  <div className="col-start-2 font-semibold">Log in</div>
                </div>
              )}
            </div>
          </button>
        </form>
      )}

      {/* Verify Form (without creating new user) */}
      {loginToken && !isNewUser && (
        <form
          onSubmit={verifyForm.handleSubmit(onVerifySubmit)}
          className="flex w-full flex-col items-center gap-y-[8px]"
        >
          <input
            type="text"
            autoComplete="email"
            autoCapitalize="none"
            placeholder="Verification code"
            className="focus:border-barcelona-primary-outline bg-barcelona-tertiary-background w-full touch-manipulation rounded-[12px] border-[1px] border-transparent p-[16px] text-start leading-[140%] outline-none"
            {...verifyForm.register('verificationCode', { required: true })}
          />

          <button
            type="submit"
            disabled={
              verifyForm.formState.isLoading ||
              verifyForm.formState.isValidating ||
              !verifyForm.formState.isValid ||
              verifyForm.formState.isSubmitting
            }
            className={cn(
              'text-barcelona-secondary-button bg-barcelona-primary-button relative flex h-[56px] min-h-0 w-full min-w-0 shrink-0 basis-auto touch-manipulation flex-row items-stretch justify-between rounded-[12px] p-[16px] transition-transform duration-200 ease-in-out outline-none select-none',
              verifyForm.formState.isLoading ||
                verifyForm.formState.isValidating ||
                !verifyForm.formState.isValid
                ? 'cursor-not-allowed'
                : !verifyForm.formState.isSubmitting &&
                    'cursor-pointer active:scale-90',
            )}
          >
            <div
              className={cn(
                'flex h-full w-full items-center justify-center',
                (verifyForm.formState.isLoading ||
                  verifyForm.formState.isValidating ||
                  !verifyForm.formState.isValid ||
                  verifyForm.formState.isSubmitting) &&
                  'opacity-40',
              )}
            >
              {verifyForm.formState.isSubmitting ? (
                <div className="text-barcelona-secondary-button inline-block size-[18px]">
                  <Loader className="size-[18px] animate-[spin_1.5s_linear_infinite]" />
                </div>
              ) : (
                <div className="grid w-full grid-cols-[24px_1fr_24px] items-center justify-center">
                  <div className="col-start-2 font-semibold">Continue</div>
                </div>
              )}
            </div>
          </button>
        </form>
      )}

      {/* Verify Form (with creating new user) */}
      {loginToken && isNewUser && (
        <form
          onSubmit={newUserForm.handleSubmit(onNewUserSubmit)}
          className="flex w-full flex-col items-center gap-y-[8px]"
        >
          <input
            type="text"
            autoComplete="email"
            autoCapitalize="none"
            placeholder="Verification code"
            className="focus:border-barcelona-primary-outline bg-barcelona-tertiary-background w-full touch-manipulation rounded-[12px] border-[1px] border-transparent p-[16px] text-start leading-[140%] outline-none"
            {...newUserForm.register('verificationCode', { required: true })}
          />

          <input
            type="name"
            autoComplete="name"
            autoCapitalize="words"
            placeholder="Name"
            className="focus:border-barcelona-primary-outline bg-barcelona-tertiary-background w-full touch-manipulation rounded-[12px] border-[1px] border-transparent p-[16px] text-start leading-[140%] outline-none"
            {...newUserForm.register('name', { required: true })}
          />

          <input
            type="username"
            autoComplete="username"
            autoCapitalize="none"
            placeholder="Username"
            className={cn(
              'focus:border-barcelona-primary-outline bg-barcelona-tertiary-background w-full touch-manipulation rounded-[12px] border-[1px] border-transparent p-[16px] text-start leading-[140%] outline-none',
              newUserForm.formState.errors.username &&
                'border-[var(--barcelona-error-text)_!important]',
            )}
            {...newUserForm.register('username', {
              required: true,
              onBlur: (e) => checkUsernameAvailability(e.target.value),
            })}
          />

          {newUserForm.formState.errors.username && (
            <div className="flex w-full shrink-0 grow-0 flex-col items-stretch justify-start overflow-visible">
              <span className="text-system-12-font-size text-barcelona-error-text relative max-w-full overflow-visible leading-[calc(1.4*1em)] font-normal whitespace-pre-line">
                {newUserForm.formState.errors.username.message}
              </span>
            </div>
          )}

          <Select.Root
            open={genderSelectOpen}
            onOpenChange={setGenderSelectOpen}
            value={newUserForm.watch('gender')}
            onValueChange={(value: 'female' | 'male' | 'prefer_not_to_say') =>
              newUserForm.setValue('gender', value)
            }
          >
            <Select.Trigger
              className={cn(
                'bg-barcelona-tertiary-background data-[placeholder]:text-barcelona-primary-text/50 hover:border-barcelona-primary-outline inline-flex w-full cursor-pointer touch-manipulation justify-between rounded-[12px] border-[1px] border-transparent p-[16px] text-start leading-[140%] outline-none select-none',
                genderSelectOpen && 'border-barcelona-primary-outline',
                newUserForm.formState.errors.gender && 'border-barcelona-',
              )}
            >
              <Select.Value
                placeholder="Gender"
                className="cursor-pointer touch-manipulation select-none"
              />
              <Select.Icon className="SelectIcon">
                <ChevronDown20Filled className="fill-barcelona-secondary-icon h-[20px] w-[20px]" />
              </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content
                align={'end'}
                position={'popper'}
                className="bg-barcelona-elevated-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 max-h-[calc(var(--radix-select-content-available-height))] w-[calc(var(--radix-select-trigger-width))] origin-top rounded-[16px] shadow-[0_10.5px_21px_var(--barcelona-box-shadow-08)] transition-all duration-200"
              >
                <Select.Viewport>
                  <Select.Group className="w-full py-[10px]">
                    {(newUserFormSchema.shape.gender.options as string[]).map(
                      (value) => (
                        <Select.Item
                          key={value}
                          value={value}
                          className="hover:bg-barcelona-hovered-background w- flex w-full shrink-0 cursor-pointer touch-manipulation flex-row flex-nowrap items-center justify-between p-[16px] transition-colors duration-200 outline-none select-none"
                        >
                          <Select.ItemText className="w-full min-w-0 shrink grow basis-auto">
                            {value.charAt(0).toUpperCase() +
                              value.slice(1).replaceAll('_', ' ')}
                          </Select.ItemText>
                          <div className="border-barcelona-primary-outline relative ml-[12px] inline-flex h-[24px] w-[24px] max-w-full min-w-0 shrink-0 items-center justify-center self-center rounded-[50%] border-[1.5px]">
                            <Select.ItemIndicator className="absolute inset-0 top-[-4.5px] left-[-4.5px] z-10 flex shrink-0">
                              <CheckmarkCircle20Filled className="fill-barcelona-primary-button h-[30px] w-[30px] shrink-0" />
                            </Select.ItemIndicator>
                          </div>
                        </Select.Item>
                      ),
                    )}
                  </Select.Group>
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>

          <div className="flex w-full shrink-0 grow-0 flex-col items-stretch justify-start overflow-visible">
            <span className="text-system-12-font-size text-barcelona-secondary-text relative max-w-full overflow-visible leading-[calc(1.4*1em)] font-normal whitespace-pre-line">
              This won't be part of your public profile.
            </span>
          </div>

          <button
            type="submit"
            disabled={
              newUserForm.formState.isLoading ||
              newUserForm.formState.isValidating ||
              !newUserForm.formState.isValid ||
              newUserForm.formState.isSubmitting
            }
            className={cn(
              'text-barcelona-secondary-button bg-barcelona-primary-button relative flex h-[56px] min-h-0 w-full min-w-0 shrink-0 basis-auto touch-manipulation flex-row items-stretch justify-between rounded-[12px] p-[16px] transition-transform duration-200 ease-in-out outline-none select-none',
              newUserForm.formState.isLoading ||
                newUserForm.formState.isValidating ||
                !newUserForm.formState.isValid
                ? 'cursor-not-allowed'
                : !newUserForm.formState.isSubmitting &&
                    'cursor-pointer active:scale-90',
            )}
          >
            <div
              className={cn(
                'flex h-full w-full items-center justify-center',
                (newUserForm.formState.isLoading ||
                  newUserForm.formState.isValidating ||
                  !newUserForm.formState.isValid ||
                  newUserForm.formState.isSubmitting) &&
                  'opacity-40',
              )}
            >
              {newUserForm.formState.isSubmitting ? (
                <div className="text-barcelona-secondary-button inline-block size-[18px]">
                  <Loader className="size-[18px] animate-[spin_1.5s_linear_infinite]" />
                </div>
              ) : (
                <div className="grid w-full grid-cols-[24px_1fr_24px] items-center justify-center">
                  <div className="col-start-2 font-semibold">Continue</div>
                </div>
              )}
            </div>
          </button>
        </form>
      )}
    </>
  )
}
