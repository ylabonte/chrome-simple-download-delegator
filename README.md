# dd-chrome-extension - <small>a simple Download Delegator</small> (Google Chrome extension)

This Google Chrome web browser Extension picks URLs from your clipboard and automatically collects all relevant 
authentication data, that might be relevant for that download. The collected information is then send to a self-hosted 
remote server application ([dd-consumer](https://ylabonte.github.io/dd-consumer/)), that actually processes the 
download. Usage scenarios might be a remote server instance on your cloud server or local home NAS and this extension in 
your Google Chrome or Chromium browser at home, work, vacation, wherever... with this extension you can delegate big 
file downloads to your desired remote system (in my case a small home server running the remote as a docker container). 


## Under development
This project is under active development. Most of the features are not yet implemented.

### Roadmap
* Build a mock service, which responds with a ~~202~~ 200 status. ✓  
  --> see: https://ylabonte.github.io/dd-consumer/
* Add target host setting. ✓
* Implement request to target host.
* Add custom header input.
* Add visible feedback for the user after submit.
* Add remote status overview (current downloads)
* Add remote status history (succeeded, failed and aborted downloads)
* Add auto-recognition of additional authentication headers.
* Write appropriate documentation including screenshots.
* Add capability to scan current tab for potential file downloads by regex pattern.


## FAQ

### What about security
Sorry, but until now: It's up to you. **BUT never ever run the remote service as it is (unencrypted and until now 
without any authentication mechanism) connected to the internet!**

There are several ways securing the remote service. One would be to configure the application using the Spring Boot 
`server.ssl.*` config parameters. My preferred way is to use nginx as a reverse proxy for ssl offloading, http basic 
auth and http to https redirects. The basic auth credentials can be passed as part of the remote target URL 
(`https://[<username>:<password>@]<host>[:<port>][/<path>]`).

### What information is sent to the ddc remote service
This extension will collect all cookies associated with the given url and all additional authentication or authorization 
relevant header that can be found. This information will only be sent to your configured remote target. YOUR INFORMATION 
WILL NOT BE STORED OR SHARED WITH ANY THIRD PARTY All information can be reviewed, before anything leaves your browser!

To be sure, you can review or even contribute to the source code of this extension - to make it a better one - by your 
own. 😉 This also holds for the [dd-consumer remote service component](https://github.com/ylabonte/ddc).  

### Is there any compatibility to any known download manager like Download Station 
No. It's not compatible with Qnap's or Synology's Download Station Apps. But it could be an imaginable next step...
