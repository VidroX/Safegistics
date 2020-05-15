import {LocalStorage} from "node-localstorage";

declare global {
    namespace NodeJS {
        interface Global {
            localStorage: LocalStorage
        }
    }
}
