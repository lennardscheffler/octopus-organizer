# Event: add-file
Add a new file to the file catalog.

## Parameters
| Name | Data Type | Description | Example |
|------|-----------|-------------|---------|
| path | string | The fill path to the file on the local file system. | /Users/berry/myfile.txt |

# Produced by
| Vue Module | File | Trigger |
|------------|------|---------| 
| - | dragdrop.js | File is dropped into the application window from outside.

# Comumed by
| Vue Module | File | Action |
|------------|------|--------| 
| catalog-app | catalog-app.js | Add a file entry to the file catalog model. |