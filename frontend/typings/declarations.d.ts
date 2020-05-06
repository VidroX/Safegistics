declare module '*.scss' {
    export const content: { [className: string]: string };
    export default content;
}

declare module '*.graphql' {
    import { DocumentNode } from 'graphql';

    const Schema: DocumentNode;

    export { Schema };
    export default defaultDocument;
}
