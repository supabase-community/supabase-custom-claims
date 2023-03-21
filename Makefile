EXTENSION = supabase_custom_claims
DATA = supabase_custom_claims--1.0.sql
 
PG_CONFIG = pg_config
PGXS := $(shell $(PG_CONFIG) --pgxs)
include $(PGXS)