import { Test } from '@nestjs/testing';
import { CustomersController } from '../customers.controller';
import { CustomersService } from '../customers.service';
import { customerStub } from './stubs/customer.stub';
import { CustomerTypes } from '../interface';

jest.mock('../customers.service');

describe('CustomersController', () => {
  let customersController: CustomersController;
  let customersService: CustomersService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [CustomersController],
      providers: [CustomersService]
    }).compile();

    customersController = moduleRef.get<CustomersController>(CustomersController);
    customersService = moduleRef.get<CustomersService>(CustomersService);
    jest.clearAllMocks();
  });

  /**
   * FIND ALL
   */
  describe('findAll', () => {
    describe('when findAll is called', () => {
      //
      let customer: CustomerTypes[];
      beforeEach(async () => {
        customer = await customersController.findAll();
      });

      test('then is should returns customer all', () => {
        expect(customer).toEqual([customerStub()]);
      });
    });
  });

  /**
   * FIND ONE
   */
  describe('findOne', () => {
    describe('when findOne is called', () => {
      //
      let customer: CustomerTypes;
      beforeEach(async () => {
        customer = await customersController.findOne(customerStub().id);
      });

      test('then it should call customer service', () => {
        expect(customersService.findOne).toBeCalledWith(customerStub().id);
      });

      test('then is should returns customer', () => {
        expect(customer).toEqual(customerStub());
      });
    });
  });

  /**
   * SIGNUP
   */
  describe('signup', () => {
    describe('when signup is called', () => {
      //
      let customer: CustomerTypes;
      const datas = {
        email: customerStub().email,
        phoneNumber: customerStub().phoneNumber,
        name: customerStub().name
      };

      beforeEach(async () => {
        customer = await customersService.signupCustomers(datas);
      });

      test('then it should call customer service', () => {
        expect(customersService.signupCustomers).toBeCalledWith(datas);
      });

      test('then is should returns signup', () => {
        expect(customer).toEqual(customerStub());
      });
    });
  });
});
