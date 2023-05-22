import { errorToast, successToast } from '../../toasts'
import { useParams } from 'react-router-dom';
import { useEffect, useState } from "react";
import axios, * as others from 'axios'
import NavBar from '../nav-bar';
import '../../css/tickets.css';

export default function Ticket() {
    const userData = JSON.parse(localStorage.getItem('userData'))
    const [response, setResponse] = useState('')
	const [ticket, setTicket] = useState(null)
    const { ticketID } = useParams()

    useEffect(async () => {
		const { data } = await axios.get(`/api/v1/tickets/${ticketID}`)
		.catch(err => errorToast(err?.response?.data?.error || err.message));

        setTicket(data)
	}, [])

    function resolveTicket() {

    }

    return (<>
        <NavBar/>

        <div class='ticket-area'>
            <div class='ticket-title'> {ticket?.title}</div>
            <br/>
            <div class='ticket-status'>status: {ticket?.status || 'unknown'}</div>
            <br/>

            <div style={{fontSize: 'medium' }}>{ticket?.text}</div>

            <div>{ticket?.response}</div>
            
            {(ticket?.status === 'open' && ['admin', 'owner'].includes(userData?.role)) && 
                <textarea
                    style={{ width: '50%', height: '50%' }}
                    class='ticket-response-input'
                    value={response}
                    onChange={(e)=> {
                        if (e.target.value.length > 4096) {
                            return errorToast('Must be less than 4096.')
                        }

                        setResponse(e.target.value)
                    }}
                    onKeyPress={ (e) => e.key === 'Enter' && resolveTicket()}
                />
            }
        </div>
    </>)
}