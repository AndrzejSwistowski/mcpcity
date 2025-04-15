import { jest, describe, beforeEach, test, expect } from '@jest/globals';
import { CitySearchHttpClient, CitySearchResult, fetchWrapper, FetchResponse, FetchOptions } from '../src/services/citysearchHttpClient.js';

describe('CitySearchHttpClient', () => {
  let client: CitySearchHttpClient;
  // Fix the type definition to match the fetchWrapper signature
  let mockFetchFn: jest.MockedFunction<typeof fetchWrapper>;
  
  beforeEach(() => {
    // Create a properly typed mock for the fetchWrapper function
    mockFetchFn = jest.fn() as jest.MockedFunction<typeof fetchWrapper>;
    
    // Create client with the mocked fetch function
    client = new CitySearchHttpClient(undefined, mockFetchFn);
    
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  test('search should call the correct URL and return city data', async () => {
    // Mock response data
    const mockCities: CitySearchResult[] = [
      {
        cityNumber: 349,
        cityName: 'Czechowice-Dziedzice',
        country: 'PL',
        region: 'województwo śląskie',
        language: 'PL',
        citySearchQuery: ''
      }
    ];

    // Configure the fetch mock to return the mock data
    mockFetchFn.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCities
    } as FetchResponse);

    // Call the search method
    const result = await client.search('Czechowice-Dziedzice', 'PL');

    // Check that fetch was called with the correct URL
    expect(mockFetchFn).toHaveBeenCalledWith(
      'https://citiessubstitute.t.voyager.pl/CitiesSearch/GetCities?query=Czechowice-Dziedzice&lang=PL',
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    // Check that the result matches our mock data
    expect(result).toEqual(mockCities);
  });

  test('search should throw an error when the API request fails', async () => {
    // Configure the fetch mock to return an error
    mockFetchFn.mockResolvedValueOnce({
      ok: false,
      status: 500
    } as FetchResponse);

    // Call the search method and expect it to throw
    await expect(client.search('Invalid', 'PL')).rejects.toThrow(
      'City search failed with status: 500'
    );
  });

  test('search should encode URL parameters correctly', async () => {
    // Configure the fetch mock
    mockFetchFn.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    } as FetchResponse);

    // Call the search method with characters that need encoding
    await client.search('City Name with spaces & special chars', 'EN');

    // Check that the URL was properly encoded
    expect(mockFetchFn).toHaveBeenCalledWith(
      expect.stringContaining('query=City%20Name%20with%20spaces%20%26%20special%20chars'),
      expect.any(Object)
    );
  });
});