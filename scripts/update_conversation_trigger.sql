-- Function to update conversation metadata
create or replace function update_conversation_metadata()
returns trigger language plpgsql as $$
begin
  update conversations
  set
    last_message = new.body,
    last_message_at = new.created_at
  where
    id = new.conversation_id;
  return new;
end;
$$;

-- Trigger to update conversation metadata
create or replace trigger on_new_message
  after insert on messages
  for each row
  execute function update_conversation_metadata();
