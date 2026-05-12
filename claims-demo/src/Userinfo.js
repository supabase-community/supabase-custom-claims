import { supabase } from './supabaseClient'

const Userinfo = ({session}) => {
	return (
        <span>
            { session.user && session.user.email }
            { !session.user && 'not logged in' }
        </span>
	)
}

export default Userinfo
