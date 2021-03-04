# Tolotra Malagasy dropper-server

This is a Nodejs server api that can handle queries from Tolotra Malagasy application in order to creaate zip files

Requierments: 
Nodejs 8 or Higher

Install for Ubuntu:
1- Install Nodejs by following this [tutorial](https://doc.ubuntu-fr.org/nodejs)
2- Then run on the root of your project 
``` javascript
npm install && nodemon server.js
```

## Results:
Image files and informations can be retrieved inside uploads folder after sending them through FormData object 
Zip file will be located in storage folder
