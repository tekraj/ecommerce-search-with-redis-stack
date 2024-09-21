import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { Link } from 'react-router-dom';
import { listUsers } from '../../services/user-service';
export function User() {
  const { data: users, isLoading } = useQuery({
    queryKey: ['list-users'],
    queryFn: () => listUsers(1, 100),
    enabled: true
  });
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">User List</h1>
      <Link to="users/add">
        <button className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600" type='button'>
          Add User
        </button>
      </Link>
      <div className="mt-6 overflow-x-auto">
        {isLoading ? <p>Loading...</p> : <table className="min-w-full bg-white border border-gray-200 rounded shadow-md">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-6 py-3 border-b">ID</th>
              <th className="px-6 py-3 border-b">Name</th>
              <th className="px-6 py-3 border-b">Email</th>
              <th className="px-6 py-3 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users?.map(user => (
              <tr className="border-b hover:bg-gray-50" key={user.id}>
                <td className="px-6 py-4">{user.id}</td>
                <td className="px-6 py-4">{user.name}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">
                  <Link to={`/users/edit/${user.id}`}>
                    <button className="bg-yellow-500 text-white px-3 py-1 rounded mr-2 hover:bg-yellow-600" type='button'>
                      Edit
                    </button>
                  </Link>

                </td>
              </tr>
            ))}
          </tbody>
        </table>
        }
      </div>
    </div>
  );
}


