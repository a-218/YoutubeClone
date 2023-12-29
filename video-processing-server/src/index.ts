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


   const inputFileName = data.name;
   const outputFileName = `processed-${inputFileName}`;

   // Download the raw video  from cloud storage

   await downloadRawVideo(inputFileName);

   try{ 
       await convertVideo(inputFileName, outputFileName);
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
   await uploadProcessedVideo(inputFileName);

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