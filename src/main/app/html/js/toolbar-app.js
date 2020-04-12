var toolbarApp = new Vue({
    el: '#toolbar-app',

    mounted() {
        var self = this;

        events.$on('display-preview-changed', function(state) {
            self.visuals.preview = state;
        });

        events.$on('display-sidebar-changed', function(state) {
            self.visuals.sidebar = state;
        });

        events.$on('tags-updated', function(tags) {
            self.tags = tags || [ ];
        });
    },

    updated() {
        
    },

    data: { 
        command: '',
        executedCommands: [ ],
        tags: [ ],
        visuals: {
            sidebar: true,
            preview: true
        },
        commandCatalog: [
            {
                id: 1001,
                title: 'Tag File',
                syntax: '+[Tag Name [, ...]]',
                description: 'Add a tag to the currently selected file items. You can also add multiple tags in one command by separating the tags by comma.',
                autoFill: {
                    command: '+',
                    hint: '[Tag Name]',
                    commandIndicator: ''

                },
                expression: /^(t:|tag:|\+)(.*)/ig, 
                execute: (cmd) => {
                    var exTag = /(t:|tag:|\+)(.*)/ig;
                    var result = exTag.exec(cmd);
                    result[2].split(',').forEach(tag => {
                        events.$emit('tag-selected', tag);
                    });
                }
            },
            {
                id: 1002,
                title: 'Untag File',
                syntax: '-[Tag Name [, ...]]',
                description: 'Remove a Tag from the currently selected files. You can also remove multiple tags in one command by separating the tags by comma.',
                autoFill: {
                    command: '-',
                    hint: '[Tag Name]',
                    commandIndicator: ''

                },
                expression: /^(ut:|untag:|-)(.*)/ig, 
                execute: (cmd) => {
                    var exTag = /(ut:|untag:|-)(.*)/ig;
                    var result = exTag.exec(cmd);
                    result[2].split(',').forEach(tag => {
                        events.$emit('untag-selected', tag);
                    });
                }
            },
            {
                id: 1003,
                title: 'Clear Tags',
                syntax: 'ct',
                description: 'Remove all tags from the currently selected files.',
                autoFill: {
                    command: 'ct',
                    hint: '',
                    commandIndicator: ''

                },
                expression: /^(ct|clear-tags)/ig, 
                execute: (cmd) => {
                    events.$emit('clear-tags-selected');
                }
            },
            {
                id: 1004,
                title: 'Select Files',
                syntax: 's:[Regular Expression]',
                description: 'Select Files by using a Regular Expression.',
                autoFill: {
                    command: 's',
                    hint: '[Regular Expression]',
                    commandIndicator: ':'
                },
                expression: /^(s|select):(.*)/ig, 
                execute: (cmd) => {
                    var exPattern = /(s|select):(.*)/ig;
                    var result = exPattern.exec(cmd);
                    events.$emit('select-by-pattern', result[2]);
                }
            },
            {
                id: 1005,
                title: 'Remove Files',
                syntax: 'rm',
                description: 'Remove currently selected files from the catalog.',
                autoFill: {
                    command: 'rm',
                    hint: '',
                    commandIndicator: ''
                },
                expression: /^(rm|remove)/ig, 
                execute: (cmd) => {
                    var exPattern = /(rm|remove)/ig;                    
                    events.$emit('remove-selected');
                }
            },
            {
                id: 1006,
                title: 'Filter Files by Tag',
                syntax: '#[Tag Name [, ...]]',
                description: 'Show only Files that match a specific tag. You can also select multiple tags by separating the tags by comma. In this case, the files have to match each of the selected tags.',
                autoFill: {
                    command: '#',
                    hint: '[Tag Name]',
                    commandIndicator: ''

                },
                expression: /^(#)(.*)/ig, 
                execute: (cmd) => {
                    var exPattern = /(#)(.*)/ig;
                    var result = exPattern.exec(cmd);
                    var selectedTags = result[2].split(",");
                    events.$emit('select-tags', selectedTags);
                }
            },
            {
                id: 1007,
                title: 'Rename File',
                syntax: '=[New Filename]',
                description: 'Rename the currently selected file. This command does not work on multiple selection.',
                autoFill: {
                    command: '=',
                    hint: '[New Filename]',
                    commandIndicator: ''

                },
                expression: /^(rn:|rename:|=)(.*)/ig, 
                execute: (cmd) => {
                    var exPattern = /(rn:|rename:|=)(.*)/ig;
                    var result = exPattern.exec(cmd);
                    var title = result[2];                    
                    events.$emit('rename-selected', title);
                }
            },
            {
                id: 1008,
                title: 'Stack Files',
                syntax: 'stack',
                description: 'Combine selected files into a stack.',
                autoFill: {
                    command: 'stack',
                    hint: '[Stack Title]',
                    commandIndicator: ':'

                },
                expression: /^(stack:)(.*)/ig, 
                execute: (cmd) => {
                    var exPattern = /(stack:)(.*)/ig;
                    var result = exPattern.exec(cmd);
                    var title = result[2];                    
                    events.$emit('stack-selected', title);
                }
            },
            {
                id: 1009,
                title: 'Unstack Files',
                syntax: 'unstack',
                description: 'Unpack a stack.',
                autoFill: {
                    command: 'unstack',
                    hint: '',
                    commandIndicator: ''

                },
                expression: /^(unstack)/ig, 
                execute: (cmd) => {                    
                    events.$emit('unstack-selected');
                }
            },
            {
                id: 1010,
                title: 'Add File',
                syntax: 'add:[Reference, [...]]',
                description: 'Add a File to the Catalog.',
                autoFill: {
                    command: 'add',
                    hint: '[Reference]',
                    commandIndicator: ':'

                },
                expression: /^(add:)(.*)/ig, 
                execute: (cmd) => {                    
                    var exPattern = /(add:)(.*)/ig;
                    var result = exPattern.exec(cmd);
                    var reference = result[2];  
                    events.$emit('add-file', reference);
                }
            },
        ]
    },

     methods: {

        fireCommand: function() {
            var commandHandlers = this.commandCatalog.filter(
                handler => this.command.match(handler.expression)
            );

            

            // If there is not command to be executed, use command as filter pattern.
            if (commandHandlers.length == 0) {
                events.$emit('filter', this.command);
                $('#commander').select();
            }
            else {
                commandHandlers.forEach(
                    handler => handler.execute(this.command)
                );

                this.executedCommands.push(this.command);
                this.command = '';
            }
            
            

            
        },

        validateCommand: function() {
            return this.commandCatalog.filter(handler => this.command.match(handler.expression)).length > 0;
        },

        getIndicatorClass: function() {
            return this.validateCommand() ? 'fa-terminal' : 'fa-search';
        },

        simpleEmit: function(message, data) {            
            events.$emit(message, data);
        },

        selectCommand: function(id, hint) {
            var handler = this.commandCatalog.find(handler => handler.id == id);
            fillCommander(handler.autoFill.command, hint || handler.autoFill.hint, handler.autoFill.commandIndicator);
            $('#imenu').slideUp('fast');
        }

     },

     computed: {

        matchingCommands: function() {
            return this.commandCatalog.filter(handler => {
                var rxTitle = new RegExp('.*' + this.command + '.*', 'i');
                
                return this.command == '' 
                || this.command.match(handler.expression)
                || rxTitle.test(handler.title);
            });
        },

        matchingTags: function() {
            return this.tags.filter(tag => tag.indexOf(this.command.replace(/^(#)/i, '')) >= 0);
        }

     }
});

