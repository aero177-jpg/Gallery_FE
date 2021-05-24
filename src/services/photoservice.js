const API_URL = "http://localhost:3000";

export function getPhotosByUserID(userID) {
  return fetch(`${API_URL}/getphotos/${userID}`).then((res) => res.json());
  // .then((res) => {
  //   return res.map((photo) => photo.photoID);
  // });
}

export async function addPhotos(userID, photoIdArray) {
  console.log(photoIdArray);
  return fetch(`${API_URL}/addphotos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userID, photoIdArray }),
  });
}
