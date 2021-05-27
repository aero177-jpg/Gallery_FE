const API_URL = "http://localhost:3000";

export function getAlbumsByUserID(userID) {
  return fetch(`${API_URL}/getalbums/${userID}`).then((res) => res.json());
  // .then((res) => console.log(res));
}

export function sendToAlbums(photoIdArray, addToAlbumIdArray) {
  console.log(photoIdArray);
  console.log(addToAlbumIdArray);

  return fetch(`${API_URL}/addtoalbums`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ photoIdArray, addToAlbumIdArray }),
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        throw new Error("didn't work :(");
      }
    })
    .then((obj) => obj.newAlbum);
}

export function createAlbum(title, userID) {
  return fetch(`${API_URL}/albums`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, userID }),
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        throw new Error("didn't work :(");
      }
    })
    .then((obj) => obj.newAlbum);
}

export function deleteBudget(id) {
  console.log("test");
  // return fetch(`${API_URL}/budsjett/${id}`, {
  //   method: "DELETE",
  // }).then((res) => res.json());
}

export function updateBudget(tittel, ID) {
  return fetch(`${API_URL}/budsjett/${ID}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tittel, ID }),
  }).then((res) => res.json());
}
