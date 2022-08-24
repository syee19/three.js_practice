import * as THREE from "https://threejsfundamentals.org/threejs/resources/threejs/r125/build/three.module.js";
import { GLTFLoader } from "https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/loaders/GLTFLoader.js";

var clock = new THREE.Clock();
var speed = 20; //units a second
var delta = 0;

let basisDir = 1;
var prevdir = [];
for (var i = 0; i < 40; i++) {
  prevdir[i] = new THREE.Vector3(0, -1, 0);
}

let cdist = 1.7; //바닥 깊이
let cang = (0 / 180) * Math.PI;

const planeWidth = 2.9 / 4;
const planeHeight = 5.7 / 4;

function main() {
  const canvas = document.querySelector("#c");
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.sortObjects = false;

  const fov = 30;
  const aspect = 310 / 466;
  const near = 0.1;
  const far = 30;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  var cameraRot = (Math.PI / 2) * 0.9; //0.75
  camera.position.z = 16 * Math.sin(cameraRot);
  camera.position.y = 16 * Math.cos(cameraRot);
  //camera.position.x = 10;
  camera.lookAt(0, 0, 0);
  camera.position.y -= 1;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x717171, 7, 18.5);
  const dirLight = new THREE.DirectionalLight(0xffffff, 3);
  dirLight.position.set(16, 14.2, 4.5);
  dirLight.target.position.set(0, 3, -2);
  scene.add(dirLight);
  scene.add(dirLight.target);
  //scene.background = new THREE.Color(0x171717);

  const pgeo = new THREE.PlaneGeometry(planeWidth, planeHeight);

  const loader = new THREE.TextureLoader();
  var mesh;
  function makeInstance(pgeo, url, xpos, zpos) {
    const texture = loader.load(url, render);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      alphaTest: 0,
      transparent: true,
      fog: false,
    });

    mesh = new THREE.Mesh(pgeo, material);
    scene.add(mesh);
    mesh.position.x = xpos;
    mesh.position.y =
      -cdist + planeHeight / 2 - mesh.position.z * Math.tan(cang);
    mesh.position.z = zpos;
  }

  makeInstance(pgeo, "./sample.png", 0, 0);

  const geometry = new THREE.SphereGeometry(2.5, 32, 16);
  const material = new THREE.MeshPhongMaterial({
    color: 0x4d4e6a,
    transparent: true,
    opacity: 0.05,
    shininess: 40,
    specular: 0xffffff,
  });
  const snowBall = new THREE.Mesh(geometry, material);
  scene.add(snowBall);

  let rad = Math.sqrt(Math.pow(2.5, 2) - Math.pow(Math.cos(cang) * cdist, 2));
  const cgeo = new THREE.CircleGeometry(rad, 32);
  const cmat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const plane = new THREE.Mesh(cgeo, cmat);
  plane.position.y = -cdist * Math.cos(cang);
  plane.position.z = -cdist * Math.sin(cang);
  plane.lookAt(0, 0, 0);
  scene.add(plane);

  // mesh 생성 함수
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
      new THREE.MeshPhongMaterial({
        color: 0x555555, //0x5b8d80,
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
  var n = 50;
  const seta = (Math.PI * 2) / n;
  var len, shx, shy, shz;
  var pm = 1;
  for (var i = 0; i < n; i++) {
    len = Math.random() * 0.4 + 0.6;
    shx = len * Math.sin(i * seta);
    shy = len * Math.cos(i * seta);
    shz = Math.sqrt(1 - shx * shx - shy * shy) * pm;
    len = Math.random() * 2.3;
    arr.push(addShape(len * shx, len * shy, len * shz));
    //arr.push(addShape(0, 0, 0));
    velo.push(0.005 + Math.random() / 300);
    pm *= -1;
  }

  {
    const gltfLoader = new GLTFLoader();
    const url = "./snowglobe.glb";
    gltfLoader.load(url, (gltf) => {
      const root = gltf.scene;
      scene.add(root);
    });
  }

  //중력 방향 arrowHelper
  const dir = new THREE.Vector3(0, -1, 0);
  const origin = new THREE.Vector3(0, 0, 0);
  const length = 2;
  // const hex = 0xffffff;
  // const arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex, 0.4);
  // scene.add(arrowHelper);

  var gx;
  var gy;
  var gz;

  // render 혹은 animate loop를 불러 렌더링하기
  function render() {
    if (resizeRendererToDisplaySize(renderer)) {
      camera.updateProjectionMatrix();
    }
    var w = 2;
    gx = basisDir * document.getElementById("Accelerometer_gx").innerHTML;
    gy = basisDir * document.getElementById("Accelerometer_gy").innerHTML;
    gz = basisDir * document.getElementById("Accelerometer_gz").innerHTML;
    var temp = new THREE.Vector3(gx, gy, gz);
    dir.addScaledVector(temp, w);
    lowpassFilter(dir);

    //dir.set(gx, gy, gz);
    dir.normalize();

    if (dir.length() == 0) {
      dir.set(0, -1, 0);
    }

    //arrowHelper.setDirection(dir);
    //arrowHelper.setLength(dir.length());

    delta = clock.getDelta();
    //* 애니메이션
    for (var i = 0; i < arr.length; i++) {
      //방법 1: 중력방향 기준으로 구 바닥쪽과 닿으면 점대칭이동
      //if (arr[i].position.y <= -2.5) arr[i].position.y = 2.5;
      // arr[i].position.x += velo[i] * dir.x;
      // arr[i].position.y += velo[i] * dir.y;
      // arr[i].position.z += velo[i] * dir.z;
      // if (getDistance(arr[i]) >= 2.3) {
      //   arr[i].position.x *= -1;
      //   arr[i].position.y *= -1;
      //   arr[i].position.z *= -1;
      // }

      //방법 2: 중력방향 기준 아래쪽 반구에서 바닥쪽과 닿으면 이동 방향을 접하는 평면위에 투사해서 미끄러지도록 함 + 속도 조절
      // var temp;
      // if (
      //   getDistance(arr[i]) >= 2.3 &&
      //   dir.angleTo(arr[i].position) < Math.PI / 2
      // ) {
      //   temp = slideDirection(arr[i], dir);
      // } else {
      //   temp = dir;
      // }
      // arr[i].position.x += velo[i] * temp.x;
      // arr[i].position.y += velo[i] * temp.y;
      // arr[i].position.z += velo[i] * temp.z;
      // arr[i].lookAt(camera.position);

      //방법 3: 일단 속도만큼 이동한 후 원점과의 거리가 구 반지름보다 크면 반지름으로 clamp한 위치로 위지를 update
      arr[i].position.x += velo[i] * dir.x * delta * speed;
      arr[i].position.y += velo[i] * dir.y * delta * speed;
      arr[i].position.z += velo[i] * dir.z * delta * speed;
      if (
        arr[i].position.y <
        -cdist + 0.05 - arr[i].position.z * Math.tan(cang)
      ) {
        arr[i].position.y = -cdist + 0.05 - arr[i].position.z * Math.tan(cang);
      }
      if (getDistance(arr[i]) >= 2.3) {
        arr[i].position.multiplyScalar(2.3 / getDistance(arr[i]));
      }
    }

    if (shakeTime != 0) {
      for (var i = 0; i < arr.length; i++) {
        var temp = new THREE.Vector3();
        temp.crossVectors(dir, arr[i].position);
        temp.lerp(temp, -0.8 * Math.sin(getDistance(arr[i]) / 2.3));
        temp.lerp(dir, -0.1 * Math.sin(temp.angleTo(dir) / 2));
        temp.multiplyScalar(20 * velo[i] * delta);
        arr[i].position.addScaledVector(
          temp,
          (speed * (1400 - shakeTime)) / 500
        );
      }
      shakeTime--;
      lowpassFilter(dir);
    }

    moveMesh(mesh);

    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
}

main();

function slideDirection(arr, dir) {
  var pjdir = dir.clone();
  var res = new THREE.Vector3();
  res.subVectors(dir, pjdir.projectOnVector(arr.position));
  res = res.multiplyScalar(
    Math.pow(
      Math.sin(dir.angleTo(arr.position)) * 0.8,
      Math.cos(dir.angleTo(arr.position)) * 8
    )
  );
  return res;
}

function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = width * 1.5; //canvas.clientWidth;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}

//point와 wolrd origin 사이의 거리 반환
function getDistance(point) {
  var x2 = point.position.x * point.position.x;
  var y2 = point.position.y * point.position.y;
  var z2 = point.position.z * point.position.z;
  //dist = Math.cqrt(x2 + y2 + z2);
  var dist = Math.sqrt(x2 + y2 + z2);
  return dist;
}

let debug_button = document.getElementById("debug");
debug_button.onclick = function (e) {
  e.preventDefault();
  shakeTime = 80;
};

function lowpassFilter(dir) {
  prevdir[0].copy(dir);
  for (var i = 1; i < prevdir.length; i++) {
    prevdir[i].addVectors(
      prevdir[i].multiplyScalar(0.9),
      prevdir[i - 1].multiplyScalar(0.1)
    );
  }
  dir.copy(prevdir[prevdir.length - 1]);
}

var temp = null;
var mv = false;

$(document).ready(function () {
  $(".btn").on("click", function (e) {
    temp = e.target.id;
    mv = true;
  });
});

function moveMesh(mesh) {
  var step = 0.4;
  var count = 3;
  if (!mv) return;
  if (temp == "NW" && mesh.position.x + mesh.position.z > -count * step) {
    mesh.position.x -= step;
    mesh.position.z -= step;
  } else if (temp == "NE" && mesh.position.x - mesh.position.z < count * step) {
    mesh.position.x += step;
    mesh.position.z -= step;
  } else if (temp == "SW" && mesh.position.z - mesh.position.x < count * step) {
    mesh.position.x -= step;
    mesh.position.z += step;
  } else if (temp == "SE" && mesh.position.x + mesh.position.z < count * step) {
    mesh.position.x += step;
    mesh.position.z += step;
  }
  mesh.position.y = -cdist + planeHeight / 2 - Math.tan(cang) * mesh.position.z;

  mv = false;
}
