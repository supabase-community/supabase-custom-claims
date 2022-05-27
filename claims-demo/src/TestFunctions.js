import { supabase } from './supabaseClient'
import { useState } from 'react';

const TestFunctions = ({session}) => {
    const [output, setOutput] = useState('')
    const [title, setTitle] = useState('')
    const get_my_claims = async () => {
        setOutput('Loading...')
        setTitle('get_my_claims')
        const { data, error } = await supabase.rpc('get_my_claims');
        if (error) console.error('get_my_claims error', error);
        else setOutput(JSON.stringify(data, null, 2));
    }
    const show_session = async () => {
        setOutput('Loading...')
        setTitle('session object')
        setOutput(JSON.stringify(session, null, 2));
    }   
    const is_claims_admin = async () => {
        setOutput('Loading...')
        setTitle('is_claims_admin')
        const { data, error } = await supabase.rpc('is_claims_admin');
        if (error) console.error('is_claims_admin error', error);
        else setOutput(JSON.stringify(data, null, 2));
    } 
    const session_claims = async () => {
        setTitle('session_claims')
        if (!session.user) {
            setOutput('no session.user')
        } else {
            setOutput(JSON.stringify(session.user?.app_metadata, null, 2))
        }
    }
	return (
        <>
		<div className='center'>
            Local: 
            <button onClick={show_session}>
				session
			</button>
            <button onClick={session_claims}>
				session_claims
			</button>
		</div>
		<div className='center'>
            Server:
			<button onClick={get_my_claims}>
				get_my_claims()
			</button>
			<button onClick={is_claims_admin}>
				is_claims_admin()
			</button>
		</div>
        <div className='center'>
            { (session?.user?.app_metadata?.claims_admin) && 
                <span>ADMIN</span>
            }
            { (!session?.user?.app_metadata?.claims_admin) && 
                <span>NOT ADMIN</span>
            }
        </div>
        <div>
            <div className="title">{title}</div>
            <pre>{output}</pre>
        </div>

        <div className="title">
            {(session?.user?.app_metadata?.claims_admin) ? 'you are a CLAIMS_ADMIN' : 'you are NOT a CLAIMS_ADMIN'}
        </div>
        </>
	)
}

export default TestFunctions
