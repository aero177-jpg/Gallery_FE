import "./App.css";
import { useState, useCallback, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Image } from "cloudinary-react";
import {
  getPhotosByUserID,
  addPhotos,
  deletePhotos,
} from "./services/photoservice";
import {
  getAlbumsByUserID,
  sendToAlbums,
  createAlbum,
  deleteBudget,
} from "./services/albumservice";

import { useMediaQuery } from "react-responsive";
import {
  useWindowSize,
  useWindowWidth,
  useWindowHeight,
} from "@react-hook/window-size/throttled";
import Carousel from "react-gallery-carousel";
import "react-gallery-carousel/dist/index.css";
import Modal from "styled-react-modal";
import styled from "styled-components";
import { ModalProvider } from "styled-react-modal";
import { slide as Menu } from "react-burger-menu";
var burgerstyles = {
  bmBurgerButton: {
    position: "fixed",
    // display: "block",
    width: "36px",
    height: "30px",
    left: "36px",
    top: "36px",
  },
  bmBurgerBars: {
    background: "white",
  },
  bmBurgerBarsHover: {
    background: "#a90000",
  },
  bmCrossButton: {
    height: "24px",
    width: "24px",
  },
  bmCross: {
    background: "#bdc3c7",
    height: "24px",
    // width: "24px",
  },
  bmMenuWrap: {
    // position: "fixed",
    height: "100%",
  },
  bmMenu: {
    zIndex: "9999",
    background: "#373a47",
    padding: "2.5em 1.5em 0",
    fontSize: "1.15em",
    overflowY: "hidden",
  },
  bmMorphShape: {
    fill: "#373a47",
  },
  bmItemList: {
    color: "#b8b7ad",
    padding: "0.8em",
  },
  bmItem: {
    display: "inline-block",
  },
  bmOverlay: {
    background: "rgba(0, 0, 0, 0.3)",
  },
};

