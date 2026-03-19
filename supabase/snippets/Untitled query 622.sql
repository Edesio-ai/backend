select
  it.id,
  it.etablissement_id,
  it.token,
  it.invited_email,
  it.expires_at,
  it.used_at,
  it.chatbots_alloues
from public.invitation_tokens it
where it.token = 'token-de-test';