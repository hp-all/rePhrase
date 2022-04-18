import Axios from "axios";
import { backendURLPrefix } from "./DatabaseRequest";


// Save Data the the database
// sections and loops are arrays of JSON objects
export function saveToDatabase(sections: any[], loops: any[]) {
    
}
export function getTrackSections(user_id: number, track_id: string) {

}

export function saveSectionsToDatabase(user_id: number, track_id: string, sections: any[]) {
    Axios.post(backendURLPrefix + 'sections/save', {
        user_id: user_id, // the app user UID
        track_id: track_id, // the UID of the friend who sent the request
        sections: sections,
    }).then((response)=>{
        // thisAppUser.friends[i].setUsername(response.data.Username);
    });
}
export function saveLoopsToDatabase(user_id: number, track_id: string, loops: any[]) {
    Axios.post(backendURLPrefix + 'loops/save', {
        user_id: user_id, // the app user UID
        track_id: track_id, // the UID of the friend who sent the request
        loops: loops,
    }).then((response)=>{
        // thisAppUser.friends[i].setUsername(response.data.Username);
    });
}