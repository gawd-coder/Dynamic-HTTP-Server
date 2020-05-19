const fs = require("fs");
const handlebars = require("handlebars");
const http = require("http");
const mime = require("mime");
const path = require("path");
const url = require("url");

//checking path for static files with baseDirectory.We store the script in this directory
const staticDir = path.resolve(`${__dirname}/static`);
console.log(`Static resources from ${staticDir}`);
//load product array form JSON file using readFileSync
const data = fs.readFileSync(`products.json`);
const products = JSON.parse(data.toString());
console.log(`Loaded ${products.length} products...`);
//helper function for our template engine => Handlebar
//these can be registered and used from within templates
handlebars.registerHelper("currency", (number) => {
    `$${number.toFixed(2)}`
});
//initialize the http handler and start listening to connections
function initializeServer(){
    const server = http.createServer();
    server.on("request",handleRequest);
    const port = 3000;
    console.log(`Go to http://localhost{port}`);
    server.listen(port);
}
function handleRequest(request,response){
    const requestUrl = url.parse(request.url);
    const pathname = requestUrl.pathname;
    if(pathname == "/" || pathname == "index.html"){
        handleProductsPage(requestUrl,response);
        return;
    }
    handleStaticFile(pathname, response);
}
//function to serve static files
function handleStaticFile(pathname,response){
    const fullPath = path.join(staticDir,pathname);
    fs.access(fullPath,fs.constants.R_OK,(error) => {
        if(error){
            console.error(`File is not readable: ${fullPath}`,error);
            response.writeHead(404);
            response.end();
            return;
        }
        const contentType = mime.getType(path.extname(fullPath));
        response.writeHead(200,{"Content-type":contentType});
        fs.createReadStream(fullPath).pipe(response);
    })
}
//function to serve dynamic files
const htmlString = fs.readFileSync(`html/index.html`).toString();
const template = handlebars.compile(htmlString);
function handleProductsPage(requestUrl,response){
    response.writeHead(200);
    response.write(template({
        products: products
    }));
    response.end();
}
//handlebars use {{variable}} for variables and {{#arrayVariable}} for executing a for loop
initializeServer();