import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import type { SubmitHandler } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createNewCategory, getCategoryById, updateCategory } from "src/services/category-service"; // Update import paths
import { toast } from "react-toastify";

// Define the Zod schema for category
const CategorySchema = z.object({
    name: z.string().min(1, "Category name is required"),
    parent_id: z.coerce.number().optional()
});

type CategorySchemaType = z.infer<typeof CategorySchema>;

export function CategoryForm() {
    const { id } = useParams();
    const navigate = useNavigate();

    // Fetch existing category if editing
    const { data: category } = useQuery({
        queryKey: ['get-category', id],
        queryFn: () => id ? getCategoryById(Number(id)) : Promise.resolve(null),
        enabled: !!id
    });

    // Mutations for creating and updating category
    const updateMutation = useMutation({
        mutationKey: ['update-category'],
        mutationFn: (data: { id: number, data: Partial<CategorySchemaType> }) => updateCategory(data.id, data.data),
        onError: (error) => {
            toast.error('Unable to update category');
            console.error(error);
        },
        onSuccess: () => {
            toast.success('Category updated successfully');
            navigate('/categories');
        },
    });

    const storeMutation = useMutation({
        mutationKey: ['store-category'],
        mutationFn: (data: Partial<CategorySchemaType>) => createNewCategory(data),
        onError: (error) => {
            toast.error('Unable to create new category');
            console.error(error);
        },
        onSuccess: () => {
            toast.success('New category created successfully');
            navigate('/categories');
        },
    });

    // Initialize form
    const categoryForm = useForm<CategorySchemaType>({ resolver: zodResolver(CategorySchema) });

    // Populate form if editing
    useEffect(() => {
        if (category) {
            categoryForm.reset({
                name: category.name,
                parent_id: category.parent_id ?? undefined
            });
        }
    }, [category, categoryForm]);

    // Form submission handler
    const onSubmit: SubmitHandler<CategorySchemaType> = (data) => {
        if (id) {
            updateMutation.mutate({ id: Number(id), data });
        } else {
            storeMutation.mutate(data);
        }
    };

    return (
        <div className="mx-auto mt-10">
            <h2 className="text-2xl font-bold mb-6">{id ? 'Edit Category' : 'Create Category'}</h2>
            <FormProvider {...categoryForm}>
                {/* eslint-disable-next-line @typescript-eslint/no-misused-promises -- handleSubmit */}
                <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4" onSubmit={categoryForm.handleSubmit(onSubmit)}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                            Name
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="name"
                            {...categoryForm.register("name")}
                            placeholder="Enter category name"
                            type="text"
                        />
                        {categoryForm.formState.errors.name ? <p className="mt-2 text-sm text-red-600">{categoryForm.formState.errors.name.message}</p> : null}
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="parent_id">
                            Parent Category
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="parent_id"
                            type="number"
                            {...categoryForm.register("parent_id")}
                            placeholder="Enter parent category ID (optional)"
                        />
                        {categoryForm.formState.errors.parent_id ? <p className="mt-2 text-sm text-red-600">{categoryForm.formState.errors.parent_id.message}</p> : null}

                    </div>

                    <div className="flex items-center justify-between">
                        <button
                            className="bg-blue-500 w-full hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            type="submit"
                        >
                            {id ? 'Update Category' : 'Create New Category'}
                        </button>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
}
