// 1. Google cloud storage file interaction 
// 2 local file interaction

import { Storage } from "@google-cloud/storage";
import fs from 'fs';
import ffmpeg from "fluent-ffmpeg";
import { resolve } from "path";
import { rejects } from "assert";
import { json } from "stream/consumers";
import { dir } from "console";

const storage = new Storage();

const rawVideoBucket = "ali-raw-videos";
const processedVideoBucket = "ali-processed-video";


const localRawPath = "./raw-videos";
const localProcessPath = "./process-videos";
/**
 * Creats Local directories for raw and processed videos
*/
export function setUpDirectories(){
 ensureDirectoryExists(localRawPath);
 ensureDirectoryExists(localProcessPath);
}

/**
 * @param rawVideoName the name of the file to convert fom {@link localRawVideoPath}
 *  @param processedVideoName - The name of the file to conver to {@link localProcessedVideoPath}
 *  @returns A promise that resolves whhen the video has been converted
 */
export function convertVideo(rawVideoName: string, processedVideoName:string){
   return new Promise<void>((resolve, reject) =>{
    ffmpeg(`${localRawPath}/${rawVideoName}`)
    .outputOptions("-vf", "scalre=-1:360")
    .on("end", ()=>{
        console.log("processing finsihed successfully");
        resolve();
    })
    .on("error", (err)=>{
        console.log(`an error occure ${err.message}`);
        reject(err);
    })
    .save(`${localProcessPath}/${[processedVideoName]}`);
    });
}


/**
 * 
 * @param fileName  the name of the file downlaod fom the 
 * {@link rawVideoBucket} bucket into the {@link localRawVideoPath} folder
 * @returns a promise that resolves when the file has been downloaded
 */
export async function downloadVideo(fileName: string){
    await storage.bucket(rawVideoBucket)
    .file(fileName)
    .download({destination:`${localRawPath}/${fileName}`});

    console.log(`gs://${rawVideoBucket}/${fileName} downloaded to ${localRawPath}/${fileName}.`);


}

/**
 * 
 * @param fileName The name of the file to upload from the {@link localProcessedVideoPath} 
 * folder into the {@link processedVideoBucket}.
* @returns a promise that resolves when the file has been uploaded
 */
export async function uploadProcessVideo(fileName: string){
    const bucket = storage.bucket(processedVideoBucket);

    await bucket.upload(`${localProcessPath}/${fileName}`, {
        destination:fileName
    });

    console.log(`${localProcessPath}/${fileName} uploaded to gs://${processedVideoBucket}/${fileName}.`);
        //by default not public
    await bucket.file(fileName).makePublic();
}
   

function deleteFile(filePath: string): Promise<void>{
    return new Promise((resolve, reject)=>{
        if(fs.existsSync(filePath)){
            fs.unlink(filePath, (err)=>{
                if(err){
                    console.log(`Failed to delete path 4 ${filePath}`, err);
                    console.log(JSON.stringify(err));
                    reject(err);
                }else{
                  
                    console.log(`file delete at ${filePath}`);
                    resolve();
                }
            })
        }else{
            console.log(`File not found at ${filePath}, skipping the delete`);
            resolve();
        }
    })
}

/**
 * 
 * @param fileName  the name of the file to deleete from the {@link localRawVideoPath} folder
 * @returns A promise that resolves when the file has been deleted
 */
export function deleteRawVideo(fileName: string){
    return deleteFile(`${localRawPath}/${fileName}`);
}

/**
 * 
 * @param fileName the name of teh file to deleete from teh {@link localProcessedVideoPath} folder
 * @returns A promise that resolves when the file has been deleted 
 */
export function deleteProcessVideo(fileName: string){
    return deleteFile( `${localProcessPath}/${fileName}`);
}


function ensureDirectoryExists(dirPath: string){
    if(!fs.existsSync(dirPath)){
        fs.mkdirSync(dirPath, {recursive:true});
        // recursive trye eables creating nested directories
        console.log(`Directory create at ${dirPath}`);
    }
}