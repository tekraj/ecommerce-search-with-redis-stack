import { UserService } from './services/user-service';
import { hashPassword } from './utils/password';

const userService = new UserService();
const setup = async () => {
  const password = await hashPassword('test@123');
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
