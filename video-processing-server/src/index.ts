import express from "express";
import ffmpeg from "fluent-ffmpeg";



const app = express();
app.use(express.json());


app.get("/", (req, res)=>{
    res.send('hellow world"');
})


app.post("/process-video", (req, res)=>{
    //get path of the input video that we want to convert in request video

    const inputVideoPath = req.body.inputVideoPath;
    const outputVideoPath = req.body.outputVideoPath;


    //Error Handling

    if(!inputVideoPath || !outputVideoPath){
        res.status(400).send("Bad request: missing file path");
    }
    
    ffmpeg(inputVideoPath)
    .outputOption("-vf", "scale = -1:360")  // convert to 360p
    .on("end", ()=>{

        res.status(200).send("video processing started");
    })
    .on("error", (err)=> {
        console.log(`An error occureed: ${err.message}`); 
        res.status(500).send(`Internal Server Error: ${err.message}`);
    })
    .save(outputVideoPath);
})

// if not defined for process env, it defines to 3000;
const port = process.env.PORT || 3000;

app.listen(port, ()=>{
    console.log(`video processing listening on port ${port}`);
})