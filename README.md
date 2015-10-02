# METAPURGE

## ABOUT

This is a static microsite for scrubbing all metadata from images. It uses javascript and the HTML5 canvas to scrub location data, filename and other camera information from your file.

It enables you to load an image in the browser (or even take one with the camera in your device) and then allows you to save the image sans metadata as a png - all inside the browser on your device without ever contacting any other site. __THE SITE NEVER SENDS ANY FILES THROUGH THE INTERNET.__

There are no statistics, no tracking cookies, no flash or java and no internet traffic other than when you visit the site to get the initial code. 

## USING

Just visit a website hosting this page, such as https://antimeta.github.io/ 
The code will be saved to your device and will even work when you are no longer connected to the internet. 


## INSTALLING

Copy the entire directory at `/dist/web` to a server, or alternatively copy the directory to your computer and open the index.html file in your browser.

## DEVELOPMENT

```
git clone
npm install
bower install
gulp
```

AND DON'T FORGET TO
`git subtree push --prefix dist/web origin gh-pages`
