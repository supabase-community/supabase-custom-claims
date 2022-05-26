import { supabase } from './supabaseClient'

const Logout = () => {
	return (
		<div className='center'>
			<button type='button' className='button block center' onClick={() => supabase.auth.signOut()}>
				Sign Out
			</button>
		</div>
	)
}

export default Logout
