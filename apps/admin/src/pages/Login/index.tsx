import React, { useEffect } from 'react';
import { z } from 'zod';
import type { SubmitHandler } from "react-hook-form";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from 'src/contexts/auth-context';
import { useNavigate } from 'react-router-dom';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(3)
    .max(20)
});

type LoginSchemaType = z.infer<typeof LoginSchema>;
export function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading } = useAuth();

  const loginForm = useForm<LoginSchemaType>({ resolver: zodResolver(LoginSchema) });
  const onSubmit: SubmitHandler<LoginSchemaType> = (data) => {
    login(data);
  };
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return (
    isLoading ? <div>Loading...</div> :
      <>
        <h2 className="text-2xl font-bold text-center">Login</h2>
        <FormProvider {...loginForm}>
          {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
          <form className="space-y-6" onSubmit={loginForm.handleSubmit(onSubmit)}>
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="email">Email:</label>
              <input
                className={`w-full mt-1 px-3 py-2 border ${loginForm.formState.errors.email ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                id="email"
                type="email"
                {...loginForm.register("email")}
              />
              {loginForm.formState.errors.email ? <p className="mt-2 text-sm text-red-600">{loginForm.formState.errors.email.message}</p> : null}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="password">Password:</label>
              <input
                className={`w-full mt-1 px-3 py-2 border ${loginForm.formState.errors.password ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                id="password"
                type="password"
                {...loginForm.register("password")}
              />
              {loginForm.formState.errors.password ? <p className="mt-2 text-sm text-red-600">{loginForm.formState.errors.password.message}</p> : null}
            </div>

            <button
              className="w-full px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              type="submit"
            >
              Login
            </button>
          </form>
        </FormProvider>
      </>
  );
}
