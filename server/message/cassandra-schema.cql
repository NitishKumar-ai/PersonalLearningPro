-- MessagePal Cassandra Schema
-- This schema supports the messaging system with conversations, messages, and user relationships

-- Keyspace for MessagePal (using existing chat_db keyspace)
USE chat_db;

-- Table for storing individual messages
CREATE TABLE IF NOT EXISTS messages (
    conversation_id text,
    message_id timeuuid,
    sender_id int,
    sender_name text,
    sender_role text,
    recipient_id int,
    content text,
    timestamp timestamp,
    read_by set<int>,
    is_read boolean,
    message_type text, -- 'text', 'file', 'image'
    file_url text,
    PRIMARY KEY (conversation_id, message_id)
) WITH CLUSTERING ORDER BY (message_id DESC);

-- Table for tracking user conversations
CREATE TABLE IF NOT EXISTS user_conversations (
    user_id int,
    conversation_id text,
    participant_ids set<int>,
    participant_names map<int, text>,
    participant_roles map<int, text>,
    last_message_id timeuuid,
    last_message_content text,
    last_message_timestamp timestamp,
    unread_count int,
    is_archived boolean,
    PRIMARY KEY (user_id, conversation_id)
) WITH CLUSTERING ORDER BY (conversation_id ASC);

-- Table for conversation metadata
CREATE TABLE IF NOT EXISTS conversations (
    conversation_id text PRIMARY KEY,
    participant_ids set<int>,
    participant_names map<int, text>,
    created_at timestamp,
    updated_at timestamp,
    is_group boolean,
    group_name text,
    group_description text
);

-- Table for tracking online status
CREATE TABLE IF NOT EXISTS user_status (
    user_id int PRIMARY KEY,
    status text, -- 'online', 'away', 'offline'
    last_seen timestamp,
    updated_at timestamp
);

-- Index for efficient message querying by recipient
CREATE INDEX IF NOT EXISTS ON messages (recipient_id);

-- Index for efficient conversation lookup by participant
CREATE INDEX IF NOT EXISTS ON conversations (participant_ids);

-- Materialized view for getting user's conversation list
CREATE MATERIALIZED VIEW IF NOT EXISTS user_active_conversations AS
    SELECT user_id, conversation_id, last_message_timestamp, unread_count
    FROM user_conversations
    WHERE user_id IS NOT NULL AND conversation_id IS NOT NULL AND last_message_timestamp IS NOT NULL
    PRIMARY KEY (user_id, last_message_timestamp, conversation_id)
    WITH CLUSTERING ORDER BY (last_message_timestamp DESC);

-- Materialized view for getting messages by recipient for notifications
CREATE MATERIALIZED VIEW IF NOT EXISTS messages_by_recipient AS
    SELECT recipient_id, conversation_id, message_id, sender_id, content, timestamp, is_read
    FROM messages
    WHERE recipient_id IS NOT NULL AND conversation_id IS NOT NULL AND message_id IS NOT NULL
    PRIMARY KEY (recipient_id, conversation_id, message_id)
    WITH CLUSTERING ORDER BY (conversation_id ASC, message_id DESC);

-- Sample data for testing
INSERT INTO conversations (conversation_id, participant_ids, participant_names, participant_roles, created_at, updated_at, is_group)
VALUES ('conv_1_2', {1, 2}, {1: 'John Doe', 2: 'Jane Smith'}, {1: 'student', 2: 'teacher'}, toTimestamp(now()), toTimestamp(now()), false);

INSERT INTO user_conversations (user_id, conversation_id, participant_ids, participant_names, participant_roles, last_message_timestamp, unread_count)
VALUES (1, 'conv_1_2', {1, 2}, {1: 'John Doe', 2: 'Jane Smith'}, {1: 'student', 2: 'teacher'}, toTimestamp(now()), 0);

INSERT INTO user_conversations (user_id, conversation_id, participant_ids, participant_names, participant_roles, last_message_timestamp, unread_count)
VALUES (2, 'conv_1_2', {1, 2}, {1: 'John Doe', 2: 'Jane Smith'}, {1: 'student', 2: 'teacher'}, toTimestamp(now()), 1);