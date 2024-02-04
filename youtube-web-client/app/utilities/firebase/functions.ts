import { httpsCallable } from "firebase/functions";
import {functions} from './firebase';

const generateUploadUrl = httpsCallable(functions, 'generateUploadUrl');
const getVideosFunction = httpsCallable(functions, 'getVideos');

//GRPC or rest api to stop copying the interface
export interface Video{
    id?: string, 
    uid?: string, 
    filename?: string, 
    status?: 'processing' | 'processed', 
    title?: string, 
    description?: string
}


//wrapper
export async function uploadVideo(file: File){
   const response : any = await generateUploadUrl({
        fileExtension:file.name.split('.').pop()
    })

    //uploa dthe file via the signed url 

    await fetch(response?.data?.url, {
        method: 'PUT',
        body: file, 
        headers: {
            'Content-Type': file.type
        }
    });
}

export async function getVideos(){
    const response = await getVideosFunction();
    return response.data as Video[];
}