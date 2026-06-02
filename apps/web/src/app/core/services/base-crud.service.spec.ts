import { TestBed } from '@angular/core/testing';
import { BaseCrudService } from './base-crud.service';
import { PocketBaseClient } from '../../infrastructure/pocketbase/pocketbase.client';

interface TestModel {
  id: string;
  name: string;
}

class ConcreteCrudService extends BaseCrudService<TestModel> {
  constructor(pbClient: PocketBaseClient) {
    super(pbClient, 'test_collection');
  }
}

describe('BaseCrudService', () => {
  let service: ConcreteCrudService;
  let mockCollection: jasmine.SpyObj<ReturnType<PocketBaseClient['instance']['collection']>>;

  function createMockPbClient() {
    mockCollection = jasmine.createSpyObj('RecordService', [
      'getList',
      'getOne',
      'create',
      'update',
      'delete',
    ]);

    const mockPb = {
      collection: jasmine.createSpy('collection').and.returnValue(mockCollection),
    };

    return { instance: mockPb } as unknown as jasmine.SpyObj<PocketBaseClient>;
  }

  beforeEach(() => {
    const mockPbClient = createMockPbClient();

    TestBed.configureTestingModule({
      providers: [
        { provide: PocketBaseClient, useValue: mockPbClient },
      ],
    });

    const pbClient = TestBed.inject(PocketBaseClient);
    service = new ConcreteCrudService(pbClient);
  });

  describe('getList', () => {
    it('should call collection.getList with pagination params', async () => {
      const expectedResult = { items: [], totalItems: 0, totalPages: 0, page: 1, perPage: 50 };
      mockCollection.getList.and.resolveTo(expectedResult);

      const result = await service.getList(1, 50, { filter: '' });

      expect(mockCollection.getList).toHaveBeenCalledWith(1, 50, { filter: '' });
      expect(result).toEqual(expectedResult as any);
    });

    it('should use default page and perPage when not provided', async () => {
      mockCollection.getList.and.resolveTo({} as any);

      await service.getList();

      expect(mockCollection.getList).toHaveBeenCalledWith(1, 50, undefined);
    });
  });

  describe('getById', () => {
    it('should call collection.getOne with the given id', async () => {
      const expected = { id: '123', name: 'Test Item', collectionId: 'test', collectionName: 'test' };
      mockCollection.getOne.and.resolveTo(expected);

      const result = await service.getById('123', { expand: 'field' });

      expect(mockCollection.getOne).toHaveBeenCalledWith('123', { expand: 'field' });
      expect(result).toEqual(expected);
    });
  });

  describe('create', () => {
    it('should call collection.create with the data', async () => {
      const data = { name: 'New Item' };
      const expected = { id: '1', collectionId: 'test', collectionName: 'test', ...data };
      mockCollection.create.and.resolveTo(expected);

      const result = await service.create(data);

      expect(mockCollection.create).toHaveBeenCalledWith(data, undefined);
      expect(result).toEqual(expected);
    });

    it('should pass options to collection.create', async () => {
      const data = { name: 'New Item' };
      mockCollection.create.and.resolveTo({} as any);

      await service.create(data, { expand: 'field' });

      expect(mockCollection.create).toHaveBeenCalledWith(data, { expand: 'field' });
    });
  });

  describe('update', () => {
    it('should call collection.update with id and data', async () => {
      const data = { name: 'Updated' };
      const expected = { id: '1', collectionId: 'test', collectionName: 'test', name: 'Updated' };
      mockCollection.update.and.resolveTo(expected);

      const result = await service.update('1', data);

      expect(mockCollection.update).toHaveBeenCalledWith('1', data, undefined);
      expect(result).toEqual(expected);
    });
  });

  describe('delete', () => {
    it('should call collection.delete with the given id', async () => {
      mockCollection.delete.and.resolveTo(true);

      const result = await service.delete('123');

      expect(mockCollection.delete).toHaveBeenCalledWith('123', undefined);
      expect(result).toBeTrue();
    });
  });

  it('should initialize collection on construction', () => {
    const pbClient = TestBed.inject(PocketBaseClient);
    expect(pbClient.instance.collection).toHaveBeenCalledWith('test_collection');
  });
});
