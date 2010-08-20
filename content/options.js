var DevCacheOptions = {

    devcacheBundle: null,

    onLoad: function() {
        this.devcacheBundle = document.getElementById('bundle_devcache');
        document.getElementById('dc_enable').checked = DevCacheUtils.isEnabled();
        this.populatePatterns();
        this.setVersion();
    },

    updateCheckboxes: function() {
        DevCacheUtils.setEnabled(document.getElementById('dc_enable').checked);
    },

    populatePatterns: function() {
        var patterns = DevCacheUtils.getPatterns().split(',');
        var i;
        var patternList = document.getElementById('dc_patternlist');
        while(patternList.getRowCount() > 0) {
            patternList.removeItemAt(0);
        }

        for(var i = 0; i < patterns.length; i++) {
            if(patterns[i] !== '') {
                patternList.ensureElementIsVisible(patternList.appendItem(patterns[i]));
            }
        }
    },

    setVersion: function() {
        if ("@mozilla.org/extensions/manager;1" in Components.classes) {
            var flashblockID = "{3d7eb24f-2740-49df-8937-200b1cc08f8a}";
            var em = Components.classes["@mozilla.org/extensions/manager;1"]
                              .getService(Components.interfaces.nsIExtensionManager);
            if (!("getItemForID" in em))
                return;
            var version = em.getItemForID(flashblockID).version;
            var display = document.getElementById("devcacheVersion");
            if (display && version)
                display.value = version;
        }
    },

    checkPattern: function(pattern) {
        try {
            var regex = new RegExp(pattern);
            delete regex;
            return true;
        } catch(e) {
            return false;
        }
    },

    hasPattern: function(pattern) {
        var patternList = document.getElementById('dc_patternlist');
        var numRows = patternList.getRowCount();
        var i;
        for(i = 0; i < numRows; i++) {
            if(patternList.getItemAtIndex(i).label == pattern)
                return true;
        }
        return false;
    },

    enterAddPattern: function(event) {
        if(event && event.type == 'keypress' && event.keyCode != KeyEvent.DOM_VK_RETURN)
            return;
        event.preventDefault();
        this.addPattern();
    },

    addPattern: function() {
        var textbox = document.getElementById('dc_pattern');
        var pattern = textbox.value;

        if(pattern.length == 0)
            return false;

        if(!this.checkPattern(pattern)) {
            var msg = this.devcacheBundle.getString('invalidRegex');
            alert(msg);
            return false;
        }

        var patternList = document.getElementById('dc_patternlist');
        if(!this.hasPattern(pattern)) {
            var numRows = patternList.getRowCount();
            newElement = patternList.appendItem(pattern, '');
            patternList.ensureElementIsVisible(newElement);
        }
        textbox.value = '';
        this.patternInput(textbox);
        textbox.focus();
        return true;
    },

    remove: function() {
        var patternList = document.getElementById('dc_patternlist');
        var index = patternList.selectedIndex;
        if(index != -1) {
            patternList.removeItemAt(index);
            document.getElementById('remove_pattern').disabled = true;
        }
    },

    removeAll: function() {
        var patternList = document.getElementById('dc_patternlist');
        var msg = devcacheBundle.getString('confirmClear');

        if(confirm(msg)) {
            while(patternList.getRowCount() > 0)
                patternList.removeItemAt(0);
        }
    },

    doAccept: function() {
        var patterns = this.patternListToString();
        DevCacheUtils.setPatterns(patterns);

        DevCacheUtils.setEnabled(document.getElementById('dc_enable').checked);
        window.close();
    },

    doCancel: function() {
        window.close();
    },

    patternInput: function(patternField) {
        document.getElementById('add_pattern').disabled = !patternField.value;
    },

    patternSelected: function(patternList) {
        document.getElementById('remove_pattern').disabled = (patternList.selectedIndex == -1);
    },

    patternListToString: function() {
        var patternList = document.getElementById('dc_patternlist');
        var numRows = patternList.getRowCount();
        var patterns = '';
        var i;
        for(i = 0; i < numRows; i++) {
            if(i != 0) patterns += ',';
            patterns += patternList.getItemAtIndex(i).label;
        }
        return patterns;
    }
}
