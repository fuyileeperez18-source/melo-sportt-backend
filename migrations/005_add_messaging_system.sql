-- ============================================
-- MESSAGING SYSTEM FOR CUSTOMER-SELLER COMMUNICATION
-- ============================================

-- Conversations table (cada conversación es entre un cliente y el vendedor)
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL, -- Optional: asociar con una orden
  product_id UUID REFERENCES products(id) ON DELETE SET NULL, -- Optional: producto sobre el que se consulta
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  last_message_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_customer_id ON conversations(customer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_order_id ON conversations(order_id);
CREATE INDEX IF NOT EXISTS idx_conversations_product_id ON conversations(product_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at DESC);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  -- Attachment fields (opcional para enviar imágenes del producto)
  attachment_url TEXT,
  attachment_type VARCHAR(20) CHECK (attachment_type IN ('image', 'document')),
  attachment_name VARCHAR(255),
  attachment_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Función para actualizar last_message_at en conversations
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET
    last_message_at = NEW.created_at,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar automáticamente last_message_at
DROP TRIGGER IF EXISTS trigger_update_conversation_last_message ON messages;
CREATE TRIGGER trigger_update_conversation_last_message
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_last_message();

-- Función para marcar mensajes como leídos
CREATE OR REPLACE FUNCTION mark_messages_as_read(
  p_conversation_id UUID,
  p_user_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE messages
  SET
    is_read = true,
    read_at = NOW()
  WHERE
    conversation_id = p_conversation_id
    AND sender_id != p_user_id
    AND is_read = false;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener el conteo de mensajes no leídos por usuario
CREATE OR REPLACE FUNCTION get_unread_messages_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  unread_count INTEGER;
BEGIN
  -- Admin ve mensajes no leídos de todas las conversaciones
  IF EXISTS (SELECT 1 FROM users WHERE id = p_user_id AND role IN ('admin', 'super_admin')) THEN
    SELECT COUNT(*)
    INTO unread_count
    FROM messages m
    INNER JOIN conversations c ON m.conversation_id = c.id
    WHERE m.sender_id != p_user_id
      AND m.is_read = false;
  ELSE
    -- Clientes solo ven sus conversaciones
    SELECT COUNT(*)
    INTO unread_count
    FROM messages m
    INNER JOIN conversations c ON m.conversation_id = c.id
    WHERE c.customer_id = p_user_id
      AND m.sender_id != p_user_id
      AND m.is_read = false;
  END IF;

  RETURN unread_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE conversations IS 'Conversaciones entre clientes y el vendedor/admin';
COMMENT ON TABLE messages IS 'Mensajes individuales dentro de cada conversación';
COMMENT ON FUNCTION mark_messages_as_read IS 'Marca todos los mensajes de una conversación como leídos para un usuario';
COMMENT ON FUNCTION get_unread_messages_count IS 'Obtiene el número total de mensajes no leídos para un usuario';
