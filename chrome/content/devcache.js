var DevCacheAddressListener = {
    QueryInterface: function(aIID) {
        if(aIID.equals(Components.interfaces.nsIWebProgressListener) ||
            aIID.equals(Components.interfaces.nsISupportsWeakReference) ||
            aIID.equals(Components.interfaces.nsISupports))
          return this;
        throw Components.results.NS_NOINTERFACE;
    },

    onLocationChange: function(aProgress, aRequest, aURI) {
        DevCacheExt.evaluateURL(aURI.spec);
    },

    onStateChange: function() {},
    onProgressChange: function() {},
    onStatusChange: function() {},
    onSecurityChange: function() {},
    onLinkIconAvailable: function() {}
};

var DevCacheExt = {
    _debug: false,
    _enabled: true,
    _activeURL: '',
    _prefs: null,
    _patterns: null,
    _cachePrefs: null,
    _loaded: false,

    _load: function() {
        var prefs = DevCacheUtils.prefs;
        this._prefs = prefs.getBranch('devcache.');
        this._cachePrefs = prefs.getBranch('browser.cache.');
        this._debug = DevCacheUtils.isDebug();
        this._enabled = DevCacheUtils.isEnabled();
        gBrowser.addProgressListener(DevCacheAddressListener,
          Components.interfaces.nsIWebProgress.NOTIFY_STATE_DOCUMENT);
        this.loadPatterns();
        this.register();
    },

    load: function() {
        DevCacheUtils.log('load()');
        if (this._enabled && !this._loaded) {
            this._loaded = true;
            this._load();
        }
    },

    unload: function() {
        this._loaded = false;
        gBrowser.removeProgressListener(DevCacheAddressListener);
    },

    register: function() {
        DevCacheUtils.log('register()');
        this._prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);
        this._prefs.addObserver('', this, false);
        this._cachePrefs.QueryInterface(Components.interfaces.nsIPrefBranch2);
        this._cachePrefs.addObserver('', this, false);
    },

    unregister: function() {
        if(this._prefs) {
            this._prefs.removeObserver('', this);
        }
        if(this._cachePrefs) {
            this._cachePrefs.removeObserver('', this);
        }
    },

    observe: function(aSubject, aTopic, aData) {
        if(aTopic != 'nsPref:changed') {
            return;
        }
        switch (aData) {
            case 'patterns':
                DevCacheUtils.log('pattern change');
                this._activeURL = '';
                this.loadPatterns();
                break;
            case 'debug':
                DevCacheUtils.log('toggled debug pref');
                this._debug = DevCacheUtils.isDebug();
                break;
            case 'enabled':
                DevCacheUtils.log('toggled enabled pref');
                this._enabled = DevCacheUtils.isEnabled();
                if(this._enabled) {
                    this.load();
                } else {
                    this.unload();
                }
                break;
            default:
                break;
        }
    },

    loadPatterns: function() {
        var patterns = DevCacheUtils.getPatterns().split(',');
        this._patterns = new Array();
        for(var i=0; i < patterns.length; i++) {
            if(!(/^[\s]$/.test(patterns[i]))) {
                this._patterns.push(new RegExp(patterns[i]));
                DevCacheUtils.log('loadPatterns(): Adding pattern: ' +
                  this._patterns[this._patterns.length - 1]);
            }
        }
        return;
    },

    evaluateURL: function(url) {
        if(!this._enabled) {
            return;
        }
        if(url == this._activeURL ) {
          return;
        }
        this._activeURL = url;
        if(this._debug) {
            this.showCachePrefs();
        }
        var match = false;
        for (var i=0; i < this._patterns.length && !match; i++) {
            DevCacheUtils.log('evaluateUrl: checking URL against pattern: '+
              this._patterns[i].source);
            match = this._patterns[i].test(url);
        }
        if (match) {
            DevCacheUtils.log('evaluateUrl(): Disabling cache');
            this.disableCachePrefs();
        } else {
            DevCacheUtils.log('evaluateUrl(): Enabling cache');
            this.enableCachePrefs();
        }
    },

    showCachePrefs: function() {
        var prefArr = ['disk.enable','memory.enable'];
        for(var i=0; i<prefArr.length; i++) {
            if(this._cachePrefs.getBoolPref(prefArr[i])) {
                DevCacheUtils.log('showCachePrefs(): ' + prefArr[i] + ' enabled');
            } else {
                DevCacheUtils.log('showCachePrefs(): ' + prefArr[i] + ' disabled');
            }
        }
    },

    disableCachePrefs: function() {
        var prefArr = ['disk.enable','memory.enable'];
        for(var i=0; i<prefArr.length; i++) {
            this._cachePrefs.setBoolPref(prefArr[i], false);
            DevCacheUtils.log('disableCachePrefs(): ' + prefArr[i] + ' disabled');
        }
    },

    enableCachePrefs: function() {
        var prefArr = ['disk.enable','memory.enable'];
        for(var i=0; i<prefArr.length; i++) {
            this._cachePrefs.setBoolPref(prefArr[i], true);
            DevCacheUtils.log('enableCachePrefs(): ' + prefArr[i] + ' enabled');
        }
    }

};
