import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { listCategories } from "src/services/category-service";

export function Category() {
  const [expandedCategories, setExpandedCategories] = useState<number[]>([]);
  const { data: categories, isLoading } = useQuery({
    queryKey: ["list-categories"],
    queryFn: () => listCategories(1, 100),
    enabled: true,
  });

  const toggleCategoryExpansion = (categoryId: number) => {
    setExpandedCategories((prevState) =>
      prevState.includes(categoryId)
        ? prevState.filter((id) => id !== categoryId)
        : [...prevState, categoryId]
    );
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Category List</h1>
      <Link to="//categories/add">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600"
          type="button"
        >
          Add Category
        </button>
      </Link>
      <div className="mt-6 overflow-x-auto">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <table className="min-w-full bg-white border border-gray-200 rounded shadow-md">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-6 py-3 border-b">ID</th>
                <th className="px-6 py-3 border-b">Name</th>
                <th className="px-6 py-3 border-b">URL</th>
                <th className="px-6 py-3 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories?.map((category) => (
                <React.Fragment key={category.id}>
                  <tr
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => { toggleCategoryExpansion(category.id); }}
                  >
                    <td className="px-6 py-4">{category.id}</td>
                    <td className="px-6 py-4">{category.name}</td>
                    <td className="px-6 py-4">{category.url}</td>
                    <td className="px-6 py-4">
                      <Link to={`/categories/edit/${category.id}`}>
                        <button
                          className="bg-yellow-500 text-white px-3 py-1 rounded mr-2 hover:bg-yellow-600"
                          type="button"
                        >
                          Edit
                        </button>
                      </Link>
                    </td>
                  </tr>

                  {expandedCategories.includes(category.id) && category.childCategories.map((child) => (
                    <tr className="bg-gray-100 border-b hover:bg-gray-200" key={child.id}>
                      <td className="pl-12 px-6 py-4">-- {child.id}</td>
                      <td className="pl-12 px-6 py-4">{child.name}</td>
                      <td className="pl-12 px-6 py-4">{child.url}</td>
                      <td className="pl-12 px-6 py-4">
                        <Link to={`/categories/edit/${child.id}`}>
                          <button
                            className="bg-yellow-500 text-white px-3 py-1 rounded mr-2 hover:bg-yellow-600"
                            type="button"
                          >
                            Edit
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
