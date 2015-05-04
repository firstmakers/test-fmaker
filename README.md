# test-fmakers

Herramienta que se utiliza para probar el funcionamiento de la tarjeta First Makers

Para compilar el puerto serial en Windows :

Requisitos:
* Visual Studio
* Python
* Node
* node-pre-gyp
* nw-gyp
* node-webkit 0.12.0
* npm

```
cd /Path/test-fmakers/
```
```
npm install
```
```
cd node_modules/serialport
```
```
node-pre-gyp configure --runtime=node-webkit --target=0.12.0 -target-platform=win64
```
```
node-pre-gyp build --runtime=node-webkit --target=0.12.0 -target-platform=win64
```

Renombrar la carpeta

```
node_modules\serialport\build\serialport\v1.6.3\Release\node-webkit-v0.12.0-win32-x64  
```
```
node_modules\serialport\build\serialport\v1.6.3\Release\node-webkit-v43-win32-x64
```

Issues:

En Windows, en algunos casos no se establece la comunicación con el puerto serial,  la solución es ejecucar la aplicación como administrador.