const http = require('http')
const fs = require('fs')
const formidable = require('formidable')

const mime = {
  'html': 'text/html',
  'css': 'text/css',
  'jpg': 'image/jpg',
  'ico': 'image/x-icon',
  'mp3': 'audio/mpeg3',
  'mp4': 'video/mp4'
}

const servidor = http.createServer((pedido, respuesta) => {
  const url = new URL('http://localhost:8888' + pedido.url)
  let camino = 'public' + url.pathname
  if (camino == 'public/')
    camino = 'public/index.html'
  encaminar(pedido, respuesta, camino)
})

servidor.listen(8888)

function encaminar(pedido, respuesta, camino) {

  switch (camino) {
    case 'public/subir': {
      subir(pedido, respuesta)
      break
    }
    case 'public/listadofotos': {
      listar(respuesta)
      break
    }
    default: {
      fs.stat(camino, error => {
        if (!error) {
          fs.readFile(camino, (error, contenido) => {
            if (error) {
              respuesta.writeHead(500, { 'Content-Type': 'text/plain' })
              respuesta.write('Error interno')
              respuesta.end()
            } else {
              const vec = camino.split('.')
              const extension = vec[vec.length - 1]
              const mimearchivo = mime[extension]
              respuesta.writeHead(200, { 'Content-Type': mimearchivo })
              respuesta.write(contenido)
              respuesta.end()
            }
          })
        } else {
          respuesta.writeHead(404, { 'Content-Type': 'text/html' })
          respuesta.write('<!doctype html><html><head></head><body>Recurso inexistente</body></html>');
          respuesta.end()
        }
      })
    }
  }
}


function subir(pedido, respuesta) {
  var form = new formidable.IncomingForm()
  form.parse(pedido, function (err, fields, files) {
    let path = files.foto1.filepath
    let nuevoPath = './public/upload/' + files.foto1.originalFilename
    fs.rename(path, nuevoPath, function (error) {
      respuesta.writeHead(200, { 'Content-Type': 'text/html' })
      respuesta.write('<!doctype html><html><head></head><body>' +
        'Archivo subido<br><a href="index.html">Retornar</a></body></html>')
      respuesta.end()
    })
  })
}

function listar(respuesta) {
  fs.readdir('./public/upload/', (error, archivos) => {
    let fotos = ''
    for (let x = 0; x < archivos.length; x++) {
      fotos += `<img src="upload/${archivos[x]}"><br>`
    }
    respuesta.writeHead(200, { 'Content-Type': 'text/html' })
    respuesta.write(`<!doctype html><html><head></head>
                     <body>${fotos}<a href="index.html">
                     Retornar</a></body></html>`)
    respuesta.end()
  })
}

console.log('Servidor web iniciado')
