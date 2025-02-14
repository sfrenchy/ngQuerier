import {TestBed} from '@angular/core/testing';
import {RequestParametersService} from './request-parameters.service';
import {ColumnSearchDto, DataRequestParametersDto, OrderByParameterDto} from '../models/api.models';

describe('RequestParametersService', () => {
  let service: RequestParametersService;
  let mockParams: DataRequestParametersDto;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RequestParametersService]
    });
    service = TestBed.inject(RequestParametersService);

    // Réinitialiser les paramètres mock avant chaque test
    mockParams = {
      pageNumber: 1,
      pageSize: 1000,
      orderBy: [],
      globalSearch: '',
      columnSearches: []
    };

    // Nettoyer localStorage avant chaque test
    localStorage.clear();
  });

  describe('Column Search Management', () => {
    it('should add a new column search', () => {
      const search: ColumnSearchDto = {column: 'name', value: 'test'};
      const result = service.addColumnSearch(mockParams, search);

      expect(result.columnSearches.length).toBe(1);
      expect(result.columnSearches[0]).toEqual(search);
    });

    it('should update existing column search', () => {
      const initialSearch: ColumnSearchDto = {column: 'name', value: 'test'};
      const updatedSearch: ColumnSearchDto = {column: 'name', value: 'updated'};

      let result = service.addColumnSearch(mockParams, initialSearch);
      result = service.addColumnSearch(result, updatedSearch);

      expect(result.columnSearches.length).toBe(1);
      expect(result.columnSearches[0]).toEqual(updatedSearch);
    });

    it('should remove column search', () => {
      const search: ColumnSearchDto = {column: 'name', value: 'test'};
      let result = service.addColumnSearch(mockParams, search);
      result = service.removeColumnSearch(result, 'name');

      expect(result.columnSearches.length).toBe(0);
    });
  });

  describe('Order By Management', () => {
    it('should add a new order by', () => {
      const order: OrderByParameterDto = {column: 'name', isDescending: true};
      const result = service.addOrderBy(mockParams, order);

      expect(result.orderBy.length).toBe(1);
      expect(result.orderBy[0]).toEqual(order);
    });

    it('should update existing order by', () => {
      const initialOrder: OrderByParameterDto = {column: 'name', isDescending: true};
      const updatedOrder: OrderByParameterDto = {column: 'name', isDescending: false};

      let result = service.addOrderBy(mockParams, initialOrder);
      result = service.addOrderBy(result, updatedOrder);

      expect(result.orderBy.length).toBe(1);
      expect(result.orderBy[0]).toEqual(updatedOrder);
    });

    it('should remove order by', () => {
      const order: OrderByParameterDto = {column: 'name', isDescending: true};
      let result = service.addOrderBy(mockParams, order);
      result = service.removeOrderBy(result, 'name');

      expect(result.orderBy.length).toBe(0);
    });
  });

  describe('LocalStorage Management', () => {
    const cardId = 123;
    const testParams: DataRequestParametersDto = {
      ...mockParams,
      columnSearches: [{column: 'name', value: 'test'}],
      orderBy: [{column: 'date', isDescending: true}]
    };

    it('should save parameters to localStorage', () => {
      service.saveToLocalStorage(cardId, testParams);
      const storedData = localStorage.getItem(`querier_filters_default_user_${cardId}`);

      expect(storedData).toBeTruthy();
      const parsedData = JSON.parse(storedData!);
      expect(parsedData.columnSearches).toEqual(testParams.columnSearches);
      expect(parsedData.orderBy).toEqual(testParams.orderBy);
    });

    it('should load parameters from localStorage', () => {
      service.saveToLocalStorage(cardId, testParams);
      const loadedParams = service.loadFromLocalStorage(cardId);

      expect(loadedParams).toBeTruthy();
      expect(loadedParams!.columnSearches).toEqual(testParams.columnSearches);
      expect(loadedParams!.orderBy).toEqual(testParams.orderBy);
    });

    it('should return null when loading non-existent parameters', () => {
      const loadedParams = service.loadFromLocalStorage(999);
      expect(loadedParams).toBeNull();
    });

    it('should clear parameters from localStorage', () => {
      service.saveToLocalStorage(cardId, testParams);
      service.clearLocalStorage(cardId);

      const storedData = localStorage.getItem(`querier_filters_default_user_${cardId}`);
      expect(storedData).toBeNull();
    });

    it('should handle invalid JSON in localStorage', () => {
      localStorage.setItem(`querier_filters_default_user_${cardId}`, 'invalid json');
      const loadedParams = service.loadFromLocalStorage(cardId);
      expect(loadedParams).toBeNull();
    });
  });
});
