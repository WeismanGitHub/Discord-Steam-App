import { errorToast, successToast } from '../toasts'
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from "react";
import Navbar from '../elements/nav-bar';
import axios, * as others from 'axios'
import '../css/Privileged.css';

export default function Privileged() {
	const userData = localStorage.getItem('userData')
	const [botData, setBotData] = useState(null)
	const [userPage, setUserPage] = useState(0)
	const [guilds, setGuilds] = useState([])
	const [users, setUsers] = useState([])
	const navigate = useNavigate();

	const [admins, setAdmins] = useState([])
	const [owners, setOwners] = useState([])

	function stopProcess() {
		axios.post('/api/v1/owner/process/kill')
		.then(res => successToast('Request was acknowledged.'))
		.catch(err => errorToast(err?.response?.data?.error || err.message));
	}

	function restartProcess() {
		axios.post('/api/v1/owner/process/restart')
		.then(res => successToast('Request was acknowledged.'))
		.catch(err => errorToast(err?.response?.data?.error || err.message));
	}

	function fetchUsers(page) {
		if (page < 0) {
			return errorToast('Cannot go below 1.')
		}

		if (users.length < 10) {
			return errorToast('No more users left.')
		}

		axios.get(`/api/v1/admin/users?page=${page}`)
		.then(res => {
			if (!res?.data?.users) {
				return errorToast('Something went wrong getting more users.')
			}
			
			setUserPage(page)
			setUsers(res.data.users)
		})
		.catch(err => errorToast(err?.response?.data?.error || err.message));
	}
	
	useEffect(() => {
		if (!userData || userData.level == 'user') {
			errorToast('You must be an admin or owner.')
			return navigate('/')
		}

		Promise.all([
			axios.get('/api/v1/admin/guilds'),
			axios.get('/api/v1/admin/users'),
			axios.get('/api/v1/admin/bot'),
			userData.level == 'owner' ? axios.get('/api/v1/owner/admins') : null,
			userData.level == 'owner' ? axios.get('/api/v1/owner/owners') : null,
		])
		.then(([guildsRes, usersRes, botRes, adminsRes, ownersRes]) => {
			setGuilds(guildsRes.data.guilds)
			setUsers(usersRes.data.users)
			setBotData(botRes.data)
			setAdmins(adminsRes?.admins)
			setOwners(ownersRes?.owners)
		})
		.catch(err => {
			errorToast(err?.response?.data?.error || err.message)
		});
    }, [])

	return <>
		<Navbar/>

		<div class='column' style={{ width: '25%' }}>
			Guilds: {guilds?.length}
			<hr class="divider"/>

			{guilds?.map(guild => {
				const name = `${guild.name?.substring(0, 32)}${guild.name?.length > 35 ? '...' : ''}`

				const joinedDate = new Date(Number(guild.joinedTimestamp))
				const formattedDate = joinedDate.toLocaleDateString("en-US", {
					year: 'numeric',
					month: 'long',
					day: 'numeric'
				})

				return <div class='column-item' title={guild.name}>
					<img src={guild.iconURL} alt='guild icon' width={60} height={60} class='icon'/>
					<div class='name'>{name}</div>
					<br/>
					
					<div class='guild-info'>
						joined: {formattedDate}
						<br/>
						members: {guild.memberCount}
						<br/>
						locale: {guild.preferredLocale}
					</div>
				</div>
			})}
		</div>
		
		<div class='column' style={{ width: '20%' }}>
			Users
			<div class='next-before-buttons'>
				<button onClick={() => fetchUsers(userPage - 1)}>Before</button>
				{userPage + 1}
				<button onClick={() => fetchUsers(userPage + 1)}>Next</button>
			</div>
			<hr class="divider"/>

			{users?.map(user => {
				return <div class='column-item' title={user.name}>
					<img src={user.avatarURL} alt='user avatar' width={55} height={55} class='icon'/>
					<div class='name'>{user.name}</div>
				</div>
			})}
		</div>

		{userData?.level == 'owner' &&
		<div class='process-buttons'>
			<button onClick={stopProcess}>Stop Process</button>
			<button onClick={restartProcess}>Restart Process</button>
		</div>}
	</>
}