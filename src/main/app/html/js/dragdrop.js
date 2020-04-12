/**
 * dragdrop.js
 * -----------------------------
 * This script file file that are dragged into the application window.
 * 
 * AUTHOR: Lennard Scheffler
 */

$(document).ready(function() {
    
    var holder = document;
   
    holder.ondragover = () => {
        $('#drag-file i').removeClass('fa-check');
        $('#drag-file i').addClass('fa-file-upload');
        $('#drag-file').fadeIn('fast');
        
        return false;
    };

    holder.ondragleave = () => {
        $('#drag-file').fadeOut('fast');
        return false;
    };

    holder.ondragend = () => {
        return false;
    };

    holder.ondrop = (e) => {
        e.preventDefault();

        for (let f of e.dataTransfer.files) {
            events.$emit('add-file', f.path);
        }

        $('#drag-file i').removeClass('fa-file-upload');
        $('#drag-file i').addClass('fa-check');
        $('#drag-file').delay(500).fadeOut('fast');        
        
        return false;
    };

    

});