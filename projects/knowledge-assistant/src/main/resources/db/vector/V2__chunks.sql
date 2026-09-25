CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE document_chunk (
    id VARCHAR(100) PRIMARY KEY,
    document_id BIGINT NOT NULL REFERENCES document(id) ON DELETE CASCADE,
    document_version BIGINT NOT NULL,
    owner_id VARCHAR(40) NOT NULL,
    embedding_model VARCHAR(200) NOT NULL,
    text VARCHAR(20000) NOT NULL,
    embedding vector NOT NULL
);
CREATE INDEX chunk_owner ON document_chunk(owner_id,embedding_model);
-- Exact search; no ANN index. This avoids approximate index/filter recall effects.
