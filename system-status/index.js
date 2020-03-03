const html = statuses => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Casa Service Status</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss/dist/tailwind.min.css" rel="stylesheet"></link>
  </head>

  <body class="bg-blue-100">
    <div class="w-full h-full flex content-center justify-center mt-8">
      <div class="bg-white shadow-md rounded px-8 pt-6 py-8 mb-4">
        <div class="mt-4" id="statuses">
	    <table id="statusTable"  border="1" cellpadding="5">
            </table>
	</div>
      </div>
    </div>
  </body>
  <script>
    window.statuses = ${statuses}

    function addCell(tr, val) {
	var td = document.createElement('td');
	td.innerHTML = val;
	tr.appendChild(td)
    }

    function addRow(tbl, val_1, val_2, val_3) {
	var tr = document.createElement('tr');
	addCell(tr, val_1);
	addCell(tr, val_2);
	addStatusCell(tr, val_3);
	tbl.appendChild(tr)
    }

    function addStatusCell(tr, val) {
	var td = document.createElement('td');
        var styleString = "margin-left: 17px; height: 25px; width: 25px; border-radius: 50%; display: inline-block; background-color: " + val + ";"
        td.setAttribute('style', styleString);
	tr.appendChild(td)
    }

    function addHeader(tbl, val_1, val_2, val_3) {
	var tr = document.createElement('tr');
	addCell(tr, val_1);
	addCell(tr, val_2);
	addCell(tr, val_3);
	tbl.appendChild(tr)
    }

    var populateStatus = function() {
      tbl = document.getElementById('statusTable');
      addHeader(tbl, "Service", "Last Seen", "Status")

      window.statuses.forEach(status => {
	addRow(tbl, status.name, status.strDate, status.statusIndicator);
      })
    }

    populateStatus()
  </script>
</html>
`

const setCache = (key, data) => LOCAL_STATUS.put(key, data);
const getCache = key => LOCAL_STATUS.get(key);

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function dateToStatus(dateTime) {
    var isoDateNow = Date.now();
    var dateDiff = (isoDateNow - dateTime);
    if (dateDiff < 180000) {
	return 1
    } else {
	return 0
    }
}

function getStatusIndicator(status) {
    if (status === 1) {
	return "#77DD77"
    } else {
	return "#FF6961"
    }
}

/**
* Fetch all statuses in cache
**/
async function getStatuses() {
    const cacheKeys = await LOCAL_STATUS.list();
    while (!(cacheKeys.list_complete === true)) {
	sleep(5)
    }

    const numKeys = cacheKeys.keys.length;
    var statuses = [];

    for (var i = 0; i < numKeys; i++) {
	var c = cacheKeys.keys[i];
	var epcDate = await getCache(c.name);
	var data = {date: Number(epcDate), name: c.name};
	data.strDate = new Date(data.date).toISOString();
	data.status = dateToStatus(data.date);
	data.statusIndicator = getStatusIndicator(data.status);
	statuses.push(data);
    }

    const body = html(JSON.stringify(statuses || []));

    return new Response(body, {
	headers: { 'Content-Type': 'text/html' },
    });
}

/**
* Fetch given status based on key passed as query param
**/
async function getStatus(cacheKey) {
    var cacheDate = await getCache(cacheKey);

    if (!cacheDate) {
	return new Response('invalid status key', { status: 500 });
    } else {
	var status = dateToStatus(cacheDate);
	return new Response(status, {status: 200});
    }
}

/**
* Update status based on key passed as query param
**/
async function updateStatus(cacheKey) {
    try {
	var isoDate = Date.now();
	await setCache(cacheKey, isoDate);
	var strDate = new Date(isoDate).toISOString();
	return new Response((cacheKey + " set at " + strDate + "\n"), { status: 200 });
    } catch (err) {
	return new Response(err, { status: 500 });
    }
}

async function handleRequest(request) {
    let statusKey = new URL(request.url).searchParams.get('service');
    let queryType = new URL(request.url).searchParams.get('query');

    if (request.method === 'POST') {
	return updateStatus(statusKey);
    } else if (queryType === 'simple') {
	return getStatus(statusKey);
    } else {
	return getStatuses();
    }
}

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})
