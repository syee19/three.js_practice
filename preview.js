import * as THREE from "https://threejsfundamentals.org/threejs/resources/threejs/r125/build/three.module.js";

//애니메이션을 위한 변수
const clock = new THREE.Clock();
const speed = 100; //units a second, 원본 20
let delta = 0;

const cdist = 1.7; //바닥 깊이
const cang = (0 / 180) * Math.PI; //바닥 기울기

// 캐릭터 평면
const planeWidth = 2.9 / 4;
const planeHeight = 5.7 / 4;

const canvas = document.querySelector("#p");
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
// camera.position.x = 10;
camera.lookAt(0, 0, 0);
// camera.position.y -= 1;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x717171, 7, 18.5);
const dirLight = new THREE.DirectionalLight(0xffffff, 3);
dirLight.position.set(16, 14.2, 4.5);
dirLight.target.position.set(0, 3, -2);
scene.add(dirLight);
scene.add(dirLight.target);
//scene.background = new THREE.Color(0x171717);

function main() {
  // mesh 생성 함수 (shape 대신 이미지로 변경 예정)
  function addShape(x, y, z) {
    //scale 조정
    const s = 0.4;
    const geometry = new THREE.PlaneGeometry();
    const loader = new THREE.TextureLoader();

    const texture = loader.load("./snowman.png", render);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      alphaTest: 0.1,
      transparent: true,
      fog: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.scale.set(s, s, s);
    scene.add(mesh);
    return mesh;
  }

  //파티클
  const PartArr = []; //파티클 배열
  const velo = []; //파티클마다 속도 다르도록 조정
  const n = 15; //50; //파티클 개수
  const seta = (Math.PI * 2) / n;
  let len, shx, shy, shz;
  for (let i = 0; i < n; i++) {
    len = Math.random() * 2 + 1;
    shx = len * Math.sin(i * seta);
    shz = len * Math.cos(i * seta);
    shy = Math.cos(Math.sqrt(shx * shx + shz * shz)) * 3;
    PartArr.push(addShape(shx, shy, shz));
    velo.push(0.005 + Math.random() / 300);
  }

  // render 혹은 animate loop를 불러 렌더링하기
  function render() {
    if (resizeRendererToDisplaySize(renderer)) {
      camera.updateProjectionMatrix();
    }
    delta = clock.getDelta();
    //* 애니메이션
    for (let i = 0; i < PartArr.length; i++) {
      PartArr[i].position.y += velo[i] * -1 * delta * speed;
      if (PartArr[i].position.y <= -3) {
        PartArr[i].position.y *= -1;
      }
    }

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
