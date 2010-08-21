var DevCacheUtils = {

    prefs: Components.classes['@mozilla.org/preferences-service;1'].
      getService(Components.interfaces.nsIPrefBranch).
      QueryInterface(Components.interfaces.nsIPrefBranchInternal),

    _console: Components.classes['@mozilla.org/consoleservice;1'].
      getService(Components.interfaces.nsIConsoleService),

    isEnabled: function() {
        if(this.prefs.getPrefType('devcache.enabled') == this.prefs.PREF_BOOL)
            return this.prefs.getBoolPref('devcache.enabled');
        else {
            this.prefs.setBoolPref('devcache.enabled', true);
            return true;
        }
    },

    setEnabled: function(enabled) {
        return this.prefs.setBoolPref('devcache.enabled', enabled);
    },

    getPatterns: function() {
        if(this.prefs.getPrefType('devcache.patterns') == this.prefs.PREF_STRING) {
            return this.prefs.getCharPref('devcache.patterns');
        } else {
            return '';
        }
    },

    setPatterns: function(patterns) {
        this.prefs.setCharPref('devcache.patterns', patterns);
    },

    isDebug: function() {
        if(this.prefs.getPrefType('devcache.debug') == this.prefs.PREF_BOOL)
            return this.prefs.getBoolPref('devcache.debug');
        else {
            this.prefs.setBoolPref('devcache.debug', false);
            return false;
        }
    },

    setDebug: function(enabled) {
        return this.prefs.setBoolPref('devcache.debug', enabled);
    },

    log: function(str) {
        if(this.isDebug()) {
            this._console.logStringMessage('devcache::' + str);
        }
    }

};
