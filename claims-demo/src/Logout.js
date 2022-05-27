import { supabase } from './supabaseClient'

const Logout = () => {
	return (
		<span>
			<button type='button' className='button block center' onClick={() => supabase.auth.signOut()}>
				Sign Out
			</button>
		</span>
	)
}

export default Logout
