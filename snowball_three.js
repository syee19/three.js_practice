import * as THREE from "three";

function main() {
  const canvas = document.querySelector("#c");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

  const fov = 75;
  const aspect = 1; // the canvas default
  const near = 0.1;
  const far = 10;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 4.5;

  const scene = new THREE.Scene();

  const geometry = new THREE.SphereGeometry(2.5, 32, 16);
  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.1,
  });
  const snowBall = new THREE.Mesh(geometry, material);
  scene.add(snowBall);

  //* mesh 생성 함수
  function addShape(x, y, z) {
    //star shape (*)
    const shape = new THREE.Shape()
      .moveTo(3, 5)
      .lineTo(3, 21)
      .lineTo(-3, 21)
      .lineTo(-3, 5)
      .lineTo(-17, 13)
      .lineTo(-20, 8)
      .lineTo(-6, 0)
      .lineTo(-20, -8)
      .lineTo(-17, -13)
      .lineTo(-3, -5)
      .lineTo(-3, -21)
      .lineTo(3, -21)
      .lineTo(3, -5)
      .lineTo(17, -13)
      .lineTo(20, -8)
      .lineTo(6, 0)
      .lineTo(20, 8)
      .lineTo(17, 13)
      .lineTo(3, 5); // close path

    //scale 조정
    var s = 0.005;
    let geometry = new THREE.ShapeGeometry(shape);

    let mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({
        color: 0x5b8d80,
        side: THREE.DoubleSide,
      })
    );
    mesh.position.set(x, y, z);
    mesh.scale.set(s, s, s);
    scene.add(mesh);
    return mesh;
  }

  //원점 주변에 일정 간격으로 랜덤하게 * mesh 생성
  var arr = [];
  var velo = [];
  var len = 10;
  const n = 40;
  const seta = (Math.PI * 2) / n;
  var shx, shy, shz;
  for (var i = 0; i < n; i++) {
    len = Math.random() * 0.4 + 0.6;
    shx = len * Math.sin(i * seta);
    shy = len * Math.cos(i * seta);
    shz = Math.sqrt(1 - shx * shx - shy * shy);
    len = Math.random() * 2.3;
    arr.push(addShape(len * shx, len * shy, len * shz));
    //arr.push(addShape(0, 0, 0));
    velo.push(0.005 + Math.random() / 100);
  }

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientWidth;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  let dir = new THREE.Vector3();
  const origin = new THREE.Vector3(0, 0, 0);
  const length = 1;
  const hex = 0xffffff;

  const arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex);
  scene.add(arrowHelper);

  // render 혹은 animate loop를 불러 렌더링하기
  function render(time) {
    time *= 0.001;
    if (resizeRendererToDisplaySize(renderer)) {
      camera.updateProjectionMatrix();
    }
    //* 애니메이션
    for (var i = 0; i < arr.length; i++) {
      //if (arr[i].position.y <= -2.5) arr[i].position.y = 2.5;

      arr[i].position.y -= velo[i];
      if (getDistance(arr[i]) >= 2.3) {
        arr[i].position.y *= -1;
      }
      arr[i].lookAt(camera.position);
    }

    // Yaw, Pitch, Roll 반영
    var alpha = document.getElementById("Orientation_a").innerHTML;
    var betta = document.getElementById("Orientation_b").innerHTML;
    var gamma = document.getElementById("Orientation_g").innerHTML;

    //dir.normalize();
    //vec.z = document.getElementById("Orientation_a").innerHTML;
    console.log(dir);
    //arrowHelper.lookAt(dir);

    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();

function getDistance(point) {
  var x2 = point.position.x * point.position.x;
  var y2 = point.position.y * point.position.y;
  var z2 = point.position.z * point.position.z;
  //dist = Math.cqrt(x2 + y2 + z2);
  var dist = Math.sqrt(x2 + y2 + z2);
  return dist;
}

//Orientation
function handleOrientation(event) {
  updateFieldIfNotNull("Orientation_a", event.alpha);
  updateFieldIfNotNull("Orientation_b", event.beta);
  updateFieldIfNotNull("Orientation_g", event.gamma);
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
  if (
    DeviceMotionEvent &&
    typeof DeviceMotionEvent.requestPermission === "function"
  ) {
    DeviceMotionEvent.requestPermission();
  }

  if (is_running) {
    window.removeEventListener("deviceorientation", handleOrientation);
    demo_button.innerHTML = "Start demo";
    updateFieldIfNotNull("Orientation_a", 0);
    updateFieldIfNotNull("Orientation_b", 0);
    updateFieldIfNotNull("Orientation_g", 0);
    is_running = false;
  } else {
    window.addEventListener("deviceorientation", handleOrientation);
    document.getElementById("start_demo").innerHTML = "Stop demo";
    is_running = true;
  }
};
