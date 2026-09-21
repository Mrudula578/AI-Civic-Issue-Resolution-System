# Categories API Documentation

The Categories API provides endpoints for managing and retrieving civic issue categories in the CivicResolve system.

## Overview

Categories are used to classify civic complaints and issues. They are public information that doesn't require authentication to view.

## Base URL

```
/api/categories
```

## Endpoints

### 1. Get All Categories

**GET** `/api/categories`

Retrieves all categories for the municipality. Optionally supports search functionality.

#### Query Parameters

| Parameter | Type   | Required | Description                    |
|-----------|--------|----------|--------------------------------|
| search    | string | No       | Search term to filter categories by name |

#### Response

```json
{
  "categories": [
    {
      "id": "uuid",
      "name": "Pothole",
      "icon": "🛣️"
    },
    {
      "id": "uuid", 
      "name": "Garbage",
      "icon": "🗑️"
    }
  ],
  "count": 2
}
```

#### Example Requests

```bash
# Get all categories
curl -X GET http://localhost:3000/api/categories

# Search categories
curl -X GET http://localhost:3000/api/categories?search=pot
```

---

### 2. Get Category by ID

**GET** `/api/categories/:id`

Retrieves a specific category by its UUID.

#### Path Parameters

| Parameter | Type   | Required | Description        |
|-----------|--------|----------|--------------------|
| id        | UUID   | Yes      | Category UUID      |

#### Response

```json
{
  "id": "uuid",
  "name": "Pothole", 
  "icon": "🛣️",
  "municipality": {
    "id": "uuid",
    "name": "Default Municipality"
  }
}
```

#### Error Responses

- **400 Bad Request**: Invalid UUID format
- **404 Not Found**: Category doesn't exist

#### Example Request

```bash
curl -X GET http://localhost:3000/api/categories/550e8400-e29b-41d4-a716-446655440000
```

---

### 3. Get Category Statistics

**GET** `/api/categories/stats`

Retrieves statistics about categories including complaint counts for each category.

#### Response

```json
{
  "categoryStats": [
    {
      "id": "uuid",
      "name": "Pothole",
      "icon": "🛣️", 
      "complaintCount": 15
    },
    {
      "id": "uuid",
      "name": "Garbage",
      "icon": "🗑️",
      "complaintCount": 8
    }
  ],
  "summary": {
    "totalCategories": 2,
    "totalComplaints": 23,
    "mostReported": {
      "id": "uuid",
      "name": "Pothole",
      "icon": "🛣️",
      "complaintCount": 15
    }
  }
}
```

#### Example Request

```bash
curl -X GET http://localhost:3000/api/categories/stats
```

## Default Categories

The system comes with the following predefined categories:

| Name          | Icon | Description                    |
|---------------|------|--------------------------------|
| Pothole       | 🛣️   | Road surface issues            |
| Garbage       | 🗑️   | Waste management issues        |
| Water Leakage | 💧   | Water pipe or system leaks    |
| Streetlight   | 💡   | Street lighting issues         |
| Drainage      | 🚰   | Drainage and sewage problems   |
| Other         | 📝   | Miscellaneous issues           |

## Features

### Search Functionality
- Case-insensitive partial matching on category names
- Automatic limiting to 10 results for performance
- Useful for autocomplete implementations

### Municipality Support
- Categories are scoped to municipalities
- Automatically uses default municipality if none specified
- Supports multi-tenant architecture

### Error Handling
- Proper HTTP status codes
- Structured error responses
- Comprehensive logging

## Usage Examples

### Frontend Integration

```javascript
// Fetch all categories for a dropdown
const fetchCategories = async () => {
  try {
    const response = await fetch('/api/categories');
    const data = await response.json();
    return data.categories;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
  }
};

// Search categories for autocomplete
const searchCategories = async (term) => {
  try {
    const response = await fetch(`/api/categories?search=${encodeURIComponent(term)}`);
    const data = await response.json();
    return data.categories;
  } catch (error) {
    console.error('Failed to search categories:', error);
  }
};

// Get category statistics for dashboard
const getCategoryStats = async () => {
  try {
    const response = await fetch('/api/categories/stats');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch category stats:', error);
  }
};
```

## Testing

A test script is provided at `scripts/test-categories.js` to verify the endpoints:

```bash
node scripts/test-categories.js
```

This will test all endpoints and display the responses, helping verify the implementation works correctly.

## Security Notes

- All category endpoints are public (no authentication required)
- Categories are read-only through the API
- UUID validation prevents injection attacks
- Rate limiting applies to prevent abuse

## Related Files

- **Routes**: `src/routes/category.routes.js`
- **Controller**: `src/controllers/category.controller.js` 
- **Service**: `src/services/category.service.js`
- **Database Schema**: `prisma/schema.prisma`
- **Seed Data**: `prisma/seed.js`
- **Tests**: `scripts/test-categories.js`