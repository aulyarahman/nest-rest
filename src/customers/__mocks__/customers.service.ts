import { customerStub } from '../test/stubs/customer.stub';

export const CustomersService = jest.fn().mockReturnValue({
  findOne: jest.fn().mockReturnValue(customerStub()),
  findAll: jest.fn().mockReturnValue([customerStub()]),
  signupCustomers: jest.fn().mockResolvedValue(customerStub())
});
