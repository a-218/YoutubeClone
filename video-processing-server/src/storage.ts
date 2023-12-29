// google cloud storage interaction

import { Storage } from "@google-cloud/storage";
import fs from 'fs';
import ffmpeg from "fluent-ffmpeg";

const storage = new Storage();

const rawVideoBucket = "ali-raw-videos";
const processedVideoBucket = "ali-processed-video";

const localRawPath = "./raw-videos";
const localProcessPath = "./processed-videos";

export function setUpDirectories(){
    ensureDirectoryExistence(localRawPath);
    ensureDirectoryExistence(localProcessPath);
}

function ensureDirectoryExistence(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true }); // recursive: true enables creating nested directories
      console.log(`Directory created at ${dirPath}  1111`);
    }else{
        console.log('director already exist');
    }


}

export function convertVideo(rawVideoName:string, processVideoName:string){
   return new Promise<void>((resolve, reject)=>{
    ffmpeg(`${localRawPath}/${rawVideoName}`)
    .outputOption("-vf", "scale=-1:360")
    .on("end", ()=>{
        console.log("11111processing finished successfully");
        resolve();
    })
    .on("err", (err)=>{
        console.log(`11111an error occurred :${err.message}`);
        console.log(JSON.stringify(err));
        reject(err);
    })
    .save(`${localProcessPath}/${processVideoName}`);
   })
}

export async function downloadRawVideo(fileName: string){
   await storage.bucket(rawVideoBucket)
    .file(fileName)
    .download({destination: `${localRawPath}/${fileName}`});

    console.log(
        `gs://${rawVideoBucket}/${fileName} downloaded to ${localRawPath}/${fileName}`)
    
}

export async function uploadProcessedVideo(fileName: string){
    console.log(`INisde the process video bucket ${fileName}`);
    const bucket = storage.bucket(processedVideoBucket);

    // Upload video to the bucket

    const filePath = `${localProcessPath}/${fileName}`;
        if (!fs.existsSync(filePath)) {
        console.error(`File not found at ${filePath}`);
        // Handle this error condition appropriately, perhaps by throwing an error
        throw new Error(`File not found at ${filePath}`);
        }
    await storage.bucket(processedVideoBucket)
      .upload(`${localProcessPath}/${fileName}`, {
        destination: fileName,
      });

    console.log(
      `${localProcessPath}/${fileName} uploaded to gs://${processedVideoBucket}/${fileName}.`
    );
  
    // Set the video to be publicly readable
    await bucket.file(fileName).makePublic();
}

export function deleteRawVideo(fileName:string){
    return deleteFile(`${localRawPath}/${fileName}`);
}

export function deleteProcessVideo(fileName:string){
    return deleteFile(`${localProcessPath}/${fileName}`);
}

function deleteFile(filePath:string):Promise<void>{
    return new Promise((resolve, reject)=>{
        if(fs.existsSync(filePath)){
            fs.unlink(filePath, (err)=>{
                if(err){
                    console.log(`xxxxxxFailed to delete ${filePath}`);
                    console.log(JSON.stringify(err));
                    reject(err);
                }else{
                    console.log(`File deleted at ${filePath}`);
                    resolve();
                    
                }
            })
        }else{
            console.log(`File not found at ${filePath}, skipping delete.`);
            resolve();
        }
    });
}

