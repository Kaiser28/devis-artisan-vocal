-- ============================================================
-- MIGRATION 003 : Tables pour Chat IA avec Assistants OpenAI
-- ============================================================

-- Table : Conversations IA (threads OpenAI)
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  thread_id TEXT NOT NULL,
  assistant_id TEXT NOT NULL,
  title TEXT,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, thread_id)
);

-- Table : Messages IA
CREATE TABLE IF NOT EXISTS ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  message_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table : Actions IA
CREATE TABLE IF NOT EXISTS ai_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('search_clients', 'search_prices', 'create_devis', 'get_devis', 'send_devis_email')),
  action_data JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  result JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Index
CREATE INDEX IF NOT EXISTS idx_conversations_user_last_message ON ai_conversations(user_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_thread ON ai_conversations(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON ai_messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_messages_message_id ON ai_messages(message_id);
CREATE INDEX IF NOT EXISTS idx_actions_conversation_status ON ai_actions(conversation_id, status);

-- RLS
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own conversations" ON ai_conversations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users read own messages" ON ai_messages FOR SELECT USING (EXISTS (SELECT 1 FROM ai_conversations WHERE id = conversation_id AND user_id = auth.uid()));
CREATE POLICY "Users insert own messages" ON ai_messages FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM ai_conversations WHERE id = conversation_id AND user_id = auth.uid()));
CREATE POLICY "Users read own actions" ON ai_actions FOR SELECT USING (EXISTS (SELECT 1 FROM ai_conversations WHERE id = conversation_id AND user_id = auth.uid()));
CREATE POLICY "Users insert own actions" ON ai_actions FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM ai_conversations WHERE id = conversation_id AND user_id = auth.uid()));
CREATE POLICY "Users update own actions" ON ai_actions FOR UPDATE USING (EXISTS (SELECT 1 FROM ai_conversations WHERE id = conversation_id AND user_id = auth.uid()));

-- Trigger
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER update_ai_conversations_updated_at BEFORE UPDATE ON ai_conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
