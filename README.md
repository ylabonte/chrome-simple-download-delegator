# Simple Download Delegator (Google Chrome extension)

This Chrome Extension should be able to send (HTTP POST) an url bundled with the current session context (cookies
of the active tab) and a specified download location as a json payload to a configurable endpoint.

As a follow up project there should be a simple webservice waiting for these requests to process. Processing the 
requests includes staging a request to the specified url and saving the response body to a specified download path. 

## Nothing more than a dummy extension

Until now this repo includes nothing more, than a simple extension template, with jquery and materializecss on board.
The current highlight is the icon: An incredibly ugly 💩 handmade scribble drawn on my iPad 👨‍🎨. 
This README will contain more information if there is more that I can you inform about.  

## Next steps
* Build a mock service, which responds with a 202 status.
* Implement request to the mock service.
* Implement configurable target.
* Build real web service consuming the download requests.
* Wrap web service into a docker image
