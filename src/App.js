import "./App.css";
import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Image } from "cloudinary-react";
import { getPhotosByUserID, addPhotos } from "./services/photoservice";
import { useMediaQuery } from "react-responsive";
import {
  useWindowSize,
  useWindowWidth,
  useWindowHeight,
} from "@react-hook/window-size/throttled";

const Example = () => {
  const onlyWidth = useWindowWidth();

  const isDesktopOrLaptop = useMediaQuery({
    query: "(min-device-width: 1224px)",
  });
  const isBigScreen = useMediaQuery({ query: "(min-device-width: 1824px)" });
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1224px)" });
  const isTabletOrMobileDevice = useMediaQuery({
    query: "(max-device-width: 1224px)",
  });
  const isPortrait = useMediaQuery({ query: "(orientation: portrait)" });
  const isRetina = useMediaQuery({ query: "(min-resolution: 2dppx)" });

  return (
    <div>
      <h1>Device Test!</h1>
      {isDesktopOrLaptop && (
        <>
          <p>You are a desktop or laptop</p>
          {isBigScreen && <p>You also have a huge screen</p>}
          {isTabletOrMobile && (
            <p>You are sized like a tablet or mobile phone though</p>
          )}
        </>
      )}
      {isTabletOrMobileDevice && <p>You are a tablet or mobile phone</p>}
      <p>Your are in {isPortrait ? "portrait" : "landscape"} orientation</p>
      {isRetina && <p>You are retina</p>}
      <h2>{onlyWidth}</h2>
    </div>
  );
};

function App() {
  const onlyWidth = useWindowWidth();

  const [hasFinished, setFinished] = useState(false);

  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [error, setError] = useState("");
  const [photoIdArray, setPhotoIdArray] = useState([]);
  const [ratioArray, setRatioArray] = useState([]);

  useEffect(() => {
    populatePhotos();
  }, []);

  async function populatePhotos() {
    try {
      setLoading({ loading: true });
      const userID = 145;
      console.log("trying something...");
      const photoArr = await getPhotosByUserID(userID);
      console.log("cool it worked");
      console.log(photoArr);
      setLoading({ loading: false });
      setPhotoIdArray((old) => [...old, ...photoArr]);
      let newArr = photoArr.map((thing) => thing.ratio);
      setRatioArray((old) => [...old, ...newArr]);
      setFinished({ hasFinished: true });
      // setTimeout(() => {
      //   console.log(photoIdArray);
      // }, 2000);

      // console.log(photoIdArray);
    } catch (error) {
      await setError({ error });
      console.log(error);
    }
  }
  function RenderLIES() {
    let arr = [0.5, 1.5, 1, 1.8, 0.4, 0.7, 0.9, 1.1, 1.7, 2, 2.1];
    var layoutGeometry = require("justified-layout")(arr);
    console.log(layoutGeometry.boxes[0].width);

    return (
      <div
        style={{
          position: "relative",
          backgroundColor: "grey",
          height: `${layoutGeometry.containerHeight}px`,
          width: "1060px",
        }}
      >
        {arr.map((i, index) => {
          // console.log(index);

          // box = geometry.boxes[index];
          // console.log(box?.width);
          // console.log(box?.height);

          return (
            <div
              style={{
                position: "absolute",
                backgroundColor: "red",
                height: `${layoutGeometry.boxes[index].height}px`,
                width: `${layoutGeometry.boxes[index].width}px`,
                top: `${layoutGeometry.boxes[index].top}px`,
                left: `${layoutGeometry.boxes[index].left}px`,
              }}
            />
          );
        })}
      </div>
    );
  }

  const RenderPhotos = () => {
    // let arr = [0.66, 1.05, 0.66, 1.05, 2.24, 1.73, 0.66, 1.07];
    let arr = ratioArray.map((num) => parseFloat(num));
    console.log(ratioArray);
    let x = onlyWidth;
    let geometry = require("justified-layout")(arr, {
      targetRowHeight:
        x >= 1000 ? x / 4 : x >= 900 ? x / 3 : x >= 300 ? x / 2 : x / 1,
      containerWidth: x,
    });
    let box = {};
    let num = 340;
    // console.log(geometry.containerHeight);
    //1060
    return (
      <div
        style={{
          position: "relative",
          backgroundColor: "red",
          height: `${geometry.containerHeight}px`,
          width: `${x}`,
        }}
      >
        {photoIdArray.map((file, index) => {
          // console.log(index);

          box = geometry.boxes[index];

          return (
            <img
              src={`${process.env.REACT_APP_CLOUDINARY_URL}w_400,c_scale/${file.photoID}`}
              // cloudName={process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}
              // publicId={file.photoID}
              // height="400"
              // crop="scale"
              style={{
                position: "absolute",
                top: `${box?.top}px`,
                left: `${box?.left}px`,
                width: `${box?.width}px`,
                height: `${box?.height}px`,
              }}
            />
          );
        })}
      </div>
    );

    // uploadedFiles.map((file) => (
    //   <Image
    //     cloudName={process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}
    //     publicId={file.public_id}
    //     width="300"
    //     crop="scale"
    //   />
    // ));
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    const url = `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/upload`;
    let uploadedPhotoIdArray = [];
    let ratioArray = [];
    let userID = 145;
    await acceptedFiles.forEach(async (acceptedFile, index) => {
      const Formdata = new FormData();
      Formdata.append("file", acceptedFile);
      Formdata.append(
        "upload_preset",
        process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET
      );
      const response = await fetch(url, {
        method: "post",
        body: Formdata,
      });
      const data = await response.json();
      console.log(data);
      let ratio = Math.round((data.width / data.height) * 100) / 100;
      // console.log(index, data.public_id);
      // const photoID = data.public_id;
      uploadedPhotoIdArray.push({ id: data.public_id, ratio });
      setUploadedFiles((old) => [...old, data]);
      if (uploadedPhotoIdArray.length === acceptedFiles.length) {
        console.log(uploadedPhotoIdArray);
        addPhotos(userID, uploadedPhotoIdArray);
      }
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accepts: "image/*",
    multiple: true,
  });
  return (
    <div className="App">
      {hasFinished && <RenderPhotos />}
      {/* <RenderLIES /> */}
      {/* <Example /> */}
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? "active" : ""}`}
      />
      <input {...getInputProps()} />
    </div>
  );
}

export default App;
