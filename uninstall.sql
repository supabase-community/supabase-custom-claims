DROP FUNCTION get_my_claims;
DROP FUNCTION get_my_claim;
DROP FUNCTION get_claims;
DROP FUNCTION set_claim;
DROP FUNCTION delete_claim;
DROP FUNCTION is_claims_admin();
NOTIFY pgrst, 'reload schema';
