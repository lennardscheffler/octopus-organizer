# Event: untag-selected
Add a new tag to the set of selected file entries.

## Parameters
| Name | Data Type | Description | Example |
|------|-----------|-------------|---------|
| tag | string | Name of the tag | my tag |

## Produced by
| Vue Module | File | Trigger |
|------------|------|---------| 
| toolbar-app | toolbar-app.js | `[untag]` command executed.

## Comumed by
| Vue Module | File | Action |
|------------|------|--------| 
| catalog-app | catalog-app.js | Remove given tag from file entries in the model that are marked as selected. |