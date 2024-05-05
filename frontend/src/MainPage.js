import React, { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PsychologyAltRoundedIcon from "@mui/icons-material/PsychologyAltRounded";
import * as tf from "@tensorflow/tfjs";

const MainPage = () => {
  const [imagePath, setImagePath] = useState(null);
  const [model, setModel] = useState(null);
  const [tensor, setTensor] = useState(null);
  const [prediction, setPrediction] = useState(null);

  const classes = ['Glioma', 'Meningioma', 'No Tumor', 'Pituitary'];

    useEffect(() => {
      const loadModel = async () => {
        try {
          const model = await tf.loadLayersModel('https://tumor-detection-model-api.vercel.app/model.json');
          setModel(model);
          console.log('Model Loaded');
        } catch (error) {
          console.error('Model loading failed:', error);
        }
      };
      
      loadModel();
  }, []); 
    

  const VisuallyHiddenInput = styled("input")({
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1,
  });

  

  const preprocessImage = (image) => {
    // Resize the image to height: 168, width: 150, and convert to grayscale
    const resizedImage = tf.image
      .resizeBilinear(image, [168, 150])
      .mean(2)
      .expandDims(2);
    // Scale the image by dividing by 255
    const scaledImage = resizedImage.div(255);
    // Add a batch dimension
    return scaledImage.expandDims(0);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePath(event.target.result);
        
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const tensor = tf.browser.fromPixels(img);
          setTensor(tensor);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const makePrediction = async () => {
    if (!tensor) {
      console.log("Tensor is not available.");
      return;
    }
    if (!model) {
      console.log("Model is not loaded.");
      return;
    }
  
    try {
      const preprocessedImage = preprocessImage(tensor);
      const prediction = model.predict(preprocessedImage);
      console.log('Prediction:', prediction);
      const predictedClass = tf.argMax(prediction, 1).dataSync()[0];
      console.log('Predicted class:', predictedClass);
      setPrediction(classes[predictedClass]);
    } catch (error) {
      console.error('Error in making prediction:', error);
    }
  };

  return (
    <div>
      <Container>
        <Stack direction="column" sx={{ alignItems: "center" ,paddingTop:"40px"}} spacing={4}>
          <Typography
            variant="h3"
            sx={{ fontFamily: "PT serif", color: "#25374f" }}
          >
            Brain Tumour Detection Model
          </Typography>
          <Paper elevation={3}>
            <Card
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    padding: "20px",
                    height: "350px",
                    width: "350px"
                }}
            >
              {imagePath ? <img
                src={imagePath}
                style={{
                  width: "350px",
                  height: "350px",
                  objectFit: "contain",
                  backgroundPosition: "center",
                  padding: "5px 5px 2px 5px",
                  borderRadius: 4,
                }}
                alt="Viewer"
              /> : <Typography variant="h5" sx={{ fontFamily: "PT serif", color: "#25374f" }}>No Image Uploaded</Typography>}
            </Card>
          </Paper>
          <Stack
            direction="row"
            sx={{ justifyContent: "space-evenly", width: "70%" }}
          >
            <Button
              component="label"
              role={undefined}
              variant="outlined"
              tabIndex={-1}
              startIcon={<CloudUploadIcon />}
              sx={{ color: "#25374f", borderColor: "#25374f" }}
            >
              Upload File
              <VisuallyHiddenInput type="file" onChange={handleFileUpload} />
            </Button>
            <Button
              variant="outlined"
              disabled={!imagePath || !model}
              onClick={makePrediction}
              startIcon={<PsychologyAltRoundedIcon />}
              sx={{ color: "#25374f", borderColor: "#25374f" }}
            >
              Prediction
            </Button>
          </Stack>
          <Typography
            variant="h4"
            sx={{ fontFamily: "PT serif", color: "#25374f" }}
          >
            {prediction && `${prediction}`}
          </Typography>
        </Stack>
      </Container>
    </div>
  );
};

export default MainPage;
