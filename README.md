# Benzene Bots 4384 Website

The frontend module is strictly for browser layer artifacts. It can have HTML, Javascript, CSS. We can even use framework like Angular/React or any other javascript library for generating ui components. For server side functionality, we have separate module bbots-web-serve under parent project bbots-web.

All files under resources folder will be copied to apache webserver's htdocs folder, and available to be served over web.

Once the development is done, run "mvn docker:push" to push docker image to Hub.

And on the web server machine, this image will be pulled and run.

Two ports are availbale from this docker container. 22 as 48322 and 80 as 48380. Avoid making direct change to running container through ssh'ing, because those changes will be lost once image is reloaded from repository.

