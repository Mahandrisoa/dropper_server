var fs = require('fs');

var archiver = require('archiver');


module.exports.archive = (files) => {
    var output = fs.createWriteStream(__dirname + '/storage/' + Date.now() + '.zip');
    var archive = archiver('zip');

    output.on('close', function () {
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
    });

    output.on('end',function(){
        console.log('Data has been drained');
    });

    archive.on('error', function (err) {
        throw err;
    });

    archive.on('warning',function (err){
        console.log(err);
    });

    archive.pipe(output);

    for (let i = 0; i < files.length; i++) {
        var temp = __dirname + '/uploads/' + files[i];
        archive
            .append(fs.createReadStream(temp), { name: `${files[i]}` })
    }
    archive.finalize()    
}