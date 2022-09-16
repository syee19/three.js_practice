import * as THREE from "https://threejsfundamentals.org/threejs/resources/threejs/r125/build/three.module.js";
import { GLTFLoader } from "https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/loaders/GLTFLoader.js";

//애니메이션을 위한 변수
const clock = new THREE.Clock();
const speed = 20; //units a second
let delta = 0;

let basisDir = 1; // 안드로이드, 아이폰 중력 센서 방향 지정
const prevdir = [];
for (let i = 0; i < 40; i++) {
  prevdir[i] = new THREE.Vector3(0, -1, 0);
}

const cdist = 1.7; //바닥 깊이
const cang = (0 / 180) * Math.PI; //바닥 기울기

// 캐릭터 평면
const planeWidth = 2.9 / 4;
const planeHeight = 5.7 / 4;

const canvas = document.querySelector("#c");
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
});
renderer.sortObjects = false;

//카메라, 씬, 조명 설정
const fov = 30;
const aspect = 310 / 466;
const near = 0.1;
const far = 30;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
let cameraRot = (Math.PI / 2) * 0.95; //0.75 //카메라 시점 상하 위치
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

function main() {
  //캐릭터
  let chaArr = [];
  const pgeo = new THREE.PlaneGeometry(planeWidth, planeHeight);
  const loader = new THREE.TextureLoader();

  function createCharacter(pgeo, url, xpos, zpos) {
    const texture = loader.load(url, render);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      alphaTest: 0.1,
      transparent: true,
      fog: false,
    });
    let cha;
    cha = new THREE.Mesh(pgeo, material);
    scene.add(cha);
    cha.position.x = xpos;
    cha.position.y = -cdist + planeHeight / 2 - cha.position.z * Math.tan(cang);
    cha.position.z = zpos;
    chaArr.push(cha);
  }

  createCharacter(pgeo, "./sample.png", 0, 0);

  //스노우볼 구, 바닥, 기둥
  {
    const geometry = new THREE.SphereGeometry(2.5, 32, 16);
    const material = new THREE.MeshPhongMaterial({
      color: 0x4d4e6a,
      transparent: true,
      opacity: 0.05,
      shininess: 40,
      specular: 0xffffff,
    });
    const snowBall = new THREE.Mesh(geometry, material);

    let rad = Math.sqrt(Math.pow(2.5, 2) - Math.pow(Math.cos(cang) * cdist, 2));
    const cgeo = new THREE.CircleGeometry(rad, 32);
    const cmat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const plane = new THREE.Mesh(cgeo, cmat);
    plane.position.y = -cdist * Math.cos(cang);
    plane.position.z = -cdist * Math.sin(cang);
    plane.lookAt(0, 0, 0);

    //스노우볼 이름 텍스처 생성
    let txt = "스노우볼 이름"; //나중에 변수로 받아올 값
    const hWorldAll = 16;
    const hWorldTxt = 2.8;
    const hPxTxt = 60;

    const kPxToWorld = hWorldTxt / hPxTxt;
    const hPxAll = Math.ceil(hWorldAll / kPxToWorld);
    const txtcanvas = document.createElement("canvas");
    const ctx = txtcanvas.getContext("2d");
    ctx.font = "bold " + hPxTxt + "px sans-serif";

    const wPxTxt = ctx.measureText(txt).width * 0.8;
    const wWorldTxt = wPxTxt * kPxToWorld;
    const wWorldAll = wWorldTxt + (hWorldAll - hWorldTxt);
    const wPxAll = Math.ceil(wWorldAll / kPxToWorld);
    txtcanvas.width = wPxAll;
    txtcanvas.height = hPxAll;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, wPxAll, hPxAll);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#000000";
    ctx.font = "bold " + hPxTxt + "px sans-serif";
    ctx.fillText(txt, wPxAll / 2, hPxAll / 2);

    const texture = new THREE.Texture(txtcanvas);
    texture.minFilter = THREE.LinearFilter;
    texture.needsUpdate = true;

    const gltfLoader = new GLTFLoader();
    const url = "./snowglobe.glb";
    gltfLoader.load(url, (gltf) => {
      const model = gltf.scene;
      gltf.scene.traverse(function (object) {
        if (object instanceof THREE.Mesh) {
          const mat = object.material;
          mat.map = texture;
        }
      });
      scene.add(model);
    });
    scene.add(snowBall);
    scene.add(plane);
  }

  // mesh 생성 함수 (shape 대신 이미지로 변경 예정)
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
    var geometry = new THREE.ShapeGeometry(shape);

    var mesh = new THREE.Mesh(
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

  //파티클
  var PartArr = []; //파티클 배열
  var velo = []; //파티클마다 속도 다르도록 조정
  var n = 50; //파티클 개수
  const seta = (Math.PI * 2) / n;
  var len, shx, shy, shz;
  for (var i = 0; i < n; i++) {
    len = Math.random() * 2.3 + 1;
    shx = len * Math.sin(i * seta);
    shz = len * Math.cos(i * seta);
    shy = Math.cos(Math.sqrt(shx * shx + shz * shz)) + 1.4;
    PartArr.push(addShape(shx, shy, shz));
    velo.push(0.005 + Math.random() / 300);
  }

  const dir = new THREE.Vector3(0, -1, 0);

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
    //lowpassFilter(dir);

    dir.normalize();

    if (dir.length() == 0) {
      dir.set(0, -1, 0);
    }

    delta = clock.getDelta();
    //* 애니메이션
    for (var i = 0; i < PartArr.length; i++) {
      //방법 3: 일단 속도만큼 이동한 후 원점과의 거리가 구 반지름보다 크면 반지름으로 clamp한 위치로 위지를 update
      PartArr[i].position.x += velo[i] * dir.x * delta * speed;
      PartArr[i].position.y += velo[i] * dir.y * delta * speed;
      PartArr[i].position.z += velo[i] * dir.z * delta * speed;
      if (
        PartArr[i].position.y <
        -cdist + 0.05 - PartArr[i].position.z * Math.tan(cang)
      ) {
        PartArr[i].position.y =
          -cdist + 0.05 - PartArr[i].position.z * Math.tan(cang);
      }
      if (getDistance(PartArr[i]) >= 2.3) {
        PartArr[i].position.multiplyScalar(2.3 / getDistance(PartArr[i]));
      }
    }

    //흔들었을 때 애니메이션
    if (shakeTime != 0) {
      if (shakeTime === interval)
        for (var i = 0; i < PartArr.length; i++) {
          velo[i] = Math.abs(velo[i]);
        }
      for (var i = 0; i < PartArr.length; i++) {
        var temp = new THREE.Vector3();
        temp.crossVectors(new THREE.Vector3(0, -1, 0), PartArr[i].position);
        temp.lerp(dir, -0.5 * Math.sin(getDistance(PartArr[i]) / 2.3));
        temp.lerp(dir, -0.9 * Math.sin(temp.angleTo(dir) / 2));
        temp.multiplyScalar(2 * velo[i] * delta);
        if (PartArr[i].position.y >= 1 && getDistance(PartArr[i]) >= 2.3) {
          //if (velo[i] > 0) velo[i] *= -1;
          PartArr[i].position.add(new THREE.Vector3());
          PartArr[i].position.multiplyScalar(2.3 / getDistance(PartArr[i]));
        }
        PartArr[i].position.lerp(
          PartArr[i].position.add(
            temp.multiplyScalar((speed * (1400 - shakeTime)) / 300)
          ),
          0.2
        );
      }
      shakeTime--;
      //lowpassFilter(dir);
    } else {
      for (var i = 0; i < PartArr.length; i++) {
        velo[i] = Math.abs(velo[i]);
      }
    }

    moveMesh(chaArr[0]);

    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
}

main();

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
  shakeTime = interval;
};

let camera_button = document.getElementById("camera");
camera_button.onclick = function (e) {
  e.preventDefault();
  if (cameraRot == (Math.PI / 2) * 0.95) {
    cameraRot = (Math.PI / 2) * 0.75;
  } else {
    cameraRot = (Math.PI / 2) * 0.95;
  }
  camera.position.z = 16 * Math.sin(cameraRot);
  camera.position.y = 16 * Math.cos(cameraRot);
  //camera.position.x = 10;
  camera.lookAt(0, 0, 0);
  camera.position.y -= 1;
  camera.updateProjectionMatrix();
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
  var step = 0.55; //0.4
  var count = 2;
  if (!mv) return;
  if (temp == "NW" && mesh.position.z > -count * step) {
    mesh.position.z -= step;
  } else if (temp == "NE" && mesh.position.z < count * step) {
    mesh.position.z += step;
  } else if (temp == "SW" && mesh.position.x > -count * step) {
    mesh.position.x -= step;
  } else if (temp == "SE" && mesh.position.x < count * step) {
    mesh.position.x += step;
  }
  mesh.position.y = -cdist + planeHeight / 2 - Math.tan(cang) * mesh.position.z;

  mv = false;
}
