-- The registration RPC is exposed only to authenticated application sessions.

revoke execute on function public.register_for_trip(uuid)
from public, anon, service_role;

grant execute on function public.register_for_trip(uuid)
to authenticated;
