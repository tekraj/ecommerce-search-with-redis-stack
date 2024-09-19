import { UserService } from './services/user-service';

const userService = new UserService();
const setup = async () => {
  const password =
    '$2b$10$RHyazVkE5IypGxn6uQ1XT.w.0MOpzU6oXBPB6YT0dt3AmLc6ubV6e'; // test@123
  return userService.create({
    name: 'Test',
    email: 'test@gmail.com',
    password,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
};

setup()
  .then((data) => {
    console.log(data);
  })
  .catch((e) => {
    console.log(e);
  });
