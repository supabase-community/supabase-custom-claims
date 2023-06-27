import './App.css'
import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './Auth'
import Logout from './Logout'
import Userinfo from './Userinfo'
import TestFunctions from './TestFunctions'

function App() {
	const [session, setSession] = useState(null)

	useEffect(() => {
		const run = async () => {
			const { data } = await supabase.auth.getSession()
			setSession(data.session)
		}
		run();
		supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session)
		})
	}, [])
	return (
		<div className='App'>
			<header className='App-header'>
				<p>Supabase Custom Claims Demo Application</p>
			</header>
			<div>
				{!session ? 
					<div className='center'>
			          <Auth /> 
					</div>
          : 
          <>
			<div className='center'>
            	<Userinfo session={session} />
				<Logout />
			</div>
            <TestFunctions session={session} />
          </>
        }
			</div>
		</div>
	)
}

export default App
