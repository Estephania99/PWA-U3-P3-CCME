const CACHE_NAME = 'cache-v1';
const CACHE_STATIC_NAME = 'static-v1';
const CACHE_DYNAMIC_NAME = 'dynamic-v1';
const CACHE_INMUTABLE_NAME = 'inmutable-v1';

function cleanCache(cacheName, sizeItem){
    caches.open(cacheName).then((cache)=>{
        cache.keys().then((keys)=>{
            console.log(keys);
            if(keys.length >= sizeItem){
                cache.delete(keys[0]).then(
                    cleanCache(cacheName, sizeItem)
                );
            }
        });
    });
}

self.addEventListener('install', (event)=>{
    // Crear caché y almacenar nuestro APPSHELL (tdo lo que ocupa la app para que se pueda ejecutar)
    const promesaCache = caches.open(CACHE_STATIC_NAME).then((cache)=>{
        return cache.addAll([
            '/',
            'index.html',
            'css/page.css',
            'img/inicio.jpg',
            'js/app.js'
        ]);
    });

    const promInmutable = caches.open(CACHE_INMUTABLE_NAME).then((cacheIn)=>{
        return cacheIn.addAll([
            'https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css'
        ]);
    });

    

    event.waitUntil(Promise.all([promesaCache, promInmutable]));
});

self.addEventListener('fetch', (event)=>{

    // 2.- Cache with network fallback
    // Primero busca caché y si no lo encuentra va a la red
    const respuestaCache = caches.match(event.request).then((resp)=>{
        // Si mi request existe en cache
        if(resp){
            //respondemos con cache
            return resp;
        }
        console.log('No está en caché', event.request.url);
        // voy a la red
        return fetch(event.request).then((respuestaNetwork)=>{
            // abro cache
            caches.open(CACHE_DYNAMIC_NAME).then((cache)=>{
                // guardo la respuesta de la red en cache
                cache.put(event.request, respuestaNetwork).then(()=>{
                    cleanCache(CACHE_DYNAMIC_NAME, 4)
                });
                
            });
            // respondo con el response de la red
            return respuestaNetwork.clone();
        });
    });
    event.respondWith(respuestaCache);


    // 1.- Only cache
    //event.respondWith(caches.match(event.request));
});