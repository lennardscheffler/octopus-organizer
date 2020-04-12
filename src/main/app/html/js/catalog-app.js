const fs = require('fs');
var util = require('util');
var exec = require('child_process').exec;

var catalogApp = new Vue({
    el: '#catalog-app',

    mounted() {
        var self = this;
        events.$on('add-file', function(path) { 
          self.addFile(path);
        });

        events.$on('remove-selected', function(path) { 
            self.removeFiles(f => f.isSelected);
        });
        
        events.$on('tag-selected', function(tag) { 
            self.addTag(tag, (file) => {
                return file.isSelected;
            });
        });

        events.$on('untag-selected', function(tag) { 
            self.removeTag(tag, (file) => {
                return file.isSelected;
            });
        });

        events.$on('clear-tags-selected', function(tag) { 
            self.clearTags((file) => {
                return file.isSelected;
            });
        });

        events.$on('clear-filters', function(tag) { 
            self.clearFilters();
        });

        events.$on('filter', function(pattern) { 
            self.filter(pattern);
        });

        events.$on('select-by-pattern', function(pattern) { 
            self.selectByPattern(pattern);
        });

        events.$on('select-tags', function(tags) { 
            self.selectedTags = tags;
        });

        events.$on('select-type-categories', function(categories) { 
            self.selectedTypeCategories = categories;
        });

        events.$on('rename-selected', function(title) { 
            if (self.files.filter(f => f.isSelected).length == 1) {
                self.rename(self.files.find(f => f.isSelected).id, title);
            }            
        });

        events.$on('stack-selected', function(title) {             
            self.stack(title, (f) => {
                return f.isSelected;
            });            
        });

        events.$on('unstack-selected', function() {             
            self.unstack((f) => {
                return f.isSelected;
            });            
        });

        events.$on('display-preview', function(state) {             
            if (state == undefined)
                self.visuals.preview = !self.visuals.preview;
            else 
                self.visuals.preview = state;

            events.$emit('display-preview-changed', self.visuals.preview);
        });

        events.$on('display-sidebar', function(state) {      
            if (state == undefined)
                self.visuals.sidebar = !self.visuals.sidebar;
            else        
                self.visuals.sidebar = state;

            events.$emit('display-sidebar-changed', self.visuals.sidebar);
        });

        events.$on('update-tags', function() {
            events.$emit('tags-updated', self.tags());
        });

        window.addEventListener('keyup', function(event) {     
            console.log(event.keyCode);
            if (event.ctrlKey && event.keyCode == 32) { 
                // CTRL+SPACE
                $('#commander').focus();
                $('#imenu').slideDown('fast');
            }
            if (event.ctrlKey && event.keyCode == 84) { 
                // CTRL+T
                $('#commander').focus();                
            }
            else if (event.keyCode == 27) {                
                // ESC
                events.$emit('clear-filters');
            }
            else if (event.ctrlKey && event.keyCode == 220) {
                // STRG + #
                fillCommander('tag', 'tag');
            }
            else if (event.keyCode == 220) { 
                // #
                fillCommander('#', 'tag', false)                
            }
            else if (event.keyCode == 187) { 
                // #
                fillCommander('+', 'tag', false)                
            }
            else if (event.keyCode == 189) { 
                // #
                fillCommander('-', 'tag', false)                
            }
            else if(event.keyCode == 48) {
                // =
                var title = self.files.find(f => f.isSelected).title;
                fillCommander('=', title, false);
            }
            else if (event.keyCode == 46) {
                // ENTF
                events.$emit('remove-selected');
            }            
            else if (event.ctrlKey && event.keyCode == 65) {
                // STRG + A
                events.$emit('select-by-pattern', '.*');
            }            
        });

        this.load();

        $('#loading-screen').fadeOut();
    },

    data: {
        filterPattern: '.*',
        selectedTags: [ ],
        selectedTypeCategories: [ ],
        files: [ ],
        visuals: {
            sidebar: true,
            preview: true
        }
     },

     methods: {        

        /**
         * Add a file to the catalog.
         * 
         * @param {string} filename 
         */
        addFile: function(filename) {          

            if (filename.match(/(^[a-z]:[\\\/].+)|(^\/.*)/ig)) {
                // Filename pattern matches a local file
                rxFileExtension = /\.([a-z0-9]*)$/ig;     
                var fileExtension = rxFileExtension.exec(filename)[1];       

                this.files.push({
                    id: uuid(),
                    role: 'file',
                    title: filename.replace(/^.*[\\\/]/, ''),
                    extension: fileExtension,
                    typeCategory: this.getTypeCategoryByExtension(fileExtension, 2),
                    path: filename,
                    tags: [ ],
                    isSelected: false,
                    stats: fs.statSync(filename)
                });
            }
            else if (filename.match(/^(http:\/\/|https:\/\/|www\.).*/ig)) {
                // Filename pattern matches a URL
                this.files.push({
                    id: uuid(),
                    role: 'url',
                    typeCategory: 'url',
                    title: filename,                    
                    path: filename,
                    tags: [ ],
                    isSelected: false                    
                });
            }

            this.persist();
        },

        /**
         * Remove a file from the catalog.
         *
         *  @param {function} filter Function to filter for files to be removed form the catalog.
         */
        removeFiles: function(filter) {
            this.files = this.files.filter(f => !filter(f));

            this.persist();
        },

        /**
         * Get an array of stacks. Each stack is included only once.
         */
        tags: function() {
            var tags = [];

            // Fill array with tags
            this.files.forEach(f => f.tags.forEach(s => tags.push(s)));
            
            // Exclude doublicates
            tags = tags.filter((elem, pos, array) => {
                return array.indexOf(elem) == pos;
            });
            
            tags.sort((a, b) => {                
                // Sort by title
                //return a.toLowerCase() > b.toLowerCase() ? 1 : -1;

                // Sort by occurance                
                return this.taggedFiles(b).length - this.taggedFiles(a).length;
            });

            return tags;
        },

        /**
         * Get a list of files related to particular stack.
         * 
         * @param {string} stack Name of stack to be fetched from the catalog.
         */
        taggedFiles: function(tag) {
            return this.files.filter(f => f.tags.includes(tag));
        },
 
        /**
         * Mark a file as selected.
         * 
         * @param {int} id Unique identifier of the file item.
         */
        select: function(id) {
            this.filteredFiles.find(f => f.id == id).isSelected = true;
        },

        /**
         * Mark a file as unselected.
         * 
         * @param {int} id Unique identifier of the file item.
         */
        unselect: function(id) {
            files.find(f => f.id == id).isSelected = false;
        },

        /**
         * Mark all files as unselected.
         * 
         * @param {int} id Unique identifier of the file item.
         */
        unselectAll: function() {
            this.files.map(f => f.isSelected = false);
        },

        /**
         * Toogle the selection of a file item.
         * 
         * @param {int} id Unique identifier of a file item.
         * @param {boolean} keepCurrentSelection Identifies if the currently selected items should be kept selected.
         */
        toggleSelection: function(id, keepCurrentSelection) {
            if (!keepCurrentSelection) {
                this.unselectAll();
            }

            var file = this.files.find(f => f.id == id);
            file.isSelected = !file.isSelected;

            if (file.isSelected) 
                file.selections = (file.selections || 1) + 1;
        },

        /**
         * Add a tag to a set of file items identified by a filter function.
         * 
         * @param {string} tag The tag that should be added to the file items.
         * @param {function} filter The filter function determining which files should be tagged.
         */
        addTag: function(tag, filter) {
            this.files.filter(
                // Only files that match the filter function
                f => filter(f)
            ).map(
                // For every matching file, add the tag input
                f => {
                    if (!f.tags.includes(tag)) f.tags.push(tag)
                }
            );

            events.$emit('tags-updated', this.tags());

            this.persist();
        },

        /**
         * Remove a tag from a set of file items identified by a filter function.
         * 
         * @param {string} tag The tag that should be removed from the file items.
         * @param {function} filter The filter function determining which files should be untagged.
         */
        removeTag: function(tag, filter) {
            this.files.filter(
                // Only files that match the filter function
                f => filter(f)
            ).map(
                // for every matching file, remove tags that match the tag input
                f => f.tags = f.tags.filter(t => t != tag)
            );

            events.$emit('tags-updated', this.tags());

            this.persist();
        },

        /**
         * Remove all tags from a set of file items.
         * 
         * @param {function} filter The filter function determining which files should be untagged.
         */
        clearTags: function(filter) {
            this.files.filter(
                // Only files that match the filter function
                f => filter(f)
            ).map(
                // for every matching file, remove tags 
                f => f.tags = []
            );

            events.$emit('tags-updated', this.tags());

            this.persist();
        },

        /**
         * Rename a file in the catalog. (No change in File Syetem.)
         * 
         * @param {int} id The ID of the file.
         * @param {string} title The new Title
         */
        rename: function(id, title) {
            this.files.filter(
                f => f.id == id
            ).map(
                f => f.title = title
            );

            this.persist();
        },

        /**
         * Set the file filter pattern in order to filter the current list of files.
         * 
         * @param {RegExp} pattern Regular Expression taht is used in order to filter the file catalog.
         */
        filter(pattern) {
            this.filterPattern = pattern || '.*';
        },

        /**
         * Mark a set of file items as selected.
         * 
         * @param {RegExp} pattern Regular Expresion that is used to determine the files that should be selected.
         */
        selectByPattern(pattern) {
            this.unselectAll();
            var regExp = new RegExp(pattern, 'i');
            this.filteredFiles.filter(f => f.title.match(regExp)).map(f => {
                f.isSelected = true;
                f.selections = (f.selections || 1) + 1;
            });
        },

        /**
         * Get the default location of the catalog.
         */
        locateCatalog: function() {            
            const catalogFilename = 'catalog.json';

            // If the platform is neither windows nor mac it is most 
            // likley to store files in the user directory.
            var appData = '~/.octopus-organizer';

            if (process.platform == 'win32') {
                appData = process.env.APPDATA + '/octopus-organizer';
            }
            else if (process.platform == 'darwin') {
                appData = process.env.HOME + '/Library/Preferences/octopus-organizer';
            }            

            // Create Directory if not exsists
            if (!fs.existsSync(appData)){
                fs.mkdirSync(appData);
            }
                        
            return appData + '/' + catalogFilename;
        },

        /**
         * Save the current model to a local file.
         * 
         * @param {string} filename The location of the file.
         */
        persist: function(filename) {
            fs.writeFile(filename || this.locateCatalog(), JSON.stringify(this.files), (err) => { 
                //TODO: Handle Error!
            });

            events.$emit('model-persisted');
        },

        /**
         * Load the model from a local file.
         * 
         * @param {string} filename The location of the file.
         */
        load: function(filename) {         
            fs.readFile(filename || this.locateCatalog(), (err, data) => {
                //TODO: Handle Error!

                this.files = JSON.parse(data);

                events.$emit('model-loaded');
                events.$emit('tags-updated', this.tags());

                // Update the files Stats with each load of file.
                //this.updateStats();
            });

            

            
        },

        /**
         * Set a single tag for filtering the file catalog.
         * 
         * @param {string} tag The tag that should be used as a filter
         */
        setSelectedTag: function(tag) {            
            this.selectedTags = [ tag ];
        },

        clearSelectedTags: function() {            
            this.selectedTags = [];
        },

        checkTagSelected: function(tag) {
            return this.selectedTags.includes(tag);
        },

        setSelectedTypeCategories: function(category) {            
            this.selectedTypeCategories = [ category ];
        },

        clearSelectedTypeCategories: function() {            
            this.selectedTypeCategories = [];
        },

        checkTypeCategorySelected: function(category) {
            return this.selectedTypeCategories.includes(category);
        },

        /**
         * Open a file depending on its role.
         * 
         * @param {object} file 
         */
        openFile: function(file) {
            file.hits = (file.hits || 1) + 1;            
            this.systemOpen(file.path);
        },

        /**
         * Open a file with the default application.
         * 
         * @param {string} path 
         */
        systemOpen: function(path) {
            if (path == undefined)
                return;

            var cmd;             
            
            if (process.platform == 'darwin')
                cmd = 'open ';
            else if (process.platform == 'win32' || process.platform == 'win64')    
                cmd = 'start "" ';
            else
                cmd = 'xdg-open ';             

             exec(cmd + '"' + path + '"');
        },

        /**
         * Remove all filters from the file catalog.
         */
        clearFilters: function() {            
            this.selectedTags = [ ];
            this.selectedTypeCategories = [ ];
            this.filterPattern = '.*';
        },

        /**
         * Emit a global message.
         * 
         * @param {string} message 
         * @param {*} data 
         */
        simpleEmit: function(message, data) {            
            events.$emit(message, data);
        },

        /**
         * Translate a file extension to the matching type category like images or documents.
         * 
         * @param {string} extension The file extension.
         */
        getTypeCategoryByExtension: function(extension, level) {                     

            var translator = [
                {
                    "extensions": [ 'pdf' ],
                    "level-1": 'document',
                    "level-2": 'pdf-document'
                },
                {
                    "extensions": [ 'docx' ],
                    "level-1": 'document',
                    "level-2": 'word-document'
                },
                {
                    "extensions": [ 'pptx' ],
                    "level-1": 'document',
                    "level-2": 'powerpint-document'
                },
                {
                    "extensions": [ 'xlsx' ],
                    "level-1": 'document',
                    "level-2": 'excel-document'
                },
                {
                    "extensions": [ 'zip', 'tar', 'gz' ],
                    "level-1": 'archive',
                    "level-2": 'archive'
                },
                {
                    "extensions": [ 'jpg', 'jpeg', 'png', 'bmp', 'gif', 'svg' ],
                    "level-1": 'image',
                    "level-2": 'image'
                }
            ];

            var item = translator.find(t => t.extensions.includes(extension.toLowerCase()));            

            if (item != undefined)
                return item['level-' + (level || 1)];
            else 
                return undefined;
        },

        getIndicatorClass: function(typeCategory) {            
            switch(typeCategory) {
                case 'pdf-document':
                    return 'fa-file-pdf';

                case 'word-document':
                    return 'fa-file-word';

                case 'powerpoint-document':
                    return 'fa-file-powerpoint'

                case 'excel-document':
                    return 'fa-file-excel';
                
                case 'archive':
                    return 'fa-file-archive';

                case 'image':
                    return 'fa-file-image';

                case 'stack':                    
                    return 'fa-paperclip';

                case 'url':
                    return 'fa-link';

                default:
                    return 'fa-file';
            }
         },

        /**          
         * Update the stat properties for files.
         * 
         * @param {function} filter The filter for determining the files that should be updated.
         */
        updateStats: function(filter) {
            if (filter == undefined)
                filter = (f) => { return true; }

            this.files.filter(f => filter(f)).forEach(f => {
                f.stats = fs.stat(f.path);
            });

            events.$emit('stats-updated');
        },
        
        /**
         * Combine a set of files into a stack.
         * 
         * @param {string} The name of the stack.
         * @param {function} filter The function determining the files to stack.
         */
        stack: function(name, filter) {
          
            // Do not create a stack without name!
            if (name == undefined) return;


            // Fetch filtered files.
            // Do not included stacks in order to prevent multi-stacking.
            var files = this.files.filter(f => filter(f) && f.role != 'stack');
            
            // Get all Tags from files
            var tags = [];
        
            files.forEach(f => {                
                f.tags.forEach(t => {
                    if (!tags.includes(t))
                        tags.push(t);
                });
            })
             
            this.files.push({
                id: uuid(),
                role: 'stack',
                typeCategory: 'stack',
                title: name,
                tags: tags,
                isSelected: false,
                files: files
            });


            this.removeFiles(filter);

            events.$emit('tags-updated', this.tags());

            this.persist();
        },
        
        /**
         * Combine a set of files into a stack.
         * 
         * @param {string} The name of the stack.
         * @param {function} filter The function determining the files to stack.
         */
        unstack: function(filter) {
            var catalog = this;
            this.files.filter(f => filter(f) && f.role == 'stack') .forEach((stack) => {// All matching stacks
                stack.files.forEach(stackedFile => {
                    catalog.files.push(stackedFile);
                });                
            });

            this.removeFiles((f) => {
                return filter(f) && f.role == 'stack';
            });            

            this.persist();
        }
     },

     computed: {
         /**
          * The set of file items filtered by the global filter pattern.
          */
         filteredFiles: function() {
            var regExp = new RegExp(this.filterPattern, 'i');

            // Create a shallow copy of filtered files.
            var sortedFiles = this.files.concat().filter(f => {
                // 1. Check for matches on filter Pattern
                var matchingFilterPattern = f.title.match(regExp)
                    || f.tags.filter(t => t.match(regExp)).length > 0;

                // 2. Check for selected tags.    
                // File has to included all selected tags.                            
                var matchingSelectedTags = true;
                this.selectedTags.forEach(selectedTag => {
                    matchingSelectedTags &= f.tags.includes(selectedTag);
                });

                // 3. Check for selected tags.    
                // File has to included all selected extensions.                            
                var matchingSelectedTypeCategories = this.selectedTypeCategories.length == 0 || this.selectedTypeCategories.includes(f.typeCategory);                                               

                return matchingFilterPattern && matchingSelectedTags && matchingSelectedTypeCategories;
            });

            // Sort the shallow copy to not affect the original file array.
            sortedFiles.sort((a, b) => {
                return a.title > b.title ? 1 : -1;
            });

            return sortedFiles;
         },

         selectedFile: function() {
            selectedFiles = this.files.filter(f => f.isSelected);
            if (selectedFiles.length == 1) {
                return selectedFiles[0];
            }

            return undefined;
         }
     }
});