import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import type { SubmitHandler } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createNewUser, getUserById, updateUser } from "src/services/user-service";
import type { User } from "@ecommerce/database";
import { toast } from "react-toastify"; // Just use toast, no need for ToastContainer here

const UserSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z
        .string()
        .min(3)
        .max(20).optional()
});

type UserSchemaType = z.infer<typeof UserSchema>;

export function UserForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: user } = useQuery({
        queryKey: ['get-user'],
        queryFn: () => getUserById(Number(id)),
        enabled: !!id
    });

    const updateMutation = useMutation({
        mutationKey: ['update-user'],
        mutationFn: (data: { id: number, data: Partial<User> }) => updateUser(data.id, data.data),
        onError: (error) => {
            toast.error('Unable to update user');
            console.error(error);
        },
        onSuccess: () => {
            toast.success('User Updated successfully');
            navigate('/users');
        },
    });

    const storeMutation = useMutation({
        mutationKey: ['store-user'],
        mutationFn: (data: Partial<User>) => createNewUser(data),
        onError: (error) => {
            toast.error('Unable to create new user');
            console.error(error);
        },
        onSuccess: () => {
            toast.success('New User created successfully');
            navigate('/users');
        },
    });

    const userForm = useForm<UserSchemaType>({ resolver: zodResolver(UserSchema) });
    useEffect(() => {
        console.log(user);
        if (user) {
            userForm.reset({
                name: user.name,
                email: user.email,
                password: ''
            });
        }
    }, [user, userForm]);
    const onSubmit: SubmitHandler<UserSchemaType> = (data) => {
        if (id) {
            updateMutation.mutate({ id: Number(id), data })
        } else {
            storeMutation.mutate(data)
        }
    };
    return (<div className="mx-auto mt-10">
        <h2 className="text-2xl font-bold mb-6">{id ? 'Edit User' : 'Create User'}</h2>
        <FormProvider {...userForm}>
            {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
            <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4" onSubmit={userForm.handleSubmit(onSubmit)}>


                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                        Name
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="name"
                        {...userForm.register("name")}
                        placeholder="Enter name"
                        type="text"
                    />
                    {userForm.formState.errors.name ? <p className="mt-2 text-sm text-red-600">{userForm.formState.errors.name.message}</p> : null}

                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                        Email
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="email"
                        placeholder="Enter email"
                        type="email"
                        {...userForm.register("email")}
                    />
                    {userForm.formState.errors.email ? <p className="mt-2 text-sm text-red-600">{userForm.formState.errors.email.message}</p> : null}
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                        Password
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                        id="password"
                        {...userForm.register("password")}
                        placeholder="Enter password"
                        type="password"
                    />
                    {userForm.formState.errors.password ? <p className="mt-2 text-sm text-red-600">{userForm.formState.errors.password.message}</p> : null}

                </div>

                <div className="flex items-center justify-between">
                    <button
                        className="bg-blue-500 w-full hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="submit"
                    >
                        {id ? 'Update User' : 'Create New User'}
                    </button>
                </div>
            </form>
        </FormProvider>
    </div>)
}