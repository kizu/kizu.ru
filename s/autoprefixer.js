var autoprefixer = require('autoprefixer');

var plugin = function() {
    return function(style) {
        this.on('end', function(err, css) {
            return autoprefixer.compile(css);
        });
    };
};
module.exports = plugin;
