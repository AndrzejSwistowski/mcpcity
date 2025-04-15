
/// service that call 'https://citiessubstitute.t.voyager.pl/CitiesSearch/GetCities?query=Czechowice-Dziedzice&lang=PL'
// in the async call method it resive query and lang as params
// and return the colection of the objects with the following properties:
//[
// {
//    "cityNumber": 349,
//    "cityName": "Czechowice-Dziedzice",
//    "country": "PL",
//    "region": "województwo śląskie",
//    "language": "PL",
//    "citySearchQuery": ""
//  }
//]


/**
 * Type definition for fetch options
 */
export type FetchOptions = {
  method: string;
  headers: Record<string, string>;
  [key: string]: any;
};

/**
 * Type definition for fetch response
 */
export interface FetchResponse {
  ok: boolean;
  status: number;
  json: () => Promise<any>;
}

/**
 * Wrapper for the global fetch function
 * This makes it easier to mock in tests without modifying the global object
 */
export const fetchWrapper = async (url: string, options: FetchOptions): Promise<FetchResponse> => {
  return fetch(url, options);
};

/**
 * Represents a city returned from the search API
 */
export interface CitySearchResult {
  cityNumber: number;
  cityName: string;
  country: string;
  region: string;
  language: string;
  citySearchQuery: string;
}

/**
 * Client for searching cities using the Cities API
 */
export class CitySearchHttpClient {
  private baseUrl: string;
  private fetchFn: typeof fetchWrapper;

  /**
   * Creates a new instance of CitySearchHttpClient
   * @param baseUrl Optional base URL for the API. Defaults to 'https://citiessubstitute.t.voyager.pl/CitiesSearch'
   * @param fetchFunction Optional fetch function to use. Defaults to the fetchWrapper function. Useful for testing.
   */
  constructor(baseUrl?: string, fetchFunction: typeof fetchWrapper = fetchWrapper) {
    this.baseUrl = baseUrl || 'https://citiessubstitute.t.voyager.pl/CitiesSearch';
    this.fetchFn = fetchFunction;
  }

  /**
   * Searches for cities matching the query string
   * @param query The search query text
   * @param lang The language code (e.g., 'PL', 'EN')
   * @returns Promise with an array of matching cities
   */
  public async search(query: string, lang: string = 'PL'): Promise<CitySearchResult[]> {
    try {

      const url = `${this.baseUrl}/GetCities?query=${encodeURIComponent(query)}&lang=${encodeURIComponent(lang)}`;

      const response = await this.fetchFn(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`City search failed with status: ${response.status}`);
      }

      const data: CitySearchResult[] = await response.json();

      return data;
    } catch (error) {
      throw error;
    }
  }
}
