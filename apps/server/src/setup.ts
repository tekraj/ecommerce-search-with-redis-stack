import { UserService } from './services/user-service';

const userService = new UserService();
const setup = async () => {
  return userService.upsert({
    name: 'Test',
    email: 'test@gmail.com',
    password: 'test@123',
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
