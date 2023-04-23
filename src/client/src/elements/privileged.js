import { errorToast, successToast } from '../toasts'
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from "react";
import Navbar from '../elements/nav-bar';
import axios, * as others from 'axios'
import '../css/privileged.css';

export default function Privileged() {
	const [personType, setPersonType] = useState(localStorage.getItem('personType') || 'users')
	const userData = JSON.parse(localStorage.getItem('userData'))
	const [peoplePage, setPeoplePage] = useState(0)
	const [guilds, setGuilds] = useState([])
	const [people, setPeople] = useState([])
	const [bot, setBot] = useState(null)
	const navigate = useNavigate();

	const [admins, setAdmins] = useState([])
	const [owners, setOwners] = useState([])
	
	useEffect(() => {
		if (!userData || userData.level == 'user') {
			errorToast('You must be an admin or owner.')
			return navigate('/')
		}

		Promise.all([
			axios.get('/api/v1/admin/guilds'),
			axios.get(`/api/v1/${personType === 'users' ? 'admin' : 'owner'}/${personType}`),
			axios.get('/api/v1/admin/bot'),
			userData.level == 'owner' ? axios.get('/api/v1/owner/admins') : null,
			userData.level == 'owner' ? axios.get('/api/v1/owner/owners') : null,
		])
		.then(([guildsRes, usersRes, botRes, adminsRes, ownersRes]) => {
			setGuilds(guildsRes.data.guilds)
			setPeople(usersRes.data)
			setBot(botRes.data)
			setAdmins(adminsRes?.admins)
			setOwners(ownersRes?.owners)
		})
		.catch(err => {
			errorToast(err?.response?.data?.error || err.message)
		});
    }, [])

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

	function fetchPeople(page) {
		if (page < 0) {
			return errorToast('Cannot go below 1.')
		}

		if (people.length < 10) {
			return errorToast('No more people left.')
		}

		axios.get(`/api/v1/${personType === 'users' ? 'admin' : 'owner'}/${personType}`)
		.then(res => {
			if (!res?.data) {
				return errorToast('Something went wrong getting more people.')
			}
			
			setPeoplePage(page)
			setPeople(res.data)
		})
		.catch(err => errorToast(err?.response?.data?.error || err.message));
	}

	function personTypeClick(type) {
		localStorage.setItem('personType', type)
		setPersonType(type)
		
		axios.get(`/api/v1/${type === 'users' ? 'admin' : 'owner'}/${type}`)
		.then(res => {
			if (!res?.data) {
				return errorToast('Something went wrong getting more people.')
			}
			
			setPeoplePage(0)
			setPeople(res.data)
		})
		.catch(err => errorToast(err?.response?.data?.error || err.message));
	}

	function formatTimestamp(timestamp) {
		const date = new Date(Number(timestamp))

		return date.toLocaleDateString("en-US", {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		})
	}

	return <>
		<Navbar/>

		<div class='column' style={{ width: '25%' }}>
			Guilds: {guilds?.length}
			<hr class="divider"/>

			{guilds?.map(guild => {
				const name = `${guild.name?.substring(0, 32)}${guild.name?.length > 35 ? '...' : ''}`
				const formattedDate = formatTimestamp(guild.joinedTimestamp)

				return <div class='column-item' title={guild.name}>
					<img src={guild.iconURL} alt='guild icon' width={60} height={60} class='icon'/>
					<div class='name'>{name}</div>
					<br/>
					
					<div class='item-info'>
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
				{userData?.level == 'admin' ? 'Users' :
				<div>
					<button
						class={`people-type-button ${personType == 'users' ? 'highlighted' : 'unhighlighted'}`}
						onClick={() => personTypeClick('users')}
					>Users</button>
					<button
						class={`people-type-button ${personType == 'admins' ? 'highlighted' : 'unhighlighted'}`}
						onClick={() => personTypeClick('admins')}
					>Admins</button>
					<button
						class={`people-type-button ${personType == 'owners' ? 'highlighted' : 'unhighlighted'}`}
						onClick={() => personTypeClick('owners')}
					>Owners</button>
				</div>}
			<div>
				<button class='pagination-button' onClick={() => fetchPeople(peoplePage - 1)}>{`<`}</button>
				{peoplePage + 1}
				<button class='pagination-button' onClick={() => fetchPeople(peoplePage + 1)}>{`>`}</button>
			</div>
			<hr class="divider"/>

			{people?.map(person => {
				return <div class='column-item' title={person.name}>
					<img src={person.avatarURL} alt='person avatar' width={53} height={53} class='icon'/>
					<div class='name'>{person.name}</div>
				</div>
			})}
		</div>

		<div class='column' style={{ width: '20%' }}>
			Bot:
			
			<hr class="divider"/>
			
			<div class='column-item' title={bot?.name}>
				<img src={bot?.avatarURL} alt='bot avatar' width={53} height={53} class='icon'/>
				<div class='name'>{bot?.name}</div>

				<div class='item-info'>
					created: {formatTimestamp(bot?.createdTimestamp)}
					<br/>
					online: {formatTimestamp(bot?.readyTimestamp)}
					<br/>
					activity: {`${bot?.activity.type} ${bot?.activity.name}`}
				</div>
			</div>

			<hr class="divider"/>

			{userData?.level == 'owner' &&
				<button onClick={stopProcess} class='people-type-button'>Stop Process</button>
			}
		</div>
	</>
}