import App from "./src/app";
import indexRouter from "./src/routes";


const server = new App(
    [indexRouter],
    []
)
server.origins = ["http://localhost:3001"]

server.listen()