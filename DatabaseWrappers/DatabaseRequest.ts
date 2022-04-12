export function MYSQLRequest(phpFileName: string, Data: any) {
	var DatabaseURL = "http://localhost/Project/" + phpFileName; // where server is hosted right now
    
    var headers = {
        'Accept' : 'application/json',
        'Content-Type' : 'application/json'
    };
    return fetch(DatabaseURL, {
        method: 'POST',
        headers:headers,
        body: JSON.stringify(Data)
    })
    .then((Response)=>Response.json()) // check if in the response is in JSON format
}