/**
 * stack-canvas-view.uxevents.js
 * -----------------------------
 * This script file contains UX events for the Stack Canvas View of the application.
 * 
 * AUTHOR: Lennard Scheffler
 */

$(document).ready(function() {    
    $('#btn-tag-selected').click(() => {
        fillCommander('+', 'tag', '');
    });

    $('#btn-tag').click(() => {
        fillCommander('#', 'tag', '');
    });

    $('#btn-imenu').click(() => {
        $('#imenu').slideToggle('fast');
    });

    $('#commander').keyup((e) => {
        var propagetedKeyCodes = [            
            32 // SPACE
        ];
        if (!propagetedKeyCodes.includes(e.keyCode)) {
            e.stopPropagation();
        }           

        if (e.keyCode == 27) {
            $('#imenu').slideUp('fast');
        }
    });

    $(document).click(() => {
        $('#imenu').slideUp('fast');
    })

    $('#imenu').click((e) => {
        e.stopPropagation();
    });

    $('#toolbar').click((e) => {
        e.stopPropagation();
    });    

});

function fillCommander(command, hint, commandIndicator) {
    if (command == undefined) return;

    if (commandIndicator == undefined) commandIndicator = true;
    if (hint == undefined) hint = '';

    $('#commander').focus();
    $('#commander').val(command + (commandIndicator ? ':' : '') + hint);
    $('#commander')[0].setSelectionRange(command.length + (commandIndicator ? 1 : 0), command.length + hint.length + (commandIndicator ? 1 : 0));

    $('#commander')[0].dispatchEvent(new Event('input', { 'bubbles': true }));
}