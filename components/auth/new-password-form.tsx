"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole } from "lucide-react";

import { CardWrapper } from "@/components/auth/card-wrapper";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { newPassword } from "@/actions/new-password";
import { FaSpinner } from "react-icons/fa";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  PasswordInput,
  PasswordInputAdornment,
  PasswordInputAdornmentToggle,
  PasswordInputInput,
} from "@/components/ui/password-input";

// Modified schema to include password confirmation
const NewPasswordSchema = z.object({
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const NewPasswordForm = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof NewPasswordSchema>>({
    resolver: zodResolver(NewPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: z.infer<typeof NewPasswordSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      newPassword(values, token)
        .then((data) => {
          setError(data?.error);
          setSuccess(data?.success);
        });
    });
  };

  return (
    <CardWrapper
      headerLabel="Enter a new password"
      backButtonLabel="Back to login"
      backButtonHref="/auth/login"
    >
      <Form {...form}>
        <form 
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <PasswordInput>
                    <PasswordInputAdornment>
                      <LockKeyhole className="size-4" />
                    </PasswordInputAdornment>
                    <FormControl>
                      <PasswordInputInput
                        {...field}
                        disabled={isPending}
                        placeholder="Enter new password"
                        autoComplete="new-password"
                      />
                    </FormControl>
                    <PasswordInputAdornmentToggle />
                  </PasswordInput>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <PasswordInput>
                    <PasswordInputAdornment>
                      <LockKeyhole className="size-4" />
                    </PasswordInputAdornment>
                    <FormControl>
                      <PasswordInputInput
                        {...field}
                        disabled={isPending}
                        placeholder="Confirm new password"
                        autoComplete="new-password"
                      />
                    </FormControl>
                    <PasswordInputAdornmentToggle />
                  </PasswordInput>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button
            disabled={isPending}
            type="submit"
            className="w-full"
          >
            {isPending ? (
              <FaSpinner size={20} className="animate-spin" />
            ) : (
              "Reset password"
            )}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};