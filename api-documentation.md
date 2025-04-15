# MCP City Sindbad - API Documentation

## Overview

The MCP City Sindbad is a service that implements the Model Context Protocol (MCP) for city search functionality. This service allows client applications to search for cities based on query strings, returning rich information about matched cities including their names, regions, and countries.

## API Endpoints

### City Search API

The City Search API is the core functionality exposed through the MCP interface as a tool.

#### Tool Name: `city_search`

**Description:** Search for cities based on a query string.

**Input Schema:**

```json
{
  "type": "object",
  "properties": {
    "q": {
      "type": "string",
      "description": "query"
    },
    "language": {
      "type": "string",
      "default": "pl"
    }
  },
  "required": ["q"]
}
```

**Parameters:**

| Parameter | Type   | Required | Default | Description                          |
|-----------|--------|----------|---------|--------------------------------------|
| q         | string | Yes      | N/A     | The query string to search for cities |
| language  | string | No       | "pl"    | Language code for the search results (e.g., "pl", "en") |

**Response Structure:**

The response is an array of city objects with the following structure:

```json
[
  {
    "cityNumber": number,
    "cityName": string,
    "country": string,
    "region": string,
    "language": string,
    "citySearchQuery": string
  }
]
```

**Response Fields:**

| Field          | Type   | Description                                          |
|----------------|--------|------------------------------------------------------|
| cityNumber     | number | Unique identifier for the city                       |
| cityName       | string | Name of the city                                     |
| country        | string | Country code where the city is located (e.g., "PL")  |
| region         | string | Region or administrative division within the country |
| language       | string | Language code of the response (e.g., "PL", "EN")     |
| citySearchQuery| string | Original search query (if returned by the API)       |

**Example Request:**

```json
{
  "q": "Czechowice-Dziedzice",
  "language": "PL"
}
```

**Example Response:**

```json
[
  {
    "cityNumber": 349,
    "cityName": "Czechowice-Dziedzice",
    "country": "PL",
    "region": "województwo śląskie",
    "language": "PL",
    "citySearchQuery": ""
  }
]
```

## Error Handling

The API returns standardized error responses when issues occur:

### Validation Errors

If the input doesn't match the required schema, a validation error is returned:

```json
{
  "error": "Invalid input: [error details]"
}
```

### API Errors

If the underlying city search service encounters an error:

```json
{
  "error": "City search failed with status: [status code]"
}
```

### Unknown Tool Error

If a request is made to a tool that doesn't exist:

```json
{
  "error": "Unknown tool: [tool name]"
}
```

## Implementation Details

### Underlying Service

The MCP City service makes requests to the following external API:

```
https://citiessubstitute.t.voyager.pl/CitiesSearch/GetCities
```

Parameters are passed as URL query parameters:
- `query`: The search string
- `lang`: Language code (e.g., "PL", "EN")

### Character Encoding

All query parameters are properly URL-encoded to handle special characters, spaces, and non-ASCII characters.

## Limitations

1. The service depends on an external API and will fail if that API is unreachable.
2. Results are limited to cities available in the external database.
3. Search accuracy depends on the external API's matching algorithms.

## Best Practices

1. **Be Specific**: More specific queries produce more accurate results.
2. **Use Native Names**: For best results, use the native spelling of city names when possible.
3. **Error Handling**: Always implement proper error handling in your client application.
4. **Language Code**: Use appropriate language codes based on user preferences.

## Rate Limiting

This service might be subject to rate limiting from the underlying API. Implement appropriate retry logic and error handling in high-volume scenarios.
