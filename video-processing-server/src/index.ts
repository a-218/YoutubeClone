import express from "express";
import ffmpeg from "fluent-ffmpeg";
import { 
    convertVideo, 
    deleteProcessVideo, 
    deleteRawVideo, 
    downloadRawVideo, 
    setUpDirectories, 
    uploadProcessedVideo } from "./storage";
import { upload } from "@google-cloud/storage/build/cjs/src/resumable-upload";
import { OutgoingMessage } from "http";
import { isVideoNew, setVideo } from "./firestore";

setUpDirectories();

const app = express();
app.use(express.json());


app.post("/process-video", async (req, res)=>{
    /// get teh bucket and file name fom the cloud pub / sub message
   let data; 
   try{ 
    const message = Buffer.from(req.body.message.data, 'base64').toString('utf8');
    data = JSON.parse(message);
    if(!data.name){
        throw new Error('Invalid message payload received');
    }
   }catch(error){
    console.error(error);
    return res.status(400).send('Bad request : mssing filename');
   }


   const inputFileName = data.name; //Formate of <UId> - <Date>.<Extension>
   const outputFileName = `processed-${inputFileName}`;
   const videoId = inputFileName.split('.')[0];

    if(!isVideoNew(videoId)){
        return res.status(400).send('Bad request : video already processing or processed')
    }else{
        await setVideo(videoId, {
            id: videoId, 
            uid: videoId.split('-')[0],
            status: 'processing'
        } );
    }

   // Download the raw video  from cloud storage
   console.log("starting to download");
   await downloadRawVideo(inputFileName);

   try{ 
    console.log("starting to convert");
       await convertVideo(inputFileName, outputFileName);
       console.log(`after to convert ${outputFileName}`);
    } catch (err){
        await Promise.all
        ([
            deleteRawVideo(inputFileName),
            deleteProcessVideo(outputFileName)
        ]);

            console.error(err);
    return res.status(500).send('Internaal server error:, video processing failed')

   }
   //Uplaod the processed video to cloud 
   console.log("starting to upload process video");
   await uploadProcessedVideo(outputFileName);

   await setVideo(videoId, {
        status: 'processed',
        filename: outputFileName
    })

  await Promise.all([
    deleteRawVideo(inputFileName),
    deleteProcessVideo(outputFileName)]);

    return res.status(200).send('Processing finishing success 200000');
});

// if not defined for process env, it defines to 3000;
const port = process.env.PORT || 3000;

app.listen(port, ()=>{
    console.log(`video processing listening on port ${port}`);
})