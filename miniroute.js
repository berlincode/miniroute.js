/*! Copyright (c) 2014, Ulf Bartel / @license: New-style BSD */
 
function MiniRoute() {
    /* 
        A small javascript url router designed for single page apps with
        support for named vars, regular expressions, url generation, automatic
        variable escaping/encoding and without any dependencies.

        Inspired by flask/werkzeug routes. 

        Public repository: https://github.com/elastic/miniroute.js
    */

    /* 
        Orderd array of routes which contain regexp pattern for url matching,
        variable names and the function handler to trigger. Only the first 
        matching route is triggered.
    */
    this.routes = [];

    /* mapping from id to url (e.g {user: "/user/<user>"})*/
    this.map = {};

    /* default types with its regexp */
    this.type = {
        /* string regexp */
        str: "([^/]+)",
        /* integer regexp */
        num: "([0-9]+)"
    };

    /* regexp to parse path expressions like "/user/<user_name:str>" */
    this.reg = /([^<]*)<(.+?):(.+?)>|([^<]+)/g;
}

MiniRoute.prototype = {

    addRoute: function(expr, id, handler) {

        function escapeRegExp(str) {
            return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        }

        var regexp = "^", // always start regexp with "^" to match the beginning 
            names = [], // list of used variable names
            match;
        
        while (match = this.reg.exec(expr)) {

            // escape fixed string
            if (match[1])
                regexp += escapeRegExp(match[1]);

            // this is a variable part
            if (match[2]) {
                // store variable name
                names.push(match[2]);
                // add the regexp for type (e.g. for int)
                regexp += this.type[match[3]];
            }

            // escape fixed string
            if (match[4])
                regexp += escapeRegExp(match[4]);
        }

        // store regexp and data for parser
        this.routes.push({
            /* always end regexp with $ */
            regexp: regexp + "$",
            names: names,
            handler: handler
        });

        // store expr for url generation with urlFor()
        this.map[id] = expr;

    },

    addType: function(id, regexp) {
        this.type[id] = regexp;
    },

    url: function(id, params, qsa) {
        var match, /* */
            uri = "", /* */
            qsa_str = "";

        while (match = this.reg.exec(this.map[id])) {

            // simply add a fixed string
            if (match[1])
                uri += match[1];

            // this is a variable part
            if (match[2]) {
                // need to extra encode the content (e.g. if it contains a "/")
                uri += encodeURIComponent(params[match[2]]);
            }

            // simply add a fixed string
            if (match[4])
                uri += match[4];
        }

        // add all non-used paramets (not sorted)
        for (var key in qsa) {
            qsa_str += key + "=" + encodeURIComponent(qsa[key]);
        }

        // return url or url?qsa if qsa exists
        return qsa_str ? uri + "?" + qsa_str : uri;
    },

    /* convenient function for direct insertion into link's href */
    urlEncoded: function(id, params, qsa) {
        return encodeURI(this.url(id, params, qsa));
    },

    run: function(url) {
        var routes = this.routes, /* */
            params = {}, /* */
            qsa = {}, /* */
            match, /* */
            url_split, /* */
            param_reg = /([^&=]+)=([^&=]*)/g;

        /* split url into path and parameter part */
        if (url_split = url.match(/^([^\?#]*)\??([^\#]*)$/)) {
            /*
            Parse additional query parameters first, since named parameter from
            route have priority. They might overwrite the query parameters.
            */
            while (match = param_reg.exec(url_split[2])) {
                qsa[match[1]] = decodeURIComponent(match[2]);
            }

            /* Now find the first matching route. */
            for (var i = 0; i < routes.length; i++) {
                if (match = url_split[1].match(routes[i].regexp)) {

                    /* set named variables */
                    for (var j = 0; j < routes[i].names.length; j++) {
                        params[routes[i].names[j]] = decodeURIComponent(match[j + 1]);
                    }

                    /* call handler and return */
                    routes[i].handler({
                        url: url_split[1], // without qsa and without hash
                        qsa_str: url_split[2],
                        params: params,
                        qsa: qsa
                    });
                    return true;
                }
            }
        }

        return false;
    }
};
