export default class CryptoUtils {
    static encode(message: string): string {
        return Buffer.from(message).toString("base64");
    }

    static decode(message: string): string {
        return Buffer.from(message, "base64").toString("utf-8");
    }

    static encodeJSON(obj: object): string {
        return Buffer.from(JSON.stringify(obj)).toString("base64");
    }

    static decodeJSON(obj: string): object {
        return JSON.parse(Buffer.from(obj, "base64").toString("utf-8"));
    }
}
