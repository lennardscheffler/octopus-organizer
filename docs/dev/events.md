# Events
In order to communicate between the Vue modules there is a central event that is used to broadcast events across the application. The event bus is represented by a simple Vue module.

The module is defined in the file `events.js.` It is included in every view so that it can be used throughout the whole application.

## Broadcast Events
In order to broadcast events use the Vue `$emit` function on the Events module. The following code segment would send the event *tag-selected* with the content *my tag* to every Vue module in the applicaiton where it can be consumed.

```javascript
events.$emit('tag-selected', 'my tag');
```

## Consume Events
The broardcasted events can be consumed in the different Vue modules. In order to consume an event, use the Vue `$on` function.

```javascript
var app = new Vue({
    mounted() {
        events.$on('tag-selected', function(tag) { 
            // ...
        });
    }
});
```

## Application Events
- [add-file](event-add-file.md)
- [tag-selected](event-tag-selected.md)
- [untag-selected](event-untag-selected.md)