function App() {
  const [UploadOpen, setUploadOpen] = useState(false);
  const onlyWidth = useWindowWidth();
  const [isOpen, setIsOpen] = useState(false);
  const [hasFinished, setFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [error, setError] = useState("");
  const [photoIdArray, setPhotoIdArray] = useState([]);
  const [albumIdArray, setAlbumIdArray] = useState([]);
  const [editMode, setEditMode] = useState(false);
  // const [editArray, setEditArray] = useState([]);
  const [ratioArray, setRatioArray] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const editArray = useRef([]);
  const EditToggle = () => {
    return (
      <button className={"button2"} onClick={() => toggleEditMode()}>
        click
      </button>
    );
  };

  useEffect(() => {
    populatePhotos();
    populateAlbums();
  }, []);
  useEffect(() => {
    console.log(editArray);
  }, [editArray]);

  function toggleModal(e) {
    setIsOpen(!isOpen);
  }

  function toggleEditMode(e) {
    setEditMode(!editMode);
  }
  function toggleUpload(e) {
    setUploadOpen(!UploadOpen);
  }

  const Checkbox = (props) => {
    const { box, index, file } = props;
    const [isChecked, setIsChecked] = useState(false);
    function indexof(arr, val) {
      var i;
      while ((i = arr.indexOf(val)) != -1) {
        arr.splice(i, 1);
      }
    }
    const handleOnChange = () => {
      setIsChecked(!isChecked);
      if (!editArray.current.includes(file.photoID)) {
        editArray.current.push(file.photoID);
      } else indexof(editArray.current, file.photoID);
      console.log(editArray);
    };
    return (
      <div
        style={{
          position: "absolute",
          top: `${box?.top}px`,
          left: `${box?.left}px`,
          width: `${box?.width}px`,
          height: `${box?.height}px`,
        }}
      >
        {editMode && (
          <label
            style={{
              position: "absolute",
              padding: `5px ${box?.width - 5}px  ${box?.height - 5}px 5px`,
            }}
          >
            <input
              type="checkbox"
              checked={isChecked}
              style={{
                position: "absolute",
                top: `5px`,
                right: `5px`,
                width: `40px`,
                height: `40px`,
              }}
              onChange={() => handleOnChange()}
            />
          </label>
        )}
        <img
          src={`${process.env.REACT_APP_CLOUDINARY_URL}${file.photoID}`}
          onClick={() => handlePhotoClick(index)}
          style={{
            width: `${box?.width}px`,
            height: `${box?.height}px`,
          }}
          //w_600,c_scale/
        />
      </div>
    );
  };
  const DeleteThings = () => {
    const handleClick = () => {
      if (editArray.current.length !== 0) {
        // deletePhotos(editArray.current);
        toggleEditMode();
        setFinished(false);
        console.log(editArray.current);
        // console.log(!editArray.current.includes("kkfvnnymfmu41_c3vl2x_etxdju"));
        var filteredArray = photoIdArray.filter(
          (item) => !editArray.current.includes(item.photoID)
        );

        setPhotoIdArray([...filteredArray]);
        editArray.current = [];
        setFinished(true);
        // console.log(filteredArray);
      } else console.log("nothing to send");
    };

    return (
      <button className={"button3"} onClick={() => handleClick()}>
        Delete
      </button>
    );
  };
  const AddtoAlbums = () => {
    function handleClick() {
      if (editArray.current.length !== 0 && albumIdArray.current.length !== 0) {
        sendToAlbums(
          editArray.current,
          albumIdArray.map((key) => key.albumid)
        );
        editArray.current = [];
      } else console.log("nothing to send");
    }
    return (
      <button className={"button4"} onClick={() => handleClick()}>
        Add to Album
      </button>
    );
  };

  const StyledModal = Modal.styled`
  width: 90vw;
  height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  // place-items: center;
  background-color: white;
  // border-radius: 40px;
  // padding:10px;
`;
  const StyledModal2 = Modal.styled`
width: 70vw;
height: 70vh;
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
// place-items: center;
// background-color: white;
// border-radius: 40px;
// padding:10px;
`;
  async function populatePhotos() {
    try {
      setLoading({ loading: true });
      const userID = 145;
      const photoArr = await getPhotosByUserID(userID);
      // console.log(photoArr);
      setLoading({ loading: false });
      setPhotoIdArray([...photoArr]);
      let newArr = photoArr.map((thing) => thing.ratio);
      setRatioArray([...newArr]);
      setFinished({ hasFinished: true });
    } catch (error) {
      await setError({ error });
      console.log(error);
    }
  }
  async function populateAlbums() {
    try {
      setLoading({ loading: true });
      const userID = 145;
      const albumObjArr = await getAlbumsByUserID(userID);
      // console.log(photoArr);
      setLoading({ loading: false });
      setAlbumIdArray([...albumObjArr]);
    } catch (error) {
      await setError({ error });
      console.log(error);
    }
  }
  const RenderAlbumList = () => {
    let albums = albumIdArray.map((album, index) => {
      // console.log(album.albumName);
      return (
        <div className={"button2"}>
          <div>{album.albumName}</div>
        </div>
      );
    });
    return albums;
  };

  const Example3 = (props) => {
    // toggleModal();
    const images = photoIdArray.map((file) => ({
      src: `${process.env.REACT_APP_CLOUDINARY_URL}${file.photoID}`,
    }));

    return (
      <Carousel
        minIcon={false}
        onSwipeEndDown={() => toggleModal()}
        shouldMinimizeOnSwipeDown={false}
        hasRightButtonAtMax={false}
        hasLeftButtonAtMax={false}
        canAutoPlay={false}
        isMaximized={true}
        objectFit={"contain"}
        // objectFitAtMax={"fill"}
        images={images}
        index={props.index}
        style={{
          display: "grid",
          placeItems: "center",
        }}
      />
    );
  };
  function handlePhotoClick(index) {
    setCurrentIndex(index);
    toggleModal();
  }

  const RenderPhotos = () => {
    let arr = photoIdArray.map((num) => parseFloat(num.ratio));
    let x = onlyWidth;
    let geometry = require("justified-layout")(arr, {
      targetRowHeight:
        x >= 1000 ? x / 4 : x >= 900 ? x / 3 : x >= 300 ? x / 2 : x / 1,
      containerWidth: x,
    });
    let box = {};
    // console.log(geometry.containerHeight);
    //1060
    let images = photoIdArray.map((file, index) => {
      box = geometry.boxes[index];

      return <Checkbox box={box} file={file} index={index} />;
    });
    return (
      <div
        style={{
          position: "relative",
          // backgroundColor: "red",
          height: `${geometry.containerHeight}px`,
          width: `${x}`,
        }}
      >
        {images}
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
        await addPhotos(userID, uploadedPhotoIdArray);
        populatePhotos();
      }
    });
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accepts: "image/*",
    multiple: true,
  });
  return (
    <div>
      <header
        style={{
          backgroundColor: "black",
          margin: "0px",
          height: "100px",
          width: "100%",
          display: "flex",
          // zIndex: "99",
          // position: "fixed",
          opacity: "0.9",
          color: "white",
        }}
      >
        {/* <Menu styles={burgerstyles}>
          <RenderAlbumList />
        </Menu> */}
        <h2 style={{ margin: "30px 30px 30px 90px", fontSize: "30px" }}>
          {"All Photos"}
        </h2>

        <button className={"button2"} onClick={toggleUpload}>
          +
        </button>
        <EditToggle />
        {editMode && <DeleteThings />}
        {editMode && <AddtoAlbums />}
      </header>
      <ModalProvider>
        <div>{hasFinished && <RenderPhotos style={{ zIndex: "1" }} />}</div>
        <StyledModal
          isOpen={isOpen}
          onBackgroundClick={toggleModal}
          onEscapeKeydown={toggleModal}
        >
          <Example3 index={currentIndex} />
        </StyledModal>
        {/* <StyledModal2
          isOpen={UploadOpen}
          onBackgroundClick={toggleModal2}
          onEscapeKeydown={toggleModal2}
        > */}
        {UploadOpen && (
          <div>
            <div
              {...getRootProps()}
              className={`dropzone ${isDragActive ? "active" : ""}`}
            >
              <h2>Drop photos here :)</h2>
            </div>
            <input {...getInputProps()} />
          </div>
        )}
        {/* </StyledModal2> */}
      </ModalProvider>
    </div>
  );
}

export default App;
