const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const fs = require('fs')

const config = require('./config.js')
const multer = require('multer')

const zip = require('./zip.js') // used to zip destination folder

const storage = require('./storage')
const upload = multer({ storage: storage })
const cors = require('cors')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({ origin: `${config.allowed_origin}` }));

app.get('/', function (req, res) {
    res.send('Hello World!')
})

var type = upload.any()

app.post('/', type, function (req, res) {
    var _body = req.body
    var filenames = [];
    var state = {
        element: {
            donnees_prives: {}, // done but need refix
            donnees_publiques: {
                galerie: [], // done but need to refix
                information_entreprise: {}, // done fixed just change photo_couverture
                offre: [],
                referencement: {}, // done need fix
                service: {}, // done need fix
                video: {} // done need fix
            },
            donnees_tm: {}
        },
        type: "tolotra_malagasy_donnees_client"
    }

    state['element']['donnees_prives'] = _body['donnees_prives'] || {}
    state['element']['donnees_tm'] = _body['donnees_tm'] || {}
    state['element']['donnees_publiques']['information_entreprise'] = _body['donnees_publiques']['information_entreprise'] || {};
    state['element']['donnees_publiques']['referencement'] = _body['donnees_publiques']['referencement'] || {};
    state['element']['donnees_publiques']['service'] = _body['donnees_publiques']['service'] || {};
    state['element']['donnees_publiques']['video'] = _body['donnees_publiques']['video'] || {};

    // adding temporary store
    var galeries = [];
    var offres = [];
    req.files.forEach((file, index) => {
        if (file.fieldname === 'donnees_publiques[galerie][][lien]')
            galeries.push(file);
        if (file.fieldname === 'donnees_publiques[offre][][image]')
            offres.push(file);
    });
    // store galerie    
    if (_body['donnees_publiques[galerie][][description]'] != undefined) {
        if (typeof (_body['donnees_publiques[galerie][][description]']) === "string") {
            state['element']['donnees_publiques']['galerie'].push({
                "description": _body['donnees_publiques[galerie][][description]'],
                "lien": galeries[0].filename
            })
            filenames.push(galeries[0].filename)
        } else {
            for (var i = 0; i < galeries.length; i++) {
                state['element']['donnees_publiques']['galerie'].push({
                    "description": _body['donnees_publiques[galerie][][description]'][i],
                    "lien": galeries[i].filename
                })
                filenames.push(galeries[i].filename)
            }
        }
    }

    // store offre    
    if (_body['donnees_publiques[offre][][description]'] != undefined) {
        if (typeof (_body['donnees_publiques[offre][][description]']) === "string") {
            state['element']['donnees_publiques']['offre'].push({
                "description": _body['donnees_publiques[offre][][description]'],
                "image": offres[0].filename,
                "nom": _body['donnees_publiques[offre][][nom]'],
                "tag": _body['donnees_publiques[offre][][tag][]'],
                "tarif": _body['donnees_publiques[offre][][tarif]'],
            })
            filenames.push(offres[0].filename)
        } else {
            var tags = _body['donnees_publiques[offre][][tag][]']
            for (var i = 0; i < offres.length; i++) {
                var tagname = 'offre_' + i + '_tag'
                var tag = JSON.parse(_body[tagname])
                state['element']['donnees_publiques']['offre'].push({
                    "description": _body['donnees_publiques[offre][][description]'][i],
                    "image": offres[i].filename,
                    "nom": _body['donnees_publiques[offre][][nom]'][i],
                    "tag": tag,
                    "tarif": _body['donnees_publiques[offre][][tarif]'][i],
                })
                filenames.push(offres[i].filename)
            }
        }
    }
    /**
     * need to change originalname to filename
     */
    req.files.filter((file, index) => {
        if (file.fieldname === 'donnees_publiques[information_entreprise][photo_de_couverture]') {
            state['element']['donnees_publiques']['information_entreprise']['photo_de_couverture'] = file.filename // change with filename
            filenames.push(file.filename)
        }
    });

    req.files.filter((file, index) => {
        if (file.fieldname === 'donnees_publiques[referencement][og_image]') {
            state['element']['donnees_publiques']['referencement']['og_image'] = file.filename // change with filename        
            filenames.push(file.filename)
        }
    });


    var outputBody = JSON.stringify(state)
    fs.writeFile(config.destination_folder + config.output_file_name, outputBody + '', (err) => {
        if (err) {
            console.warn(err)
            throw err
        }
        filenames.push(config.output_file_name) // add output_file_name json file
        zip.archive(filenames)
    });
    let path = `${__dirname}/storage/`
    res.send({ path: path })
})

app.listen(8000, function () {
    console.log('Example app listening on port 8000!')
})
