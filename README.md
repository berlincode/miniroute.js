miniroute.js
============

A small javascript url router (only around 650 bytes minified and gzipped) designed for
single page apps.

[demo page](https://rawgit.com/berlincode/miniroute.js/master/demo.html)

Support for:
- named vars
- regexp support
- url generation
- automatic variable escaping/encoding 

No other dependencies required.

Inspired by flask/werkzeug routes. 

Usage
-----

Miniroute is not tied directly to hash change events to be more flexible.
Here's an excerpt from demo.html:

Create a new miniroute object:

    var r = new MiniRoute();

Create a route. The url may contain named parmeters:

    r.addRoute('<url>', '<route_name>', function (param) {
        // do the processing here 
    });

Example for route creation containing the named parameter 'user' of
default type 'str':
    
    r.addRoute('/users/<user:str>', 'user_page', function (param) {
        // do the processing here 
    }

    when calling a url #/users/robert?more=information
    'param' will contain a dict like the following:
    {
        // the url without any query string
        "url": "/users/robert",

        // named parameters 
        "params": {
            "user": "robert"
        },

        // query string append parameters
        "qsa": {
            "more": "information"
        },

        // the unparsed query string
        "qsa_str": "more=information"
    }

The router is triggered via the run() method. If you want to trigger it
via the hashChanged handler call it like this: 

    // hash-based routing
    function process() {
        var hash = location.hash || '#';

        if (! r.run(hash.substr(1)))
        {
            /* handle errors (unmatched routes) here */
        }
    }

    // add to event listener
    window.addEventListener('hashchange', process);
    process();

Beside the predefined types 'str' and 'num' you may add your own custom types:

    r.addType('<type_name>', '<regexp>');

Example for a lower case type:

    r.addType('lower_case', '([a-z]+)');

Create a url from a route:

    r.url("route_name" [, <named_param_dict] [, <qsa_dict>]);

Example for url() creation (for the url '/users/robert?more=information' used above):

    r.url("users", {"user": "robert"}, {"more": "information"});

Convenient wrapper around url() with encoding: urlEncoded(). Use it like this: 

    document.getElementById('your_id').href = "#" + r.urlEncoded("language", {"language": "lua"}, {"more": "information"});

Please view the [demo.html](./demo.html) for further examples and more details.

Public repository
---------------------

https://github.com/berlincode/miniroute.js

Copyright and license
---------------------

Code and documentation copyright Ulf Bartel. Code is licensed under the
[new-style BSD license](./LICENSE.txt).

