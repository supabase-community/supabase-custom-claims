const Session = ({session}) => {
	return (
        <div style={{ margin: '20px' }}>
          Session:
          <pre>{JSON.stringify(session, null,2)}</pre>
        </div>
	)
}

export default Session
