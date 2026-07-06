import { Pinecone } from '@pinecone-database/pinecone';

export const pinecone = new Pinecone({
    apiKey:process.env.PINECONE_DB_API!
});

export const pineconeIndex = pinecone.index('code-audit-vector-embedding-v1');