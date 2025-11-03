API /members/members-by-classroom-id/{classroomId}
<table>
<tr>
<td> Old format response  </td> <td> New format response </td>
</tr>
<tr>
<td>

```json
json
  {
    "id": "472186c5-3b0b-4cbd-8064-b94a7742e232",
    "first_name": "Hồ Văn",
    "last_name": "Mộng",
    "birthday": null,
    "note": null,
    "order_index": "35000.000000",
    "avatar": null,
    "display_order": 35
  }
```
</td>
<td> 

```json
json
  {
    "id": "unique-id",           // Unique identifier (required)
    "data": {                    // Person's data (required)
      "gender": "M",             // Gender (M/F) - REQUIRED
      // All other properties are custom and optional
      "first name": "John",      // Example: First name
      "last name": "Doe",        // Example: Last name
      "birthday": "1980",        // Example: Birthday
      "date_of_death": "",      // Example: Date of Death
      "avatar": "image-url"      // Example: Avatar image URL
      // Add any additional properties you need
    },
    "rels": {                    // Relationships (required)
      "father": "father-id",     // Father's ID (optional)
      "mother": "mother-id",     // Mother's ID (optional)
      "spouses": ["spouse1-id", "spouse2-id"], // Array of spouse IDs (optional)
      "children": ["child1-id", "child2-id"]   // Array of children IDs (optional)
    }
  }
```
</td>
</tr>
<tr>
<td> 
</td>
<td>
</td>
</tr>
</table>