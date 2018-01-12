const unitId = process.arg[2] // инд. плагина от сервера.


process.send({ type: 'get', tabelename: 'params' + '/' + unitId}) // получу конфиг от сервера params  пропис. в манифесте в блоке парамс
// type chanels []data ->   {id, desc}
// type data    []data -> {id, value, ts }

// desc - maping to manifest

process.message() // ответы от сервера
