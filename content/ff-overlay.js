var devcache = {
  onLoad: function() {
      this.initialized = true;
      this.strings = document.getElementById("devcache-strings");
      DevCacheExt.load();
  },

  onMenuItemCommand: function(e) {
      window.open('chrome://devcache/content/options.xul', '', 'chrome');
  },

  onToolbarButtonCommand: function(e) {
      devcache.onMenuItemCommand(e);
  }

};

window.addEventListener('load', devcache.onLoad, false);
document.addEventListener('load', function() { DevCacheExt.load(); }, false);
document.addEventListener('unload', function() { DevCacheExt.unload(); }, false);
