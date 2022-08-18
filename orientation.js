//Orientation
function handleMotion(event) {
  updateFieldIfNotNull(
    "Accelerometer_gx",
    event.accelerationIncludingGravity.x - event.acceleration.x
  );
  updateFieldIfNotNull(
    "Accelerometer_gy",
    event.accelerationIncludingGravity.y - event.acceleration.y
  );
  updateFieldIfNotNull(
    "Accelerometer_gz",
    event.accelerationIncludingGravity.z - event.acceleration.z
  );
}

function updateFieldIfNotNull(fieldName, value, precision = 1) {
  if (value != null)
    document.getElementById(fieldName).innerHTML = value.toFixed(precision);
}

let is_running = false;

let demo_button = document.getElementById("start_demo");
demo_button.onclick = function (e) {
  e.preventDefault();
  // Request permission for iOS 13+ devices
  if (typeof DeviceMotionEvent.requestPermission === "function") {
    DeviceMotionEvent.requestPermission()
      .then((state) => {
        if (state === "granted") {
          //window.alert("granted!");
          basisDir = 1;
        } else {
          //window.alert("denied!");
        }
      })
      .catch(console.error);
  } else {
    basisDir = -1;
    // Handle regular non iOS 13+ devices.
  }

  if (is_running) {
    window.removeEventListener("devicemotion", handleMotion);
    demo_button.innerHTML = "Start";
    updateFieldIfNotNull("Accelerometer_gx", 0.0);
    updateFieldIfNotNull("Accelerometer_gy", 0.0);
    updateFieldIfNotNull("Accelerometer_gz", 0.0);
    is_running = false;
  } else {
    window.addEventListener("devicemotion", handleMotion);
    demo_button.innerHTML = "Stop";
    is_running = true;
  }
};
