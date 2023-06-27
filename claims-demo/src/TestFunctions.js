import { supabase } from './supabaseClient'
import { useState, useEffect } from 'react';

const TestFunctions = ({session}) => {
    const [output, setOutput] = useState('')
    const [notes, setNotes] = useState('')
    const [title, setTitle] = useState('')
    const [uid, setUid] = useState('')
    const [claim, setClaim] = useState('')
    const [value, setValue] = useState('')
	useEffect(() => {
		setUid(session?.user?.id || '')
	}, [])

    const get_my_claims = async () => {
        setOutput('Loading...')
        setTitle('get_my_claims')
        const { data, error } = await supabase.rpc('get_my_claims');
        if (error) console.error('get_my_claims error', error);
        else setOutput(JSON.stringify(data, null, 2));
        setNotes('This calls the server function "get_my_claims()" and gets the claims from the current token at the server.')
    }
    const get_my_claim = async () => {
        setOutput('Loading...')
        setTitle(`get_my_claim('${claim}')`)
        const { data, error } = await supabase.rpc('get_my_claim',{claim});
        if (error) console.error('get_my_claim error', error);
        else setOutput(JSON.stringify(data, null, 2));
        setNotes('This calls the server function "get_my_claim(claim text)" and gets the claim from the current token at the server.')
    }
    const show_session = async () => {
        setOutput('Loading...')
        setTitle('session object')
        setOutput(JSON.stringify(session, null, 2));
        setNotes('This displays the entire session object that was returned from "supabase.auth.onAuthStateChange".')
    }   
    const is_claims_admin = async () => {
        setOutput('Loading...')
        setTitle('is_claims_admin')
        const { data, error } = await supabase.rpc('is_claims_admin');
        if (error) console.error('is_claims_admin error', error);
        else setOutput(JSON.stringify(data, null, 2));
        setNotes('This calls the server function "is_claims_admin()" and returns true if the current token on teh server has the "claims_admin" claim.')
    } 
    const session_claims = async () => {
        setTitle('session_claims')
        if (!session.user) {
            setOutput('no session.user')
        } else {
            setOutput(JSON.stringify(session.user?.app_metadata, null, 2))
        }
        setNotes('This returns the value of "app_metadata" (the claims) from the current session object (returned from "supabase.auth.onAuthStateChange").')
    }
    const set_claim = async () => {
        if (!uid || !claim || !value) return;
        setOutput('Loading...')
        setTitle('set_claim')
        const { data, error } = await supabase.rpc('set_claim', {uid, claim, value});
        if (error) console.error('set_claim error', error);
        else { // setOutput(JSON.stringify(data, null, 2)); 
            const { user, error: updateError } = await refresh_claims();
            if (updateError) console.error('update error', updateError);
            else setOutput(JSON.stringify(user?.app_metadata, null, 2));
        }
        setNotes('This calls the server function "set_claim(uid, claim, value)" to set a custom claim for a given user by id (uuid).')
    }
    const delete_claim = async () => {
        if (!uid || !claim) return;
        setOutput('Loading...')
        setTitle('delete_claim')
        const { data, error } = await supabase.rpc('delete_claim', {uid, claim});
        if (error) console.error('delete_claim error', error);
        else { // setOutput(JSON.stringify(data, null, 2)); 
            const { user, error: updateError } = await refresh_claims();
            if (updateError) console.error('update error', updateError);
            else setOutput(JSON.stringify(user?.app_metadata, null, 2));
        }
        setNotes('This calls the server function "delete_claim(uid, claim)" to delete a custom claim for a given user by id (uuid).')
    }
    const refresh_claims = async () => {
        const { data: { user }, error } = await supabase.auth.refreshSession()
        return { user, error };
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
            <button onClick={refresh_claims}>
                refresh_claims
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
            claim: <input type="text" value={claim} onChange={e => setClaim(e.target.value)} placeholder="claim name" />
			<button onClick={get_my_claim}>
				get_my_claim('{claim}')
			</button>
 		</div>
        <div className="center">
            uid: <input type="text" value={uid} onChange={e => setUid(e.target.value)} placeholder="user id (auth.users.id)" />
            &nbsp;claim: <input type="text" value={claim} onChange={e => setClaim(e.target.value)} placeholder="claim name" />
            &nbsp;value: <input type="text" value={value} onChange={e => setValue(e.target.value)} placeholder="claim value" />
            <button onClick={set_claim} disabled={!uid || !claim || !value || !(session?.user?.app_metadata?.claims_admin)}>
                set_claim
            </button>
            <button onClick={delete_claim} disabled={!uid || !claim || !(session?.user?.app_metadata?.claims_admin)}>
                delete_claim
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
            <div className='notes'><b>{title}:</b> {notes}</div>
        </div>

        <div className="title">
            {(session?.user?.app_metadata?.claims_admin) ? 'you are a CLAIMS_ADMIN' : 'you are NOT a CLAIMS_ADMIN'}
        </div>
        </>
	)
}

export default TestFunctions
