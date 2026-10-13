-- Only TEMP objects; run fixture, ONE exercise, and its tests in one psql session.
CREATE TEMP TABLE bridge_user(id BIGINT PRIMARY KEY, name TEXT NOT NULL);
CREATE TEMP TABLE bridge_document(
    id BIGINT PRIMARY KEY,
    owner_id BIGINT NOT NULL REFERENCES bridge_user(id),
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
);
CREATE TEMP TABLE bridge_request(
    owner_id BIGINT NOT NULL,
    since_at TIMESTAMPTZ NOT NULL,
    cursor_at TIMESTAMPTZ NOT NULL,
    cursor_id BIGINT NOT NULL,
    page_size INT NOT NULL CHECK(page_size BETWEEN 1 AND 100)
);
INSERT INTO bridge_user VALUES(1,'An'),(2,'Bình'),(3,'Chi');
INSERT INTO bridge_document VALUES
    (101,1,'Java','2026-09-01 00:00:00+00'),
    (102,1,'SQL','2026-09-02 00:00:00+00'),
    (104,1,'Spring','2026-09-02 00:00:00+00'),
    (105,1,'HTTP','2026-09-03 00:00:00+00'),
    (201,2,'Private','2026-09-02 00:00:00+00');
-- Exactly one request row. Tests update its parameters without recreating views.
INSERT INTO bridge_request VALUES(1,'2026-09-02 00:00:00+00','2026-09-02 00:00:00+00',104,2);
