import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import type { SubmitHandler } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createNewProduct, getProductById, updateProduct, uploadImage, deleteImage } from "src/services/product-service"; // Update import paths
import { toast } from "react-toastify";
import type { ProductImage } from "@ecommerce/database";
import { listCategories } from "src/services/category-service";

// Define the Zod schema for product
const ProductSchema = z.object({
    name: z.string().min(1, "Product name is required"),
    description: z.string().min(1, "Description is required"),
    price: z.coerce.number().min(0, "Price must be a positive number"),
    quantity: z.coerce.number().int().min(0, "Quantity must be a non-negative integer"),
    discount: z.coerce.number().int().min(0, "Discount must be a non-negative number"),
    tags: z.string().optional(),
    categoryId: z.coerce.number().int().min(1, "Category is required"),
});

type ProductSchemaType = z.infer<typeof ProductSchema>;

export function ProductForm() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: product } = useQuery({
        queryKey: ['get-product', id],
        queryFn: () => id ? getProductById(Number(id)) : Promise.resolve(null),
        enabled: !!id
    });

    const { data: categories } = useQuery({
        queryKey: ['get-categories'],
        queryFn: () => listCategories(),
        enabled: true
    });

    const allCategories = useMemo(() => {
        if (!categories) return [];
        return categories.map(c => {
            const { childCategories, ...rest } = c;
            return [...childCategories, rest];
        }).flat();
    }, [categories]);


    const [productImages, setProductImages] = useState<ProductImage[]>([]);
    const [newImages, setNewImages] = useState<{ file: File, preview: string }[]>([]); // For new images

    useEffect(() => {
        if (product) {
            setProductImages(product.images);
        }
    }, [product]);

    const updateMutation = useMutation({
        mutationKey: ['update-product'],
        mutationFn: (data: { id: number, data: Partial<ProductSchemaType> }) => updateProduct(data.id, data.data),
        onError: (error) => {
            toast.error('Unable to update product');
            console.error(error);
        },
        onSuccess: () => {
            toast.success('Product updated successfully');
            navigate('/products');
        },
    });

    const storeMutation = useMutation({
        mutationKey: ['store-product'],
        mutationFn: (data: FormData) => createNewProduct(data),
        onError: (error) => {
            toast.error('Unable to create new product');
            console.error(error);
        },
        onSuccess: () => {
            toast.success('New product created successfully');
            navigate('/products');
        },
    });

    const uploadImageMutation = useMutation({
        mutationKey: ['upload-image'],
        mutationFn: (formData: FormData) => uploadImage(Number(id), formData),
        onSuccess: (response) => {
            setProductImages(prev => [...prev, response]);
        },
        onError: () => {
            toast.error('Failed to upload image');
        }
    });

    const deleteImageMutation = useMutation({
        mutationKey: ['delete-image'],
        mutationFn: (imageId: number) => deleteImage(imageId),
        onSuccess: (data) => {
            const imageIndex = productImages.findIndex((i) => i.id === data.id);
            if (imageIndex === -1) return;

            const updatedImages = [...productImages];
            updatedImages.splice(imageIndex, 1);

            setProductImages(updatedImages);
        },
        onError: (error) => {
            toast.error('Failed to delete image');
            console.error(error);
        },
    });


    const productForm = useForm<ProductSchemaType>({
        resolver: zodResolver(ProductSchema),
    });

    useEffect(() => {
        if (product) {
            productForm.reset({
                name: product.name,
                description: product.description,
                price: product.price,
                quantity: product.quantity,
                discount: product.discount,
                tags: product.tags ?? '',
                categoryId: product.categoryId,
            });
        }
    }, [product, productForm]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        console.log(file.size);

        if (id) {
            const formData = new FormData();
            formData.append('file', file);
            uploadImageMutation.mutate(formData);
        } else {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewImages(prev => [...prev, { file, preview: reader.result as string }]);
            };
            reader.readAsDataURL(file);  // Convert file to base64 preview
        }
    };


    const handleImageRemove = (imageId: number) => {
        deleteImageMutation.mutate(imageId);
    };

    const onSubmit: SubmitHandler<ProductSchemaType> = (data) => {

        if (id) {
            updateMutation.mutate({ id: Number(id), data });
        } else {
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                formData.append(key, String(value));
            });
            newImages.forEach((img) => {
                formData.append('images', img.file);
            });
            storeMutation.mutate(formData);
        }
    };


    return (
        <div className="w-full mx-auto mt-10 px-4">
            <h2 className="text-3xl font-extrabold text-left mb-10 text-gray-900">
                {id ? 'Edit Product' : 'Create Product'}
            </h2>

            <FormProvider {...productForm}>
                <form
                    className="bg-white shadow-lg rounded-lg px-8 pb-4 mx-auto"
                    // eslint-disable-next-line @typescript-eslint/no-misused-promises
                    onSubmit={productForm.handleSubmit(onSubmit)}
                >
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                            Name
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="name"
                            {...productForm.register("name")}
                            placeholder="Enter product name"
                            type="text"
                        />
                        {productForm.formState.errors.name ? <p className="mt-2 text-sm text-red-600">{productForm.formState.errors.name.message}</p> : null}
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="categoryId">
                            Category
                        </label>
                        <select
                            id="categoryId"
                            {...productForm.register("categoryId")}
                            className="w-full px-4 py-2 text-gray-800 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option disabled value="">
                                Select a category
                            </option>
                            {allCategories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>

                        {productForm.formState.errors.categoryId ? <p className="mt-2 text-sm text-red-600">{productForm.formState.errors.categoryId.message}</p> : null}
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                            Description
                        </label>
                        <textarea
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="description"
                            {...productForm.register("description")}
                            placeholder="Enter product description"
                        />
                        {productForm.formState.errors.description ? <p className="mt-2 text-sm text-red-600">{productForm.formState.errors.description.message}</p> : null}
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
                            Price
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="price"
                            step="0.01"
                            type="number"
                            {...productForm.register("price")}
                            placeholder="Enter product price"
                        />
                        {productForm.formState.errors.price ? <p className="mt-2 text-sm text-red-600">{productForm.formState.errors.price.message}</p> : null}
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="quantity">
                            Quantity
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="quantity"
                            type="number"
                            {...productForm.register("quantity")}
                            placeholder="Enter product quantity"
                        />
                        {productForm.formState.errors.quantity ? <p className="mt-2 text-sm text-red-600">{productForm.formState.errors.quantity.message}</p> : null}
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="discount">
                            Discount
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="discount"
                            type="number"
                            {...productForm.register("discount")}
                            placeholder="Enter discount amount"
                        />
                        {productForm.formState.errors.discount ? <p className="mt-2 text-sm text-red-600">{productForm.formState.errors.discount.message}</p> : null}
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tags">
                            Tags
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="tags"
                            {...productForm.register("tags")}
                            placeholder="Enter tags (comma-separated)"
                        />
                        {productForm.formState.errors.tags ? <p className="mt-2 text-sm text-red-600">{productForm.formState.errors.tags.message}</p> : null}
                    </div>

                    <div className="mb-8">
                        <h4 className="block text-gray-800 text-lg font-semibold mb-4">
                            Product Images
                        </h4>

                        {/* Display existing images for update */}
                        {productImages.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                                {productImages.map((item) => (
                                    <div
                                        className="relative bg-gray-100 rounded overflow-hidden"
                                        key={item.id}
                                    >
                                        <img
                                            alt="Product"
                                            className="w-full h-full object-cover rounded"
                                            src={item.url}
                                        />
                                        <button
                                            className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1 px-2 rounded"
                                            onClick={() => { handleImageRemove(item.id); }}
                                            type="button"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* New images preview for create */}
                        {newImages.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                                {newImages.map((img, idx) => (
                                    <div
                                        className="relative bg-gray-100 rounded overflow-hidden"
                                        // eslint-disable-next-line react/no-array-index-key
                                        key={idx}
                                    >
                                        <img
                                            alt="Preview"
                                            className="w-full h-full object-cover rounded"
                                            src={img.preview}
                                        />
                                        <button
                                            className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1 px-2 rounded"
                                            onClick={() => { setNewImages(newImages.filter((_, i) => i !== idx)); }}
                                            type="button"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="fileInput">
                            Upload New Images
                        </label>
                        <input
                            accept="image/*"
                            className="w-full px-4 py-2 text-sm text-gray-800 bg-gray-50 border border-gray-300 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                            id="fileInput"
                            onChange={handleFileChange}
                            type="file"
                        />
                    </div>

                    <div className="flex items-center justify-between mt-8">
                        <button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            type="submit"
                        >
                            {id ? 'Update Product' : 'Create New Product'}
                        </button>
                    </div>
                </form>
            </FormProvider>
        </div>

    );
}
